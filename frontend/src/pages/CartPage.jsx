import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, Tag, X, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/api/axios";

export default function CartPage() {
  const {
    cart, coupon, isCouponApplied, total, subtotal, loading,
    fetchCart, removeFromCart, updateQuantity, applyCoupon, removeCoupon, calculateTotals
  } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    await applyCoupon(couponCode.trim());
    setCouponCode("");
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await api.post("/payments/create-checkout-session", { products: cart, couponCode: coupon?.code });
      window.location.href = res.data.url;
    } catch {
      toast.error("Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const shipping = subtotal >= 200 ? 0 : 15;
  const freeShippingRemaining = 200 - subtotal;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="rounded-full bg-muted p-8 w-fit mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you have not added anything yet.</p>
        <Button asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-heading text-3xl font-semibold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item, idx) => (
              <div key={`${item._id}-${item.selectedSize}`} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                <Link to={`/product/${item._id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg object-cover bg-muted"
                  />
                </Link>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/product/${item._id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{item.category}</span>
                        {item.selectedSize && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.selectedSize}</Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id, item.selectedSize)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(item._id, item.quantity - 1, item.selectedSize)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedSize)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-semibold text-primary font-heading">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 sticky top-20">
              <h2 className="font-semibold mb-4">Order Summary</h2>

              {freeShippingRemaining > 0 && (
                <Alert className="mb-4 border-primary/30 bg-primary/5">
                  <Truck className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs">
                    Add <span className="font-semibold text-primary">${freeShippingRemaining.toFixed(2)}</span> more for free shipping!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {isCouponApplied && coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon.discountPercentage}%)</span>
                    <span>-${(subtotal * coupon.discountPercentage / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping}`}</span>
                </div>
              </div>

              <Separator className="my-3" />
              <div className="flex justify-between font-semibold text-base mb-4">
                <span>Total</span>
                <span className="text-primary font-heading text-lg">${total.toFixed(2)}</span>
              </div>

              {/* Coupon */}
              {isCouponApplied && coupon ? (
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium text-primary">{coupon.code}</span>
                    <span className="text-muted-foreground text-xs">({coupon.discountPercentage}% off)</span>
                  </div>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="h-9 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon} className="shrink-0">Apply</Button>
                </div>
              )}

              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
