import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Container, Typography, Button, Grid,
  Divider, Stack,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faTruckFast, faShieldHalved, faRotateLeft,
  faGem, faMicrochip, faShirt, faBriefcase, faRing,
  faCouch, faSprayCan,
} from "@fortawesome/free-solid-svg-icons";
import useProductStore from "../store/useProductStore";
import useAuthStore from "../store/useAuthStore";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { label: "Electronics", icon: faMicrochip, color: "#4C8AE0", desc: "Gadgets & tech", bg: "linear-gradient(145deg, #0D1B3E 0%, #1A2A5E 100%)" },
  { label: "Clothing", icon: faShirt, color: "#7B5EA7", desc: "Style & fashion", bg: "linear-gradient(145deg, #1A1030 0%, #2A1850 100%)" },
  { label: "Accessories", icon: faBriefcase, color: "#C9A84C", desc: "Bags & more", bg: "linear-gradient(145deg, #2A1F00 0%, #3A2D0A 100%)" },
  { label: "Jewelry", icon: faRing, color: "#E09C3C", desc: "Fine jewelry", bg: "linear-gradient(145deg, #2A1800 0%, #3D2400 100%)" },
  { label: "Homes", icon: faCouch, color: "#4CAF82", desc: "Décor & living", bg: "linear-gradient(145deg, #001A10 0%, #0A2E1C 100%)" },
  { label: "Fragrance", icon: faSprayCan, color: "#E05C5C", desc: "Scents & parfums", bg: "linear-gradient(145deg, #2A0808 0%, #3E1010 100%)" },
];

const PROMISES = [
  { icon: faTruckFast, title: "Free Shipping", desc: "On orders over $200" },
  { icon: faShieldHalved, title: "Secure Payment", desc: "256-bit SSL encryption" },
  { icon: faRotateLeft, title: "Easy Returns", desc: "30-day return policy" },
  { icon: faGem, title: "Authenticity", desc: "100% genuine products" },
];

