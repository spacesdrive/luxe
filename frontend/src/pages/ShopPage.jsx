import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";

import useProductStore from "@/store/useProductStore";
import ProductCard from "@/components/ProductCard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = ["All", "Electronics", "Clothing", "Accessories", "Jewelry", "Home", "Fragrance"];
const SORTS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
];

export default function ShopPage() {
  const { category: paramCategory } = useParams();
  const { products, loading, fetchByCategory, fetchPublicProducts } = useProductStore();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [activeCategory, setActiveCategory] = useState(
    paramCategory ? paramCategory.charAt(0).toUpperCase() + paramCategory.slice(1) : "All"
  );

  const debounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    if (activeCategory === "All") {
      fetchPublicProducts();
    } else {
      fetchByCategory(activeCategory);
    }
  }, [activeCategory, fetchByCategory, fetchPublicProducts]);

  useEffect(() => {
    if (paramCategory) {
      const formatted = paramCategory.charAt(0).toUpperCase() + paramCategory.slice(1);
      setActiveCategory(formatted);
    }
  }, [paramCategory]);

  const filtered = products
    .filter((p) => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.name?.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <nav className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Shop</span>
            {activeCategory !== "All" && (
              <>
                <span>/</span>
                <span className="text-foreground">{activeCategory}</span>
              </>
            )}
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold">
                {activeCategory === "All" ? "All Products" : activeCategory}
              </h1>
              {!loading && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {filtered.length} {filtered.length === 1 ? "product" : "products"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {/* Sort */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-52">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
