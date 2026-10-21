import { useEffect, useRef } from "react";
import { trackAnalyticsEvent } from "../../analytics";

export interface HeroMetric {
  id: string;
  value: string;
  label: string;
  icon: "shield-check" | "rocket" | "shield-dollar" | "shield-star";
}

export interface HeroRightProps {
  imageSrc?: string;
  titleAnnotation?: string;
  metrics?: HeroMetric[];
}

const DEFAULT_METRICS: HeroMetric[] = [
  {
    id: "reliability",
    value: "99.9%",
    label: "System Reliability",
    icon: "shield-check",
  },
  {
    id: "speed",
    value: "Faster",
    label: "Time to Market",
    icon: "rocket",
  },
  {
    id: "cost",
    value: "Lower",
    label: "Operational Costs",
    icon: "shield-dollar",
  },
  {
    id: "security",
    value: "Stronger",
    label: "Security & Trust",
    icon: "shield-star",
  },
];

function MetricIcon({ type }: Readonly<{ type: HeroMetric["icon"] }>) {
  const commonProps = {
    className: "h-7 w-7 text-blue-700",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  switch (type) {
    case "rocket":
      return (
        <svg {...commonProps}>
          <path
            d="M14.5 5.5C16.8 3.2 19.2 2.5 21 3c.5 1.8-.2 4.2-2.5 6.5l-4.2 4.2-4-4 4.2-4.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m10.3 9.7-3.5.8-2.3 2.3 4.1.6.6 4.1 2.3-2.3.8-3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="17"
            cy="7"
            r="1.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6.5 17.5 4 20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "shield-dollar":
      return (
        <svg {...commonProps}>
          <path
            d="M12 3 19 6v5.5c0 4.4-2.8 7.7-7 9.5-4.2-1.8-7-5.1-7-9.5V6l7-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12 8v8M14.5 10.5c-.5-.7-1.3-1-2.3-1-1.2 0-2 .6-2 1.5 0 2.3 4.3 1.1 4.3 3.5 0 .9-.8 1.5-2 1.5-1 0-1.8-.3-2.3-1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "shield-star":
      return (
        <svg {...commonProps}>
          <path
            d="M12 3 19 6v5.5c0 4.4-2.8 7.7-7 9.5-4.2-1.8-7-5.1-7-9.5V6l7-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m12 8 .9 2 2.1.2-1.6 1.4.5 2.1-1.9-1.1-1.9 1.1.5-2.1-1.6-1.4 2.1-.2.9-2Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "shield-check":
    default:
      return (
        <svg {...commonProps}>
          <path
            d="M12 3 19 6v5.5c0 4.4-2.8 7.7-7 9.5-4.2-1.8-7-5.1-7-9.5V6l7-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m8.5 12 2.2 2.2 4.8-4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export default function HeroRight({
  imageSrc = "/Sajid.png",
  titleAnnotation = "My Impact in Action",
  metrics = DEFAULT_METRICS,
}: Readonly<HeroRightProps>) {
  const heroRightRef = useRef<HTMLElement | null>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    const heroElement = heroRightRef.current;

    if (!heroElement || hasTrackedView.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedView.current) {
          hasTrackedView.current = true;

          trackAnalyticsEvent({
            name: "hero.right.viewed",
            eventType: "view",
            path: window.location.pathname,
          });

          observer.disconnect();
        }
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(heroElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={heroRightRef}
      aria-labelledby="technology-owner-impact-heading"
      className="
        relative
        z-20
        m-0
        min-h-0
        w-full
        overflow-visible
        bg-transparent
        p-0
        lg:min-h-142.5
      "
    >
      {/* =========================================================
          LARGE ROUND CURVE
          ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-0.5
          -right-45
          z-30
          h-87.5
          w-175
          rounded-full
          bg-linear-to-br
          from-blue-100
          via-blue-50
          to-white
          sm:-top-25
          sm:-right-55
          sm:h-145
          sm:w-200
          lg:-top-30
          lg:-right-65
          lg:h-175
          lg:w-250
        "
      />

      {/* =========================================================
          HERO RIGHT CONTENT
          ========================================================= */}

      <div
        className="
          relative
          z-30
          mx-auto
          flex
          min-h-0
          w-full
          max-w-7xl
          items-end
          justify-center
          px-4
          sm:px-6
          lg:min-h-142.5
          lg:px-8
        "
      >
        {/* =======================================================
            PERSON + DIGITAL BACKGROUND
            ======================================================= */}

        <div
          className="
            relative
            flex
            h-100
            w-full
            max-w-180
            items-end
            justify-center
            sm:h-117.5
            lg:h-148
            lg:max-w-180
          "
        >
          {/* Circular digital background */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-[50%]
              top-[40%]
              z-0
              h-75
              w-75
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[url('/Background.png')]
              bg-cover
              bg-center
              opacity-70
              mix-blend-multiply
              sm:left-[45%]
              sm:top-[38%]
              sm:h-162.5
              sm:w-137.5
              lg:left-[25%]
              lg:top-[35%]
              lg:h-120
              lg:w-120
            "
          />

          {/* Person */}

          <div
            className="
              relative
              z-10
              flex
              h-full
              w-full
              items-end
              justify-center
              overflow-visible
            "
          >
            <img
              src={imageSrc}
              alt="Technology Owner working on a laptop"
              className="
                relative
                bottom-10
                -right-12.5
                h-auto
                w-125
                max-w-none
                object-contain
                object-bottom
                select-none
                drop-shadow-2xl
                sm:bottom-14
                sm:right-4
                sm:w-140
                lg:bottom-30
                lg:right-20
                lg:w-197.5
              "
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        {/* =======================================================
            IMPACT CARD AREA
            ======================================================= */}

        <div
          className="
            relative
            z-30
            mb-17.5
            -ml-22.5
            flex
            w-75
            shrink-0
            flex-col
            items-end
            sm:mb-20
            sm:-ml-17.5
            lg:mb-30
            lg:-ml-56
          "
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');
          `}</style>

          <div className="relative flex w-full items-center justify-end pr-2 pb-1">
            {/* Handwritten Cursive Text */}

            <h4
              id="technology-owner-impact-heading"
              className="
                whitespace-nowrap
                font-['Dancing_Script',cursive]
                text-[18px]
                font-bold
                leading-none
                tracking-wide
                -translate-y-2.5
                -translate-x-17.5
                text-[#1e40af]
                select-none
                sm:text-[22px]
                sm:-translate-y-12.5
                sm:-translate-x-17.5
                lg:text-[25px]
                lg:-translate-y-8
                lg:-translate-x-10
              "
            >
              {titleAnnotation}
            </h4>

            {/* Curved Pointer Arrow SVG */}

            <svg
              aria-hidden="true"
              className="
                ml-1
                h-5
                w-6
                -translate-y-1.25
                -translate-x-17.5
                text-blue-700
                sm:h-11
                sm:w-14.5
                sm:-translate-y-10
                sm:-translate-x-17.5
                lg:h-12
                lg:w-16
                lg:-translate-y-3
                lg:-translate-x-10
              "
              viewBox="0 0 65 50"
              fill="none"
            >
              {/* Rounder Arc Path */}

              <path
                d="M 2 8 C 42 2, 62 10, 52 38"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Downward Arrowhead */}

              <path
                d="M 42 28 L 52 39 L 60 27"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* =====================================================
              IMPACT CARD
              ===================================================== */}

          <aside
            aria-label="Technology Owner Impact Metrics"
            className="
              w-55
              overflow-hidden
              rounded-[14px]
              border
              border-slate-100
              bg-white
              px-[-10px]
              py-0
              shadow-[0_8px_25px_rgba(15,23,42,0.12)]
              sm:w-57.5
              sm:rounded-2xl
              sm:px-3.75
              sm:py-2.75
              lg:w-62.5
              lg:rounded-[18px]
              lg:px-5
              lg:py-4.5
            "
          >
            <div className="flex flex-col">
              {metrics.map((metric, index) => (
                <div
                  key={metric.id}
                  className={`
                    flex
                    min-h-15
                    items-center
                    gap-2.5
                    ${index !== metrics.length - 1 ? "border-b border-slate-200" : ""}
                    sm:min-h-17.5
                    sm:gap-3
                    lg:min-h-22.25
                    lg:gap-4
                  `}
                >
                  {/* Icon */}

                  <div
                    aria-hidden="true"
                    className="
                      flex
                      h-8.5
                      w-8.5
                      shrink-0
                      items-center
                      justify-center
                      rounded-[9px]
                      bg-blue-50
                      sm:h-10
                      sm:w-10
                      sm:rounded-[11px]
                      lg:h-13
                      lg:w-13
                      lg:rounded-[14px]
                    "
                  >
                    <div className="[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6 lg:[&>svg]:h-7 lg:[&>svg]:w-7">
                      <MetricIcon type={metric.icon} />
                    </div>
                  </div>

                  {/* Text */}

                  <div className="min-w-0">
                    <p
                      className="
                        text-[18px]
                        font-bold
                        leading-none
                        tracking-[-0.02em]
                        text-blue-800
                        sm:text-[21px]
                        lg:text-[25px]
                      "
                    >
                      {metric.value}
                    </p>

                    <p
                      className="
                        mt-0.75
                        whitespace-nowrap
                        text-[10px]
                        font-semibold
                        leading-[1.1]
                        text-slate-800
                        sm:mt-1
                        sm:text-[12px]
                        lg:mt-1.5
                        lg:text-[14px]
                      "
                    >
                      {metric.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
