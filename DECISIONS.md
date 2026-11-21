# DECISIONS.md

Margalla Dera: CS4032 Web Programming, Assignment 02

Each entry records one frontend decision for one problem found on the reference site (Kababjees Fried Chicken). Text in [brackets] must be confirmed or filled in once the code and screenshots exist.

---

## Decision 1: Search and filters that help a budget shopper recover and narrow down

**Problem**
A mistyped search ("majrsty") shows a dead-end "No items found", and the menu has no price filter or sort, so a customer with a budget must read every card.

**Decision**
Keep search text, category, price range and sort order together in one filter state, and apply all of them to the same list. When a search has no matches, the empty state suggests the closest item name ("Did you mean Karahi?") and offers next actions: clear the search, or browse a category.

**Alternative**
Add a live autocomplete dropdown while typing, or use a fuzzy-search library.

**Reason**
The audience is students and young professionals who order on a budget, and spellings like "karhai" or "seekh" are easy to get slightly wrong. One shared filter state means search, filter and sort always work together, and a small suggestion function is easy to explain and test.

**Tradeoff**
A suggestion can occasionally be wrong, so it is worded as a question and never applied automatically. The shared filter state adds some complexity to the menu page.

**Code location**
- `src/utils/search.js`: `matchItems()` and `suggestClosest()` [confirm after build]
- `src/pages/MenuPage.jsx`: filter state [confirm after build]
- `src/components/FilterBar.jsx` and `src/components/EmptyResults.jsx` [confirm after build]

**Evidence**
1. Open the menu and search "karhai".
2. The empty state shows "Did you mean Karahi?" with a button to apply it.
3. Apply a price range and sort low to high; results update together with the search.

[Screenshot: own app, typo search with suggestion]

[Screenshot: own app, price filter and sort active]

---

## Decision 2: Show the opening status first, and keep the cart usable

**Problem**
The reference site reveals that it is closed only after the user presses Proceed to Checkout, with nothing earlier on the menu or cart.

**Decision**
Show an open/closed banner at the top of every menu page, with the next opening time, and repeat the status in the cart summary. When closed, keep browsing and the cart working, but disable Place Order and show the reason beside it.

**Alternative**
Block adding items to the cart while closed, or show a pop-up when the page loads.

**Reason**
Customers see the restriction before they invest effort, and an order built while closed is saved for later instead of being lost. This fits the audience, who may plan a meal ahead.

**Tradeoff**
Users can build a cart they cannot submit right now, which needs clear wording to avoid confusion. The application also needs a clock, with a labelled "Simulated time" control so the rule can be demonstrated at any hour.

**Code location**
- `src/utils/orderingHours.js`: `isOpenAt()` and `nextOpening()` [confirm after build]
- `src/components/StatusBanner.jsx` [confirm after build]
- `src/pages/CartPage.jsx`: disabled Place Order button with reason [confirm after build]

**Evidence**
1. Set Simulated time to 22:30.
2. The menu shows "Closed now, opens at 08:00" before any item is added.
3. Add an item and open the cart: the button is disabled, the reason is visible, and the cart is kept.

[Screenshot: own app, closed banner on the menu]

[Screenshot: own app, disabled Place Order with reason]

---

## Decision 3: Make the URL the source of truth for navigation

**Problem**
On the reference site, the cart has no URL of its own. Pressing Back with the cart open changes the address but leaves the cart showing, and Back, Forward, Back can fill the history with entries that do not match any page.

**Decision**
Use real routes: `/` for the menu, `/items/:id` for details, and `/cart` for the cart. Adding to the cart updates shared state without adding history entries, so Back and Forward always move between genuine pages.

**Alternative**
Keep the cart as a slide-in drawer and listen for the browser's Back event to close it.

**Reason**
The browser's Back and Forward buttons behave predictably, any page can be reloaded or shared, and React Router keeps the address and the visible page in sync without extra code to maintain.

**Tradeoff**
Opening the cart leaves the menu instead of overlaying it, so the quick-glance feel of a drawer is lost. The menu's filters must be restored when the user comes back, so they are kept in shared state.

**Code location**
- `src/App.jsx`: route definitions [confirm after build]
- `src/pages/ItemDetailsPage.jsx` and `src/pages/CartPage.jsx` [confirm after build]
- `src/context/CartContext.jsx`: shared cart state [confirm after build]

**Evidence**
1. Open the menu, then an item (`/items/:id`), add it to the cart, and open `/cart`.
2. Press Back: the item page returns. Press Back again: the menu returns with its filters kept.
3. Press Forward twice: the item page and then the cart appear, and the address always matches what is shown.
4. Repeat Back, Forward, Back: no extra or repeated entries appear in the history list.

[Screenshot: own app, /cart route with the address bar visible]

[Screenshot: own app, history list after Back, Forward, Back]
