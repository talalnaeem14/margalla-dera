import ItemCard from "../components/ItemCard.jsx";
import { useMenu } from "../context/useMenu.js";

export default function MenuPage() {
  const { status, items, error, reload } = useMenu();

  return (
    <>
      <h1>Menu</h1>

      {status === "loading" && <p role="status">Loading the menu…</p>}

      {status === "error" && (
        <div role="alert" className="notice notice-error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <ul className="item-grid">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
