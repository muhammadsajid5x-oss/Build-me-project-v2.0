import { useEffect } from "react";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../../analytics";

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/muhammad-sajid-softwaredeveloper/",
    event: ANALYTICS_EVENTS.FOLLOW_US_LINKEDIN_CLICKED,
    label: "Connect with me on LinkedIn",
    bgClass: "bg-[#0A66C2]",
    hoverClass: "hover:bg-[#095196]",
  },
  {
    name: "Facebook",
    href: "https://web.facebook.com/rao.sajid.1232",
    event: ANALYTICS_EVENTS.FOLLOW_US_FACEBOOK_CLICKED,
    label: "Connect with me on Facebook",
    bgClass: "bg-[#1877F2]",
    hoverClass: "hover:bg-[#145dbf]",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UCX80pgVBcXTgawdM3hAQzBg",
    event: ANALYTICS_EVENTS.FOLLOW_US_YOUTUBE_CLICKED,
    label: "Visit my YouTube channel",
    bgClass: "bg-[#FF0000]",
    hoverClass: "hover:bg-[#cc0000]",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/923009164602",
    event: ANALYTICS_EVENTS.FOLLOW_US_WHATSAPP_CLICKED,
    label: "Contact me on WhatsApp",
    bgClass: "bg-[#25D366]",
    hoverClass: "hover:bg-[#1ebe5d]",
  },
  {
    name: "Telegram",
    href: "https://t.me/+923009164602",
    event: ANALYTICS_EVENTS.FOLLOW_US_TELEGRAM_CLICKED,
    label: "Contact me on Telegram",
    bgClass: "bg-[#229ED9]",
    hoverClass: "hover:bg-[#1b7fb3]",
  },
] as const;

function SocialIcon({ name }: { name: (typeof socialLinks)[number]["name"] }) {
  const commonProps = {
    className: "h-4 w-4 fill-white",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "LinkedIn":
      return (
        <svg {...commonProps}>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );

    case "Facebook":
      return (
        <svg {...commonProps}>
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.04 1.79-4.72 4.55-4.72 1.32 0 2.7.24 2.7.24v2.98h-1.52c-1.5 0-1.97.94-1.97 1.9v2.27h3.35l-.54 3.49h-2.81V24C19.61 23.09 24 18.1 24 12.07Z" />
        </svg>
      );

    case "YouTube":
      return (
        <svg {...commonProps}>
          <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.55 15.58V8.42L15.82 12l-6.27 3.58Z" />
        </svg>
      );

    case "WhatsApp":
      return (
        <svg {...commonProps}>
          <path d="M20.52 3.48A11.78 11.78 0 0 0 12.13 0C5.6 0 .28 5.32.28 11.86c0 2.09.55 4.13 1.6 5.93L.18 24l6.36-1.67a11.86 11.86 0 0 0 5.59 1.42h.01c6.53 0 11.85-5.32 11.85-11.86 0-3.17-1.23-6.14-3.47-8.41Zm-8.39 18.22h-.01a9.84 9.84 0 0 1-5.02-1.38l-.36-.21-3.77.99 1.01-3.67-.23-.38a9.83 9.83 0 0 1-1.5-5.19C2.25 6.43 6.68 2 12.13 2a9.8 9.8 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.88 6.99c0 5.46-4.43 9.89-9.87 9.89Zm5.42-7.41c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.49 1.71.63.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      );

    case "Telegram":
      return (
        <svg {...commonProps}>
          <path d="M21.9 3.1 18.7 20c-.24 1.19-.89 1.48-1.8.92l-5-3.68-2.41 2.32c-.27.27-.5.5-1.02.5l.36-5.08 9.25-8.36c.4-.36-.09-.56-.62-.2L6.03 13.64l-4.92-1.54c-1.07-.34-1.09-1.07.22-1.58L20.57 2.8c.89-.33 1.67.2 1.33.3Z" />
        </svg>
      );
  }
}

export default function FollowUs() {
  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.FOLLOW_US_VIEWED,
      eventType: "view",
      path: window.location.pathname,
    });
  }, []);

  const handlePlatformClick = (
    eventName: (typeof socialLinks)[number]["event"],
  ) => {
    trackAnalyticsEvent({
      name: eventName,
      eventType: "click",
      path: window.location.pathname,
    });
  };

  return (
    <section
      aria-labelledby="follow-us-heading"
      className="flex flex-col gap-6"
    >
      <h2 id="follow-us-heading" className="text-sm font-bold text-[#0052FF]">
        Follow Us
      </h2>

      <nav aria-label="Social connections">
        <ul className="flex flex-wrap items-center gap-2.5">
          {socialLinks.map((social) => (
            <li key={social.name}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.name}
                onClick={() => handlePlatformClick(social.event)}
                className={`
                  inline-flex h-8 w-8 items-center justify-center
                  rounded-full ${social.bgClass} ${social.hoverClass}
                  text-white shadow-sm
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#0052FF]
                  focus:ring-offset-2
                `}
              >
                <SocialIcon name={social.name} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
