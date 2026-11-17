const facts = ["No Stress", "No Confusion", "No Jargons", "Just Simple"];

export default function HeroBottom() {
  return (
    <div className="w-full text-center">
      {/* Centered heading */}
      <h3 className="text-xl font-bold leading-tight text-black-700 sm:text-2xl">
        Reliable solutions that help you grow.
      </h3>

      {/* Centered flex container for the cards */}
      <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
        {facts.map((fact) => (
          <div
            key={fact}
            className="group flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-2.5 shadow-sm transition-colors duration-200 hover:border-blue-600 hover:bg-blue-600"
          >
            {/* Checkbox: stays white with blue tick normally, becomes all-white on hover */}
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-blue-400 bg-white text-xs font-bold text-blue-600 transition-colors duration-200 group-hover:border-white group-hover:bg-white"
            >
              ✓
            </span>

            {/* Text: turns white when hovering over the box */}
            <span className="whitespace-nowrap text-sm font-semibold text-black transition-colors duration-200 group-hover:text-white">
              {fact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
