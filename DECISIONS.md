# DECISIONS.md

Margalla Dera: CS4032 Web Programming, Assignment 02

Each entry records one frontend decision for one problem found on the reference site (Kababjees Fried Chicken, https://kababjeesfriedchicken.com). Screenshot placeholders in [brackets] must be replaced with your own screenshots from the deployed site.

---

## Decision 1: Search and filters that help a budget shopper recover and narrow down

**Problem**
A mistyped search ("majrsty") shows a dead-end "No items found", and the menu has no price filter or sort, so a customer with a budget must read every card.

**Decision**
Keep search text, category, maximum price and sort order together in one filter state, and apply all of them to the same list. When nothing matches, the empty state suggests the closest item name ("Did you mean karahi?") and offers next actions: apply the suggestion, raise a budget that is too low, or clear all filters.

**Alternative**
Add a live autocomplete dropdown while typing, or use a fuzzy-search library.

**Reason**
The audience is students and young professionals who order on a budget, and spellings like "karhai" or "seekh" are easy to get slightly wrong. One shared filter state means search, filter and sort always work together, and a small suggestion function is easy to explain and test.

**Tradeoff**
A suggestion can occasionally be wrong, so it is worded as a question and never applied automatically. Short words are never corrected (up to 3 letters allow no mistakes, 4 to 5 allow one, 6 or more allow two), which avoids odd suggestions but means a typo in a very short word gets no help. The shared filter state adds some complexity to the menu page.

**Code location**
- `src/utils/search.js`: `matchItems()`, `editDistance()`, `suggestClosest()` and `applyFilters()`
- `src/pages/MenuPage.jsx`: `MenuPage`, where `visible` is derived from the menu and the current filters
- `src/components/FilterBar.jsx` and `src/components/EmptyResults.jsx`

**Evidence**
1. Open the menu and search `karhai`.
2. The page shows "No items match" with a "Did you mean karahi?" button. Press it and the BBQ & Karahi items appear.
3. Set a budget of 100: the page says "Our cheapest item is Lassi at Rs. 190" and offers "Show items up to Rs. 190".
4. Choose a category, set a budget of 3000 and sort by price high to low. The results and the "Showing N of 14 items" count update together.

[Screenshot: own app, typo search with suggestion]

[Screenshot: own app, budget too low with the cheapest-item hint]

---

## Decision 2: Show the opening status first, and keep the cart usable

**Problem**
The reference site reveals that it is closed only after the user presses Proceed to Checkout, with nothing earlier on the menu or cart.

**Decision**
Show an open or closed bar at the top of every page, with the next opening time, and keep browsing and the cart working while closed. Checkout stays disabled with the reason written beside the button, on both the cart page and the checkout page. The ordering-hours rule is its own function, so the same answer drives the bar and the buttons.

**Alternative**
Block adding items to the cart while closed, or show a pop-up when the page loads.

**Reason**
Customers see the restriction before they invest effort, and an order built while closed is saved for later instead of being lost. This fits the audience, who may plan a meal ahead.

**Tradeoff**
Users can build a cart they cannot submit right now, which needs clear wording to avoid confusion. The application also needs a clock, with a labelled "Simulated time" control so the rule can be demonstrated at any hour.

**Code location**
- `src/rules/orderingHours.js`: `isOpenAt()`, `nextOpening()` and `statusMessage()`
- `src/components/StatusBar.jsx`, drawn by `src/components/Layout.jsx` so it appears on every page
- `src/rules/orderCheck.js`: `getOrderProblems()`, used by `src/pages/CartPage.jsx` and `src/pages/CheckoutPage.jsx`
- `src/context/ShopTimeProvider.jsx` and `src/components/DemoControls.jsx`: the simulated clock

**Evidence**
1. In the footer demo panel press the 22:30 button.
2. The top bar says "Closed now. We open tomorrow at 08:00." before any item is added.
3. Add an item and open the cart: "Continue to checkout" is disabled and the reason is listed. The cart is kept.
4. Press 22:29: the bar says "Open now. Orders accepted until 22:30." and checkout is enabled.

[Screenshot: own app, closed bar on the menu]

[Screenshot: own app, disabled checkout with the reason]

---

## Decision 3: Make the URL the source of truth for navigation

**Problem**
On the reference site, the cart has no URL of its own. Pressing Back with the cart open changes the address but leaves the cart showing, and Back, Forward, Back can fill the history with entries that do not match any page.

**Decision**
Use real routes: `/` for the menu, `/items/:id` for details, `/cart` for the cart, `/checkout` and `/confirmation`. The menu's search, category, budget and sort are stored in the address (`/?q=lassi&max=500`) and update with `replace`, so typing never adds history entries. A small component restores the scroll position on Back and starts new pages at the top.

**Alternative**
Keep the cart as a slide-in drawer and listen for the browser's Back event to close it, with the filters kept in component state.

**Reason**
The Back and Forward buttons behave predictably, any page can be reloaded or shared with its filters intact, and React Router keeps the address and the visible page in sync without extra code to maintain.

**Tradeoff**
Opening the cart leaves the menu instead of overlaying it, so the quick-glance feel of a drawer is lost. Filters in the address make URLs longer and need careful parsing (invalid values fall back to defaults). Scroll restoration is extra code, because the browser does not do it for a single-page app.

**Code location**
- `src/App.jsx`: route definitions
- `src/pages/MenuPage.jsx`: `updateFilters()` writes the filters to the URL with `replace: true`
- `src/utils/search.js`: `filtersFromParams()` and `filtersToParams()`
- `src/components/ScrollManager.jsx`: scroll to top on new pages, restore on Back
- `src/context/CartProvider.jsx`: the shared cart state

**Evidence**
1. On the menu, choose a category, set a budget and scroll down. The address changes, for example `/?category=Drinks&max=300`.
2. Open an item. It opens at the top of the page.
3. Press Back: the menu returns with the same filters and scroll position.
4. Open an item, add it, open `/cart`, then press Back twice: the item page and then the menu appear, and the address always matches what is shown.
5. Repeat Back, Forward, Back: no extra or repeated entries appear in the history list.

[Screenshot: own app, menu with filters in the address bar]

[Screenshot: own app, history list after Back, Forward, Back]
