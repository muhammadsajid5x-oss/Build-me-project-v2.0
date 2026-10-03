import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section>
      <h1 className="text-3xl font-bold">Build Me</h1>
      <p className="mt-2">Public website foundation.</p>
      <Link className="mt-4 inline-block underline" to="/foundation-test">
        Foundation Test Page
      </Link>
    </section>
  );
}
