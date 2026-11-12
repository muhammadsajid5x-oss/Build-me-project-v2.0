import { Link } from "react-router-dom";

const values = [
  {
    number: "01",
    title: "Own It",
    description:
      "Take responsibility from the first decision through delivery, operation, and improvement.",
  },
  {
    number: "02",
    title: "Keep It Clear",
    description:
      "Make technology decisions simple enough to understand and strong enough to trust.",
  },
  {
    number: "03",
    title: "Build Well",
    description:
      "Create reliable technology with quality engineering, testing, security, and operational readiness.",
  },
  {
    number: "04",
    title: "Deliver Well",
    description:
      "Turn clear outcomes into working technology and finish what we start.",
  },
  {
    number: "05",
    title: "Keep Learning",
    description:
      "Use evidence, feedback, and real usage to understand what should improve next.",
  },
  {
    number: "06",
    title: "Grow Together",
    description:
      "Create better outcomes through collaboration, shared understanding, and continuous improvement.",
  },
];

const journey = [
  {
    date: "01",
    title: "The Idea",
    description:
      "Cup&Cummit begins with a simple belief: technology ownership should be visible through the work itself.",
  },
  {
    date: "02",
    title: "The Foundation",
    description:
      "The platform takes shape around a connected public experience, delivery paths, and supporting technology.",
  },
  {
    date: "03",
    title: "The Practice",
    description:
      "Engineering, analytics, testing, security, performance, and operations become part of the platform.",
  },
  {
    date: "04",
    title: "The Delivery",
    description:
      "The platform creates practical ways to start projects, collaborate, and turn needs into outcomes.",
  },
  {
    date: "05",
    title: "The Improvement",
    description:
      "Every release creates new evidence that can be used to make the platform stronger.",
  },
];

