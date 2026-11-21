import { Link } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import { useShopTime } from "../context/useShopTime.js";
import { formatTime, isOpenAt, statusMessage } from "../rules/orderingHours.js";
import "../styles/cart.css";

// Top bar on every page (Problem 2): says whether we are open BEFORE the customer
// builds an order, and gives a one-tap route to the order.
export default function StatusBar() {
  const { minutes, isSimulated } = useShopTime();
  const { itemCount } = useCart();
  const open = isOpenAt(minutes);

  return (
    <aside className={`status-bar ${open ? "status-open" : "status-closed"}`} aria-label="Shop status and your order">
      <div className="container status-bar-inner">
        <p className="status-text" role="status">
          {statusMessage(minutes)}
          {isSimulated && ` (simulated time ${formatTime(minutes)})`}
        </p>
        <Link to="/cart" className="status-cart" aria-label={`View your order, ${itemCount} items`}>
          Your order ({itemCount})
        </Link>
      </div>
    </aside>
  );
}
