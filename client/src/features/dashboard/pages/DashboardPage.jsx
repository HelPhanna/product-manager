import { useEffect } from "react";
import { useProductStore, useCategoryStore } from "../../../app/store";
import Navbar from "../../../shared/components/Navbar";
import ProductsPage from "../../products/pages/ProductsPage";

export default function DashboardPage() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

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



