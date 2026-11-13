import { useEffect, useRef } from "react";

import { trackAnalyticsEvent } from "../../analytics";

export interface HeroLeftProps {
  titlePrimary?: string;
  titleSecondary?: string;
}

export default function HeroLeft({
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
      <h1
        id="technology-ownership-heading"
        className="mt-4 sm:mt-6 text-3xl sm:text-6xl lg:text-[3.5xl] font-bold leading-[1.15] tracking-tight text-slate-900"
      >
        <span className="block">{titlePrimary}</span>
        <span className="mt-1 block text-blue-700">{titleSecondary}</span>
      </h1>

      <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl font-bold text-slate-900">
        Simple, fast, and beautiful platforms that win and
        <br className="hidden sm:inline" /> get real results
      </p>

      <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-lg font-small text-slate-900">
        Modern web applications built to perform, scale, and impress.
        <br className="hidden sm:inline" />
        Clean design, fast performance, and smooth user experience
        <br className="hidden sm:inline" />
        that helps businesses grow with ease.
      </p>
    </div>
  );
}
