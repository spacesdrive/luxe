import { userSchema } from "./user-model.js";
import { productSchema } from "./product-model.js";
import { orderSchema } from "./order-model.js";
import { couponSchema } from "./coupon-model.js";

// Binds each schema to the request-scoped connection. A fresh connection
// (see lib/db.js) means a fresh, empty model registry, so re-registering
// these names on every request is expected and safe.
export const getModels = (connection) => ({
    User: connection.model("User", userSchema),
    Product: connection.model("Product", productSchema),
    Order: connection.model("Order", orderSchema),
    Coupon: connection.model("Coupon", couponSchema),
});
