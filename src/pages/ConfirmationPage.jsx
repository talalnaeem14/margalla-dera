import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "../utils/format.js";
import "../styles/cart.css";
import "../styles/checkout.css";

// Final screen of the journey (FR16). The order arrives in the router state.
export default function ConfirmationPage() {
  const { state } = useLocation();
  const order = state?.order;
  const headingRef = useRef(null);

  // Move focus to the heading so keyboard and screen-reader users land on the result.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Opened directly (typed address or a new tab): there is no order to show.
  if (!order) {
    return (
      <section>
        <h1>No recent order to show</h1>
        <p>This page shows your order right after you place it. Start a new order from the menu.</p>
        <Link to="/" className="btn btn-primary">
          Browse the menu
        </Link>
      </section>
    );
  }

  const { fulfilment, summary } = order;

  return (
    <section className="confirmation">
      <h1 ref={headingRef} tabIndex={-1}>
        Order placed (simulated)
      </h1>
      <p className="notice notice-success" role="status">
        <strong>Success:</strong> thank you, {order.nickname}. Your order reference is <strong>{order.reference}</strong>.
        Nothing was charged and nothing will be delivered, because this is a demonstration.
      </p>

      <div className="cart-layout">
        <div>
          <h2>{fulfilment.method === "delivery" ? "Delivery details" : "Pickup details"}</h2>
          <dl className="facts">
            <dt>Method</dt>
            <dd>{fulfilment.method === "delivery" ? "Delivery" : "Pickup"}</dd>
            {fulfilment.method === "delivery" ? (
              <>
                <dt>Sector</dt>
                <dd>{fulfilment.sector}</dd>
                <dt>Address</dt>
                <dd>{fulfilment.address}</dd>
              </>
            ) : (
              <>
                <dt>Collect from</dt>
                <dd>
                  {fulfilment.name}, {fulfilment.address}
                </dd>
              </>
            )}
            <dt>Phone</dt>
            <dd>{order.phone}</dd>
            {order.notes && (
              <>
                <dt>Notes</dt>
                <dd>{order.notes}</dd>
              </>
            )}
            <dt>Placed</dt>
            <dd>{new Date(order.placedAt).toLocaleString("en-PK")}</dd>
          </dl>
        </div>

        <aside className="cart-summary" aria-labelledby="confirmation-summary-title">
          <h2 id="confirmation-summary-title">Order summary</h2>
          <ul className="summary-lines">
            {order.lines.map((line) => (
              <li key={line.id}>
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span>{formatPrice(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="facts">
            <dt>Serves</dt>
            <dd>
              {summary.serves} {summary.serves === 1 ? "person" : "people"}
            </dd>
            <dt>Subtotal</dt>
            <dd>{formatPrice(summary.subtotal)}</dd>
            <dt>{fulfilment.method === "delivery" ? "Delivery" : "Pickup"}</dt>
            <dd>{summary.deliveryFee === 0 ? "Free" : formatPrice(summary.deliveryFee)}</dd>
            <dt className="total-label">Total</dt>
            <dd className="total-value">{formatPrice(summary.total)}</dd>
          </dl>
        </aside>
      </div>

      <p>
        <Link to="/" className="btn btn-primary">
          Back to the menu
        </Link>
      </p>
    </section>
  );
}
