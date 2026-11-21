// Two different empty states (FR15):
//   "filters"  -> the menu has items, but the current search/filters match none.
//   "menu"     -> the menu itself came back empty.
// Each one tells the customer what happened and what to do next.
export default function EmptyResults({
  kind,
  filters,
  suggestion,
  cheapest,
  onApplySuggestion,
  onRaiseBudget,
  onClear,
  onReload,
}) {
  if (kind === "menu") {
    return (
      <section className="mp-empty" aria-labelledby="empty-title">
        <h2 id="empty-title">The menu is empty right now</h2>
        <p>Nothing has been published yet. This is not caused by your filters.</p>
        <button type="button" className="mp-button" onClick={onReload}>
          Reload menu
        </button>
      </section>
    );
  }

  const reasons = [];
  if (filters.q.trim() !== "") reasons.push(`search "${filters.q.trim()}"`);
  if (filters.category !== "all") reasons.push(`category ${filters.category}`);
  if (filters.maxPrice !== null) reasons.push(`budget up to Rs. ${filters.maxPrice}`);

  const budgetIsTooLow = cheapest && filters.maxPrice !== null && filters.maxPrice < cheapest.price;

  return (
    <section className="mp-empty" aria-labelledby="empty-title">
      <h2 id="empty-title">No items match</h2>
      {reasons.length > 0 && <p>Active: {reasons.join(", ")}.</p>}

      {suggestion && (
        <p>
          Did you mean{" "}
          <button type="button" className="mp-link-button" onClick={() => onApplySuggestion(suggestion)}>
            {suggestion}
          </button>
          ?
        </p>
      )}

      {budgetIsTooLow && (
        <p>
          Our cheapest item is {cheapest.name} at Rs. {cheapest.price}.{" "}
          <button type="button" className="mp-link-button" onClick={() => onRaiseBudget(cheapest.price)}>
            Show items up to Rs. {cheapest.price}
          </button>
        </p>
      )}

      <button type="button" className="mp-button" onClick={onClear}>
        Clear all filters
      </button>
    </section>
  );
}
