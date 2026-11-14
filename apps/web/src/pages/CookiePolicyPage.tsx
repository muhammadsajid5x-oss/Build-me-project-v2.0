import { Link } from "react-router-dom";

export default function CookiePolicyPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#0052FF]">
            Legal
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-[#0052FF] sm:text-5xl lg:text-6xl">
            Cookie Policy
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            This policy explains how cookies and similar technologies may be
            used to support the Cup&Cummit website.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                1. What Cookies Are
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Cookies are small data files that websites can store in your
                browser. They can help websites remember information and support
                certain functionality.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                2. How Cup&Cummit May Use Cookies
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Cookies or similar technologies may be used to support website
                functionality, understand interactions, maintain appropriate
                settings, and improve the overall experience.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                3. Analytics Technologies
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Analytics technologies may help us understand how visitors
                interact with the platform and identify areas that can be
                improved.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                4. Managing Cookies
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Most modern browsers provide controls that allow you to view,
                block, or remove cookies. Disabling certain cookies may affect
                some website functionality.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                5. Changes to This Policy
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                This Cookie Policy may be updated when the website or its use of
                cookies and similar technologies changes. The latest version
                will remain available on this page.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/about"
              className="rounded-lg bg-[#0052FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0046D8] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
            >
              Back to About
            </Link>

            <Link
              to="/"
              className="rounded-lg border border-[#0052FF] bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#EBF3FE] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
