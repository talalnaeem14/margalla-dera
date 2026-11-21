# Margalla Dera

A React ordering website for a fictional Islamabad desi restaurant. Customers browse the menu, search and filter it, open an item, build an order, enter delivery or pickup details, review a calculated summary, and reach a simulated confirmation.

**Student:** Talal Naeem | **Roll number:** 24i-2053 | **Section:** BCY-5A
**Course:** CS4032 Web Programming, Assignment 02 (Fall 2026)

| | |
|---|---|
| GitHub repository | https://github.com/talalnaeem14/margalla-dera |
| Deployed website  | Select-String -Path README.md -Pattern "vercel.app" |
| Final commit hash | Stated in the submitted report (a commit cannot contain its own hash) |

**Everything is simulated.** No payment is taken, nothing is delivered, and the form asks for a nickname and a fictional phone number only. No personal information is stored or sent anywhere.

## The business

Margalla Dera serves breakfast and chai, rolls and wraps, and BBQ and karahi to university students and young professionals in Islamabad, solo or in groups of 2 to 6. It delivers to sectors H-9, H-10, H-11, H-12, G-10 and G-11, or customers collect from a fictional kitchen at H-11 Markaz. There are 14 menu items.

## Setup

Requires Node.js 20.19 or newer, 22.13 or newer, or 24 or newer (the range the Vite version supports).

```bash
npm install        # install dependencies
npm run dev        # development server (usually http://localhost:5173)
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
npm test           # business-rule and logic tests (Node's built-in test runner)
```

`npm test` runs `node --test` on the files in `tests/`. All tests should pass (44 at the time of writing).

The automated business-rule test for Task 6.2 is `tests/rules.test.js`. It tests the rule functions in `src/rules/` that the application itself uses, with a valid case, an exact-limit case and a rule-breaking case for each rule. To run only that file: `node --test tests/rules.test.js`.

## Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Menu | Browse, search, filter and sort. Filters live in the address, e.g. `/?q=lassi&max=500&sort=price-asc` |
| `/items/:id` | Item details | Price, serves, service window, order limit, availability, add to order |
| `/cart` | Your order | Change quantities, resolve conflicts, see the summary |
| `/checkout` | Checkout | Delivery or pickup form with validation |
| `/confirmation` | Confirmation | Final summary of the simulated order |
| `*` | Not found | Explains the problem and links to the menu |

## Features

- **Search** across name, category and description, ignoring case, with "Did you mean...?" for small typos.
- **Filter and sort**: category, maximum price (budget) and sort order, all working together with search.
- **Three operating rules**:
  1. *Quantity limit*: 1 to 10 per item, and 1 to 2 for limited-batch items.
  2. *Compatibility*: breakfast items (until 11:30) cannot share an order with BBQ and karahi items (from 12:00).
  3. *Ordering hours*: orders are accepted from 08:00 to 22:30 shop time (22:30 itself is closed).
- **Order summary**: items, how many people it serves, subtotal, delivery fee (Rs. 150, free from Rs. 2,500 or for pickup) and total.
- **Saved order**: the cart is saved in local storage and checked against the current menu and rules when it is restored.
- **Loading, failure and empty states**, each with a way forward.

## Simulated operations

- Placing an order creates a confirmation on screen only. Nothing is sent or stored.
- The order reaches the confirmation page through router state, so refreshing it still works.
- Only the cart is saved in the browser. Form details are never saved.
- The shop clock follows the real time unless the simulated time control is switched on.

## Reproducing edge cases

Use the **Demonstration controls (for testing only)** panel in the footer of every page. The full checklist with expected results is in [`docs/EDGE_CASES.md`](docs/EDGE_CASES.md).

| To reproduce | Do this |
|---|---|
| Loading failure and retry | Tick "Simulate a menu loading failure", press "Reload menu", then untick it and press "Try again" |
| Empty menu | Tick "Simulate an empty menu" and press "Reload menu" |
| Item becomes unavailable | Put an item in the cart, choose it under "Item availability" and tick "Mark as sold out", then open the cart |
| Shop closed (Rule 3) | Use the boundary buttons: 07:59 and 22:30 are closed, 08:00 and 22:29 are open |
| Conflict (Rule 2) | Add Halwa Puri Plate, then open Chicken Karahi (Half) |
| Quantity limit (Rule 1) | Add Weekend Karahi Feast and try to go above 2 |
| Damaged saved cart | In the browser console run `localStorage.setItem('margalla-dera-cart-v1', '[{"id":"lassi","quantity":99}]')` and open `/cart` |
| Invalid URL | Open `/items/nope` or `/nowhere` |
| No search results | Search `karhai`, or set a budget of 100 |

