# Postman collection

Every route of the Luxe API, with example bodies, docs and test scripts. Both backends expose the same routes: Express (`backend/server.js`) and the Cloudflare Worker (`backend/src/index.js`).

| File | Purpose |
| --- | --- |
| `luxe-api.postman_collection.json` | 34 requests in 9 folders |
| `luxe-production.postman_environment.json` | `baseUrl` = `https://luxe-api.ujjwalkrai.workers.dev` |
| `luxe-local-express.postman_environment.json` | `baseUrl` = `http://localhost:5000` (`npm run dev`) |
| `luxe-local-worker.postman_environment.json` | `baseUrl` = `http://localhost:8787` (`cd backend && npm run dev`) |

## Import

Postman → **Import** → drag all four `.json` files in → choose an environment in the top-right dropdown.

## Auth

Auth is cookie based. **Signup** and **Login** set httpOnly `accessToken` (15 min) and `refreshToken` (7 days) cookies, and Postman's cookie jar sends them on later requests. You don't need an Authorization header. If you get `401 Access token expired`, run **Auth → Refresh Token**.

## Routes

| Folder | Method | Route | Auth |
| --- | --- | --- | --- |
| 00 Health | GET | `/` | - |
| 01 Auth | POST | `/api/auth/signup` | - |
| | POST | `/api/auth/login` | - |
| | GET | `/api/auth/profile` | user |
| | POST | `/api/auth/refresh-token` | refresh cookie |
| 02 Products | GET | `/api/products/all` | - |
| | GET | `/api/products/featured` | - |
| | GET | `/api/products/category/:category` | - |
| | GET | `/api/products/recommendations` | - |
| | GET | `/api/products/:id` | - |
| 03 Cart | POST | `/api/cart` | user |
| | GET | `/api/cart` | user |
| | PUT | `/api/cart/:productId` | user |
| | DELETE | `/api/cart` (body `{productId}` = one item, `{}` = clear) | user |
| 04 Payments | POST | `/api/payments/create-checkout-session` | user |
| | POST | `/api/payments/checkout-success` | user |
| 05 Coupons | GET | `/api/coupons` | user |
| | POST | `/api/coupons/validate` | user |
| 06 Chat | POST | `/api/chat` (SSE stream) | - |
| 07 Admin | GET | `/api/products` | admin |
| | POST | `/api/products` | admin |
| | PUT | `/api/products/:id` | admin |
| | PATCH | `/api/products/:id` (toggle featured) | admin |
| | DELETE | `/api/products/:id` | admin |
| | GET | `/api/analytics` | admin |
| 08 Logout | POST | `/api/auth/logout` | - |

Each request's **Docs** tab lists its body fields and possible responses.

## Running the whole flow

Run the collection **in order**. Scripts pass data forward: Signup generates a unique `testEmail`, **Get All Products** sets `productId`/`category`, and **Create Checkout Session** sets `stripeSessionId`.

- **Admin folder:** set `adminEmail` / `adminPassword` in the environment (the user needs `role: "admin"` in MongoDB). Without them the folder is skipped. Create → Update → Toggle → Delete clean up the test product.
- **Payments:** open `{{checkoutUrl}}` (also printed in the console) and pay with Stripe test card `4242 4242 4242 4242`. Then run **Checkout Success** to get `200` with an `orderId`. Unpaid, it returns `400 Payment not completed`.
- **Local Worker:** `wrangler.toml` sets `NODE_ENV=production`, so cookies are `Secure`. If Postman doesn't resend them over `http://localhost`, use the Express environment or production.

CLI run (same tests):

```sh
npx newman run postman/luxe-api.postman_collection.json -e postman/luxe-production.postman_environment.json
```
