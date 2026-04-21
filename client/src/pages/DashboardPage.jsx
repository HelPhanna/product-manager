// ============================================================
// 📁 src/pages/DashboardPage.jsx  (new file)
//
// The main app page — only reachable when logged in.
// Previously this layout lived inside App.jsx.
// Now it's a proper page component at the /dashboard route.
//
// It fetches products + categories on mount, just like before,
// but now this only runs when the user actually lands here —
// not on every render of App.jsx.
// ============================================================

import { useEffect } from "react";
import { useProductStore, useCategoryStore } from "../store";
import Navbar from "../components/Navbar";
import ProductsPage from "./ProductsPage";

export default function DashboardPage() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  // Fetch data when this page mounts (i.e. when the user is logged in
  // and navigates to /dashboard — including on refresh)
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <ProductsPage />
    </>
  );
}
