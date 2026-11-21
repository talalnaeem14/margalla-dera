import { Link } from "react-router-dom";
import QuantityControl from "../components/QuantityControl.jsx";
import { useCart } from "../context/useCart.js";
import { useMenu } from "../context/useMenu.js";
import { useShopTime } from "../context/useShopTime.js";
import { findConflict } from "../rules/compatibilityRule.js";
import { getOrderProblems } from "../rules/orderCheck.js";
import { calculateSummary } from "../utils/pricing.js";
import { formatPrice } from "../utils/format.js";
import { FREE_DELIVERY_FROM, DELIVERY_FEE } from "../data/serviceAreas.js";
import "../styles/cart.css";

export default function CartPage() {
  const { status, error, reload } = useMenu();
  const { lines, restoreNotes, dismissNotes, setQuantity, removeItem } = useCart();
  const { minutes } = useShopTime();

  if (status === "loading") return <p role="status">Loading your order…</p>;
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

  const notes = restoreNotes.length > 0 && (
    <section className="notice notice-warning" aria-labelledby="restore-title">
      <h2 id="restore-title">We updated your saved order</h2>
      <ul>
        {restoreNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <button type="button" className="btn btn-secondary" onClick={dismissNotes}>
        Dismiss
      </button>
    </section>
  );

  // Distinct empty state (FR15): the order is empty, so say what to do next.
  if (lines.length === 0) {
    return (
      <section>
        <h1>Your order</h1>
        {notes}
        <div className="notice">
          <h2>Your order is empty</h2>
          <p>Add something from the menu to get started. Your order is saved on this device.</p>
          <Link to="/" className="btn btn-primary">
            Browse the menu
          </Link>
        </div>
      </section>
    );
  }

  // Derived values: nothing here is stored, it is all calculated from the lines.
  const problems = getOrderProblems(lines, minutes);
  const conflict = findConflict(lines);
  const otherProblems = problems.filter((p) => p.code !== "conflict");
  const summary = calculateSummary(lines, "delivery");
  const canCheckout = problems.length === 0;

  return (
    <section>
      <h1>Your order</h1>
      {notes}

      {conflict && (
        <section className="notice notice-error" aria-labelledby="conflict-title">
          <h2 id="conflict-title">These items can't be ordered together</h2>
          <p>{conflict.message}</p>
          <p>Choose which side to remove:</p>
          <ul className="conflict-actions">
            {[...conflict.breakfast, ...conflict.bbq].map((item) => (
              <li key={item.id}>
                <button type="button" className="btn btn-secondary" onClick={() => removeItem(item.id)}>
                  Remove {item.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="cart-layout">
        <div>
          <h2>Items</h2>
          <ul className="cart-lines">
            {lines.map(({ item, quantity }) => (
              <li key={item.id} className="cart-line">
                <div className="cart-line-main">
                  <h3>
                    <Link to={`/items/${item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="cart-line-price">{formatPrice(item.price)} each</p>
                  {item.soldOut && (
                    <p className="tag tag-soldout" role="status">
                      Sold out
                    </p>
                  )}
                </div>
                <QuantityControl item={item} quantity={quantity} onChange={(q) => setQuantity(item, q)} />
                <p className="cart-line-total">{formatPrice(item.price * quantity)}</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  aria-label={`Remove ${item.name} from your order`}
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="cart-summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Order summary</h2>
          <dl className="facts">
            <dt>Items</dt>
            <dd>{summary.itemCount}</dd>
            <dt>Serves</dt>
            <dd>
              {summary.serves} {summary.serves === 1 ? "person" : "people"}
            </dd>
            <dt>Subtotal</dt>
            <dd>{formatPrice(summary.subtotal)}</dd>
          </dl>
          <p className="cart-delivery-note">
            Delivery: {formatPrice(DELIVERY_FEE)}, free from {formatPrice(FREE_DELIVERY_FROM)} or for pickup.
            {summary.amountToFreeDelivery > 0 && ` Add ${formatPrice(summary.amountToFreeDelivery)} more for free delivery.`}
          </p>
          <p className="cart-simulated">This is a simulated order. No payment is taken.</p>

          {canCheckout ? (
            <Link to="/checkout" className="btn btn-primary cart-checkout">
              Continue to checkout
            </Link>
          ) : (
            <>
              <button type="button" className="btn btn-primary cart-checkout" disabled aria-describedby="checkout-reasons">
                Continue to checkout
              </button>
              <div id="checkout-reasons" className="cart-reasons">
                <p>You can't check out yet:</p>
                <ul>
                  {otherProblems.map((p) => (
                    <li key={p.code + (p.itemId ?? "")}>{p.message}</li>
                  ))}
                  {conflict && <li>Resolve the item conflict above.</li>}
                </ul>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
