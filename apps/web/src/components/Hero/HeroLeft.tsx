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
      className="flex w-full flex-col justify-center px-4 text-left sm:px-6 lg:px-0"
    >
      <h1
        id="technology-ownership-heading"
        className="mt-2 text-4xl font-bold leading-[1.08] tracking-tight text-black sm:mt-6 sm:text-6xl lg:text-[3.5rem]"
      >
        <span className="block">{titlePrimary}</span>
        <span className="mt-2 block text-blue-700">{titleSecondary}</span>
      </h1>

      <p className="mt-2 max-w-2xl text-base font-bold leading-7 text-black sm:mt-6 sm:text-lg sm:leading-8 lg:text-xl">
        Simple, fast, and beautiful platforms that
        <br />
        win and get real results.
      </p>

      <p className="mt-2 max-w-2xl text-base leading-7 text-black sm:mt-5 sm:text-lg sm:leading-8">
        Get more customers with ease with websites and apps that are <br /> easy
        to use, <br /> look great, and work fast.
      </p>
    </div>
  );
}
