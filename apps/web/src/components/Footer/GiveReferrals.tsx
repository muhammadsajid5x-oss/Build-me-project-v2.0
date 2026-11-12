import { useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../../analytics";

type Step = 1 | 2 | 3;

type Relationship = "friend" | "family" | "colleague" | "";

type ReferralForm = {
  referrerName: string;
  referrerEmail: string;
  contactName: string;
  contactEmail: string;
  relationship: Relationship;
  reason: string;
};

const initialForm: ReferralForm = {
  referrerName: "",
  referrerEmail: "",
  contactName: "",
  contactEmail: "",
  relationship: "",
  reason: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function GiveReferrals() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ReferralForm>(initialForm);
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.GIVE_REFERRALS_VIEWED,
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
        closeModal();
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
      name: ANALYTICS_EVENTS.GIVE_REFERRALS_CLICKED,
      eventType: "click",
      path: window.location.pathname,
    });

    setStep(1);
    setSubmitted(false);
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setStep(1);
    setSubmitted(false);
    setError("");
  };

  const updateField = <K extends keyof ReferralForm>(
    field: K,
    value: ReferralForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const continueToStepTwo = () => {
    if (!form.referrerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!isValidEmail(form.referrerEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.GIVE_REFERRALS_STEP_ONE_COMPLETED,
      eventType: "click",
    });

    setError("");
    setStep(2);
  };

  const continueToStepThree = () => {
    if (!form.contactName.trim()) {
      setError(
        "Please enter your friend's, family member's, or colleague's name.",
      );
      return;
    }

    if (!isValidEmail(form.contactEmail)) {
      setError("Please enter a valid contact email address.");
      return;
    }

    if (!form.relationship) {
      setError("Please select your relationship.");
      return;
    }

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.GIVE_REFERRALS_STEP_TWO_COMPLETED,
      eventType: "click",
    });

    setError("");
    setStep(3);
  };

  const submitReferral = () => {
    if (!form.reason.trim()) {
      setError("Please tell us why you are making this referral.");
      return;
    }

    trackAnalyticsEvent({
      name: ANALYTICS_EVENTS.GIVE_REFERRALS_COMPLETED,
      eventType: "click",
    });

    setError("");
    setSubmitted(true);
  };

  const goBack = () => {
    setError("");

    if (step === 2) {
      setStep(1);
    }

    if (step === 3) {
      setStep(2);
    }
  };

  return (
    <>
      <section
        aria-labelledby="give-referrals-heading"
        className="flex h-full items-center"
      >
        <button
          type="button"
          onClick={openModal}
          aria-label="Give Referrals"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="group flex w-full items-center gap-4 px-6 py-4 text-left transition focus:outline-none"
        >
          <svg
            className="h-9 w-9 shrink-0 text-[#22C55E] transition-transform duration-200 group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="8" width="18" height="13" rx="2" />
            <path d="M12 8v13" />
            <path d="M3 12h18" />
            <path d="M12 8H7.5a2.5 2.5 0 1 1 0-5C10.5 3 12 8 12 8Z" />
            <path d="M12 8h4.5a2.5 2.5 0 1 0 0-5C13.5 3 12 8 12 8Z" />
          </svg>

          <div className="min-w-0">
            <h2
              id="give-referrals-heading"
              className="text-base font-bold text-[#22C55E] group-hover:underline"
            >
              Give Referrals
            </h2>

            <p className="text-xs text-gray-600">Help others grow with us.</p>
          </div>
        </button>
      </section>

      {isOpen && (
        <dialog
          ref={dialogRef}
          aria-labelledby="give-referrals-dialog-title"
          className="fixed inset-0 m-auto w-full max-w-md rounded-xl bg-white p-6 shadow-xl backdrop:bg-black/50"
          onClose={closeModal}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <svg
                  className="h-7 w-7 text-[#22C55E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <h2
                id="give-referrals-dialog-title"
                className="mt-4 text-lg font-bold text-gray-900"
              >
                Referral Submitted
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Thank you for the referral. Your referral details have been
                submitted successfully.
              </p>

              <button
                type="button"
                onClick={closeModal}
                className="mt-6 w-full rounded-md bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="h-7 w-7 text-[#22C55E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="8" width="18" height="13" rx="2" />
                    <path d="M12 8v13" />
                    <path d="M3 12h18" />
                    <path d="M12 8H7.5a2.5 2.5 0 1 1 0-5C10.5 3 12 8 12 8Z" />
                    <path d="M12 8h4.5a2.5 2.5 0 1 0 0-5C13.5 3 12 8 12 8Z" />
                  </svg>

                  <h2
                    id="give-referrals-dialog-title"
                    className="text-base font-semibold text-gray-900"
                  >
                    Give Referrals
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close referral dialog"
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
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

              <div className="mt-5 flex items-center justify-center gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-1.5 flex-1 rounded-full ${
                      item <= step ? "bg-[#22C55E]" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {step === 1 && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Your Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Tell us who is making the referral.
                    </p>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Your Name
                    </span>
                    <input
                      type="text"
                      value={form.referrerName}
                      onChange={(event) =>
                        updateField("referrerName", event.target.value)
                      }
                      className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Your Email
                    </span>
                    <input
                      type="email"
                      value={form.referrerEmail}
                      onChange={(event) =>
                        updateField("referrerEmail", event.target.value)
                      }
                      className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                      placeholder="you@example.com"
                    />
                  </label>

                  {error && (
                    <p role="alert" className="text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={continueToStepTwo}
                    className="w-full rounded-md bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Friend, Family, or Colleague
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Tell us who you would like to refer.
                    </p>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Name
                    </span>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(event) =>
                        updateField("contactName", event.target.value)
                      }
                      className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                      placeholder="Their name"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Email
                    </span>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(event) =>
                        updateField("contactEmail", event.target.value)
                      }
                      className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                      placeholder="their@example.com"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Relationship
                    </span>
                    <select
                      value={form.relationship}
                      onChange={(event) =>
                        updateField(
                          "relationship",
                          event.target.value as Relationship,
                        )
                      }
                      className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                    >
                      <option value="">Select relationship</option>
                      <option value="friend">Friend</option>
                      <option value="family">Family</option>
                      <option value="colleague">Colleague</option>
                    </select>
                  </label>

                  {error && (
                    <p role="alert" className="text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={goBack}
                      className="w-1/3 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={continueToStepThree}
                      className="w-2/3 rounded-md bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Confirmation
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Tell us why you think this person would benefit.
                    </p>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Why are you making this referral?
                    </span>
                    <textarea
                      value={form.reason}
                      onChange={(event) =>
                        updateField("reason", event.target.value)
                      }
                      rows={4}
                      className="mt-1.5 w-full resize-none rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                      placeholder="Tell us how we can help..."
                    />
                  </label>

                  <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                    <p>
                      <strong className="text-gray-800">Referrer:</strong>{" "}
                      {form.referrerName}
                    </p>
                    <p className="mt-1">
                      <strong className="text-gray-800">Referral:</strong>{" "}
                      {form.contactName}
                    </p>
                    <p className="mt-1">
                      <strong className="text-gray-800">Relationship:</strong>{" "}
                      {form.relationship}
                    </p>
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={goBack}
                      className="w-1/3 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={submitReferral}
                      className="w-2/3 rounded-md bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
                    >
                      Submit Referral
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </dialog>
      )}
    </>
  );
}