## Deployment

The app is a single-page application, so the host must send every path to `index.html`. Otherwise refreshing `/items/...` or `/cart` shows a 404. This repository includes the setting for both common hosts: `vercel.json` (Vercel) and `public/_redirects` (Netlify). Build command: `npm run build`. Output folder: `dist`.

## Known limitations

- Menu items use a lettered placeholder block instead of photographs (the missing-image fallback is the only image behaviour in use).
- The saved order lives in one browser on one device.
- Marking an item sold out is a demonstration control and is not remembered after a refresh.
- Delivery sectors and fees are fixed in `src/data/serviceAreas.js`.
- Checked in Chromium (the engine behind Chrome and Edge) only. Firefox and Safari were not tested.

## Concept map

| Concept | File | Component or function |
|---|---|---|
| Components and modules | `src/components/`, `src/pages/` | One function component per file, imported where used |
| Props | `src/components/QuantityControl.jsx` | `QuantityControl({ item, quantity, onChange, alreadyInCart })` |
| Callback props | `src/pages/MenuPage.jsx`, `src/components/FilterBar.jsx` | `FilterBar` calls `onChange`, and `MenuPage` updates the filters |
| Events and `preventDefault` | `src/pages/CheckoutPage.jsx` | `handleSubmit` |
| `useState` and controlled inputs | `src/pages/CheckoutPage.jsx` | `form`, `touched`, `handleChange` |
| Functional updates | `src/context/CartProvider.jsx`, `src/context/MenuProvider.jsx` | `addItem` uses `setCart((prev) => ...)`, `reload` uses `setAttempt((n) => n + 1)` |
| Objects without mutation | `src/pages/CheckoutPage.jsx` | `setForm((prev) => ({ ...prev, [name]: value }))` |
| Arrays without mutation | `src/utils/cart.js` | `addItem`, `setQuantity`, `removeItem` |
| Lists and keys | `src/pages/CartPage.jsx` | `lines.map` with `key={item.id}` |
| Conditional rendering | `src/pages/MenuPage.jsx`, `src/pages/ItemDetailsPage.jsx` | Loading, error, empty, sold-out, conflict |
| Shared state | `src/context/` | `MenuProvider`, `CartProvider`, `ShopTimeProvider` and the `useMenu`, `useCart`, `useShopTime` hooks |
| Derived values | `src/pages/MenuPage.jsx`, `src/context/CartProvider.jsx` | `visible` (`applyFilters`), `lines`, `itemCount` |
| Effects | `src/context/MenuProvider.jsx` | `useEffect` that calls `loadMenu` |
| Dependencies and cleanup | `src/context/ShopTimeProvider.jsx`, `src/components/ScrollManager.jsx` | `clearInterval`, `removeEventListener`, the `cancelled` flag in `MenuProvider` |
| Data handling | `src/utils/search.js`, `src/utils/pricing.js` | `applyFilters`, `editDistance`, `calculateSummary` (filter, sort, reduce, spread) |
| Asynchronous code | `src/services/mockApi.js`, `src/context/MenuProvider.jsx` | `loadMenu` (Promise with failure), `.then` and `.catch` |
| Browser storage | `src/context/CartProvider.jsx`, `src/services/mockApi.js` | `readSavedCart`, the save effect, demo flags |
| Routing | `src/App.jsx` and pages | `Routes`, `useParams`, `useSearchParams`, `useNavigate`, `useLocation` |
| Business rules | `src/rules/` | `checkQuantity`, `findConflict`, `isOpenAt`, `getOrderProblems` |
| Form validation | `src/utils/checkoutForm.js` | `validateCheckout` |
| Rule test (Task 6.2) | `tests/rules.test.js` | Valid, exact-limit and rule-breaking cases for each rule |