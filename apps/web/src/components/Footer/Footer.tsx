import FollowUs from "./FollowUs";
import ShareThisPage from "./ShareThisPage";

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="border-t border-gray-200 bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Child Story 11 — Follow Us */}
          <FollowUs />

          {/* Child Story 12 — Share this Page */}
          <ShareThisPage />

          {/* Child Story 13 — Give Referrals */}
          <div aria-hidden="true" />

          {/* Child Story 14 — About Us */}
          <div aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
