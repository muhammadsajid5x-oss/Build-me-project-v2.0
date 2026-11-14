import { Link } from "react-router-dom";

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#0052FF]">
            Legal
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-[#0052FF] sm:text-5xl lg:text-6xl">
            Terms & Conditions
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            These terms explain the basic conditions for using Cup&Cummit,
            requesting services, and interacting with our platform.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                1. Using Cup&Cummit
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                By using Cup&Cummit, you agree to use the website and its
                services responsibly and for lawful purposes. You should provide
                accurate information when submitting a request or contacting us.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                2. Services and Requests
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Information submitted through Cup&Cummit may be used to
                understand your request, evaluate the required work, and
                communicate with you about the next steps. Submitting a request
                does not automatically create a service agreement.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                3. Website Content
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Content published on Cup&Cummit is provided for general
                information and may be updated, improved, or changed over time.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                4. Intellectual Property
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Unless otherwise stated, Cup&Cummit branding, original content,
                design, and platform materials belong to their respective owners
                and should not be copied, reproduced, or redistributed without
                appropriate permission.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                5. Responsible Use
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                You must not misuse the website, attempt to interfere with its
                operation, submit malicious content, or use the platform for
                unlawful activity.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                6. Changes
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                These terms may be updated when the platform, services, or
                applicable requirements change. Updated terms will be published
                on this page.
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
