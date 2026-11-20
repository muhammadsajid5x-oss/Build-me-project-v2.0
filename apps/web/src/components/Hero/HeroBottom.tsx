const facts = ["No Stress", "No Confusion", "No Jargons", "Just Simple"];

export default function HeroBottom() {
  return (
    <div className="w-full py-10 text-center">
      {/* Divider */}
      <div
        aria-hidden="true"
        className="relative left-1/2 hidden h-0.5 w-screen -translate-x-1/2 bg-blue-700 lg:block"
      />

      {/* Heading */}
      <h3 className="mt-8 text-xl font-bold leading-tight text-blue-700 sm:text-2xl">
        Reliable solutions that help you grow.
      </h3>

      {/* Key Facts */}
      <div className="mt-5 flex w-full flex-nowrap items-stretch justify-center gap-1.5 sm:gap-3 md:gap-4">
        {facts.map((fact) => (
          <div
            key={fact}
            className="group flex min-w-0 flex-1 items-center justify-center gap-1 border-2 border-black bg-blue-100 px-1.5 py-2 transition-colors duration-200 hover:bg-blue-700 sm:gap-2 sm:px-3 sm:py-2.5 md:px-4"
          >
            <span
              aria-hidden="true"
              className="flex h-4 w-4 shrink-0 items-center justify-center border-2 border-blue-700 bg-white text-[9px] font-bold text-blue-700 transition-colors duration-200 group-hover:border-white group-hover:text-blue-700 sm:h-5 sm:w-5 sm:text-xs"
            >
              ✓
            </span>

            <span className="whitespace-nowrap text-[10px] font-semibold text-black transition-colors duration-200 group-hover:text-white sm:text-sm">
              {fact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
