type EmptyStateProps = {
  message?: string;
};
export default function EmptyState({
  message = "No data available.",
}: EmptyStateProps) {
  return (
    <div role="status" className="p-8">
      {message}
    </div>
  );
}
