import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  ShoppingCart, Sun, Moon, LogOut, LayoutDashboard, Menu
} from "lucide-react";

import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleCircular } from "@/components/ui/theme-toggle-circular";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Electronics", "Clothing", "Accessories", "Jewelry", "Home", "Fragrance"];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary relative pb-0.5",
      isActive
        ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary"
        : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transform-gpu">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/favicon.jpg"
            alt="Luxe"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
          />
          <span className="font-heading text-xl font-semibold tracking-wide">Luxe</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/shop" className={navLinkClass}>Shop</NavLink>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggleCircular onToggle={toggleTheme} speed={0.5}>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </ThemeToggleCircular>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart" aria-label="Cart">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-1 ml-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle asChild>
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <img src="/favicon.jpg" alt="Luxe" className="h-7 w-7 rounded-full object-cover" />
                    <span className="font-heading text-lg font-semibold">Luxe</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-1">
                <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
                <MobileNavLink to="/shop" onClick={() => setMobileOpen(false)}>All Products</MobileNavLink>
                <Separator className="my-2" />
                <p className="text-xs font-medium text-muted-foreground px-3 py-1 uppercase tracking-wider">Categories</p>
                {CATEGORIES.map((cat) => (
                  <MobileNavLink key={cat} to={`/shop/${cat.toLowerCase()}`} onClick={() => setMobileOpen(false)}>
                    {cat}
                  </MobileNavLink>
                ))}
                {!user && (
                  <>
                    <Separator className="my-2" />
                    <Button asChild className="mt-1" onClick={() => setMobileOpen(false)}>
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button variant="outline" asChild className="mt-2" onClick={() => setMobileOpen(false)}>
                      <Link to="/signup">Sign up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      {children}
    </NavLink>
  );
}
