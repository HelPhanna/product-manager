import { useState } from "react";
import { Plus, Loader2, PackageX, Eye } from "lucide-react";
import { useProductStore } from "../../../app/store";
import { useAuthStore } from "../../auth/store/authStore";
import SummaryBar from "../components/SummaryBar";
import SearchFilterBar from "../components/SearchFilterBar";
import ProductTable from "../components/ProductTable";
import ProductModal from "../components/ProductModal";

export default function ProductsPage() {
  const { products = [], loading } = useProductStore();
  const [showCreate, setShowCreate] = useState(false);

  const isAdmin = useAuthStore((s) => s.isAdmin);

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

        <div className="flex items-center gap-3">
          {!isAdmin() && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                backgroundColor: "rgba(251,191,36,0.10)",
                border: "1px solid rgba(251,191,36,0.25)",
                color: "var(--amber)",
              }}
            >
              <Eye size={12} />
              View Only
            </div>
          )}

          {isAdmin() && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={15} />
              Add Product
            </button>
          )}
        </div>
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
          {isAdmin() && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary mt-6"
            >
              <Plus size={14} />
              Add your first product
            </button>
          )}
        </div>
      ) : (
        <ProductTable products={products} />
      )}

      {showCreate && <ProductModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}


