const facts = ["No Stress", "No Confusion", "No Jargons", "Just Simple"];

export default function HeroBottom() {
  return (
    <div className="w-full py-10 text-center">
      {/* Divider */}
      <div
        aria-hidden="true"
        className="mx-auto hidden h-0.5 w-full bg-blue-700 lg:block"
      />

      {/* Heading */}
      <h3 className="mt-8 text-xl font-bold leading-tight text-blue-700 sm:text-2xl">
        Reliable solutions that help you grow.
      </h3>

      {/* Fact cards */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {facts.map((fact) => (
          <div
            key={fact}
            className="group flex items-center gap-2.5 border-2 border-blue-100 bg-white px-4 py-2.5 transition-colors duration-200 hover:border-blue-700 hover:bg-blue-700"
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center border-2 border-blue-700 bg-white text-xs font-bold text-blue-700 transition-colors duration-200 group-hover:border-white group-hover:text-blue-700"
            >
              ✓
            </span>

            <span className="whitespace-nowrap text-sm font-semibold text-black transition-colors duration-200 group-hover:text-white">
              {fact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
