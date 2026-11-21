import { Link } from "react-router-dom";
import { SERVICE_LABELS } from "../data/menuItems.js";
import { formatPrice } from "../utils/format.js";
import ItemImage from "./ItemImage.jsx";

export default function ItemCard({ item }) {
  return (
    <article className="item-card">
      <ItemImage item={item} />
      <div className="item-card-body">
        <p className="item-card-category">{item.category}</p>
        <h3 className="item-card-title">
          <Link to={`/items/${item.id}`}>{item.name}</Link>
        </h3>
        <p className="item-card-meta">
          {formatPrice(item.price)} · Serves {item.serves}
        </p>
        <ul className="tag-list">
          <li className="tag">{SERVICE_LABELS[item.service]}</li>
          {item.vegetarian && <li className="tag tag-veg">Vegetarian</li>}
          {item.limitedBatch && (
            <li className="tag tag-limited">Limited batch: max {item.maxPerOrder} per order</li>
          )}
          {item.soldOut && <li className="tag tag-soldout">Sold out</li>}
        </ul>
      </div>
    </article>
  );
}
