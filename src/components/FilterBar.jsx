import { SORT_OPTIONS } from "../utils/search.js";

const BUDGET_PRESETS = [300, 500, 1000];

// Controls for search, category, budget and sort (Problem 1).
// It owns no state: the filters come in as props and every change goes out
// through the onChange callback prop, so the page (and the URL) stay in charge.
export default function FilterBar({ filters, categories, onChange, onClear, canClear }) {
  return (
    <form className="mp-filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="mp-field mp-field-wide">
        <label htmlFor="menu-search">Search the menu</label>
        <input
          id="menu-search"
          type="search"
          value={filters.q}
          placeholder="Try: karahi, roll, chai"
          maxLength={60}
          autoComplete="off"
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>

      <div className="mp-field">
        <label htmlFor="menu-budget">Budget per item (Rs.)</label>
        <input
          id="menu-budget"
          type="number"
          inputMode="numeric"
          min="1"
          step="50"
          value={filters.maxPrice ?? ""}
          placeholder="No limit"
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange({ maxPrice: e.target.value !== "" && n > 0 ? Math.round(n) : null });
          }}
        />
      </div>

      <div className="mp-field">
        <label htmlFor="menu-sort">Sort by</label>
        <select
          id="menu-sort"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mp-chip-group mp-field-wide" role="group" aria-label="Quick budget">
        <span className="mp-chip-label">Quick budget:</span>
        {BUDGET_PRESETS.map((amount) => (
          <button
            key={amount}
            type="button"
            className="mp-chip"
            aria-pressed={filters.maxPrice === amount}
            onClick={() => onChange({ maxPrice: filters.maxPrice === amount ? null : amount })}
          >
            Under Rs. {amount}
          </button>
        ))}
      </div>

      <div className="mp-chip-group mp-field-wide" role="group" aria-label="Category">
        <button
          type="button"
          className="mp-chip"
          aria-pressed={filters.category === "all"}
          onClick={() => onChange({ category: "all" })}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className="mp-chip"
            aria-pressed={filters.category === c}
            onClick={() => onChange({ category: c })}
          >
            {c}
          </button>
        ))}
      </div>

      {canClear && (
        <button type="button" className="mp-link-button" onClick={onClear}>
          Clear all filters
        </button>
      )}
    </form>
  );
}
