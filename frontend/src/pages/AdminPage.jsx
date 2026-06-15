import { useEffect, useState, useRef } from "react";
import { Users, Package, Receipt, DollarSign, Plus, Trash2, Upload, Pencil, X, Ruler, Image } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

import api from "@/api/axios";
import useProductStore from "@/store/useProductStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = ["Electronics", "Clothing", "Accessories", "Jewelry", "Home", "Fragrance"];
const SIZE_CATEGORIES = ["Clothing", "Accessories"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SHOE_SIZES = ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];
const EMPTY_PRODUCT = { name: "", description: "", price: "", image: "", category: "", sizes: [], shoeSizes: [] };

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className="font-heading text-3xl font-semibold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ImageUploader({ value, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => { onChange(reader.result); setUploading(false); };
    reader.onerror = () => { toast.error("Failed to read file"); setUploading(false); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Product Image</p>
      <div
        onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
      >
        {uploading ? (
          <div className="h-36 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : value ? (
          <div className="relative">
            <img src={value} alt="Preview" className="w-full max-h-48 object-contain" onError={(e) => { e.target.style.display = "none"; }} />
            <button
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-7 w-7 opacity-50" />
            <p className="text-sm">Click to upload image</p>
            <p className="text-xs opacity-60">PNG, JPG, WEBP · max 5MB</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Input
        placeholder="Or paste an image URL..."
        value={value?.startsWith("data:") ? "" : (value || "")}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SizeSelector({ category, sizes, shoeSizes, onSizesChange, onShoeSizesChange }) {
  if (!SIZE_CATEGORIES.includes(category)) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-primary" />Available Sizes</p>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Clothing</p>
        <div className="flex flex-wrap gap-1.5">
          {CLOTHING_SIZES.map((s) => (
            <button
              key={s} type="button"
              onClick={() => onSizesChange(sizes.includes(s) ? sizes.filter((x) => x !== s) : [...sizes, s])}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-all ${sizes.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Shoe Sizes (optional)</p>
        <div className="flex flex-wrap gap-1.5">
          {SHOE_SIZES.map((s) => (
            <button
              key={s} type="button"
              onClick={() => onShoeSizesChange(shoeSizes.includes(s) ? shoeSizes.filter((x) => x !== s) : [...shoeSizes, s])}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-all ${shoeSizes.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ data, onChange, onSubmit, submitLabel = "Create Product", submitting }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Product Name *</label>
          <Input required placeholder="Product name" value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Price ($) *</label>
          <Input required type="number" min="0" step="0.01" placeholder="0.00" value={data.price} onChange={(e) => onChange({ ...data, price: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <Textarea placeholder="Product description..." value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={3} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Category *</label>
        <Select value={data.category} onValueChange={(v) => onChange({ ...data, category: v, sizes: [], shoeSizes: [] })}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <SizeSelector
        category={data.category}
        sizes={data.sizes}
        shoeSizes={data.shoeSizes}
        onSizesChange={(s) => onChange({ ...data, sizes: s })}
        onShoeSizesChange={(s) => onChange({ ...data, shoeSizes: s })}
      />
      <ImageUploader value={data.image} onChange={(v) => onChange({ ...data, image: v })} />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

export default function AdminPage() {
  const { products, loading, fetchAllProducts, deleteProduct, toggleFeatured, createProduct, updateProduct } = useProductStore();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [submitting, setSubmitting] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");

  useEffect(() => {
    fetchAllProducts();
    api.get("/analytics").then((res) => {
      const { analyticsData, dailySalesData } = res.data;
      const { users, products: p, totalSales, totalRevenue } = analyticsData || {};
      setStats({ users, products: p, sales: totalSales, revenue: totalRevenue });
      setChartData(dailySalesData || []);
    }).catch(() => {});
  }, [fetchAllProducts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error("Name, price, and category are required");
      return;
    }
    setSubmitting(true);
    try {
      await createProduct({ ...newProduct, price: parseFloat(newProduct.price) });
      setNewProduct(EMPTY_PRODUCT);
      setActiveTab("products");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    setSubmitting(true);
    try {
      await updateProduct(editProduct._id, { ...editProduct, price: parseFloat(editProduct.price) });
      setEditOpen(false);
      setEditProduct(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your store</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="add">Add Product</TabsTrigger>
          </TabsList>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats ? (
                <>
                  <StatCard icon={Users} label="Total Users" value={stats.users != null ? stats.users.toLocaleString() : "—"} />
                  <StatCard icon={Package} label="Total Products" value={stats.products != null ? stats.products.toLocaleString() : "—"} />
                  <StatCard icon={Receipt} label="Total Orders" value={stats.sales != null ? stats.sales.toLocaleString() : "—"} />
                  <StatCard icon={DollarSign} label="Revenue" value={stats.revenue != null ? `$${Number(stats.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"} />
                </>
              ) : (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Revenue & Orders (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No sales data available yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.75 0.13 75)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.75 0.13 75)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="oklch(0.75 0.13 75)" fill="url(#revGrad)" strokeWidth={2} name="Revenue ($)" />
                      <Area type="monotone" dataKey="sales" stroke="oklch(0.62 0.18 280)" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Orders" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products table */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">All Products ({products.length})</CardTitle>
                <Button size="sm" onClick={() => setActiveTab("add")}>
                  <Plus className="h-4 w-4 mr-1.5" />Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0" />
                              <div>
                                <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                                {(p.sizes?.length > 0) && (
                                  <p className="text-xs text-muted-foreground">{p.sizes.slice(0, 3).join(", ")}{p.sizes.length > 3 ? "..." : ""}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{p.category}</Badge>
                          </TableCell>
                          <TableCell className="font-medium font-heading">${p.price?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Switch
                              checked={p.isFeatured}
                              onCheckedChange={() => toggleFeatured(p._id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8"
                                onClick={() => { setEditProduct({ ...p, price: p.price?.toString() }); setEditOpen(true); }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => { if (confirm("Delete this product?")) deleteProduct(p._id); }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add product */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductForm
                  data={newProduct}
                  onChange={setNewProduct}
                  onSubmit={handleCreate}
                  submitLabel="Create Product"
                  submitting={submitting}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              data={editProduct}
              onChange={setEditProduct}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
              submitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
