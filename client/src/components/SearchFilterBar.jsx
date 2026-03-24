import { Search, Filter } from "lucide-react";
import { useProductStore, useCategoryStore } from "../store";

export default function SearchFilterBar() {
  const {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    fetchProducts,
  } = useProductStore();
  const categories = useCategoryStore((s) => s.categories) ?? [];

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchProducts({ search: e.target.value, page: 1 });
  };

  const handleCategory = (e) => {
    setSelectedCategory(e.target.value);
    fetchProducts({ category: e.target.value, page: 1 });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search products by name…"
          className="input-field pl-10"
        />
      </div>
      <div className="relative sm:w-56">
        <Filter
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <select
          value={selectedCategory}
          onChange={handleCategory}
          className="input-field pl-10 appearance-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
