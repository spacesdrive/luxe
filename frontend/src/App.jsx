import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DotLoader } from "@/components/ui/dot-loader";

import useAuthStore from "./store/useAuthStore";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import AdminPage from "./pages/AdminPage";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { user } = useAuthStore();
  return !user ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { checkAuth, checkingAuth } = useAuthStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <DotLoader size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:category" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/purchase-success" element={<ProtectedRoute><PurchaseSuccessPage /></ProtectedRoute>} />
          <Route path="/purchase-cancel" element={<ProtectedRoute><PurchaseCancelPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
        <ChatBot />
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
          },
          success: { iconTheme: { primary: "var(--primary)", secondary: "var(--primary-foreground)" } },
          error: { iconTheme: { primary: "oklch(0.58 0.22 27)", secondary: "var(--foreground)" } },
        }}
      />
    </BrowserRouter>
  );
}
