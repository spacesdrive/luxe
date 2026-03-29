<div align="center">

# LUXE Store

### An AI-powered premium e-commerce store with a real-time shopping assistant chatbot

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat&logo=redis&logoColor=white)](https://upstash.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat&logo=stripe&logoColor=white)](https://stripe.com)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=flat)](https://pinecone.io)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>

---

## What is LUXE?

LUXE is a full-stack premium e-commerce store where customers can browse and buy electronics, clothing, jewelry, accessories, fragrances, and home products — and get instant product recommendations through an **AI chatbot** that understands natural language.

The chatbot doesn't just keyword-match. It classifies intent, corrects typos, understands budgets and categories, performs semantic vector search using NVIDIA embeddings and Pinecone, and streams a natural conversational response back in real time using Groq's LLaMA 3.3 70B model.

---

## Features

- **AI Shopping Assistant** — real-time streaming chatbot that understands natural language queries, corrects typos, filters by budget and category, and recommends relevant products
- **Semantic Product Search** — NVIDIA NV-EmbedQA embeddings + Pinecone vector database for similarity-based product retrieval
- **Intent Classification** — LLM-powered classifier distinguishes product searches, price filters, greetings, store info questions, and off-topic messages
- **Stripe Checkout** — full payment flow with session-based order creation and reward coupons for orders over $200
- **JWT Authentication** — access and refresh tokens stored in HTTP-only cookies, refresh tokens stored in Redis
- **Admin Dashboard** — analytics overview (users, products, revenue, sales) with a 7-day daily sales chart
- **Cloudinary Image Uploads** — product images uploaded and served via Cloudinary CDN
- **Cart with Size Selection** — supports clothing sizes and shoe sizes per cart item
- **Coupon System** — per-user discount coupons with expiration dates, validated before checkout
- **Dark Premium UI** — MUI v7 components styled around a dark `#0A0A0F` theme with gold accents

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Cache / Sessions | Redis (ioredis) via Upstash |
| Auth | JWT (access 15m + refresh 7d), HTTP-only cookies |
| Payments | Stripe |
| Image Storage | Cloudinary |
| AI Chat | Groq SDK — LLaMA 3.3 70B + LLaMA 3.1 8B |
| Vector Search | Pinecone |
| Embeddings | NVIDIA NV-EmbedQA-E5-v5 (1024-dim) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| UI Library | Material UI v7 + Emotion |
| State Management | Zustand |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Charts | Recharts |
| Fonts | Cormorant Garamond + DM Sans |
| Notifications | React Hot Toast |

### Tooling / Scripts
| Tool | Purpose |
|---|---|
| Python + PyMongo | Seed product embeddings to Pinecone |
| UptimeRobot | Keep free-tier backend alive |

---

## Project Structure

```
ai-shopping-assistant/
│
├── backend/
│   ├── controllers/         # Route handlers
│   │   ├── auth-controller.js
│   │   ├── product-controller.js
│   │   ├── cart-controller.js
│   │   ├── coupon-controller.js
│   │   ├── payment-controller.js
│   │   ├── analytics-controller.js
│   │   └── chat-controller.js
│   │
│   ├── lib/                 # Third-party configs
│   │   ├── env.js           # Centralized env variables
│   │   ├── db.js            # MongoDB connection
│   │   ├── redis.js         # Redis client
│   │   ├── cloudinary.js    # Cloudinary config
│   │   └── stripe.js        # Stripe client
│   │
│   ├── middleware/
│   │   └── auth-middleware.js   # protectRoute + adminRoute
│   │
│   ├── models/
│   │   ├── user-model.js
│   │   ├── product-model.js
│   │   ├── order-model.js
│   │   └── coupon-model.js
│   │
│   ├── routes/              # Express routers
│   │   ├── auth-route.js
│   │   ├── product-route.js
│   │   ├── cart-route.js
│   │   ├── coupon-route.js
│   │   ├── payment-route.js
│   │   ├── analytics-route.js
│   │   └── chat-route.js
│   │
│   └── services/            # AI and external integrations
│       ├── embedding-service.js   # NVIDIA embeddings
│       ├── pinecone-service.js    # Vector upsert/query/delete
│       ├── llm-service.js         # Groq streaming + extraction
│       └── intent-service.js      # LLM intent classifier
│
├── frontend/
│   └── src/
│       ├── api/             # Axios instance + base URL config
│       ├── components/      # Navbar, ProductCard, ChatBot
│       ├── pages/           # All page components
│       ├── store/           # Zustand stores (auth, cart, products)
│       ├── theme.js         # MUI theme config
│       ├── App.jsx          # Routes + layout
│       └── main.jsx         # React entry point
│
└── scripts/
    ├── seed-embeddings.py   # Seeds all products into Pinecone
    └── requirements.txt     # Python dependencies
```

---

## How the AI Chatbot Works

Every chat message goes through a 5-step pipeline:

```
User message
     │
     ▼
1. Intent Classification (Groq LLaMA 3.1 8B)
   └── Classifies: product_search / price_filter / greeting / store_info / off_topic
   └── Extracts: corrected query, budget, category
     │
     ▼
2. Embedding Generation (NVIDIA NV-EmbedQA-E5-v5)
   └── Converts the corrected query into a 1024-dim vector
     │
     ▼
3. Vector Search (Pinecone)
   └── Finds the top 8 most semantically similar products
     │
     ▼
4. LLM Response (Groq LLaMA 3.3 70B — streamed via SSE)
   └── Generates a warm, concise recommendation using only real products
     │
     ▼
5. Structured Data Extraction (Groq LLaMA 3.3 70B — JSON mode)
   └── Extracts which products to show, add to cart, or compare
```

Chat sessions are stored in Redis with a 1-hour TTL, enabling multi-turn conversations.

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free)
- Upstash Redis account (free)
- Groq API key (free) — [console.groq.com](https://console.groq.com)
- NVIDIA API key (free) — [build.nvidia.com](https://build.nvidia.com)
- Pinecone account (free) — [pinecone.io](https://pinecone.io)
- Cloudinary account (free)
- Stripe account

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-shopping-assistant.git
cd ai-shopping-assistant
```

### 2. Install dependencies

```bash
# Backend
npm install

# Frontend
npm install --prefix frontend
```

### 3. Create environment files

Create `.env` in the root:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_DB_URI=mongodb+srv://user:password@cluster.mongodb.net/ai-shopping-agent

# Redis
REDIS_URL=redis://default:password@your-endpoint.upstash.io:6379

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# AI Services
GROQ_API_KEY=your_groq_api_key
NVIDIA_API_KEY=your_nvidia_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=luxe-products
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Seed product embeddings into Pinecone

> Do this after you have added products to MongoDB.

```bash
cd scripts
pip install -r requirements.txt
python seed-embeddings.py
```

### 5. Run the app

```bash
# Run backend and frontend together
npm run dev              # backend (port 5000)
npm run dev --prefix frontend   # frontend (port 5173)
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables Reference

### Backend (root `.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Backend server port | No (default 5000) |
| `NODE_ENV` | `development` or `production` | Yes |
| `MONGO_DB_URI` | MongoDB Atlas connection string | Yes |
| `REDIS_URL` | Upstash Redis `redis://` URL | Yes |
| `ACCESS_TOKEN_SECRET` | Secret for signing access tokens | Yes |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_...`) | Yes |
| `BACKEND_URL` | Full URL of deployed backend | Yes |
| `FRONTEND_URL` | Full URL of deployed frontend | Yes |
| `GROQ_API_KEY` | Groq API key for LLM | Yes |
| `NVIDIA_API_KEY` | NVIDIA API key for embeddings | Yes |
| `PINECONE_API_KEY` | Pinecone API key | Yes |
| `PINECONE_INDEX` | Pinecone index name | Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_BACKEND_URL` | Backend URL for production | No (uses proxy in dev) |

---

## Deployment (Free Forever)

| Service | Provider | Free Tier |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Free forever |
| Backend | [Render](https://render.com) | 750 hrs/month |
| MongoDB | [MongoDB Atlas](https://mongodb.com/cloud/atlas) | 512MB free forever |
| Redis | [Upstash](https://upstash.com) | 10k commands/day free |
| Keep-alive | [UptimeRobot](https://uptimerobot.com) | Pings every 5 min, free |

**Backend settings on Render:**
- Build Command: `npm install`
- Start Command: `node backend/server.js`
- Root Directory: *(leave empty)*

**Frontend settings on Vercel:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_BACKEND_URL=https://your-backend.onrender.com`

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Register a new user | Public |
| POST | `/login` | Log in | Public |
| POST | `/logout` | Log out | Public |
| POST | `/refresh-token` | Refresh access token | Public |
| GET | `/profile` | Get current user | Protected |

### Products — `/api/products`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/all` | Get all products (public) | Public |
| GET | `/featured` | Get featured products | Public |
| GET | `/category/:category` | Get by category | Public |
| GET | `/recommendations` | Get 4 random products | Public |
| GET | `/:id` | Get single product | Public |
| GET | `/` | Get all products | Admin |
| POST | `/` | Create product | Admin |
| PUT | `/:id` | Update product | Admin |
| PATCH | `/:id` | Toggle featured | Admin |
| DELETE | `/:id` | Delete product | Admin |

### Cart — `/api/cart`
| Method | Route | Auth |
|---|---|---|
| GET | `/` | Get cart items | Protected |
| POST | `/` | Add to cart | Protected |
| DELETE | `/` | Remove from cart | Protected |
| PUT | `/:id` | Update quantity | Protected |

### Other Endpoints
| Route | Description |
|---|---|
| `POST /api/coupons/validate` | Validate a coupon code |
| `POST /api/payments/create-checkout-session` | Create Stripe checkout |
| `POST /api/payments/checkout-success` | Confirm payment and save order |
| `GET /api/analytics` | Get sales analytics (Admin only) |
| `POST /api/chat` | Send a message to the AI chatbot (SSE stream) |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Stage only the files you changed: `git add specific-file.js`
4. Commit with a clear message: `git commit -m "feat: describe your change"`
5. Push: `git push origin feat/your-feature-name`
6. Open a Pull Request

Please make sure your code runs locally before submitting a PR.

---

## License

This project is licensed under the [MIT License](./LICENSE).