// Dark skeleton for loading states
function DarkSkeleton() {
  return (
    <Box
      sx={{
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
          background:
            "linear-gradient(90deg, transparent 25%, rgba(201,168,76,0.04) 50%, transparent 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s infinite",
        },
        "@keyframes shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      }}
    />
  );
}

export default function HomePage() {
  const { featuredProducts, fetchFeaturedProducts, loading } = useProductStore();
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const { fetchRecommended } = useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchRecommended().then((data) => {
      setRecommended(data);
      setRecLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ bgcolor: "#0A0A0F" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "auto", md: "70vh" },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 70% 80% at 50% 60%, rgba(123,94,167,0.13) 0%, transparent 65%),
              radial-gradient(ellipse 50% 50% at 20% 30%, rgba(201,168,76,0.07) 0%, transparent 55%),
              linear-gradient(180deg, #0A0A0F 0%, #0D0D18 100%)
            `,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(201,168,76,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "72px 72px",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, py: { xs: 10, md: 0 }, textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 28, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
            <Typography sx={{ color: "primary.main", fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600 }}>
              New Collection 2026
            </Typography>
            <Box sx={{ width: 28, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
          </Box>

          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "3.2rem", sm: "4.5rem", md: "6rem" }, lineHeight: 1.0, mb: 3, color: "text.primary" }}
          >
            Crafted for
            <Box component="span" sx={{
              display: "block",
              background: "linear-gradient(135deg, #C9A84C 0%, #E4C97E 45%, #C9A84C 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Connoisseurs
            </Box>
          </Typography>

          <Typography sx={{
            fontSize: { xs: "0.95rem", md: "1.1rem" },
            color: "text.secondary", lineHeight: 1.9, mb: 6,
            maxWidth: 520, mx: "auto",
          }}>
            Premium goods curated for those who appreciate quality without compromise.
            Each piece chosen with the discerning collector in mind.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ mb: 8 }}>
            <Button
              component={Link} to="/shop" variant="contained" size="large"
              endIcon={<FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "0.75rem" }} />}
              sx={{ fontSize: "0.75rem", px: 5, py: 1.8 }}
            >
              Explore Collection
            </Button>
            <Button
              component={Link} to="/shop/fragrance" variant="outlined" size="large"
              sx={{ fontSize: "0.75rem", px: 8, py: 1.8 }}
            >
              View Fragrance
            </Button>
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 4, md: 8 }, pt: 5, borderTop: "1px solid rgba(201,168,76,0.1)" }}>
            {[["2k+", "Products"], ["150+", "Brands"], ["98%", "Satisfaction"]].map(([num, lbl]) => (
              <Box key={lbl}>
                <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "2.2rem", fontWeight: 600, color: "primary.main", lineHeight: 1 }}>{num}</Typography>
                <Typography sx={{ fontSize: "0.67rem", color: "text.secondary", letterSpacing: "0.1em", textTransform: "uppercase", mt: 0.4 }}>{lbl}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Promises Bar */}
      <Box sx={{ borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider", py: 3.5, background: "#0E0E1A" }}>
        <Container maxWidth="md">
          <Grid container>
            {PROMISES.map((p, i) => (
              <Grid item xs={6} md={3} key={p.title}>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 2,
                  px: { xs: 2, md: 3 }, py: { xs: 2, md: 0 },
                  borderRight: { md: i < 3 ? "1px solid rgba(201,168,76,0.08)" : "none" },
                }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: "8px",
                    background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <FontAwesomeIcon icon={p.icon} style={{ fontSize: 14, color: "#C9A84C" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>{p.title}</Typography>
                    <Typography sx={{ fontSize: "0.67rem", color: "text.secondary", mt: 0.2 }}>{p.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography variant="subtitle1" sx={{ color: "primary.main", mb: 1 }}>
            Handpicked Selection
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3rem" }, color: "text.primary", mb: 2 }}>
            Featured Products
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}>
            Discover our carefully curated collection of premium items that embody luxury and sophistication
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <DarkSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : featuredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {featuredProducts.slice(0, 8).map((product) => (
              <Grid key={product._id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ color: "text.secondary" }}>No featured products available</Typography>
          </Box>
        )}

        {featuredProducts.length > 0 && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              component={Link}
              to="/shop"
              variant="outlined"
              size="large"
              endIcon={<FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />}
              sx={{ px: 5 }}
            >
              View All Products
            </Button>
          </Box>
        )}
      </Container>

      {/* Categories Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: "linear-gradient(180deg, #0A0A0F 0%, #0D0D15 100%)" }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ color: "primary.main", mb: 1 }}>
              Shop by Category
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3rem" }, color: "text.primary", mb: 2 }}>
              Browse Collections
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {CATEGORIES.map((cat) => (
              <Grid key={cat.label} size={{ xs: 12, sm: 6, md: 4 }}>
                <CategoryCard cat={cat} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Recommended Products Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography variant="subtitle1" sx={{ color: "primary.main", mb: 1 }}>
            Curated for You
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3rem" }, color: "text.primary", mb: 2 }}>
            Recommended Products
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}>
            Explore our personalized recommendations based on trending items and customer favorites
          </Typography>
        </Box>

        {recLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <DarkSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : recommended.length > 0 ? (
          <Grid container spacing={3}>
            {recommended.slice(0, 8).map((product) => (
              <Grid key={product._id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ color: "text.secondary" }}>No recommendations available</Typography>
          </Box>
        )}

        {recommended.length > 0 && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              component={Link}
              to="/shop"
              variant="contained"
              size="large"
              endIcon={<FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />}
              sx={{ px: 5 }}
            >
              Explore More
            </Button>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ background: "#0D0D15", borderTop: "1px solid rgba(201,168,76,0.1)", pt: { xs: 8, md: 12 }, pb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "1.2fr repeat(3, 1fr)" }, gap: { xs: 5, md: 8 }, mb: { xs: 6, md: 10 } }}>
            {/* Col 1 — Brand */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
                <FontAwesomeIcon icon={faGem} style={{ fontSize: 18, color: "#C9A84C" }} />
                <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.5rem", fontWeight: 600, color: "text.primary", letterSpacing: "0.1em" }}>
                  LUXE
                </Typography>
              </Box>
              <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", lineHeight: 1.9, mb: 4 }}>
                Premium goods curated for those who appreciate quality without compromise. Experience luxury redefined.
              </Typography>
            </Box>

            {/* Col 2 — Support & Account */}
            <Box>
              <Typography sx={{ color: "primary.main", fontSize: "0.63rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, mb: 3 }}>
                Support
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4, mb: 4 }}>
                {[["FAQ", "/faq"], ["Shipping Info", "/shipping"], ["Returns", "/returns"], ["Contact Us", "/contact"]].map(([label, path]) => (
                  <Typography key={path} component={Link} to={path}
                    sx={{ color: "text.secondary", fontSize: "0.81rem", textDecoration: "none", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                    {label}
                  </Typography>
                ))}
              </Box>
              <Typography sx={{ color: "primary.main", fontSize: "0.63rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, mb: 3 }}>
                Account
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
                {(user
                  ? [["My Cart", "/cart"]]
                  : [["Sign In", "/login"], ["Create Account", "/signup"], ["My Cart", "/cart"]]
                ).map(([label, path]) => (
                  <Typography key={path} component={Link} to={path}
                    sx={{ color: "text.secondary", fontSize: "0.81rem", textDecoration: "none", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                    {label}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Col 3 — Categories */}
            <Box>
              <Typography sx={{ color: "primary.main", fontSize: "0.63rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, mb: 3 }}>
                Categories
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
                {CATEGORIES.map((c) => (
                  <Box key={c.label} component={Link} to={`/shop/${c.label.toLowerCase()}`}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none", "&:hover .lbl": { color: "primary.main" }, "&:hover .ico": { opacity: 1 } }}>
                    <FontAwesomeIcon className="ico" icon={c.icon} style={{ fontSize: 11, color: c.color, opacity: 0.6, width: 13, transition: "opacity 0.2s" }} />
                    <Typography className="lbl" sx={{ color: "text.secondary", fontSize: "0.81rem", transition: "color 0.2s" }}>{c.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Col 4 — Why Luxe*/}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography sx={{ color: "primary.main", fontSize: "0.63rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>
                Why Luxe
              </Typography>

              {/* Stats */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5 }}>
                {[{ n: "2k+", l: "Curated Products" }, { n: "150+", l: "Global Brands" }, { n: "98%", l: "Happy Customers" }, { n: "30d", l: "Return Window" }].map((s) => (
                  <Box key={s.l} sx={{ p: 2, background: "#1A1A26", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "8px" }}>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.6rem", fontWeight: 600, color: "primary.main", lineHeight: 1 }}>{s.n}</Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", mt: 0.5 }}>{s.l}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Stay in the loop */}
              <Box sx={{
                p: 3,
                background: "linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(123,94,167,0.05) 100%)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "10px",
              }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary", mb: 0.6 }}>
                  Stay in the loop
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 2, lineHeight: 1.7 }}>
                  Get early access to new arrivals, exclusive drops, and member-only offers before anyone else.
                </Typography>
                <Button component={Link} to="/signup" variant="outlined" size="small" fullWidth
                  endIcon={<FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "0.6rem" }} />}
                  sx={{ fontSize: "0.72rem", py: 1 }}>
                  Create Account — It's Free
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: { xs: 4, md: 6 }, borderColor: "rgba(201,168,76,0.08)" }} />

          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FontAwesomeIcon icon={faGem} style={{ fontSize: 11, color: "#C9A84C", opacity: 0.5 }} />
              <Typography sx={{ color: "text.disabled", fontSize: "0.71rem", letterSpacing: "0.06em" }}>
                © 2026 LUXE STORE. ALL RIGHTS RESERVED.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <Typography sx={{ color: "text.disabled", fontSize: "0.71rem" }}>
                Secured by Stripe · SSL Encrypted
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function CategoryCard({ cat }) {
  return (
    <Box
      component={Link}
      to={`/shop/${cat.label.toLowerCase()}`}
      sx={{
        display: "block",
        textDecoration: "none",
        borderRadius: "12px",
        background: cat.bg,
        border: `1px solid ${cat.color}18`,
        height: 200,
        p: 3,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          border: `1px solid ${cat.color}50`,
          transform: "translateY(-4px)",
          boxShadow: `0 20px 50px ${cat.color}18`,
          "& .cat-arrow": { transform: "translateX(5px)", opacity: 1 },
          "& .cat-icon-wrap": { background: `${cat.color}28` },
        },
        "&::after": {
          content: '""', position: "absolute",
          top: -50, right: -50,
          width: 180, height: 180, borderRadius: "50%",
          background: `radial-gradient(circle, ${cat.color}14 0%, transparent 65%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        className="cat-icon-wrap"
        sx={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          p: 1.4, background: `${cat.color}18`,
          borderRadius: "10px", border: `1px solid ${cat.color}28`,
          transition: "background 0.25s",
        }}
      >
        <FontAwesomeIcon icon={cat.icon} style={{ fontSize: 22, color: cat.color }} />
      </Box>

      <Box sx={{ position: "absolute", bottom: 22, left: 24, right: 24 }}>
        <Typography sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "1.45rem", fontWeight: 600,
          color: "#F0ECE3", lineHeight: 1.1, mb: 0.6,
        }}>
          {cat.label}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", color: cat.color, fontWeight: 600, letterSpacing: "0.05em" }}>
            {cat.desc}
          </Typography>
          <FontAwesomeIcon
            className="cat-arrow"
            icon={faArrowRight}
            style={{ fontSize: 9, color: cat.color, transition: "transform 0.2s, opacity 0.2s", opacity: 0.6 }}
          />
        </Box>
      </Box>
    </Box>
  );
}