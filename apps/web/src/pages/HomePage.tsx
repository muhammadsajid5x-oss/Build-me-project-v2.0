import TechnologyOwnershipHero from "../components/Hero/hero-left";
import HeroRight from "../components/Hero/hero-right";

export default function HomePage() {
  return (
    <div className="relative w-full overflow-visible">
      <section
        aria-labelledby="technology-ownership-heading"
        className="
          relative
          mx-auto
          grid
          w-full
          max-w-7xl
          grid-cols-1
          items-start
          gap-0
          px-4
          pt-8
          sm:px-6
          lg:grid-cols-2
          lg:px-4
        "
      >
        <TechnologyOwnershipHero />

        <HeroRight />
      </section>
    </div>
  );
}
