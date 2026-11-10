import { useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../../analytics";

type ShareChannel =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "pinterest"
  | "tiktok"
  | "telegram"
  | "whatsapp"
  | "youtube"
  | "snapchat"
  | "email";

type ChannelConfig = {
  label: string;
  event: Extract<
    keyof typeof ANALYTICS_EVENTS,
    `SHARE_THIS_PAGE_${string}_CLICKED`
  >;
  getUrl: (pageUrl: string, title: string) => string;
};

const channels: Record<ShareChannel, ChannelConfig> = {
  facebook: {
    label: "Facebook",
    event: "SHARE_THIS_PAGE_FACEBOOK_CLICKED",
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  instagram: {
    label: "Instagram",
    event: "SHARE_THIS_PAGE_INSTAGRAM_CLICKED",
    getUrl: (url) =>
      `https://www.instagram.com/?url=${encodeURIComponent(url)}`,
  },
  twitter: {
    label: "Twitter",
    event: "SHARE_THIS_PAGE_TWITTER_CLICKED",
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  linkedin: {
    label: "LinkedIn",
    event: "SHARE_THIS_PAGE_LINKEDIN_CLICKED",
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  pinterest: {
    label: "Pinterest",
    event: "SHARE_THIS_PAGE_PINTEREST_CLICKED",
    getUrl: (url, title) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
  tiktok: {
    label: "TikTok",
    event: "SHARE_THIS_PAGE_TIKTOK_CLICKED",
    getUrl: (url) =>
      `https://www.tiktok.com/share?url=${encodeURIComponent(url)}`,
  },
  telegram: {
    label: "Telegram",
    event: "SHARE_THIS_PAGE_TELEGRAM_CLICKED",
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  whatsapp: {
    label: "WhatsApp",
    event: "SHARE_THIS_PAGE_WHATSAPP_CLICKED",
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
  },
  youtube: {
    label: "YouTube",
    event: "SHARE_THIS_PAGE_YOUTUBE_CLICKED",
    getUrl: (url) => `https://www.youtube.com/?url=${encodeURIComponent(url)}`,
  },
  snapchat: {
    label: "Snapchat",
    event: "SHARE_THIS_PAGE_SNAPCHAT_CLICKED",
    getUrl: (url) =>
      `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`,
  },
  email: {
    label: "Email",
    event: "SHARE_THIS_PAGE_EMAIL_CLICKED",
    getUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
};

export default function ShareThisPage() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const pageTitle =
    typeof document !== "undefined" ? document.title : "Cup&Cummit";

  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.SHARE_THIS_PAGE_VIEWED,
      eventType: "view",
      path: window.location.pathname,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (dialogRef.current?.open) {
        dialogRef.current.close();
      }
    };
  }, [isOpen]);

  const openModal = () => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.SHARE_THIS_PAGE_CLICKED,
      eventType: "click",
    });

    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const shareToChannel = (channel: ShareChannel) => {
    const config = channels[channel];

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS[config.event],
      eventType: "click",
    });

    const shareUrl = config.getUrl(pageUrl, pageTitle);

    window.open(shareUrl, "_blank", "noopener,noreferrer,width=700,height=600");
  };

  const shareWithApp = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      return;
    }

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.SHARE_THIS_PAGE_APP_CLICKED,
      eventType: "click",
    });

    try {
      await navigator.share({
        title: pageTitle,
        url: pageUrl,
      });
    } catch {
      // User cancelled the native share dialog.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);

      trackAnalyticsEvent({
        name: ANALYTICS_EVENTS.SHARE_THIS_PAGE_COPY_LINK_CLICKED,
        eventType: "click",
      });
    } catch {
      // Clipboard access is optional.
    }
  };

  return (
    <>
      <section aria-labelledby="share-this-page-heading">
        <div className="flex items-center justify-between border-x border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openModal}
              aria-label="Share this page"
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              className="flex items-center gap-4 text-left transition focus:outline-none group"
            >
              <svg
                className="h-9 w-9 text-blue-600 shrink-0 transition group-hover:scale-105"
                style={{ transform: "rotate(320deg)" }}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>

              <div>
                <h2
                  id="share-this-page-heading"
                  className="text-base font-bold text-blue-600 group-hover:underline"
                >
                  Share This Page
                </h2>
                <p className="text-xs text-gray-600">
                  Spread value. Inspire others.
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {isOpen && (
        <dialog
          ref={dialogRef}
          aria-labelledby="share-dialog-title"
          className="fixed inset-0 m-auto w-full max-w-md rounded-xl bg-white p-6 shadow-xl backdrop:bg-black/50"
          onClose={closeModal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeModal();
            }
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-blue-600 shrink-0 transition group-hover:scale-105"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <h2
                id="share-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Share This Page
              </h2>
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close share dialog"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Share Cup&Cummit with your network
          </p>

          <div className="mt-4 grid max-h-60 grid-cols-3 gap-2 overflow-y-auto pr-1">
            {(Object.keys(channels) as ShareChannel[]).map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => shareToChannel(channel)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {channels[channel].label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {typeof navigator !== "undefined" &&
              typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={shareWithApp}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <svg
                    className="h-6 w-6 text-white-600 shrink-0 transition group-hover:scale-105"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share With an App
                </button>
              )}

            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              Copy Link
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
