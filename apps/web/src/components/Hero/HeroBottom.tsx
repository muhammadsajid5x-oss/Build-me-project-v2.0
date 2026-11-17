const facts = ["No Stress", "No Confusion", "No Jargons", "Just simple"];

export default function HeroBottom() {
  return (
    <div className="w-full text-left">
      <h3 className="text-x2 font-bold leading-tight text-blue-700 sm:text-2xl">
        Reliable solutions that help you grow.
      </h3>

      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3">
        {facts.map((fact) => (
          <div key={fact} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0052FF] text-xs font-bold text-white"
            >
              ✓
            </span>

            <span className="whitespace-nowrap text-sm font-semibold text-slate-900">
              {fact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
