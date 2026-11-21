import { checkQuantity, canIncrease, limitLabel } from "../rules/quantityRule.js";
import "../styles/cart.css";

// Plus/minus control for one item (Rule 1). It owns no state: the quantity comes
// in as a prop and every change goes out through the onChange callback prop.
// alreadyInCart is how many the order already holds, so the limit is checked
// against the whole order and not just this control.
export default function QuantityControl({ item, quantity, onChange, alreadyInCart = 0 }) {
  const total = alreadyInCart + quantity;
  const atLimit = !canIncrease(item, total);
  const limitMessage = atLimit ? checkQuantity(item, total + 1).message : null;

  return (
    <div className="qty">
      <div className="qty-row">
        <button
          type="button"
          className="btn btn-secondary qty-button"
          aria-label={`Decrease quantity of ${item.name}`}
          disabled={quantity <= 1}
          onClick={() => onChange(quantity - 1)}
        >
          −
        </button>
        <output className="qty-value" aria-label={`Quantity of ${item.name}`}>
          {quantity}
        </output>
        <button
          type="button"
          className="btn btn-secondary qty-button"
          aria-label={`Increase quantity of ${item.name}`}
          disabled={atLimit}
          onClick={() => onChange(quantity + 1)}
        >
          +
        </button>
        <span className="qty-limit">{limitLabel(item)}</span>
      </div>
      <p className="qty-message" role="status">
        {limitMessage}
      </p>
    </div>
  );
}
