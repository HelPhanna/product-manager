import { useState } from "react";
import {
  Edit2,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProductStore } from "../../../app/store";
import toast from "react-hot-toast";
import { useAuthStore } from "../../auth/store/authStore";
import ProductModal from "./ProductModal";

export function Pagination() {
  const { pagination, fetchProducts, setPage } = useProductStore();
  const { page, pages, total, limit } = pagination;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const go = (p) => {
    setPage(p);
    fetchProducts({ page: p });
  };

  // Build page numbers: show up to 5 around current
  const range = [];
  const delta = 2;
  for (
    let i = Math.max(1, page - delta);
    i <= Math.min(pages, page + delta);
    i++
  ) {
    range.push(i);
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{ borderTop: "1px solid var(--border-base)" }}
    >
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {from}–{to} of {total} products
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
          style={{
            backgroundColor: "var(--bg-muted)",
            border: "1px solid var(--border-input)",
          }}
        >
          <ChevronLeft size={13} style={{ color: "var(--text-secondary)" }} />
        </button>

        {range[0] > 1 && (
          <>
            <button
              onClick={() => go(1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors"
              style={{
                backgroundColor: "var(--bg-muted)",
                border: "1px solid var(--border-input)",
                color: "var(--text-secondary)",
              }}
            >
              1
            </button>
            {range[0] > 2 && (
              <span
                className="text-xs px-1"
                style={{ color: "var(--text-faint)" }}
              >
                …
              </span>
            )}
          </>
        )}

        {range.map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors"
            style={
              p === page
                ? {
                    backgroundColor: "var(--accent)",
                    border: "1px solid var(--accent)",
                    color: "#fff",
                  }
                : {
                    backgroundColor: "var(--bg-muted)",
                    border: "1px solid var(--border-input)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {p}
          </button>
        ))}

        {range[range.length - 1] < pages && (
          <>
            {range[range.length - 1] < pages - 1 && (
              <span
                className="text-xs px-1"
                style={{ color: "var(--text-faint)" }}
              >
                …
              </span>
            )}
            <button
              onClick={() => go(pages)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors"
              style={{
                backgroundColor: "var(--bg-muted)",
                border: "1px solid var(--border-input)",
                color: "var(--text-secondary)",
              }}
            >
              {pages}
            </button>
          </>
        )}

        <button
          onClick={() => go(page + 1)}
          disabled={page === pages}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
          style={{
            backgroundColor: "var(--bg-muted)",
            border: "1px solid var(--border-input)",
          }}
        >
          <ChevronRight size={13} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </div>
  );
}

export default function ProductTable({ products }) {
  const headerStyle = {
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border-base)",
    backgroundColor: "var(--bg-muted)",
  };

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Sticky header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0 text-[11px] uppercase tracking-wider font-medium"
        style={headerStyle}
      >
        <div className="w-10 flex-shrink-0" />
        <div className="flex-1 min-w-0">Product</div>
        <div className="w-28 flex-shrink-0 hidden sm:block">Category</div>
        <div className="w-20 flex-shrink-0 text-right">Price</div>
        <div className="w-12 flex-shrink-0 text-right">Qty</div>
        <div className="w-24 flex-shrink-0 text-right">Amount</div>
        <div className="w-16 flex-shrink-0" />
      </div>

      {/* Scrollable rows */}
      <div style={{ borderTop: "1px solid var(--border-base)" }}>
        {products.map((product, i) => (
          <ProductRow
            key={product._id}
            product={product}
            last={i === products.length - 1}
          />
        ))}
      </div>

      <Pagination />
    </div>
  );
}

function ProductRow({ product, last }) {
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  // Read isAdmin from auth store to conditionally show edit/delete
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteProduct(product._id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-3 transition-colors group animate-fade-in"
        style={{ borderBottom: last ? "none" : "1px solid var(--border-base)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--bg-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {/* Thumbnail */}
        <div
          className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: "var(--bg-muted)" }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Package size={16} style={{ color: "var(--text-faint)" }} />
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p
            className="font-medium text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {product.name}
          </p>
          {product.description && (
            <p
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {product.description}
            </p>
          )}
          {product.category && (
            <span
              className="sm:hidden inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
              style={{
                backgroundColor: product.category.color + "22",
                color: product.category.color,
              }}
            >
              {product.category.name}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="w-28 flex-shrink-0 hidden sm:block">
          {product.category ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full max-w-full"
              style={{
                backgroundColor: product.category.color + "22",
                border: `1px solid ${product.category.color}44`,
                color: product.category.color,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: product.category.color }}
              />
              <span className="truncate">{product.category.name}</span>
            </span>
          ) : (
            <span style={{ color: "var(--text-faint)" }}>—</span>
          )}
        </div>

        {/* Price */}
        <div className="w-20 flex-shrink-0 text-right">
          <span
            className="font-mono text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            ${fmt(product.price)}
          </span>
        </div>

        {/* Qty */}
        <div className="w-12 flex-shrink-0 text-right">
          <span
            className="font-mono text-xs font-medium"
            style={{ color: "var(--amber)" }}
          >
            {product.quantity}
          </span>
        </div>

        {/* Amount */}
        <div className="w-24 flex-shrink-0 text-right">
          <span
            className="font-mono text-xs font-semibold"
            style={{ color: "var(--green)" }}
          >
            ${fmt(product.amount)}
          </span>
        </div>

        {/* Actions — only shown to admins (RBAC in UI)
            isAdmin() read from authStore — viewers see nothing here.
            Note: This is UX-only. The real security is on the server. */}
        <div className="w-16 flex-shrink-0 flex items-center justify-end gap-1">
          {isAdmin() && (
            <>
              <button
                onClick={() => setShowEdit(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--bg-muted)",
                  border: "1px solid var(--border-input)",
                }}
                title="Edit"
              >
                <Edit2 size={12} style={{ color: "var(--text-secondary)" }} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "rgba(251,113,133,0.1)",
                  border: "1px solid rgba(251,113,133,0.2)",
                }}
                title="Delete"
              >
                <Trash2 size={12} style={{ color: "var(--red)" }} />
              </button>
            </>
          )}
        </div>
      </div>

      {showEdit && (
        <ProductModal product={product} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
