export interface LoadingProps {
  readonly label?: string;
}
export function Loading({ label = "Loading..." }: LoadingProps) {
  return (
    <output aria-live="polite" className="block p-8">
      {label}
    </output>
  );
}
