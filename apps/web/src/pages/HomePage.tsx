import { Link } from "react-router-dom";
import TechnologyOwnershipHero from "../components/Hero/hero-left";

export default function HomePage() {
  return (
    <section>
      <TechnologyOwnershipHero />

      <Link className="mt-4 inline-block underline" to="/foundation-test">
        Foundation Test Page
      </Link>
    </section>
  );
}
