import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/cart");
      set({ cart: res.data, loading: false });
      get().calculateTotals();
    } catch {
      set({ cart: [], loading: false });
      toast.error("Failed to load cart");
    }
  },

  addToCart: async (product, selectedSize = null) => {
    try {
      await api.post("/cart", { productId: product._id, selectedSize });

      const existing = get().cart.find(
        (i) => i._id === product._id && (i.selectedSize || null) === (selectedSize || null)
      );

      if (existing) {
        set({
          cart: get().cart.map((i) =>
            i._id === product._id && (i.selectedSize || null) === (selectedSize || null)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        });
      } else {
        set({ cart: [...get().cart, { ...product, quantity: 1, selectedSize }] });
      }

      get().calculateTotals();
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  },

  removeFromCart: async (productId, selectedSize = null) => {
    try {
      await api.delete("/cart", { data: { productId, selectedSize } });
      set({
        cart: get().cart.filter(
          (i) => !(i._id === productId && (i.selectedSize || null) === (selectedSize || null))
        ),
      });
      get().calculateTotals();
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  },

  updateQuantity: async (productId, quantity, selectedSize = null) => {
    if (quantity <= 0) return get().removeFromCart(productId, selectedSize);
    try {
      await api.put(`/cart/${productId}`, { quantity, selectedSize });
      set({
        cart: get().cart.map((i) =>
          i._id === productId && (i.selectedSize || null) === (selectedSize || null)
            ? { ...i, quantity }
            : i
        ),
      });
      get().calculateTotals();
    } catch {
      toast.error("Failed to update quantity");
    }
  },

  clearCart: () => set({ cart: [], coupon: null, isCouponApplied: false, total: 0, subtotal: 0 }),

  applyCoupon: async (code) => {
    try {
      const res = await api.post("/coupons/validate", { code });
      set({ coupon: res.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success(`Coupon applied: ${res.data.discountPercentage}% off`);
    } catch {
      toast.error("Invalid or expired coupon");
    }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let total = subtotal;
    if (coupon) total = subtotal * (1 - coupon.discountPercentage / 100);
    set({ subtotal, total });
  },
}));

export default useCartStore;