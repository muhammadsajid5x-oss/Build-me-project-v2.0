import { useState } from "react";

import FoundationCheckinCard from "../components/FoundationCheckinCard";

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
      {completed && <output className="mt-4">Foundation test passed.</output>}
      <FoundationCheckinCard />
    </section>
  );
}
