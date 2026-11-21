# Edge-case checklist (Task 6.1)

Margalla Dera | Talal Naeem | 24i-2053 | BCY-5A

**How to use this file.** Each row gives the action and the expected result. The "Observed" column records what I saw when each case was run against the production build in Chromium on 21 November 2026, with the console open (no errors or React warnings in any run). Before submitting, repeat each case yourself in the latest Chrome or Edge, tick the last column, and correct "Observed" wherever your result differs. The report must contain your own observations.

Use the demo panel in the footer ("Demonstration controls (for testing only)") for the cases that need it.

## A. Required handling

| # | Case | Action | Expected | Observed | Checked |
|---|---|---|---|---|---|
| 1 | Missing image | Open any item | A lettered block appears, the name is still shown | All 14 items use the fallback, layout intact | [ ] |
| 2 | Long content | View each page at 390 px wide | No sideways scrolling, long names wrap | No horizontal overflow on menu, cart, checkout or confirmation | [ ] |
| 3 | Empty results | Search `karhai` | "No items match", a suggestion and a way forward | "No items match", "Did you mean karahi?", Clear all filters | [ ] |
| 4 | Empty results (budget) | Set a budget of 100 | Explain the cheapest item and offer to raise the budget | "Our cheapest item is Lassi at Rs. 190" with a button | [ ] |
| 5 | Empty dataset | Tick "Simulate an empty menu", press Reload menu | A different message from "No items match" | "The menu is empty right now" with Reload menu | [ ] |
| 6 | Invalid item URL | Open `/items/nope` | Explain, link to the menu | "We couldn't find that item" and Back to the menu | [ ] |
| 7 | Invalid page URL | Open `/nowhere` | Explain, link to the menu | "Page not found" and Go to the menu | [ ] |
| 8 | Invalid form input | Submit the empty checkout form, then enter a nickname and phone `0400` | Specific messages, valid fields kept | An error list names each problem, nickname kept, phone error says 11 digits starting with 03 | [ ] |
| 9 | Form: switch method | Choose Pickup, then Delivery again | Hidden fields are not checked, values return | Sector and address hidden for pickup, values restored on return | [ ] |
| 10 | Unavailable selection | Add Lassi, mark Lassi sold out, open the cart | Explain and let me correct it | "Lassi is sold out. Remove it to continue." checkout disabled, removing it empties the cart | [ ] |
| 11 | Restored cart over the limit | Save quantity 99 for Weekend Karahi Feast, open the cart | Corrected with a visible explanation | "reduced from 99 to 2 (maximum 2 per order)" | [ ] |
| 12 | Restored cart, unknown item | Save an item id that does not exist | Removed with a note | "An item in your saved order is no longer on the menu and was removed." | [ ] |
| 13 | Restored cart, invalid quantity | Save quantity `-3` and `"abc"` | Set to 1 with a note | "had an invalid saved quantity and was set to 1" for each item | [ ] |
| 14 | Restored cart, unreadable data | Save `{not json` | Empty cart, no crash | "Your order is empty", no console error | [ ] |
| 15 | Loading failure | Tick "Simulate a menu loading failure", press Reload menu | Clear error and a working retry | "could not be loaded" with Try again, which works once unticked | [ ] |
| 16 | Console clean | Run every case above with the console open | No errors or React warnings | None seen | [ ] |

To save a damaged cart for cases 11 to 14, run this in the console and then open `/cart`:

```js
localStorage.setItem('margalla-dera-cart-v1', '[{"id":"weekend-karahi-feast","quantity":99}]')
```

## B. The three investigated improvements

| # | Improvement | Actions | Expected | Observed | Checked |
|---|---|---|---|---|---|
| P1 | Search, filters and a way forward | Search `karhai`; press the suggestion; set a budget; choose a category; sort by price | The suggestion applies, and search, filter and sort act on one list with a live count | Suggestion applied BBQ & Karahi items, the count "Showing N of 14 items" updated with every control | [ ] |
| P2 | Opening status first | Press 22:30, add an item, open the cart; then press 22:29 | Closed message everywhere, checkout disabled with a reason, cart kept; open again at 22:29 | Closed bar on every page, checkout disabled with the reason, cart kept; checkout enabled at 22:29 | [ ] |
| P3 | Back and Forward match the page | Set filters, scroll, open an item, add it, open the cart, press Back twice | Item then menu, with the same filters and scroll | The item opened at the top; Back returned to the same filters and scroll position | [ ] |

## C. Business-rule boundaries

| Rule | Boundary | Expected | Covered by |
|---|---|---|---|
| 1 Quantity | Weekend Karahi Feast x 2 accepted, x 3 blocked, quantity stays 2 | Message and disabled plus button | `tests/rules.test.js` |
| 2 Compatibility | Halwa Puri with Tikka Roll accepted, adding Chicken Karahi conflicts, removing Halwa Puri clears it | Both items named, either can be removed, checkout disabled | `tests/rules.test.js` and the browser |
| 3 Hours | 07:59 closed, 08:00 open, 22:29 open, 22:30 closed | Status bar and disabled buttons follow | `tests/rules.test.js` and the browser |
