import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Gem, Star } from "lucide-react";

import useProductStore from "@/store/useProductStore";
import useAuthStore from "@/store/useAuthStore";
import ProductCard from "@/components/ProductCard";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CategoryOne } from "@/components/category-01";
import { ReviewOne } from "@/components/review-01";

const PROMISES = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $200" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "256-bit SSL encryption" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Gem, title: "Authenticity", desc: "100% genuine products" },
];

const REVIEWS = [
  {
    quote: "Absolutely stunning quality. The jewelry I ordered exceeded my expectations. Every detail is perfect.",
    author: "Sarah M.",
    handle: "@sarah_luxe",
    initials: "SM",
  },
  {
    quote: "The fragrance collection is divine. Fast shipping and beautifully packaged. Will be ordering again.",
    author: "James K.",
    handle: "@jk_style",
    initials: "JK",
  },
  {
    quote: "Best online luxury store I've found. The electronics selection is curated perfectly for discerning buyers.",
    author: "Priya R.",
    handle: "@priyar",
    initials: "PR",
  },
];

export default function HomePage() {
  const { featuredProducts, loading, fetchFeaturedProducts, fetchRecommended, recommendedProducts } = useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchRecommended?.();
  }, [fetchFeaturedProducts, fetchRecommended]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/20 border-b border-border">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.75 0.13 75 / 0.4), transparent)" }} />
        <div className="container mx-auto px-4 py-24 lg:py-36 text-center relative">
          <h1 className="font-heading text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
            Elevate Your{" "}
            <span className="text-primary">Everyday</span>{" "}
            Luxury
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Discover handpicked premium products across electronics, fashion, jewelry, and more. Delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/shop">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="outline" asChild>
                <Link to="/signup">Create Account</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Promises bar */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PROMISES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">Featured Products</h2>
            <p className="text-muted-foreground mt-1">Handpicked selections for you</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/shop">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-64 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </section>

      <Separator />

      {/* Categories (using commercn CategoryOne block) */}
      <section className="container mx-auto px-4 py-16">
        <CategoryOne />
      </section>

      <Separator />

      {/* Recommended */}
      {recommendedProducts?.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold">Recommended</h2>
              <p className="text-muted-foreground mt-1">Picked just for you</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recommendedProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Reviews */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold">What Our Customers Say</h2>
          <p className="text-muted-foreground mt-2">Real reviews from real buyers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div key={review.author} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{review.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                  {review.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/favicon.jpg" alt="Luxe" className="h-8 w-8 rounded-full object-cover" />
                <span className="font-heading text-lg font-semibold">Luxe</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium curated products for the discerning shopper.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Shop</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Electronics", "Clothing", "Accessories", "Jewelry"].map((c) => (
                  <li key={c}><Link to={`/shop/${c.toLowerCase()}`} className="hover:text-primary transition-colors">{c}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Account</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Create Account</Link></li>
                <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="pt-6 text-xs text-muted-foreground text-center">
            <p>© 2025 Luxe Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
