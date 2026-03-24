import { useState } from "react";
import { Plus, Loader2, PackageX } from "lucide-react";
import { useProductStore } from "../store";
import SummaryBar from "../components/SummaryBar";
import SearchFilterBar from "../components/SearchFilterBar";
import ProductTable from "../components/ProductTable";
import ProductModal from "../components/ProductModal";

export default function ProductsPage() {
  const { products = [], loading } = useProductStore();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Inventory
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Product Management
          </h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={15} />
          Add Product
        </button>
      </div>

      <SummaryBar />
      <SearchFilterBar />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--text-muted)" }}
          />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <PackageX
            size={52}
            className="mb-4"
            style={{ color: "var(--text-faint)" }}
          />
          <p
            className="text-base font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            No products found
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-faint)" }}>
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary mt-6"
          >
            <Plus size={14} />
            Add your first product
          </button>
        </div>
      ) : (
        <ProductTable products={products} />
      )}

      {showCreate && <ProductModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}
