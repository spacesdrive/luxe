import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box, Container, Grid, Typography, Button, Chip,
  Skeleton, Breadcrumbs, Divider, Stack,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faChevronRight, faTruckFast, faShieldHalved, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";
import useCartStore from "../store/useCartStore";
import useAuthStore from "../store/useAuthStore";
import ProductCard from "../components/ProductCard";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedShoeSize, setSelectedShoeSize] = useState(null);

  useEffect(() => {
    if (!id) return;
    setSelectedSize(null);
    setSelectedShoeSize(null);
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, recRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get("/products/recommendations"),
        ]);
        setProduct(productRes.data);
        const recs = (recRes.data || []).filter((p) => p._id !== id).slice(0, 4);
        setRecommended(recs);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) { navigate("/login"); return; }
    if (!product) return;
    const size = selectedSize || selectedShoeSize || null;
    addToCart(product, size);
  };

  const hasSizes = product?.sizes?.length > 0;
  const hasShoeSizes = product?.shoeSizes?.length > 0;
  const needsSize = hasSizes || hasShoeSizes;
  const sizeChosen = needsSize ? (selectedSize || selectedShoeSize) : true;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: "4px", bgcolor: "#1A1A26" }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton height={40} sx={{ mb: 2, bgcolor: "#1A1A26" }} />
            <Skeleton height={60} sx={{ mb: 2, bgcolor: "#1A1A26" }} />
            <Skeleton height={100} sx={{ bgcolor: "#1A1A26" }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h3" sx={{ color: "text.secondary", mb: 3 }}>Product not found</Typography>
        <Button component={Link} to="/shop" variant="contained" startIcon={<FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 13 }} />}>
          Back to Shop
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Breadcrumbs
          separator={<FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9, color: "#4A4A60" }} />}
          sx={{ mb: 4 }}
        >
          <Typography component={Link} to="/" sx={{ color: "text.secondary", fontSize: "0.78rem", textDecoration: "none", "&:hover": { color: "primary.main" } }}>Home</Typography>
          <Typography component={Link} to="/shop" sx={{ color: "text.secondary", fontSize: "0.78rem", textDecoration: "none", "&:hover": { color: "primary.main" } }}>Shop</Typography>
          {product.category && (
            <Typography component={Link} to={`/shop/${product.category.toLowerCase()}`} sx={{ color: "text.secondary", fontSize: "0.78rem", textDecoration: "none", "&:hover": { color: "primary.main" } }}>
              {product.category}
            </Typography>
          )}
          <Typography sx={{ color: "primary.main", fontSize: "0.78rem" }}>{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={7}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{
              position: "relative",
              background: "#12121A",
              border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: "4px",
              overflow: "hidden",
              aspectRatio: "1",
            }}>
              {product.isFeatured && (
                <Chip
                  label="Featured"
                  size="small"
                  sx={{ position: "absolute", top: 16, left: 16, zIndex: 2, background: "linear-gradient(135deg, #C9A84C, #E4C97E)", color: "#0A0A0F", fontWeight: 700 }}
                />
              )}
              <Box
                component="img"
                src={product.image || `https://placehold.co/600x600/1A1A26/C9A84C?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", "&:hover": { transform: "scale(1.04)" } }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ color: "primary.main", mb: 1 }}>{product.category}</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, color: "text.primary", mb: 2, lineHeight: 1.15 }}>
              {product.name}
            </Typography>

            <Typography sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "2.5rem",
              fontWeight: 600,
              color: "primary.main",
              mb: 3,
              letterSpacing: "-0.01em",
            }}>
              ${product.price?.toFixed(2)}
            </Typography>

            {hasSizes && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.2 }}>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                    Available Sizes
                  </Typography>
                  {selectedSize && (
                    <Typography sx={{ fontSize: "0.72rem", color: "primary.main", fontWeight: 600 }}>
                      Selected: {selectedSize}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {product.sizes.map((s) => (
                    <Box
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                      sx={{
                        px: 2, py: 0.7,
                        border: selectedSize === s ? "1px solid #C9A84C" : "1px solid rgba(201,168,76,0.3)",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: selectedSize === s ? "#C9A84C" : "text.secondary",
                        letterSpacing: "0.04em",
                        background: selectedSize === s ? "rgba(201,168,76,0.1)" : "transparent",
                        transition: "all 0.15s",
                        "&:hover": { borderColor: "#C9A84C", color: "#C9A84C" },
                      }}
                    >
                      {s}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {hasShoeSizes && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.2 }}>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                    Shoe Sizes
                  </Typography>
                  {selectedShoeSize && (
                    <Typography sx={{ fontSize: "0.72rem", color: "primary.main", fontWeight: 600 }}>
                      Selected: {selectedShoeSize}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {product.shoeSizes.map((s) => (
                    <Box
                      key={s}
                      onClick={() => setSelectedShoeSize(selectedShoeSize === s ? null : s)}
                      sx={{
                        px: 2, py: 0.7,
                        border: selectedShoeSize === s ? "1px solid #7B5EA7" : "1px solid rgba(123,94,167,0.3)",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: selectedShoeSize === s ? "#C9A84C" : "#A07FCC",
                        letterSpacing: "0.02em",
                        background: selectedShoeSize === s ? "rgba(123,94,167,0.12)" : "transparent",
                        transition: "all 0.15s",
                        "&:hover": { borderColor: "#7B5EA7", color: "#C9A84C" },
                      }}
                    >
                      {s}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Typography sx={{ color: "text.secondary", lineHeight: 1.9, fontSize: "0.95rem", mb: 4 }}>
              {product.description}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {needsSize && !sizeChosen && (
              <Typography sx={{ fontSize: "0.78rem", color: "error.main", mb: 1.5 }}>
                Please select a size before adding to cart
              </Typography>
            )}

            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAddToCart}
                disabled={!sizeChosen}
                startIcon={<FontAwesomeIcon icon={faBagShopping} style={{ fontSize: 15 }} />}
                sx={{ flex: 1, py: 1.8 }}
              >
                Add to Cart
              </Button>
            </Stack>

            <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { icon: <FontAwesomeIcon icon={faTruckFast} style={{ fontSize: 13 }} />, text: "Free shipping on orders over $200" },
                { icon: <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 13 }} />, text: "Secure checkout · 256-bit SSL" },
              ].map((item) => (
                <Box key={item.text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ color: "primary.main", opacity: 0.7, display: "flex" }}>{item.icon}</Box>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {recommended.length > 0 && (
          <Box sx={{ mt: 10 }}>
            <Typography variant="subtitle1" sx={{ color: "primary.main", mb: 0.5 }}>You may also like</Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" }, mb: 4, color: "text.primary" }}>
              Related Products
            </Typography>
            <Grid container spacing={3}>
              {recommended.map((p) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p._id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}