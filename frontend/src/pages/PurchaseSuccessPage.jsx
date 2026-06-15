import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag, Home } from "lucide-react";
import useCartStore from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/api/axios";

export default function PurchaseSuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId) {
      api.post("/payments/checkout-success", { sessionId }).catch(() => {});
    }
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-10 space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-5">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-3xl font-semibold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. You will receive an email confirmation shortly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild>
              <Link to="/shop"><ShoppingBag className="h-4 w-4 mr-2" />Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/"><Home className="h-4 w-4 mr-2" />Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
