import { useState } from "react";

export default function FoundationTestPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <section>
      <h1 className="text-3xl font-bold">Foundation Test Page</h1>
      <button
        className="mt-4 rounded border px-4 py-2"
        type="button"
        onClick={() => setCompleted(true)}
      >
        Run Foundation Test
      </button>
      {completed && (
        <p className="mt-4" role="status">
          Foundation test passed.
        </p>
      )}
    </section>
  );
}