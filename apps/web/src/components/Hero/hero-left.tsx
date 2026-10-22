import { useEffect, useRef } from "react";

import { trackAnalyticsEvent } from "../../analytics";

export interface HeroLeftProps {
  badge?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  subheading?: string;
  description?: string;
}

export default function HeroLeft({
  badge = "TECHNOLOGY OWNERSHIP",
  titlePrimary = "Build Better",
  titleSecondary = "Digital Experiences",
}: Readonly<HeroLeftProps>) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    const heroElement = heroRef.current;

    if (!heroElement || hasTrackedView.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedView.current) {
          hasTrackedView.current = true;

          trackAnalyticsEvent({
            name: "hero.viewed",
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
    <div
      ref={heroRef}
      className="flex w-full flex-col justify-center text-left px-4 sm:px-6 lg:px-0"
    >
      {/* Badge: fixed text color and responsive padding */}
      <div className="inline-flex w-fit items-center rounded-full bg-blue-100 px-3.5 py-1 sm:px-4 sm:py-1.5">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
          {badge}
        </p>
      </div>

      {/* Heading: mobile-first scaling from text-3xl to 5xl/6xl */}
      <h1
        id="technology-ownership-heading"
        className="mt-4 sm:mt-6 text-3xl sm:text-6xl lg:text-[3.5xl] font-bold leading-[1.15] tracking-tight text-slate-900"
      >
        <span className="block">{titlePrimary}</span>
        <span className="mt-1 block text-blue-700">{titleSecondary}</span>
      </h1>

      {/* Subheading: responsive line break on desktop/tablet only */}
      <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl font-bold text-slate-900">
        Simple, fast, and beautiful platforms that win and
        <br className="hidden sm:inline" /> get real results
      </p>

      {/* Description: responsive text sizing and natural mobile wrapping */}
      <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl font-normal text-slate-900">
        Websites and apps that are easy to use, look great,
        <br className="hidden sm:inline" /> and work fast. Get more customers
        with ease.
        <br className="hidden sm:inline" /> No stress, no confusion —— just
        simple, reliable
        <br className="hidden sm:inline" /> solutions that help you grow.
      </p>
    </div>
  );
}
