# 🛒 E-Commerce REST API — Node.js / Express

A production-ready e-commerce REST API built with **Express.js**, **Mongoose**, and **JWT** authentication, converted from the ASP.NET Core reference implementation. Supports multi-role access (Admin, Seller, Customer), Stripe payments, email notifications, and full Swagger documentation.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features & Modules](#features--modules)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Seed Data](#seed-data)
- [Architecture](#architecture)
- [Middleware](#middleware)
- [Testing](#testing)
- [.NET → Node.js Migration Reference](#net--nodejs-migration-reference)

---

## Tech Stack

| Concern | .NET Equivalent | Node.js Package |
|---|---|---|
| Framework | ASP.NET Core 8 | `express` |
| Language | C# | JavaScript (ESM) |
| ODM / ORM | Entity Framework Core | `mongoose` |
| Database | SQL Server | MongoDB |
| Authentication | ASP.NET Identity + JWT Bearer | `jsonwebtoken` + `bcryptjs` |
| Validation | DataAnnotations / FluentValidation | `joi` |
| Payments | Stripe.net | `stripe` |
| Email | MailKit | `nodemailer` |
| API Docs | Swashbuckle / Swagger | `swagger-jsdoc` + `swagger-ui-express` |
| Rate Limiting | Custom IMemoryCache middleware | `express-rate-limit` |
| Caching | IMemoryCache | `node-cache` |
| Logging | Microsoft.Extensions.Logging | `pino` + `pino-http` |
| Config | appsettings.json + IOptions | `dotenv` |
| Testing | MSTest / xUnit | `jest` + `supertest` |

---

## Project Structure

```
ecommerce-api/
├── src/
│   ├── config/
│   │   ├── db.js                  # Mongoose connection
│   │   ├── env.js                 # Validated env variables
│   │   └── swagger.js             # OpenAPI spec config
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── review.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── category.controller.js
│   │   ├── notification.controller.js
│   │   └── admin.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verify + role guard
│   │   ├── error.middleware.js     # Global error handler
│   │   ├── rateLimiter.middleware.js
│   │   └── validate.middleware.js  # Joi schema runner
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── category.model.js
│   │   ├── cart.model.js
│   │   ├── order.model.js
│   │   ├── review.model.js
│   │   ├── wishlist.model.js
│   │   ├── promotion.model.js
│   │   └── notification.model.js
│   ├── routes/
│   │   ├── index.js               # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── review.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── category.routes.js
│   │   ├── notification.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── cart.service.js
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   ├── inventory.service.js
│   │   ├── notification.service.js
│   │   ├── promotion.service.js
│   │   ├── shipping.service.js
│   │   └── email.service.js
│   ├── validations/
│   │   ├── auth.validation.js
│   │   ├── product.validation.js
│   │   ├── cart.validation.js
│   │   ├── order.validation.js
│   │   └── review.validation.js
│   ├── utils/
│   │   ├── response.js            # ApiResponse / ApiError helpers
│   │   ├── cache.js               # node-cache singleton
│   │   ├── logger.js              # Pino instance
│   │   └── seed.js                # Database seeder
│   └── app.js                     # Express app bootstrap
├── tests/
│   ├── auth.test.js
│   ├── product.test.js
│   └── order.test.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## Features & Modules

### 🔐 Authentication
- Register as Customer or Seller
- Email + password login, JWT access token issued on success
- Refresh token rotation
- Logout (refresh token invalidation)
- Change password for authenticated users
- Passwords hashed with `bcryptjs` (salt rounds: 12)

### 📦 Products
- Paginated search with filters: keyword, category, price range, min rating, tags
- Sort by name / price / rating / createdAt (asc or desc)
- Get product by ID, featured products (rating ≥ 4.0), related by category
- Create, update, soft-delete (Admin / Seller only)
- Response caching via `node-cache` (5 min TTL)

### 🛒 Cart
- Per-user cart stored in MongoDB
- Add item (validates stock), update quantity, remove item, clear cart
- Computed line totals and cart grand total

### 📬 Orders
- Checkout from cart — creates order, reserves inventory, applies promo code, calculates 18% tax and conditional shipping
- Stripe payment intent created on checkout
- Payment confirmation, order cancellation (Pending only) with stock release
- Order status progression (Admin / Seller)
- Per-user order history and admin-scoped order detail

### 💳 Payments
- Create Stripe payment intent tied to an order
- Confirm payment → order transitions to `confirmed`
- Refund processing → order transitions to `refunded`
- Stripe webhook handler for async payment events

### ⭐ Reviews
- List approved reviews per product (paginated)
- Submit review (Customer only, one per product enforced)
- Approve review (Admin only)
- Delete review (owner or Admin)

### ❤️ Wishlist
- View saved items with current pricing
- Add to wishlist (duplicate guard)
- Remove from wishlist

### 🔔 Notifications
- Fetch latest 50 notifications per user
- Mark single or all notifications as read
- Auto-created on: order confirmed, order status updates, low-stock alerts, welcome on register

### 🗂 Categories
- Hierarchical parent → subcategory tree
- List all top-level categories with nested subcategories
- CRUD (Admin only)

### 🛡 Admin
- **Dashboard** — total users, orders, revenue, pending orders, low-stock count
- **User management** — paginated list, activate / deactivate accounts
- **Order management** — all orders paginated, with user info and item counts
- **Promotions** — create discount codes (percentage, fixed amount, free shipping)
- **Sales analytics** — daily sales aggregation and top-10 products by revenue, optional date-range filter

### 📦 Inventory
- Stock reservation on order creation
- Stock release on cancellation
- Low-stock threshold alerts (default ≤ 10 units) sent as admin notifications

### 🚚 Shipping
- Weight-based shipping cost calculation
- Shipment creation with auto-generated tracking numbers
- Tracking info lookup hook (ready for courier API integration)

---

## Authentication & Authorization

All protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Three roles are enforced via the `authorise(...roles)` middleware:

| Role | Description |
|---|---|
| `admin` | Full platform access |
| `seller` | Product and order management |
| `customer` | Shopping, reviews, wishlist |

Route-level examples:

```js
router.post('/',        authenticate, authorise('admin', 'seller'), createProduct);
router.post('/review',  authenticate, authorise('customer'),        createReview);
router.get('/dashboard',authenticate, authorise('admin'),           getDashboard);
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register as customer |
| POST | `/register/seller` | Public | Register as seller |
| POST | `/login` | Public | Login, receive access + refresh tokens |
| POST | `/logout` | Required | Invalidate refresh token |
| POST | `/refresh-token` | Public | Rotate refresh token |
| POST | `/change-password` | Required | Change password |

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Search / filter products |
| GET | `/:id` | Public | Get product by ID |
| GET | `/featured` | Public | Featured products |
| GET | `/:id/related` | Public | Related by category |
| POST | `/` | Admin / Seller | Create product |
| PUT | `/:id` | Admin / Seller | Update product |
| DELETE | `/:id` | Admin / Seller | Soft-delete product |

### Cart — `/api/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | Get cart items |
| GET | `/total` | Required | Get cart total |
| POST | `/items` | Required | Add item |
| PUT | `/items/:cartItemId` | Required | Update quantity |
| DELETE | `/items/:cartItemId` | Required | Remove item |
| DELETE | `/` | Required | Clear cart |

### Orders — `/api/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | User's order history |
| GET | `/:id` | Required | Order detail |
| POST | `/checkout` | Required | Place order + create payment intent |
| POST | `/:id/payment` | Required | Confirm payment |
| POST | `/:id/cancel` | Required | Cancel order |
| PUT | `/:id/status` | Admin / Seller | Update order status |
| GET | `/admin/:id` | Admin | Admin order detail |

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/product/:productId` | Public | Get product reviews |
| POST | `/` | Customer | Submit review |
| PUT | `/:id/approve` | Admin | Approve review |
| DELETE | `/:id` | Required | Delete review |

### Wishlist — `/api/wishlist`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | Get wishlist |
| POST | `/items/:productId` | Required | Add to wishlist |
| DELETE | `/items/:productId` | Required | Remove from wishlist |

### Categories — `/api/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | All categories + subcategories |
| GET | `/:id` | Public | Category by ID |
| GET | `/:id/subcategories` | Public | Subcategories |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | Get notifications (latest 50) |
| PUT | `/:id/read` | Required | Mark as read |
| PUT | `/mark-all-read` | Required | Mark all as read |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Metrics overview |
| GET | `/users` | Admin | Paginated users |
| PUT | `/users/:userId/status` | Admin | Toggle user active |
| GET | `/orders` | Admin | All orders paginated |
| POST | `/promotions` | Admin | Create promotion |
| GET | `/analytics/sales` | Admin | Sales analytics |

---

## Data Models

### Mongoose Schemas

```
User           email, passwordHash, firstName, lastName, role, dob, address, isActive, refreshToken
Product        name, slug, sku, description, price, salePrice, stockQty, categoryId, images, tags,
               averageRating, reviewCount, isActive, createdAt, updatedAt
Category       name, description, parentId (self-ref), slug
Cart           userId, items[{ productId, quantity }]
Order          userId, orderNumber, status, subTotal, taxAmount, shippingCost, discountAmount,
               totalAmount, shippingAddress, billingAddress, paymentMethod, paymentIntentId,
               paymentStatus, trackingNumber, courierService, items[{ productId, qty, unitPrice }]
Review         productId, userId, rating, comment, isApproved
WishlistItem   userId, productId
Promotion      name, code, type, value, minOrderAmount, usageLimit, usageCount, startDate, endDate, isActive
Notification   userId, title, message, type, isRead
```

### Enums

```js
// Order status
'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded'

// Payment status
'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'

// Promotion type
'percentage' | 'fixed_amount' | 'free_shipping'

// Notification type
'order' | 'payment' | 'shipping' | 'promotion' | 'system'

// User role
'admin' | 'seller' | 'customer'
```

---

## Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```ini
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_jwt_secret_must_be_at_least_32_characters_long
JWT_EXPIRES_IN=60m
JWT_REFRESH_SECRET=your_refresh_secret_must_be_at_least_32_characters
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM_NAME=E-commerce Platform
EMAIL_FROM_ADDRESS=noreply@ecommerce.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Cache TTL in seconds
CACHE_TTL=300

# CORS
CORS_ORIGIN=http://localhost:3000
```

> ⚠️ Never commit `.env` to version control. Use a secrets manager in production.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20.0.0
- MongoDB 6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Install & run

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd ecommerce-api

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your values

# 4. Seed the database
npm run seed

# 5. Start development server (with --watch auto-reload)
npm run dev
```

The API runs at `http://localhost:5000`.
Swagger UI is available at `http://localhost:5000/api-docs`.

### Production

```bash
NODE_ENV=production npm start
```

---

## Seed Data

Running `npm run seed` populates the database with:

**Users**

| Email | Password | Role |
|---|---|---|
| admin@ecommerce.com | Password@123 | admin |
| seller@ecommerce.com | Password@123 | seller |
| customer@ecommerce.com | Password@123 | customer |

**Products** — 12 products across 4 categories (Electronics, Clothing, Books, Home & Garden)

**Categories** — Electronics, Clothing, Books, Home & Garden (with subcategory support)

**Promotions**

| Code | Type | Value | Min Order |
|---|---|---|---|
| WELCOME10 | Percentage | 10% | $50 |
| FLAT20 | Fixed Amount | $20 | $200 |
| FREESHIP | Free Shipping | — | — |

**Sample orders** — 2 seeded orders (Delivered, Shipped) with items, reviews, and wishlist entries for the customer account.

---

## Architecture

```
HTTP Request
  └─► pino-http (request logging)
        └─► express-rate-limit (100 req / min per IP)
              └─► cors
                    └─► authenticate middleware (JWT verify)
                          └─► authorise middleware (role check)
                                └─► validate middleware (Joi schema)
                                      └─► Controller (thin — extracts params, calls service)
                                            └─► Service (business logic — tax, stock, promos)
                                                  └─► Mongoose Model (MongoDB query)
                                                        └─► node-cache (read-through for products)
  Error bubbles up → error.middleware → structured JSON response
```

**Key design decisions:**

- **ESM throughout** — `"type": "module"` in `package.json`; all files use `import`/`export`. No CommonJS `require`.
- **Thin controllers** — controllers only extract `req` params and call the appropriate service. No business logic lives in a controller.
- **Service layer** — all business rules (tax calculation, stock reservation, promo application, order number generation) live exclusively in services.
- **Joi validation middleware** — a single `validate(schema)` factory wraps any route. Errors are caught before the controller is ever called.
- **`response.js` helper** — `apiResponse()` and `apiError()` produce the same consistent envelope as the .NET `CustomResponse<T>`, so frontend contracts are unchanged.
- **`node-cache` singleton** — imported as a shared module instance so all services share one cache. Products and categories are cached with a 5-minute TTL.
- **Pino structured logging** — JSON logs in production, pretty-printed in development via `pino-pretty`. `pino-http` logs every request with status, method, path and response time.

---

## Middleware

| Middleware | File | Responsibility |
|---|---|---|
| Request logger | `pino-http` (via `app.js`) | Logs method, path, status, response time on every request |
| Rate limiter | `rateLimiter.middleware.js` | 100 requests/min per IP; returns 429 with standard error envelope |
| Authenticate | `auth.middleware.js` | Verifies JWT, attaches `req.user` (`{ id, email, role }`) |
| Authorise | `auth.middleware.js` | Role whitelist check; returns 403 if role not permitted |
| Validate | `validate.middleware.js` | Runs Joi schema against `req.body` / `req.query` / `req.params`; returns 400 on failure |
| Error handler | `error.middleware.js` | Catches all thrown errors; maps to HTTP status and `apiError()` envelope |

### Response envelope

Every endpoint returns the same JSON shape:

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": { ... },
  "errors": [],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": ["\"email\" is required", "\"password\" must be at least 8 characters"],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Testing

Tests use **Jest** and **Supertest** for HTTP integration testing.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Test files live in `tests/` and mirror the module they cover:

```
tests/
├── auth.test.js        # register, login, JWT validation
├── product.test.js     # CRUD, search filters, auth guards
└── order.test.js       # checkout flow, payment, cancellation
```

Each test file spins up the Express app in-process, connects to a test MongoDB instance (set `MONGODB_URI` to a test DB in your `.env`), seeds minimal data, runs assertions, and tears down after.

---

## .NET → Node.js Migration Reference

Quick lookup for .NET concepts and their Node.js equivalents in this project:

| .NET Concept | Node.js Equivalent |
|---|---|
| `Program.cs` / `WebApplication.CreateBuilder` | `src/app.js` — `express()` setup |
| `appsettings.json` + `IOptions<T>` | `src/config/env.js` — validated `process.env` |
| `DbContext` + `OnModelCreating` | `src/config/db.js` + Mongoose schemas in `src/models/` |
| `IdentityUser` | `User` model with `bcryptjs` password hashing |
| `[Authorize]` attribute | `authenticate` middleware |
| `[Authorize(Policy = "AdminOnly")]` | `authorise('admin')` middleware |
| `DataAnnotations` / `[Required]` | Joi schema in `src/validations/` |
| `IServiceCollection.AddScoped<>` | ES module imports (Node modules are singletons by default) |
| `BaseApiController` helpers | `src/utils/response.js` — `apiResponse()` / `apiError()` |
| `CustomResponse<T>` | Same shape, returned by `apiResponse()` / `apiError()` |
| `ErrorHandlingMiddleware` | `src/middlewares/error.middleware.js` |
| `RateLimitingMiddleware` | `express-rate-limit` in `src/middlewares/rateLimiter.middleware.js` |
| `IMemoryCache` | `node-cache` singleton in `src/utils/cache.js` |
| `ILogger<T>` | `pino` logger in `src/utils/logger.js` |
| `SeedData.Initialize` | `src/utils/seed.js` — run via `npm run seed` |
| Migration commands (`dotnet ef`) | No migrations needed — Mongoose infers schema from models |
| `OrderStatus` enum | String enum values validated in Mongoose schema |

---

## License

MIT
