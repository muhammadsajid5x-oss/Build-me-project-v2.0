import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#0052FF]">
            Legal
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-[#0052FF] sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            This policy explains what information Cup&Cummit may collect, why it
            may be used, and how we aim to handle it responsibly.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                1. Information We Receive
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                When you interact with Cup&Cummit, you may voluntarily provide
                information such as your name, email address, project details,
                referral information, or other information included in a
                submitted request.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                2. How Information Is Used
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Information may be used to respond to requests, communicate
                about submitted inquiries, understand how the platform is being
                used, improve the website, and support the services requested
                through Cup&Cummit.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                3. Analytics
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Cup&Cummit may collect technical and interaction information
                through analytics to understand page usage, interactions, and
                platform performance. This information is intended to help
                improve reliability and user experience.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                4. Information Sharing
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Information may be processed by service providers required to
                operate the platform and provide requested functionality. We do
                not intend to use submitted information for purposes unrelated
                to the operation of Cup&Cummit or the request you submitted.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                5. Data Protection
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Reasonable technical and organizational measures are used to
                protect information handled through the platform. However, no
                internet-based system can guarantee absolute security.
              </p>
            </section>

            <section className="rounded-2xl bg-[#EBF3FE] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0052FF] sm:text-2xl">
                6. Policy Updates
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                This policy may be updated as Cup&Cummit evolves or applicable
                requirements change. Any updated version will be published on
                this page.
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
