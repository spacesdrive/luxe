import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", pct: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score], pct: score * 25 };
}

export default function SignupPage() {
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = getPasswordStrength(form.password);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signup(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/favicon.jpg" alt="Luxe" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30" />
            <span className="font-heading text-2xl font-semibold">Luxe</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-2xl">Create an account</CardTitle>
            <CardDescription>Join Luxe and start shopping premium</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="Your full name" className="pl-9"
                    value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-9"
                    value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPw ? "text" : "password"} placeholder="Min. 8 characters" className="pl-9 pr-9"
                    value={form.password} onChange={(e) => update("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="space-y-1">
                    <Progress value={strength.pct} className="h-1" />
                    <p className="text-xs text-muted-foreground">{strength.label}</p>
                  </div>
                )}
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirm" type="password" placeholder="Repeat password" className="pl-9"
                    value={form.confirm} onChange={(e) => update("confirm", e.target.value)} />
                </div>
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Already have an account?&nbsp;
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
