import { useEffect } from "react";

import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../analytics";
import { technologyOwnershipToolkit as toolkit } from "../content/technology-ownership-toolkit";

export default function OwnershipToolkitPage() {
  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.OWNERSHIP_TOOLKIT_VIEWED,
      eventType: "view",
      path: "/ownership-toolkit",
    });
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Technology Ownership
        </p>

        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {toolkit.title}
        </h1>

        <p className="leading-7 text-gray-600">{toolkit.subtitle}</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {toolkit.introduction.heading}
        </h2>

        <p className="leading-7 text-gray-600">
          {toolkit.introduction.description}
        </p>

        <p className="rounded-lg border border-blue-200 bg-blue-50 p-4 leading-7 text-gray-700">
          {toolkit.introduction.principle}
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          The Technology Ownership Lifecycle
        </h2>

        {toolkit.lifecycle.map((stage) => (
          <article
            key={stage.title}
            className="space-y-4 rounded-lg border border-gray-200 p-5"
          >
            <h3 className="text-xl font-bold text-gray-900">{stage.title}</h3>

            <div>
              <h4 className="font-semibold text-gray-800">Objective</h4>
              <p className="mt-1 leading-7 text-gray-600">{stage.objective}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800">Checklist</h4>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600">
                {stage.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800">
                Evidence to retain
              </h4>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600">
                {stage.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-800">
                Ownership question
              </h4>
              <p className="mt-1 leading-7 text-gray-600">
                {stage.ownershipQuestion}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Production Readiness Checklist
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-600">
          {toolkit.readinessChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Technology Ownership Evidence Record
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-gray-600">
          {toolkit.evidenceRecord.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Ownership Review Questions
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-600">
          {toolkit.reviewQuestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Ownership Boundaries
        </h2>

        <div>
          <h3 className="font-semibold text-gray-900">Product Ownership</h3>
          <p className="mt-1 leading-7 text-gray-600">
            {toolkit.ownershipBoundaries.productOwnership}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">Technology Ownership</h3>
          <p className="mt-1 leading-7 text-gray-600">
            {toolkit.ownershipBoundaries.technologyOwnership}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="font-bold text-gray-900">The Ownership Principle</h2>
        <p className="mt-2 font-semibold leading-7 text-gray-800">
          {toolkit.slogan}
        </p>
      </section>
    </main>
  );
}
