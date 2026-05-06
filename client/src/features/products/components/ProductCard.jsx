import { useState } from 'react'
import { Edit2, Trash2, Package } from 'lucide-react'
import { useProductStore } from '../../../app/store'
import toast from 'react-hot-toast'
import ProductModal from './ProductModal'

export default function ProductCard({ product }) {
  const deleteProduct = useProductStore((s) => s.deleteProduct)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"?`)) return
    setDeleting(true)
    try {
      await deleteProduct(product._id)
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden hover:border-ink-600/50 transition-all duration-200 animate-fade-in group">
        {/* Image */}
        <div className="relative h-44 bg-ink-900 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={40} className="text-ink-700" />
            </div>
          )}
          {/* Category badge */}
          {product.category && (
            <span
              className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: product.category.color + 'cc' }}
            >
              {product.category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-ink-100 text-sm mb-1 truncate">{product.name}</h3>
          {product.description && (
            <p className="text-ink-500 text-xs mb-3 line-clamp-2">{product.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-ink-900 rounded-lg p-2 text-center">
              <p className="text-ink-500 text-[10px] uppercase tracking-wide">Price</p>
              <p className="text-ink-200 text-xs font-mono font-medium">${fmt(product.price)}</p>
            </div>
            <div className="bg-ink-900 rounded-lg p-2 text-center">
              <p className="text-ink-500 text-[10px] uppercase tracking-wide">Qty</p>
              <p className="text-amber-400 text-xs font-mono font-medium">{product.quantity}</p>
            </div>
            <div className="bg-ink-900 rounded-lg p-2 text-center">
              <p className="text-ink-500 text-[10px] uppercase tracking-wide">Amount</p>
              <p className="text-sage-500 text-xs font-mono font-medium">${fmt(product.amount)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex-1 btn-secondary py-1.5 justify-center"
            >
              <Edit2 size={12} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger py-1.5 px-3"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {showEdit && <ProductModal product={product} onClose={() => setShowEdit(false)} />}
    </>
  )
}

