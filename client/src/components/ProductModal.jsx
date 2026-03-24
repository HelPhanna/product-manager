import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Image, Calculator, Upload } from "lucide-react";
import { useProductStore, useCategoryStore } from "../store";
import toast from "react-hot-toast";

export default function ProductModal({ product, onClose }) {
  const isEdit = !!product;
  const { createProduct, updateProduct } = useProductStore();
  const categories = useCategoryStore((s) => s.categories) ?? [];
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    quantity: product?.quantity || "",
    category: product?.category?._id || product?.category || "",
    image: product?.image || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || "");
  const [saving, setSaving] = useState(false);

  const amount = (
    (parseFloat(form.price) || 0) * (parseInt(form.quantity) || 0)
  ).toFixed(2);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUrlChange = (e) => {
    setForm({ ...form, image: e.target.value });
    setImagePreview(e.target.value);
    setImageFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm({ ...form, image: "" });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Only image files are allowed");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm({ ...form, image: "" });
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
      // Build FormData so the file is sent as multipart
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("price", form.price);
      payload.append("quantity", form.quantity);
      payload.append("category", form.category);
      if (imageFile) {
        payload.append("image", imageFile);
      } else if (form.image) {
        payload.append("image", form.image);
      }

      if (isEdit) {
        await updateProduct(product._id, payload);
        toast.success("Product updated!");
      } else {
        await createProduct(payload);
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
          {/* Image */}
          <div>
            <label className="label">Image</label>

            {/* Drop zone / preview */}
            <div
              className="mt-1 h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative overflow-hidden"
              style={{
                borderColor: "var(--border-input)",
                backgroundColor: "var(--bg-input)",
              }}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Upload size={16} className="text-white" />
                    <span className="text-white text-xs font-medium">
                      Change image
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Image size={32} style={{ color: "var(--text-faint)" }} />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Click or drag & drop to upload
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-faint)" }}
                  >
                    JPEG, PNG, GIF, WEBP — max 5MB
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* OR divider */}
            <div className="flex items-center gap-2 my-3">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "var(--border-base)" }}
              />
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                or paste a URL
              </span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "var(--border-base)" }}
              />
            </div>

            <input
              name="image"
              value={form.image}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="input-field"
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
