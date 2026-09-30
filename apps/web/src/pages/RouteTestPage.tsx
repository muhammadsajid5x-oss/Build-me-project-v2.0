import { Link } from "react-router-dom";

export default function RouteTestPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold">Another Route</h1>
      <p className="mt-2">Build Me routing is working.</p>
      <Link className="mt-4 inline-block underline" to="/">
        Home
      </Link>
    </section>
  );
}
