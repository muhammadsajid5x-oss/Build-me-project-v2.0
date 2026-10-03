import { spawnSync } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

// Set by pnpm when running `pnpm review:kpis`; avoids resolving pnpm through PATH.
const pnpmScript = process.env.npm_execpath;

const gitExecutable =
  process.platform === "win32"
    ? String.raw`C:\Program Files\Git\cmd\git.exe`
    : "/usr/bin/git";

const apiBaseUrl = process.env.KPI_API_URL ?? "http://localhost:3000";

const webBaseUrl = process.env.KPI_WEB_URL ?? "http://localhost:5173";

const dashboardBaseUrl =
  process.env.KPI_DASHBOARD_URL ?? "http://localhost:5174";

const requireServices = process.env.KPI_REQUIRE_SERVICES === "1";

const results = [];

/**
 * Remove credentials/query data from URLs before reporting them.
 */
function safeUrl(value) {
  const url = new URL(value);

  return `${url.origin}${url.pathname}`;
}

/**
 * Check whether a service is available.
 */
async function probe(name, url) {
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    const result = {
      name,
      status: response.ok ? "pass" : "fail",
      url: safeUrl(url),
      httpStatus: response.status,
      responseTimeMs: Number((performance.now() - startedAt).toFixed(2)),
      blocking: requireServices && !response.ok,
    };

    console.log(
      `${name}: HTTP ${response.status} (${result.responseTimeMs} ms)`,
    );

    results.push(result);

    return result;
  } catch (error) {
    const result = {
      name,
      status: "unavailable",
      url: safeUrl(url),
      reason: error instanceof Error ? error.name : "Request failed",
      blocking: requireServices,
    };

    console.log(`${name}: unavailable (${result.reason})`);

    results.push(result);

    return result;
  }
}

/**
 * Run a pnpm command from the repository root.
 */
