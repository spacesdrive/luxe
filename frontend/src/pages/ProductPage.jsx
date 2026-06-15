import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ShieldCheck, Truck, Star, Heart } from "lucide-react";

import useProductStore from "@/store/useProductStore";
import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";
import ProductCard from "@/components/ProductCard";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import api from "@/api/axios";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { recommendedProducts, fetchRecommended } = useProductStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setImgLoaded(false);
      setSelectedSize(null);
      setQuantity(1);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    fetchRecommended?.();
  }, [id, navigate, fetchRecommended]);

  const handleAddToCart = () => {
    if (!user) { navigate("/login"); return; }
    const needsSize = product?.sizes?.length > 0 || product?.shoeSizes?.length > 0;
    if (needsSize && !selectedSize) return;
    addToCart(product, selectedSize);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/5] rounded-xl" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasSizes = product.sizes?.length > 0;
  const hasShoeSizes = product.shoeSizes?.length > 0;
  const needsSize = hasSizes || hasShoeSizes;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop/${product.category?.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="relative aspect-[4/5] bg-muted rounded-xl overflow-hidden">
            {!imgLoaded && <Skeleton className="absolute inset-0 rounded-xl" />}
            <img
              src={product.image}
              alt={product.name}
              className={imgLoaded ? "w-full h-full object-cover opacity-100" : "w-full h-full object-cover opacity-0"}
              onLoad={() => setImgLoaded(true)}
            />
            {product.isFeatured && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
            )}
            <button
              onClick={() => setWished(!wished)}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border"
            >
              <Heart className={wished ? "h-4 w-4 fill-red-500 text-red-500" : "h-4 w-4 text-foreground"} />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">{product.category}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
                <span className="text-sm text-muted-foreground">(4.8)</span>
              </div>
              <span className="font-heading text-4xl font-semibold text-primary">${product.price?.toFixed(2)}</span>
            </div>

            <Separator />
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {hasSizes && (
              <div>
                <p className="text-sm font-semibold mb-2">Size {needsSize && !selectedSize && <span className="text-destructive">*</span>}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <Button key={s} size="sm" variant={selectedSize === s ? "default" : "outline"} onClick={() => setSelectedSize(s)}>{s}</Button>
                  ))}
                </div>
              </div>
            )}
            {hasShoeSizes && (
              <div>
                <p className="text-sm font-semibold mb-2">Shoe Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.shoeSizes.map((s) => (
                    <Button key={s} size="sm" variant={selectedSize === s ? "default" : "outline"} onClick={() => setSelectedSize(s)}>{s}</Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={needsSize && !selectedSize}>
                {needsSize && !selectedSize ? "Select a size first" : "Add to Cart"}
              </Button>
            </div>

            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary shrink-0" />Free shipping over $200
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />Secure checkout
              </div>
            </div>
          </div>
        </div>

        {recommendedProducts?.length > 0 && (
          <>
            <Separator className="mb-10" />
            <h2 className="font-heading text-2xl font-semibold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} compact />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