const faqGroups = [
  {
    title: "About Cup&Cummit",
    questions: [
      {
        question: "What is Cup&Cummit?",
        answer:
          "Cup&Cummit is a technology platform built around practical technology ownership, delivery, collaboration, and continuous improvement.",
      },
      {
        question: "What does Cup&Cummit stand for?",
        answer:
          "Cup&Cummit represents the idea of starting meaningful conversations, building strong commitments, and turning those commitments into real technology outcomes.",
      },
    ],
  },
  {
    title: "How We Work",
    questions: [
      {
        question: "What does technology ownership mean?",
        answer:
          "Technology ownership covers the complete lifecycle: planning, designing, building, testing, deploying, operating, securing, recovering, analysing, and continuously improving technology.",
      },
      {
        question: "What happens after something goes live?",
        answer:
          "Going live is not the end. The technology is observed, secured, measured, reviewed, and improved based on real usage and evidence.",
      },
    ],
  },
  {
    title: "Working With Us",
    questions: [
      {
        question: "Can I request a project?",
        answer:
          "Yes. The Deliver My Project path provides a structured way to share your project, expected outcome, timeline, and budget.",
      },
      {
        question: "How do I get started?",
        answer:
          "Start by choosing the path that best matches what you need. For a delivery project, use Deliver My Project to provide the initial context.",
      },
    ],
  },
  {
    title: "The Platform",
    questions: [
      {
        question: "What does the platform include?",
        answer:
          "Cup&Cummit combines the public experience with the technology, data, analytics, testing, security, and operational practices that support it.",
      },
      {
        question: "How is the platform improved?",
        answer:
          "Improvements are driven by outcomes, feedback, platform behaviour, engineering evidence, and lessons learned from real delivery.",
      },
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-white text-black">
      {/* =========================================================
          HERO TOP
      ========================================================== */}
      <section className="px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16 lg:px-8 lg:pb-14 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Hero Left */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                About Us
              </p>

              <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-blue-600 sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                We build technology with ownership.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-700 sm:text-xl">
                One platform, one ownership mindset, one continuous journey from
                meaningful ideas to technology that creates real value.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/deliver-my-project"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Deliver My Project
                </Link>

                <a
                  href="#our-story"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-blue-600 bg-white px-6 text-sm font-semibold text-black transition hover:bg-[#EBF3FE] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Discover Our Story
                </a>
              </div>
            </div>

            {/* Hero Right */}
            <div className="relative">
              <div className="relative min-h-97.5 overflow-hidden rounded-4xl bg-[#EBF3FE] p-6 sm:min-h-115 sm:p-8 lg:min-h-130">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue/70" />
                <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-600/10" />

                <div className="relative flex h-full min-h-85 flex-col justify-between sm:min-h-100">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                      Cup&Cummit
                    </span>
                  </div>

                  <div className="max-w-md">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                      Our approach
                    </p>

                    <p className="mt-4 text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl">
                      From an idea to technology you can own.
                    </p>

                    <div className="mt-7 h-px w-full bg-black/10" />

                    <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Build
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          With purpose
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Deliver
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          With clarity
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Operate
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          With ownership
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Improve
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          With evidence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HERO BOTTOM / IDENTITY STRIP
      ========================================================== */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden rounded-2xl bg-[#EBF3FE] sm:grid-cols-2 lg:grid-cols-4">
            {[
              "One Platform",
              "One Ownership",
              "One Journey",
              "One Purpose",
            ].map((item, index) => (
              <div
                key={item}
                className={`px-6 py-7 sm:px-8 lg:px-7 lg:py-8 ${
                  index > 0
                    ? "border-t border-black/10 sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  0{index + 1}
                </p>

                <p className="mt-3 text-lg font-bold text-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          WHO WE ARE
      ========================================================== */}
      <section
        id="our-story"
        className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Who We Are
              </p>

              <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-600 sm:text-5xl">
                The company behind Cup&Cummit.
              </h2>
            </div>

            <div>
              <p className="text-xl leading-9 text-black sm:text-2xl sm:leading-10">
                Cup&Cummit is a technology platform built to make ownership
                visible through the work itself.
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#EBF3FE] p-7">
                  <p className="text-sm font-semibold text-blue-600">
                    Technology
                  </p>
                  <p className="mt-3 text-sm leading-7 text-gray-700">
                    Engineering practices are part of the product, not an
                    afterthought.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#EBF3FE] p-7">
                  <p className="text-sm font-semibold text-blue-600">
                    Ownership
                  </p>
                  <p className="mt-3 text-sm leading-7 text-gray-700">
                    Decisions remain connected to delivery, operation, and
                    improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MISSION
      ========================================================== */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Our Mission
              </p>

              <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-600 sm:text-5xl">
                Make technology ownership practical.
              </h2>
            </div>

            <div className="rounded-2xl bg-[#EBF3FE] p-8 sm:p-10 lg:p-12">
              <p className="text-2xl font-semibold leading-relaxed text-black sm:text-3xl">
                Turn clear decisions into reliable technology, useful outcomes,
                and continuous improvement.
              </p>

              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-700">
                We believe technology ownership becomes meaningful when
                responsibility continues beyond implementation and remains
                connected to the people, outcomes, and systems it supports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VISION
      ========================================================== */}
      <section className="bg-[#EBF3FE] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-24">
            <div className="order-2 lg:order-1">
              <p className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl">
                Technology should remain useful after the launch moment.
              </p>

              <p className="mt-7 max-w-2xl text-base leading-8 text-gray-700 sm:text-lg">
                Our vision is to create technology that can be understood,
                trusted, operated, measured, and improved as needs evolve.
              </p>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Our Vision
              </p>

              <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-600 sm:text-5xl">
                Build technology that keeps creating value.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUES
      ========================================================== */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Our Values
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-600 sm:text-5xl">
              How we choose to work.
            </h2>

            <p className="mt-6 text-base leading-8 text-gray-700 sm:text-lg">
              These principles shape the decisions behind Cup&Cummit and the way
              technology is built, delivered, and improved.
            </p>
          </div>

          <div className="mt-14 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.number}
                className="border-t border-black/10 py-8 lg:py-10"
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="text-sm font-semibold text-blue-600">
                    {value.number}
                  </span>

                  <span className="h-px flex-1 bg-black/10" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-blue-600">
                  {value.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-gray-700">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          JOURNEY
      ========================================================== */}
      <section className="bg-[#EBF3FE] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Our Journey
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-600 sm:text-5xl">
              From idea to continuous improvement.
            </h2>

            <p className="mt-6 text-base leading-8 text-gray-700 sm:text-lg">
              Cup&Cummit grows through a connected technology lifecycle where
              every stage creates the foundation for the next.
            </p>
          </div>

          <div className="mt-14">
            {journey.map((item, index) => (
              <article
                key={item.date}
                className="grid gap-6 border-t border-black/10 py-8 sm:grid-cols-[100px_1fr] sm:py-10 lg:grid-cols-[140px_0.8fr_1.2fr] lg:items-start"
              >
                <div className="text-sm font-semibold text-blue-600">
                  {item.date}
                </div>

                <h3 className="text-2xl font-bold text-black">{item.title}</h3>

                <p className="max-w-2xl text-sm leading-7 text-gray-700">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW WE WORK
      ========================================================== */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-4xl bg-[#EBF3FE] p-8 sm:p-10 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  How We Work
                </p>

                <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-600 sm:text-5xl">
                  One connected lifecycle.
                </h2>
              </div>

              <div>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Plan",
                    "Design",
                    "Build",
                    "Test",
                    "Deploy",
                    "Observe",
                    "Secure",
                    "Recover",
                    "Analyse",
                    "Improve",
                  ].map((step) => (
                    <span
                      key={step}
                      className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black"
                    >
                      {step}
                    </span>
                  ))}
                </div>

                <p className="mt-8 max-w-2xl text-base leading-8 text-gray-700">
                  Technology ownership does not end when a feature is delivered.
                  The same responsibility continues through operation, recovery,
                  analysis, and improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQs
      ========================================================== */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Company FAQs
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-600 sm:text-5xl">
              Quick answers about Cup&Cummit.
            </h2>

            <p className="mt-6 text-base leading-8 text-gray-700 sm:text-lg">
              Explore the questions that explain who we are, how we work, and
              how you can work with us.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
            {/* FAQ categories */}
            <nav
              aria-label="FAQ categories"
              className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"
            >
              {faqGroups.map((group, index) => (
                <a
                  key={group.title}
                  href={`#faq-${index}`}
                  className={`block shrink-0 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    index === 0
                      ? "bg-[#EBF3FE] text-blue-600"
                      : "text-gray-700 hover:bg-[#EBF3FE] hover:text-blue-600"
                  }`}
                >
                  {group.title}
                </a>
              ))}
            </nav>

            {/* FAQ questions */}
            <div className="space-y-8">
              {faqGroups.map((group, groupIndex) => (
                <div
                  key={group.title}
                  id={`faq-${groupIndex}`}
                  className="scroll-mt-24"
                >
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                    {group.title}
                  </h3>

                  <div className="divide-y divide-black/10 border-y border-black/10">
                    {group.questions.map((faq) => (
                      <details key={faq.question} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-base font-semibold text-black marker:hidden">
                          <span>{faq.question}</span>

                          <span className="shrink-0 text-2xl font-normal text-blue-600 transition-transform group-open:rotate-45">
                            +
                          </span>
                        </summary>

                        <p className="max-w-3xl pb-6 pr-10 text-sm leading-7 text-gray-700">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="px-4 pb-20 pt-4 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-4xl bg-blue-600 px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                  Ready to Move Forward?
                </p>

                <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  Let&apos;s turn your technology need into a clear next step.
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
                  Start with the outcome, bring the context, and create a
                  practical path toward delivery.
                </p>
              </div>

              <Link
                to="/deliver-my-project"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-blue-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Deliver My Project
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
