import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/favicon.jpg" alt="Luxe" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30" />
            <span className="font-heading text-2xl font-semibold">Luxe</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email" type="email" required autoComplete="email"
                    placeholder="you@example.com" className="pl-9"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password" type={showPw ? "text" : "password"} required autoComplete="current-password"
                    placeholder="••••••••" className="pl-9 pr-9"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Don&apos;t have an account?&nbsp;
            <Link to="/signup" className="text-primary hover:underline font-medium">Create one</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
