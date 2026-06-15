import { Link } from "react-router-dom";
import { XCircle, ShoppingCart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PurchaseCancelPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-10 space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-5">
              <XCircle className="h-14 w-14 text-destructive" />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-3xl font-semibold mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges were made. Your cart has been saved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild>
              <Link to="/cart"><ShoppingCart className="h-4 w-4 mr-2" />Return to Cart</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
