import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Image, Calculator } from "lucide-react";
import { useProductStore, useCategoryStore } from "../store";
import toast from "react-hot-toast";

export default function ProductModal({ product, onClose }) {
  const isEdit = !!product;
  const { createProduct, updateProduct } = useProductStore();
  const categories = useCategoryStore((s) => s.categories);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    quantity: product?.quantity || "",
    category: product?.category?._id || product?.category || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  const [saving, setSaving] = useState(false);

  const amount = (
    (parseFloat(form.price) || 0) * (parseInt(form.quantity) || 0)
  ).toFixed(2);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.price || isNaN(form.price))
      return toast.error("Valid price is required");
    if (!form.quantity || isNaN(form.quantity))
      return toast.error("Valid quantity is required");
    if (!form.category) return toast.error("Please select a category");

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
        await updateProduct(product._id, fd);
        toast.success("Product updated!");
      } else {
        await createProduct(fd);
        toast.success("Product created!");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      <div className="relative glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div
          className="sticky top-0 glass-card px-6 py-4 flex items-center justify-between z-10"
          style={{ borderBottom: "1px solid var(--border-base)" }}
        >
          <h2
            className="font-semibold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--bg-muted)" }}
          >
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="label">Product Image</label>
            <div
              className="relative h-40 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden group transition-colors"
              style={{
                borderColor: "var(--border-input)",
                backgroundColor: "var(--bg-input)",
              }}
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-contain p-2"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                  >
                    <Upload size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <Image size={32} style={{ color: "var(--text-faint)" }} />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Click to upload image
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-faint)" }}
                  >
                    PNG, JPG, WEBP up to 5MB
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </div>

          {/* Name */}
          <div>
            <label className="label">Product Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Keyboard"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description…"
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($) *</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || parseFloat(v) >= 0)
                    setForm({ ...form, price: v });
                }}
                onKeyDown={(e) =>
                  ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()
                }
                onBlur={(e) => {
                  if (parseFloat(e.target.value) < 0)
                    setForm({ ...form, price: "0" });
                }}
                placeholder="0.00"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || parseInt(v) >= 0)
                    setForm({ ...form, quantity: v });
                }}
                onKeyDown={(e) =>
                  ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()
                }
                onBlur={(e) => {
                  if (parseInt(e.target.value) < 0)
                    setForm({ ...form, quantity: "0" });
                }}
                placeholder="0"
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Auto-calculated amount */}
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: "var(--bg-muted)",
              border: "1px solid var(--border-base)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(74,222,128,0.12)" }}
            >
              <Calculator size={15} style={{ color: "var(--green)" }} />
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Auto-Calculated Amount
              </p>
              <p
                className="text-lg font-bold font-mono"
                style={{ color: "var(--green)" }}
              >
                $
                {parseFloat(amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <p
              className="text-xs ml-auto"
              style={{ color: "var(--text-faint)" }}
            >
              {form.price || "0"} × {form.quantity || "0"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
