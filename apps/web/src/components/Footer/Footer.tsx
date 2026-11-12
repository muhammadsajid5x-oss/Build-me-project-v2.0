import { Link } from "react-router-dom";
import AboutMe from "./AboutMe";
import FollowUs from "./FollowUs";
import ShareThisPage from "./ShareThisPage";
import GiveReferrals from "./GiveReferrals";

export default function Footer() {
  return (
    <footer className="bg-white" aria-labelledby="footerHeading">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer row */}
        <div className="grid grid-cols-2 lg:grid-cols-[1.20fr_1.4fr_1.4fr_1.4fr_1.4fr]">
          {/* Child Story 11 — Follow Us */}
          <div
            className="
              min-w-0 overflow-hidden py-4
              sm:py-5
              lg:py-4 lg:pr-0
            "
          >
            <div className="origin-left scale-[0.85] whitespace-nowrap sm:scale-90 md:scale-95 lg:scale-90">
              <FollowUs />
            </div>
          </div>

          {/* Child Story 12 — Share This Page */}
          <div
            className="
              min-w-0 overflow-hidden whitespace-nowrap py-4
              sm:py-5
              lg:pl-0 lg:pr-0 lg:py-3
            "
          >
            <div className="origin-left scale-[0.85] whitespace-nowrap sm:scale-90 md:scale-95 lg:scale-90">
              <ShareThisPage />
            </div>
          </div>

          {/* Child Story 13 — Give Referrals */}
          <div
            className="
              min-w-0 overflow-hidden whitespace-nowrap py-4
              sm:py-5
              lg:pl-0 lg:pr-0 lg:py-1
            "
          >
            <div className="origin-left scale-[0.85] lg:ml-0 py-2 whitespace-nowrap sm:scale-90 md:scale-95 lg:scale-90">
              <GiveReferrals />
            </div>
          </div>

          {/* Child Story 14 — About Me */}
          <div
            className="
              min-w-0 overflow-hidden whitespace-nowrap py-4
              sm:py-5
              lg:pl-0 lg:pr-0 lg:py-8
            "
          >
            <div className="origin-left scale-[0.85] lg:ml-0 py-0 whitespace-nowrap sm:scale-90 md:scale-95 lg:scale-90">
              <AboutMe />
            </div>
          </div>

          {/* Copyright / Brand */}
          <div
            className="
              col-span-2 flex min-w-0 items-center py-4
              sm:py-5
              lg:col-span-1 lg:py-1 lg:pl-1
            "
          >
            <div className="flex min-w-0 items-center gap-1 whitespace-nowrap">
              <div
                className="
                  text-[10px] leading-4 text-gray-500
                  sm:text-[11px] sm:leading-5
                  md:text-xs md:leading-5
                  lg:text-xs lg:leading-5
                "
              >
                <p className="mt-1 whitespace-nowrap">
                  © 2026 Cup&Commit. All rights reserved.
                </p>
                <p className="mt-1 whitespace-nowrap">
                  Innovate. Collaborate. Grow Together.
                </p>
              </div>

              <img
                src="/icon.png"
                alt="Cup&Commit"
                className="
                  h-8 w-8 shrink-0 object-contain
                  sm:h-9 sm:w-9
                  md:h-10 md:w-10
                  lg:h-10 lg:w-10
                "
              />
            </div>
          </div>
        </div>

        {/* Legal links */}
        <nav
          aria-label="Legal"
          className="
            py-4
            sm:py-5
            lg:py-5
          "
        >
          <ul
            className="
              flex flex-wrap items-center
              gap-x-4 gap-y-2
              text-[10px] text-gray-500
              sm:gap-x-5 sm:text-[11px]
              md:gap-x-6 md:text-xs
              lg:gap-x-6 lg:text-xs
            "
          >
            <li>
              <Link
                to="/terms-and-conditions"
                className="transition hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
              >
                Terms & Conditions
              </Link>
            </li>

            <li>
              <Link
                to="/privacy-policy"
                className="transition hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
              >
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link
                to="/cookie-policy"
                className="transition hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2"
              >
                Cookie Policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
