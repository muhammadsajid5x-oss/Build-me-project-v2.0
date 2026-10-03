import helmetModule from "helmet";

const helmet = helmetModule as unknown as (
  options?: Record<string, unknown>,
) => (req: unknown, res: unknown, next: (err?: unknown) => void) => void;

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});
