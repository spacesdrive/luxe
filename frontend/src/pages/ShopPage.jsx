import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Typography, Grid, Chip, Stack,
  TextField, InputAdornment, MenuItem, Select,
  FormControl, InputLabel, Breadcrumbs,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faChevronRight,
  faMicrochip, faShirt, faBriefcase, faRing, faCouch, faSprayCan,
} from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { label: "All", icon: null, color: "#C9A84C" },
  { label: "Electronics", icon: faMicrochip, color: "#4C8AE0" },
  { label: "Clothing", icon: faShirt, color: "#7B5EA7" },
  { label: "Accessories", icon: faBriefcase, color: "#C9A84C" },
  { label: "Jewelry", icon: faRing, color: "#E09C3C" },
  { label: "Home", icon: faCouch, color: "#4CAF82" },
  { label: "Fragrance", icon: faSprayCan, color: "#E05C5C" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A–Z" },
];

function DarkSkeleton() {
  return (
    <Box sx={{
      height: 430,
      borderRadius: "6px",
      bgcolor: "#1A1A26",
      border: "1px solid rgba(201,168,76,0.08)",
      overflow: "hidden",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent 25%, rgba(201,168,76,0.04) 50%, transparent 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s infinite",
      },
      "@keyframes shimmer": {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
    }} />
  );
}

export default function ShopPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const hasLoadedOnce = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const activeCategory = category
    ? CATEGORIES.find((c) => c.label.toLowerCase() === category.toLowerCase())?.label || "All"
    : "All";

  useEffect(() => {
    setSearch("");
    const loadProducts = async () => {
      setLoading(true);
      try {
        let data = [];
        if (activeCategory === "All") {
          const res = await api.get("/products/all");
          data = res.data.products || [];
        } else {
          const res = await api.get(`/products/category/${activeCategory}`);
          data = res.data.products || [];
        }
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err.message);
        setProducts([]);
      } finally {
        setLoading(false);
        if (!hasLoadedOnce.current) {
          hasLoadedOnce.current = true;
          setIsInitialLoad(false);
        }
      }
    };
    loadProducts();
  }, [activeCategory]);

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

  const activeCat = CATEGORIES.find((c) => c.label === activeCategory);
  const showSkeletons = isInitialLoad && loading && products.length === 0;

  return (
    <Box sx={{ minHeight: "100vh", pb: 10, bgcolor: "#0A0A0F" }}>
      <Box sx={{
        background: "linear-gradient(180deg, #12121A 0%, #0A0A0F 100%)",
        borderBottom: "1px solid",
        borderColor: "divider",
        py: { xs: 5, md: 7 },
        mb: 5,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "60%", height: "100%",
          background: "radial-gradient(ellipse at top, rgba(201,168,76,0.05) 0%, transparent 70%)",
        },
      }}>
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Breadcrumbs
            separator={<FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9, color: "#4A4A60" }} />}
            sx={{ mb: 2 }}
          >
            <Typography component={Link} to="/" sx={{ color: "text.secondary", fontSize: "0.78rem", textDecoration: "none", "&:hover": { color: "primary.main" } }}>
              Home
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>Shop</Typography>
            {activeCategory !== "All" && (
              <Typography sx={{ color: "primary.main", fontSize: "0.78rem" }}>{activeCategory}</Typography>
            )}
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {activeCat?.icon && (
              <Box sx={{ p: 1.5, background: `${activeCat.color}15`, border: `1px solid ${activeCat.color}30`, borderRadius: "4px" }}>
                <FontAwesomeIcon icon={activeCat.icon} style={{ fontSize: 22, color: activeCat.color }} />
              </Box>
            )}
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, color: "text.primary", lineHeight: 1.1 }}>
                {activeCategory === "All" ? "All Products" : activeCategory}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", mt: 0.5 }}>
                {loading && isInitialLoad ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.label;
              return (
                <Chip
                  key={cat.label}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      {cat.icon && <FontAwesomeIcon icon={cat.icon} style={{ fontSize: 10 }} />}
                      {cat.label}
                    </Box>
                  }
                  onClick={() => navigate(cat.label === "All" ? "/shop" : `/shop/${cat.label.toLowerCase()}`)}
                  sx={{
                    cursor: "pointer",
                    background: isActive ? "linear-gradient(135deg, #C9A84C, #E4C97E)" : "transparent",
                    color: isActive ? "#0A0A0F" : "text.secondary",
                    border: isActive ? "none" : "1px solid rgba(201,168,76,0.2)",
                    fontWeight: isActive ? 700 : 500,
                    "&:hover": { background: isActive ? undefined : "rgba(201,168,76,0.08)" },
                  }}
                />
              );
            })}
          </Stack>

          <TextField
            size="small"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 13, color: "#4A4A60" }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: 210 } }}
          />

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel sx={{ fontSize: "0.8rem" }}>Sort By</InputLabel>
            <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)} sx={{ fontSize: "0.8rem" }}>
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {showSkeletons ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <DarkSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 && !loading ? (
          <Box sx={{ minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 48, color: "#4A4A60", marginBottom: 16 }} />
            <Typography variant="h4" sx={{ color: "text.secondary", mb: 1.5, fontSize: "1.6rem" }}>
              No products found
            </Typography>
            <Typography sx={{ color: "text.disabled" }}>
              Try adjusting your search or filters
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{
            opacity: loading && !isInitialLoad ? 0.5 : 1,
            transition: "opacity 0.25s ease",
            pointerEvents: loading && !isInitialLoad ? "none" : "auto",
          }}>
            {filtered.map((product) => (
              <Grid key={product._id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}