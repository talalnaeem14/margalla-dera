import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import MenuProvider from "./context/MenuProvider.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Route table. The URL decides which page is shown (see DECISIONS.md, decision 3).
export default function App() {
  return (
    <MenuProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<MenuPage />} />
          <Route path="items/:id" element={<ItemDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MenuProvider>
  );
}
