import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ScrollManager from "./components/ScrollManager.jsx";
import StatusBar from "./components/StatusBar.jsx";
import CartProvider from "./context/CartProvider.jsx";
import MenuProvider from "./context/MenuProvider.jsx";
import ShopTimeProvider from "./context/ShopTimeProvider.jsx";
import CartPage from "./pages/CartPage.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Route table. The URL decides which page is shown (see DECISIONS.md, decision 3).
// The three providers share the menu, the shop clock and the cart with every page.
export default function App() {
  return (
    <MenuProvider>
      <ShopTimeProvider>
        <CartProvider>
          <ScrollManager />
          <StatusBar />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<MenuPage />} />
              <Route path="items/:id" element={<ItemDetailsPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </ShopTimeProvider>
    </MenuProvider>
  );
}
