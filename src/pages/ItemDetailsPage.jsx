import { Link, useParams } from "react-router-dom";
import ItemImage from "../components/ItemImage.jsx";
import { SERVICE_LABELS } from "../data/menuItems.js";
import { useMenu } from "../context/useMenu.js";
import { formatPrice } from "../utils/format.js";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const { status, items, error, reload } = useMenu();
  const item = items.find((candidate) => candidate.id === id);

  if (status === "loading") {
    return <p role="status">Loading the item…</p>;
  }

  if (status === "error") {
    return (
      <div role="alert" className="notice notice-error">
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          Try again
        </button>
      </div>
    );
  }

  // Invalid ID (FR02): explain what happened and offer a way forward.
  if (!item) {
    return (
      <section>
        <h1>We couldn't find that item</h1>
        <p>
          There is no menu item called "{id}". It may have been removed, or the link may be
          mistyped.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to the menu
        </Link>
      </section>
    );
  }

  return (
    <article className="item-details">
      <p>
        <Link to="/">← Back to the menu</Link>
      </p>
      <div className="item-details-layout">
        <ItemImage item={item} />
        <div>
          <h1>{item.name}</h1>
          <p className="item-details-price">{formatPrice(item.price)}</p>
          <p>{item.description}</p>
          <dl className="facts">
            <dt>Category</dt>
            <dd>{item.category}</dd>
            <dt>Serves</dt>
            <dd>
              {item.serves} {item.serves === 1 ? "person" : "people"}
            </dd>
            <dt>Available</dt>
            <dd>{SERVICE_LABELS[item.service]}</dd>
            <dt>Diet</dt>
            <dd>{item.vegetarian ? "Vegetarian" : "Contains meat"}</dd>
            <dt>Order limit</dt>
            <dd>
              Up to {item.maxPerOrder} per order{item.limitedBatch ? " (limited batch)" : ""}
            </dd>
          </dl>
          {item.soldOut && (
            <p className="notice notice-warning" role="status">
              This item is sold out right now.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
