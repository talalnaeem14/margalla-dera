import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>That address does not match any page on Margalla Dera.</p>
      <Link to="/" className="btn btn-primary">
        Go to the menu
      </Link>
    </section>
  );
}
