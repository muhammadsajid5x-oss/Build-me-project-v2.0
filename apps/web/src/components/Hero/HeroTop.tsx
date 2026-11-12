export interface HeroTopProps {
  badge?: string;
}

export default function HeroTop({
  badge = "TECHNOLOGY OWNERSHIP",
}: Readonly<HeroTopProps>) {
  return (
    <div className="w-full px-4 text-left sm:px-6 lg:px-0">
      <div className="inline-flex w-fit items-center rounded-full bg-blue-100 px-3.5 py-1 sm:px-4 sm:py-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-700 sm:text-xs">
          {badge}
        </p>
      </div>
    </div>
  );
}
