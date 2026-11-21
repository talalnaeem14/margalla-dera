import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ItemImage from "../components/ItemImage.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import { SERVICE_LABELS } from "../data/menuItems.js";
import { useCart } from "../context/useCart.js";
import { useMenu } from "../context/useMenu.js";
import { conflictIfAdded } from "../rules/compatibilityRule.js";
import { formatPrice } from "../utils/format.js";
import "../styles/cart.css";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const { status, items, error, reload } = useMenu();
  const { lines, addItem } = useCart();
  const [amount, setAmount] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");
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

  // Derived values for the add-to-order area.
  const inOrder = lines.find((l) => l.item.id === item.id)?.quantity ?? 0;
  const room = item.maxPerOrder - inOrder; // how many more the order can take (Rule 1)
  const chosen = Math.min(amount, Math.max(room, 1));
  const conflict = conflictIfAdded(lines, item); // Rule 2 warning: shown before adding and while the clash remains
  const canAdd = !item.soldOut && room > 0;

  function handleAdd() {
    addItem(item, chosen);
    setAddedMessage(`Added ${chosen} × ${item.name} to your order.`);
    setAmount(1);
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
          {conflict && (
            <div className="notice notice-warning" role="alert">
              <strong>Heads up: this clashes with your order.</strong>
              <p>{conflict.message}</p>
              <p>
                {inOrder > 0
                  ? "Checkout stays blocked until you remove one side from your order."
                  : "You can still add it, but you will need to remove one side before checkout."}
              </p>
            </div>
          )}

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

          {canAdd ? (
            <div className="add-area">
              <QuantityControl item={item} quantity={chosen} alreadyInCart={inOrder} onChange={setAmount} />
              <button type="button" className="btn btn-primary" onClick={handleAdd}>
                Add {chosen} to order
              </button>
            </div>
          ) : (
            !item.soldOut && (
              <p className="notice notice-warning" role="status">
                Your order already has the maximum of {item.maxPerOrder} for this item.
              </p>
            )
          )}
          {inOrder > 0 && <p>{inOrder} already in your order.</p>}

          <p className="add-feedback" role="status">
            {addedMessage}{" "}
            {addedMessage && (
              <Link to="/cart" className="btn btn-secondary">
                View your order
              </Link>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