function runPnpm(name, args, extraEnvironment = {}) {
  console.log(`\n> pnpm ${args.join(" ")}`);

  const startedAt = performance.now();

  const environment = {
    ...process.env,
    ...extraEnvironment,
  };

  if (!pnpmScript || !/\.[cm]?js$/.test(pnpmScript)) {
    throw new Error("Run this script through pnpm: pnpm review:kpis");
  }

  const result = spawnSync(process.execPath, [pnpmScript, ...args], {
    cwd: repositoryRoot,
    env: environment,
    encoding: "utf8",
    timeout: 30 * 60 * 1000,
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  const check = {
    name,
    command: `pnpm ${args.join(" ")}`,
    status: result.status === 0 ? "pass" : "fail",
    exitCode: result.status,
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
    ...(result.error ? { reason: result.error.message } : {}),
    blocking: true,
  };

  results.push(check);

  console.log(`${name}: ${check.status} (${check.durationMs} ms)`);

  return check;
}

/**
 * Read a Git value safely.
 */
function gitValue(args) {
  const result = spawnSync(gitExecutable, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  return result.status === 0 ? result.stdout.trim() : null;
}

/**
 * Check whether a repository file exists.
 */
async function fileExists(relativePath) {
  try {
    await access(path.join(repositoryRoot, relativePath));

    return true;
  } catch {
    return false;
  }
}

/*
 * ---------------------------------------------------------
 * SERVICE AVAILABILITY
 * ---------------------------------------------------------
 */

const apiHealthUrl = new URL("/health", apiBaseUrl).toString();

const apiHealth = await probe("API availability", apiHealthUrl);

const webUrl = new URL("/", webBaseUrl).toString();

const webAvailability = await probe("Web availability", webUrl);

const dashboardUrl = new URL("/", dashboardBaseUrl).toString();

const dashboardAvailability = await probe(
  "Dashboard availability",
  dashboardUrl,
);

/*
 * ---------------------------------------------------------
 * RELIABILITY
 * ---------------------------------------------------------
 */

const reliability = runPnpm("Workspace tests", ["test"]);

/*
 * ---------------------------------------------------------
 * DEPENDENCY SECURITY
 * ---------------------------------------------------------
 */

const dependencyAudit = runPnpm("Production dependency audit", [
  "audit",
  "--prod",
]);

/*
 * ---------------------------------------------------------
 * API SECURITY TESTS
 * ---------------------------------------------------------
 */

let securityTests = {
  name: "API security tests",
  status: "not-run",
  reason: "Start the API at http://localhost:3000 to run pnpm test:security.",
  blocking: false,
};

if (
  apiHealth.status === "pass" &&
  new URL(apiBaseUrl).origin === "http://localhost:3000"
) {
  securityTests = runPnpm("API security tests", ["test:security"]);
} else {
  results.push(securityTests);
}

/*
 * ---------------------------------------------------------
 * WEBSITE PERFORMANCE
 * ---------------------------------------------------------
 */

let websitePerformance = {
  name: "Website performance test",
  status: "not-run",
  reason:
    "Start the Web app at http://localhost:5173 to run pnpm test:performance.",
  blocking: false,
};

if (
  webAvailability.status === "pass" &&
  new URL(webBaseUrl).origin === "http://localhost:5173"
) {
  websitePerformance = runPnpm("Website performance test", [
    "test:performance",
  ]);
} else {
  results.push(websitePerformance);
}

/*
 * ---------------------------------------------------------
 * DATABASE PERFORMANCE
 * ---------------------------------------------------------
 */

let databaseResponse = {
  name: "Database response probe",
  status: "not-run",
  reason:
    "Set KPI_RUN_DATABASE=1 to run the read-only SELECT 1 probe; use a non-production database.",
  blocking: false,
};

if (process.env.KPI_RUN_DATABASE === "1") {
  databaseResponse = runPnpm(
    "Database response probe",
    ["--dir", "database", "exec", "tsx", "performance.ts"],
    {
      DEBUG_PERFORMANCE: "1",
    },
  );
} else {
  results.push(databaseResponse);
}

/*
 * ---------------------------------------------------------
 * REQUIRED WORKFLOWS
 * ---------------------------------------------------------
 */

const requiredWorkflows = [
  ".github/workflows/ci.yml",
  ".github/workflows/security.yml",
  ".github/workflows/cd-preview.yml",
  ".github/workflows/cd-development.yml",
  ".github/workflows/cd-staging.yml",
  ".github/workflows/cd-production.yml",
];

const configuredWorkflows = await Promise.all(
  requiredWorkflows.map(async (workflow) => ({
    path: workflow,
    present: await fileExists(workflow),
  })),
);

/*
 * ---------------------------------------------------------
 * RECOVERY DOCUMENTATION
 * ---------------------------------------------------------
 */

const recoveryDocuments = [
  "docs/deployment/rollback-guide.md",
  "docs/database/recovery-guide.md",
];

const recoveryGuides = await Promise.all(
  recoveryDocuments.map(async (guide) => ({
    path: guide,
    present: await fileExists(guide),
  })),
);

/*
 * ---------------------------------------------------------
 * RESULT SUMMARY
 * ---------------------------------------------------------
 */

const failedChecks = results.filter((result) => result.status === "fail");

/*
 * ---------------------------------------------------------
 * KPI REPORT
 * ---------------------------------------------------------
 */

const report = {
  generatedAt: new Date().toISOString(),

  repository: {
    branch: gitValue(["branch", "--show-current"]),

    commit: gitValue(["rev-parse", "--short", "HEAD"]),

    worktreeClean: gitValue(["status", "--porcelain"]) === "",
  },

  kpis: {
    availability: [apiHealth, webAvailability, dashboardAvailability],

    reliability,

    performance: {
      webResponseTimeMs: webAvailability.responseTimeMs ?? null,

      apiResponseTimeMs: apiHealth.responseTimeMs ?? null,

      websiteTest: websitePerformance,

      databaseProbe: databaseResponse,
    },

    security: {
      dependencyAudit,
      apiSecurityTests: securityTests,
    },

    delivery: {
      configuredWorkflows,

      liveRunHistory:
        "Not queried; review GitHub Actions and Vercel for cycle/lead time and throughput.",
    },

    defects: {
      failedLocalChecks: failedChecks.map(({ name, exitCode }) => ({
        name,
        exitCode,
      })),

      issueTracker:
        "Not queried; link post-release defects and incidents in the reporting record.",
    },

    recovery: {
      guides: recoveryGuides,

      restoreDrill:
        "Not run by this script; record a non-production restore exercise separately.",
    },
  },

  limitations: [
    "This local scorecard does not define or enforce production SLOs.",
    "GitHub/Vercel history and issue-tracker data are not retrieved automatically.",
    "Unavailable local services are informational unless KPI_REQUIRE_SERVICES=1.",
  ],
};

/*
 * ---------------------------------------------------------
 * WRITE REPORT
 * ---------------------------------------------------------
 */

const reportDirectory = path.join(repositoryRoot, "test-results");

await mkdir(reportDirectory, {
  recursive: true,
});

const reportPath = path.join(reportDirectory, "delivery-kpi-review.json");

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  `\nKPI report written to ${path.relative(repositoryRoot, reportPath)}`,
);

console.log(`Failed required checks: ${failedChecks.length}`);

/*
 * ---------------------------------------------------------
 * EXIT STATUS
 * ---------------------------------------------------------
 */

if (
  failedChecks.length > 0 ||
  (requireServices && results.some((result) => result.status === "unavailable"))
) {
  process.exitCode = 1;
}
