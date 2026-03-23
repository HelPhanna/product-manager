import { useEffect } from 'react'
import { useProductStore, useCategoryStore, useThemeStore } from './store'
import Navbar from './components/Navbar'
import ProductsPage from './pages/ProductsPage'

export default function App() {
  const fetchProducts = useProductStore((s) => s.fetchProducts)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
    fetchCategories()
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow */}
      <div
        className="fixed top-0 left-1/3 w-[600px] h-[300px] blur-[120px] pointer-events-none rounded-full"
        style={{ backgroundColor: 'var(--glow-color)' }}
      />
      <Navbar />
      <ProductsPage />
    </div>
  )
}
