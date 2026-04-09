// ============================================================
// 📁 src/components/CategoryModal.jsx  (updated — RBAC-aware)
//
// This modal is already only opened by admins (the Navbar
// hides the "Manage Categories" button from viewers).
// However, we add the check here too as a defense-in-depth
// pattern: never rely on a single layer of protection.
//
// LEARNING: "Defense in Depth"
// Security should have multiple layers:
//   Layer 1 → Server: API routes protected with authorize("admin")
//   Layer 2 → Client UI: buttons hidden for non-admins
//   Layer 3 → Component: double-check role inside the component itself
//
// If Layer 2 somehow fails (e.g. a bug), Layer 1 still protects.
// If someone calls CategoryModal directly in code, Layer 3 still protects.
// ============================================================

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Edit2, Trash2, Tag, Lock } from "lucide-react";
import { useCategoryStore } from "../store";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f43f5e","#f97316",
  "#eab308","#22c55e","#14b8a6","#06b6d4","#3b82f6",
];

function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      await onSave({ name, description, color });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-4 space-y-3"
      style={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-base)" }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input-field" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="input-field" />
      <div>
        <p className="label">Color</p>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button type="button" key={c} onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center py-1.5 text-xs">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-1.5 text-xs">
          {saving ? "Saving…" : initial ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

export default function CategoryModal({ onClose }) {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ── Defense-in-depth: check role inside the component too ──
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const handleCreate = async (data) => {
    try {
      await createCategory(data);
      toast.success("Category created!");
      setAdding(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateCategory(id, data);
      toast.success("Category updated!");
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat._id);
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div className="relative glass-card rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-scale-in">

        {/* Header */}
        <div className="sticky top-0 glass-card px-6 py-4 flex items-center justify-between z-10" style={{ borderBottom: "1px solid var(--border-base)" }}>
          <h2 className="font-semibold text-base flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Tag size={15} style={{ color: "var(--text-muted)" }} />
            Categories
            {/* Show lock icon if viewer somehow opens this */}
            {!isAdmin() && <Lock size={13} style={{ color: "var(--amber)" }} />}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-muted)" }}>
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {categories.map((cat) => (
            <div key={cat._id}>
              {/* Only show the edit form if admin AND this item is being edited */}
              {editingId === cat._id && isAdmin() ? (
                <CategoryForm
                  initial={cat}
                  onSave={(d) => handleUpdate(cat._id, d)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  className="flex items-center gap-3 rounded-xl p-3 group transition-colors"
                  style={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border-base)" }}
                >
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{cat.description}</p>
                    )}
                  </div>

                  {/* Edit/Delete — admin only (defense-in-depth layer 3) */}
                  {isAdmin() && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingId(cat._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--bg-surface)" }}
                      >
                        <Edit2 size={11} style={{ color: "var(--text-secondary)" }} />
                      </button>
                      <button onClick={() => handleDelete(cat)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "rgba(251,113,133,0.1)" }}
                      >
                        <Trash2 size={11} style={{ color: "var(--red)" }} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && !adding && (
            <div className="text-center py-8">
              <Tag size={32} className="mx-auto mb-2" style={{ color: "var(--text-faint)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No categories yet</p>
            </div>
          )}

          {/* Add Category — admin only */}
          {isAdmin() && (
            adding ? (
              <CategoryForm onSave={handleCreate} onCancel={() => setAdding(false)} />
            ) : (
              <button onClick={() => setAdding(true)} className="w-full btn-secondary justify-center py-2.5">
                <Plus size={14} />
                Add Category
              </button>
            )
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
