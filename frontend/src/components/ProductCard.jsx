import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, X } from "lucide-react";

import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [pendingSize, setPendingSize] = useState(null);

  const hasSizes = product.sizes?.length > 0;
  const hasShoeSizes = product.shoeSizes?.length > 0;
  const needsSizeSelection = hasSizes || hasShoeSizes;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (needsSizeSelection) {
      setPendingSize(null);
      setSizeDialogOpen(true);
    } else {
      addToCart(product, null);
    }
  };

  const handleConfirmSize = () => {
    if (!pendingSize) return;
    addToCart(product, pendingSize);
    setSizeDialogOpen(false);
    setPendingSize(null);
  };

  return (
    <>
      <Card
        className={cn(
          "group overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer",
          compact ? "w-full" : "w-full"
        )}
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <div className={cn("relative overflow-hidden bg-muted", compact ? "h-40" : "h-64")}>
          {!imgLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImgLoaded(true)}
          />
          {/* Overlays */}
          <button
            onClick={(e) => { e.stopPropagation(); setWished(!wished); }}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={cn("h-4 w-4", wished ? "fill-red-500 text-red-500" : "text-foreground")} />
          </button>
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px]">
              Featured
            </Badge>
          )}
        </div>

        <CardContent className={cn("p-4", compact && "p-3")}>
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <p className={cn("font-semibold line-clamp-2 mb-2 leading-snug", compact ? "text-sm" : "text-base")}>
            {product.name}
          </p>

          {!compact && (hasSizes || hasShoeSizes) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(hasSizes ? product.sizes : product.shoeSizes).slice(0, 4).map((s) => (
                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                  {s}
                </Badge>
              ))}
              {((hasSizes ? product.sizes : product.shoeSizes).length > 4) && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{(hasSizes ? product.sizes : product.shoeSizes).length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-primary font-bold font-heading text-lg">
              ${product.price?.toFixed(2)}
            </span>
            <Button
              size="sm"
              className="shrink-0"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {compact ? "Add" : "Add to Cart"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Size selection dialog */}
      <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {hasSizes && (
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Clothing Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={pendingSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPendingSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {hasShoeSizes && (
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Shoe Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.shoeSizes.map((size) => (
                    <Button
                      key={size}
                      variant={pendingSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPendingSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSizeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmSize} disabled={!pendingSize}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
