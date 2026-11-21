import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import { useCart } from "../context/useCart.js";
import { useMenu } from "../context/useMenu.js";
import { useShopTime } from "../context/useShopTime.js";
import { DELIVERY_SECTORS, FREE_DELIVERY_FROM, PICKUP_POINT } from "../data/serviceAreas.js";
import { getOrderProblems } from "../rules/orderCheck.js";
import { EMPTY_FORM, LIMITS, validateCheckout } from "../utils/checkoutForm.js";
import { formatPrice } from "../utils/format.js";
import { createOrder } from "../utils/order.js";
import { calculateSummary } from "../utils/pricing.js";
import "../styles/cart.css";
import "../styles/checkout.css";

// Where to move focus for each field when the customer picks it from the error list.
function fieldElementId(name) {
  return name === "method" ? "method-delivery" : `field-${name}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { status, error, reload } = useMenu();
  const { lines, clearCart } = useCart();
  const { minutes } = useShopTime();

  // One object holds every field. Updates copy it (never mutate it), and nothing
  // typed here is saved to storage: only the cart is (no personal details).
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [failedSubmits, setFailedSubmits] = useState(0);
  const summaryRef = useRef(null);

  // After a failed submit the error list is drawn on the next render, so focus it
  // from an effect (the element does not exist yet inside the submit handler).
  useEffect(() => {
    if (failedSubmits > 0) summaryRef.current?.focus();
  }, [failedSubmits]);

  if (status === "loading") return <p role="status">Loading checkout…</p>;
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

  // Nothing to check out: explain and point to the menu.
  if (lines.length === 0) {
    return (
      <section>
        <h1>Checkout</h1>
        <div className="notice">
          <h2>Your order is empty</h2>
          <p>Add something from the menu before checking out.</p>
          <Link to="/" className="btn btn-primary">
            Browse the menu
          </Link>
        </div>
      </section>
    );
  }

  // Derived values, recalculated on every render from the current form and cart.
  const errors = validateCheckout(form);
  const errorNames = Object.keys(errors);
  const shown = (name) => (attempted || touched[name] ? errors[name] : undefined);
  const problems = getOrderProblems(lines, minutes);
  const summary = calculateSummary(lines, form.method);
  const isDelivery = form.method === "delivery";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function focusField(name) {
    document.getElementById(fieldElementId(name))?.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Rule problems (closed, conflict, limit) still block placing the order.
    if (problems.length > 0) return;
    setAttempted(true);
    if (errorNames.length > 0) {
      setFailedSubmits((count) => count + 1);
      return;
    }
    const order = createOrder({
      form,
      lines,
      reference: `MD-${Math.floor(10000 + Math.random() * 90000)}`,
      placedAt: new Date().toISOString(),
    });
    // The order travels in the router state, so a refresh of the confirmation page
    // still works and nothing personal is stored in the browser.
    navigate("/confirmation", { state: { order }, replace: true });
    clearCart();
  }

  const showSummary = attempted && errorNames.length > 0;

  return (
    <section>
      <p>
        <Link to="/cart">← Back to your order</Link>
      </p>
      <h1>Checkout</h1>
      <p className="notice notice-warning">
        This is a simulated order. Do not enter real personal details: use a nickname and a fictional phone number.
        No payment is taken.
      </p>

      <div className="cart-layout">
        <form onSubmit={handleSubmit} noValidate aria-label="Checkout details">
          {showSummary && (
            <div className="notice notice-error" role="alert" tabIndex={-1} ref={summaryRef}>
              <h2>Please fix {errorNames.length === 1 ? "1 problem" : `${errorNames.length} problems`}</h2>
              <ul className="error-list">
                {errorNames.map((name) => (
                  <li key={name}>
                    <button type="button" className="link-button" onClick={() => focusField(name)}>
                      {errors[name]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2>Your details</h2>
          <FormField
            id="field-nickname"
            label="Nickname"
            required
            hint={`A nickname, not your real name. ${LIMITS.nicknameMin} to ${LIMITS.nicknameMax} characters.`}
            error={shown("nickname")}
          >
            {(aria) => (
              <input
                {...aria}
                name="nickname"
                type="text"
                autoComplete="off"
                value={form.nickname}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
          </FormField>

          <FormField
            id="field-phone"
            label="Phone number"
            required
            hint="Fictional only. 11 digits starting with 03, for example 0300 0000000."
            error={shown("phone")}
          >
            {(aria) => (
              <input
                {...aria}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
          </FormField>

          <fieldset className="choice-group">
            <legend>How would you like to get your order?</legend>
            <label className="choice">
              <input
                id="method-delivery"
                type="radio"
                name="method"
                value="delivery"
                checked={isDelivery}
                onChange={handleChange}
              />
              <span>
                Delivery <small>(Rs. 150, free from {formatPrice(FREE_DELIVERY_FROM)})</small>
              </span>
            </label>
            <label className="choice">
              <input
                id="method-pickup"
                type="radio"
                name="method"
                value="pickup"
                checked={!isDelivery}
                onChange={handleChange}
              />
              <span>
                Pickup <small>(free)</small>
              </span>
            </label>
          </fieldset>

          {isDelivery ? (
            <>
              <FormField id="field-sector" label="Delivery sector" required error={shown("sector")}>
                {(aria) => (
                  <select {...aria} name="sector" value={form.sector} onChange={handleChange} onBlur={handleBlur}>
                    <option value="">Choose a sector</option>
                    {DELIVERY_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
              <FormField
                id="field-address"
                label="Street or house description"
                required
                hint="Fictional is fine, for example Street 4, house 12."
                error={shown("address")}
              >
                {(aria) => (
                  <input
                    {...aria}
                    name="address"
                    type="text"
                    autoComplete="off"
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                )}
              </FormField>
            </>
          ) : (
            <p className="notice" role="status">
              Collect from <strong>{PICKUP_POINT.name}</strong>, {PICKUP_POINT.address}.
            </p>
          )}

          <FormField
            id="field-notes"
            label="Order notes"
            hint={`For example "less spicy". Up to ${LIMITS.notesMax} characters.`}
            error={shown("notes")}
          >
            {(aria) => (
              <textarea
                {...aria}
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
          </FormField>
          <p className="field-count" aria-live="polite">
            {form.notes.length} / {LIMITS.notesMax} characters
          </p>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={problems.length > 0}
              aria-describedby={problems.length > 0 ? "place-reasons" : undefined}
            >
              Place simulated order
            </button>
            <Link to="/cart" className="btn btn-secondary">
              Change my order
            </Link>
          </div>
          {problems.length > 0 && (
            <div id="place-reasons" className="cart-reasons">
              <p>You can't place this order yet:</p>
              <ul>
                {problems.map((p) => (
                  <li key={p.code + (p.itemId ?? "")}>{p.message}</li>
                ))}
              </ul>
              <Link to="/cart">Go to your order to fix this</Link>
            </div>
          )}
        </form>

        <aside className="cart-summary" aria-labelledby="checkout-summary-title">
          <h2 id="checkout-summary-title">Order summary</h2>
          <ul className="summary-lines">
            {lines.map(({ item, quantity }) => (
              <li key={item.id}>
                <span>
                  {quantity} × {item.name}
                </span>
                <span>{formatPrice(item.price * quantity)}</span>
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
            <dt>{isDelivery ? "Delivery" : "Pickup"}</dt>
            <dd>{summary.deliveryFee === 0 ? "Free" : formatPrice(summary.deliveryFee)}</dd>
            <dt className="total-label">Total</dt>
            <dd className="total-value">{formatPrice(summary.total)}</dd>
          </dl>
          {isDelivery && summary.amountToFreeDelivery > 0 && (
            <p className="cart-delivery-note">
              Add {formatPrice(summary.amountToFreeDelivery)} more for free delivery.
            </p>
          )}
          <p className="cart-simulated">Simulated order. No payment is taken.</p>
        </aside>
      </div>
    </section>
  );
}
