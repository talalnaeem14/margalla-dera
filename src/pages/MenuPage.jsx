import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EmptyResults from "../components/EmptyResults.jsx";
import FilterBar from "../components/FilterBar.jsx";
import { useMenu } from "../context/useMenu.js";
import {
  DEFAULT_FILTERS,
  applyFilters,
  filtersFromParams,
  filtersToParams,
  getCategories,
  hasActiveFilters,
  suggestClosest,
} from "../utils/search.js";
import "../styles/menu.css";

function formatPrice(n) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

function ItemCard({ item }) {
  return (
    <li className="mp-card">
      <Link to={`/items/${item.id}`} className="mp-card-link">
        {item.image ? (
          <img className="mp-card-image" src={item.image} alt={item.name} loading="lazy" />
        ) : (
          <div className="mp-card-image mp-card-fallback" aria-hidden="true">
            {item.name.charAt(0)}
          </div>
        )}
        <h3>{item.name}</h3>
        <p className="mp-card-desc">{item.description}</p>
        <p className="mp-card-meta">
          <span className="mp-price">{formatPrice(item.price)}</span>
          <span>Serves {item.serves}</span>
          {item.vegetarian && <span className="mp-tag">Vegetarian</span>}
          {item.soldOut && <span className="mp-tag mp-tag-warn">Sold out</span>}
        </p>
      </Link>
    </li>
  );
}

export default function MenuPage() {
  const { status, items, error, reload } = useMenu();
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = useMemo(() => getCategories(items), [items]);

  // Derived values: nothing below is stored in state. The URL holds the filters,
  // and the visible list is recalculated from the menu plus the filters.
  const filters = useMemo(() => filtersFromParams(searchParams, categories), [searchParams, categories]);
  const visible = useMemo(() => applyFilters(items, filters), [items, filters]);
  const suggestion = useMemo(
    () => (visible.length === 0 ? suggestClosest(items, filters.q) : null),
    [visible, items, filters.q]
  );
  const cheapest = useMemo(
    () => (items.length === 0 ? null : items.reduce((a, b) => (b.price < a.price ? b : a))),
    [items]
  );

  // replace: true keeps typing from filling the Back button with one entry per keystroke.
  function updateFilters(changes) {
    setSearchParams(filtersToParams({ ...filters, ...changes }), { replace: true });
  }
  function clearFilters() {
    setSearchParams(filtersToParams(DEFAULT_FILTERS), { replace: true });
  }

  if (status === "loading") {
    return (
      <p className="mp-message" role="status">
        Loading the menu…
      </p>
    );
  }

  if (status === "error") {
    return (
      <section className="mp-message mp-error" role="alert">
        <h2>We couldn't load the menu</h2>
        <p>{error}</p>
        <button type="button" className="mp-button" onClick={reload}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <div className="mp">
      <h1>Menu</h1>

      {items.length > 0 && (
        <FilterBar
          filters={filters}
          categories={categories}
          onChange={updateFilters}
          onClear={clearFilters}
          canClear={hasActiveFilters(filters)}
        />
      )}

      {items.length === 0 ? (
        <EmptyResults kind="menu" onReload={reload} />
      ) : (
        <>
          <p className="mp-count" aria-live="polite">
            Showing {visible.length} of {items.length} items
          </p>
          {visible.length === 0 ? (
            <EmptyResults
              kind="filters"
              filters={filters}
              suggestion={suggestion}
              cheapest={cheapest}
              onApplySuggestion={(q) => updateFilters({ q })}
              onRaiseBudget={(maxPrice) => updateFilters({ maxPrice })}
              onClear={clearFilters}
            />
          ) : (
            <ul className="mp-grid">
              {visible.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
