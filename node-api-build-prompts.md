# 🚀 Node.js E-Commerce API — Phased Build Prompts

Each phase builds on the previous. Test the checklist at the end of each phase before running the next prompt.

---

## Phase 1 — Project foundation

> **Builds:** `package.json`, `.env.example`, `.gitignore`, `src/app.js`, `src/config/env.js`, `src/config/db.js`, `src/utils/logger.js`, `src/utils/response.js`, `src/utils/cache.js`

---

### Prompt

```
Create the foundation for a Node.js Express e-commerce API with the following stack:
- Express.js (framework)
- JavaScript ESM ("type": "module" in package.json, all files use import/export — no require())
- Mongoose (ODM)
- Pino + pino-http + pino-pretty (logging)
- node-cache (in-process caching)
- dotenv (config)

Generate the following files with complete, working code:

1. package.json
   - name: "ecommerce-api", type: "module", node >=20
   - scripts: start, dev (node --watch), seed, test
   - dependencies: express, mongoose, dotenv, pino, pino-http, pino-pretty,
     node-cache, cors, bcryptjs, jsonwebtoken, joi, stripe, nodemailer,
     swagger-jsdoc, swagger-ui-express, express-rate-limit
   - devDependencies: jest, supertest

2. .env.example — include variables for:
   PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN,
   JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN,
   STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS,
   RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, CACHE_TTL, CORS_ORIGIN

3. .gitignore — node_modules, .env, coverage, *.log

4. src/config/env.js
   - Import dotenv/config
   - Export a validated `env` object — throw an Error for any missing required variable
   - Required: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
   - Optional with defaults: PORT=5000, NODE_ENV=development, JWT_EXPIRES_IN=60m, etc.

5. src/config/db.js
   - Connect to MongoDB using env.mongoUri
   - Log success with pino logger
   - On error: log and process.exit(1)
   - Attach disconnected / reconnected event listeners

6. src/utils/logger.js
   - Export a pino instance
   - In development: use pino-pretty transport (colorize: true)
   - In production: plain JSON output
   - Include timestamp

7. src/utils/response.js
   - Export apiResponse(res, data, message, statusCode=200)
   - Export apiError(res, message, statusCode=400, errors=[])
   - Both return this exact JSON shape:
     { success: bool, message: string, data: any, errors: [], timestamp: ISO string }

8. src/utils/cache.js
   - Export a shared node-cache singleton with TTL from env.cacheTtl (default 300s)
   - Export helper functions: getCache(key), setCache(key, value, ttl?), deleteCache(key)

9. src/app.js
   - Import and call connectDB()
   - Apply middleware in this order:
     pino-http logger → cors → express.json() → express.urlencoded()
   - Mount a GET /health route that returns { status: "ok", uptime, environment }
   - Mount swagger-ui at /api-docs (import spec from src/config/swagger.js — create a stub for now)
   - Mount all API routes under /api (import from src/routes/index.js — create a stub for now)
   - Apply global error handler as the last middleware
   - Start listening on env.port
   - Export app for testing

After generating all files, show me:
- The exact terminal commands to install dependencies and start the dev server
- The expected output when the server starts successfully
- How to verify the /health endpoint works
```

### ✅ Phase 1 test checklist

```bash
npm install
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm run dev
```

- [ ] Server starts without errors
- [ ] Pino logs show in pretty format (development)
- [ ] `GET http://localhost:5000/health` returns `{ status: "ok" }`
- [ ] `GET http://localhost:5000/api-docs` loads Swagger UI
- [ ] MongoDB connected log appears in terminal

---

---

## Phase 2 — Mongoose models

> **Builds:** all 9 models in `src/models/`

---

### Prompt

```
Using the existing project structure (ESM, Mongoose, pino logger from Phase 1),
generate all Mongoose models for the e-commerce API.

Create src/models/ with these files. Each model must:
- Use named exports (export const ModelName = mongoose.model(...))
- Include JSDoc @swagger schema comments for swagger-jsdoc to pick up
- Use timestamps: true on all schemas

1. src/models/user.model.js
   Fields: email (unique, required, lowercase), passwordHash (required, select:false),
   firstName, lastName, role (enum: admin/seller/customer, default: customer),
   dateOfBirth (Date), address (String), isActive (default: true),
   refreshToken (String, select:false)
   Instance method: comparePassword(candidate) using bcryptjs
   Pre-save hook: hash passwordHash if modified

2. src/models/category.model.js
   Fields: name (required, trim), slug (unique), description,
   parentId (ref: Category, default null)
   Pre-save hook: auto-generate slug from name using toLowerCase + replace spaces

3. src/models/product.model.js
   Fields: name (required), slug (unique), sku (unique, required), description,
   price (required, min:0), salePrice (min:0), stockQty (default:0, min:0),
   categoryId (ref: Category, required), images ([String]), tags ([String]),
   averageRating (default:0, min:0, max:5), reviewCount (default:0),
   isActive (default:true)
   Pre-save hook: auto-generate slug from name

4. src/models/cart.model.js
   Fields: userId (ref: User, unique, required),
   items: [{ productId (ref: Product), quantity (min:1), _id:false }]

5. src/models/order.model.js
   Fields: userId (ref: User, required), orderNumber (unique),
   status (enum: pending/confirmed/processing/shipped/delivered/cancelled/returned/refunded, default: pending),
   subTotal, taxAmount, shippingCost, discountAmount, totalAmount (all Number, required),
   shippingAddress (String), billingAddress (String),
   paymentMethod (String), paymentIntentId (String), paymentStatus (enum: pending/completed/failed/cancelled/refunded, default: pending),
   trackingNumber (String), courierService (String),
   items: [{ productId (ref: Product), name, quantity, unitPrice, totalPrice, _id:false }]

6. src/models/review.model.js
   Fields: productId (ref: Product, required), userId (ref: User, required),
   rating (Number, min:1, max:5, required), comment (String),
   isApproved (default: false)
   Compound unique index on { productId, userId }

7. src/models/wishlist.model.js
   Fields: userId (ref: User, required, unique),
   productIds: [{ type: ObjectId, ref: Product }]

8. src/models/promotion.model.js
   Fields: name, code (unique, uppercase), type (enum: percentage/fixed_amount/free_shipping),
   value (Number), minOrderAmount (Number, default:0),
   usageLimit (Number, default: null), usageCount (Number, default:0),
   startDate (Date), endDate (Date), isActive (default:true)

9. src/models/notification.model.js
   Fields: userId (ref: User, required), title (required), message (required),
   type (enum: order/payment/shipping/promotion/system),
   isRead (default: false)

After generating all models, show me a quick test: a standalone script
(test-models.js in the project root, not committed) that imports and
saves one User document then deletes it, to confirm schemas work.
```

### ✅ Phase 2 test checklist

```bash
node test-models.js     # run the quick model smoke-test script
```

- [ ] Script runs without errors
- [ ] User document is created and deleted cleanly
- [ ] No Mongoose validation errors
- [ ] Slug auto-generation works (log the product slug)
- [ ] `passwordHash` is hashed (not plain text) in the saved document
- [ ] Delete `test-models.js` before proceeding

---

---

## Phase 3 — Authentication

> **Builds:** `src/validations/auth.validation.js`, `src/services/auth.service.js`, `src/controllers/auth.controller.js`, `src/middlewares/auth.middleware.js`, `src/middlewares/validate.middleware.js`, `src/routes/auth.routes.js`, `src/routes/index.js` (stub)

---

### Prompt

```
Using the project from Phases 1–2 (ESM, Express, Mongoose User model, pino logger,
apiResponse/apiError helpers), build the complete authentication module.

1. src/middlewares/validate.middleware.js
   - Export validate(schema, target='body') — a middleware factory
   - target can be 'body', 'query', or 'params'
   - Run req[target] through Joi schema with abortEarly:false, stripUnknown:true
   - On error: call apiError(res, 'Validation failed', 400, error.details.map(d => d.message))
   - On success: replace req[target] with the validated value and call next()

2. src/validations/auth.validation.js — Joi schemas:
   - registerSchema: email, password (min 8, has uppercase + number + special char),
     firstName, lastName, phoneNumber, dateOfBirth
   - loginSchema: email, password (required)
   - changePasswordSchema: currentPassword, newPassword (same rules as password)
   - refreshTokenSchema: refreshToken (string, required)

3. src/services/auth.service.js — export these functions:
   - register(dto, role='customer')
     * Check email not already taken (throw 409 if taken)
     * Create User (passwordHash will be hashed by pre-save hook)
     * Generate access + refresh tokens
     * Save refreshToken on user document
     * Return { user: safeUser, tokens }
   - login(dto)
     * Find user by email (select +passwordHash +refreshToken)
     * Verify password with comparePassword()
     * Check isActive — throw 403 if inactive
     * Generate and save new tokens
     * Return { user: safeUser, tokens }
   - logout(userId)
     * Clear refreshToken field on User document
   - refreshToken(token)
     * Verify with JWT_REFRESH_SECRET
     * Find user, confirm stored refreshToken matches
     * Generate new access token (do NOT rotate refresh token)
     * Return { accessToken }
   - changePassword(userId, currentPassword, newPassword)
     * Load user with +passwordHash
     * Verify currentPassword
     * Assign newPassword to passwordHash (triggers pre-save hash)
     * Save and return true
   - Private: generateTokens(user) — signs accessToken (JWT_SECRET, JWT_EXPIRES_IN)
     and refreshToken (JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN)
     Payload: { id, email, role }
   - Private: safeUser(user) — strips passwordHash and refreshToken from response

4. src/middlewares/auth.middleware.js
   - export authenticate — verify Bearer token from Authorization header
     * On success: attach req.user = { id, email, role } and call next()
     * On failure: apiError(res, 'Unauthorised', 401)
   - export authorise(...roles) — middleware factory
     * Check req.user.role is in roles
     * On failure: apiError(res, 'Forbidden', 403)

5. src/controllers/auth.controller.js
   - Thin controller — extract req.body/req.user, call service, return apiResponse
   - Handlers: register, registerSeller, login, logout, refreshToken, changePassword

6. src/routes/auth.routes.js
   - POST /register           → validate(registerSchema) → register
   - POST /register/seller    → validate(registerSchema) → registerSeller
   - POST /login              → validate(loginSchema) → login
   - POST /logout             → authenticate → logout
   - POST /refresh-token      → validate(refreshTokenSchema) → refreshToken
   - POST /change-password    → authenticate → validate(changePasswordSchema) → changePassword

7. src/routes/index.js
   - Mount auth.routes at /auth
   - Add stubs for all other route files (products, cart, orders, reviews,
     wishlist, categories, notifications, admin) — just router.use('/products', ...)
     with a placeholder 200 response so the app boots cleanly

After generating all files:
- Show the curl commands to test register, login, and the authenticate middleware
- Show what the JWT payload looks like when decoded
- Show how to test a 401 and a 403 response
```

### ✅ Phase 3 test checklist

```bash
npm run dev
```

- [ ] `POST /api/auth/register` creates a user, returns tokens
- [ ] Duplicate email returns 409
- [ ] Weak password returns 400 with Joi error messages
- [ ] `POST /api/auth/login` returns `accessToken` and `refreshToken`
- [ ] Wrong password returns 401
- [ ] `POST /api/auth/logout` with Bearer token clears refreshToken
- [ ] `POST /api/auth/refresh-token` with valid refresh returns new `accessToken`
- [ ] A protected route without token returns 401
- [ ] A customer hitting an admin route returns 403

---

---

## Phase 4 — Products & Categories

> **Builds:** validations, services, controllers, and routes for products and categories, plus caching integration

---

### Prompt

```
Using the project from Phases 1–3 (ESM, Express, auth middleware, validate middleware,
Mongoose Product + Category models, node-cache helpers, apiResponse/apiError),
build the Products and Categories modules.

1. src/validations/product.validation.js — Joi schemas:
   - createProductSchema: name, sku, description, price (number, min:0),
     salePrice (number, min:0, optional), stockQty (integer, min:0),
     categoryId (valid ObjectId string), images ([string url]), tags ([string])
   - updateProductSchema: same as create but all fields optional
   - productSearchSchema (for req.query):
     search (string), categoryId, minPrice, maxPrice, minRating,
     tags (comma-separated string → array), sortBy (name/price/rating/createdAt, default: name),
     sortOrder (asc/desc, default: asc), page (integer min:1, default:1),
     pageSize (integer min:1 max:100, default:10)

2. src/validations/category.validation.js — Joi schemas:
   - createCategorySchema: name (required), description, parentId (ObjectId string, optional)
   - updateCategorySchema: same but all optional

3. src/services/product.service.js — export:
   - searchProducts(query)
     * Build Mongoose filter from search, categoryId, minPrice, maxPrice, minRating, tags, isActive:true
     * Apply sort and paginate with skip/limit
     * Check cache first (key: 'products:' + JSON.stringify(query))
     * Cache result for CACHE_TTL seconds
     * Return { items, totalCount, page, pageSize, totalPages }
   - getProductById(id)
     * Check cache first (key: 'product:' + id)
     * Populate category name
     * Cache result
   - createProduct(dto)
     * Verify categoryId exists — throw 404 if not
     * Create and save product
     * Invalidate all product list cache keys (use cache.keys() and filter)
     * Return created product
   - updateProduct(id, dto)
     * Find product, throw 404 if not found
     * Apply updates, save
     * Invalidate 'product:{id}' and list cache
     * Return updated product
   - deleteProduct(id)
     * Soft-delete: set isActive=false
     * Invalidate cache
   - getFeaturedProducts()
     * Find isActive:true, averageRating >= 4, sort by averageRating desc, limit 10
     * Cache with key 'products:featured'
   - getRelatedProducts(productId)
     * Find product, get categoryId
     * Find other active products in same category, limit 5
   - recalculateRating(productId) — internal helper called after review changes
     * Aggregate average rating and count from approved reviews
     * Update product document

4. src/services/category.service.js — export:
   - getAll() — find parentId:null, populate subcategories (nested populate), cache result
   - getById(id) — find by id, throw 404 if missing
   - getSubcategories(parentId) — find by parentId
   - create(dto) — create Category, invalidate category cache
   - update(id, dto) — find, update, save, invalidate cache
   - remove(id) — check no products use this category (throw 400 if any), then delete

5. src/controllers/product.controller.js — thin handlers:
   searchProducts, getProduct, createProduct, updateProduct, deleteProduct,
   getFeaturedProducts, getRelatedProducts

6. src/controllers/category.controller.js — thin handlers:
   getCategories, getCategory, getSubcategories, createCategory,
   updateCategory, deleteCategory

7. src/routes/product.routes.js
   GET    /                → validate(productSearchSchema, 'query') → searchProducts
   GET    /featured        → getFeaturedProducts
   GET    /:id             → getProduct
   GET    /:id/related     → getRelatedProducts
   POST   /                → authenticate → authorise('admin','seller') → validate(createProductSchema) → createProduct
   PUT    /:id             → authenticate → authorise('admin','seller') → validate(updateProductSchema) → updateProduct
   DELETE /:id             → authenticate → authorise('admin','seller') → deleteProduct

8. src/routes/category.routes.js
   GET    /                → getCategories
   GET    /:id             → getCategory
   GET    /:id/subcategories → getSubcategories
   POST   /                → authenticate → authorise('admin') → validate(createCategorySchema) → createCategory
   PUT    /:id             → authenticate → authorise('admin') → validate(updateCategorySchema) → updateCategory
   DELETE /:id             → authenticate → authorise('admin') → deleteCategory

9. Update src/routes/index.js — wire up the real product and category routers
   (replace the stubs from Phase 3)

After generating all files, show me:
- curl to create a category (admin token required)
- curl to create a product in that category
- curl to search products with filters (?minPrice=10&sortBy=price&sortOrder=desc)
- How to confirm cache is being hit (add a log line temporarily)
```

### ✅ Phase 4 test checklist

- [ ] `GET /api/products` returns paginated list
- [ ] Search by `?search=phone` filters results correctly
- [ ] `?minPrice=100&maxPrice=500` price range works
- [ ] `?sortBy=price&sortOrder=desc` sorts correctly
- [ ] `POST /api/products` without token returns 401
- [ ] `POST /api/products` with customer token returns 403
- [ ] `POST /api/products` with seller/admin token creates product
- [ ] `GET /api/products/featured` returns products with rating ≥ 4
- [ ] `DELETE /api/products/:id` soft-deletes (product still in DB, isActive=false)
- [ ] Category CRUD works end-to-end
- [ ] `DELETE /api/categories/:id` with products attached returns 400

---

---

## Phase 5 — Cart & Wishlist

> **Builds:** cart and wishlist modules with stock validation

---

### Prompt

```
Using the project from Phases 1–4 (ESM, Express, auth middleware, Mongoose Cart +
Wishlist + Product models, apiResponse/apiError), build the Cart and Wishlist modules.

1. src/validations/cart.validation.js — Joi schemas:
   - addToCartSchema: productId (ObjectId string, required), quantity (integer min:1, required)
   - updateCartItemSchema: quantity (integer min:1, required)

2. src/services/cart.service.js — export:
   - getCart(userId)
     * Find cart by userId, populate items.productId (name, price, salePrice, imageUrl, stockQty)
     * Return { items: enriched array with computed lineTotal, cartTotal }
     * Each enriched item: { productId, name, effectivePrice (salePrice ?? price),
       quantity, lineTotal, imageUrl, inStock: stockQty >= quantity }
   - addItem(userId, { productId, quantity })
     * Load product — throw 404 if not found or not active
     * Check stockQty >= quantity — throw 400 'Insufficient stock' if not
     * Upsert Cart document (findOneAndUpdate with upsert:true)
     * If productId already in items array: increment quantity ($inc)
       but re-check new total quantity does not exceed stockQty
     * Else: push new item to array
     * Return updated cart via getCart()
   - updateItem(userId, productId, quantity)
     * Load product, check stock >= quantity
     * Update the matching item in items array using arrayFilters
     * Return updated cart via getCart()
   - removeItem(userId, productId)
     * Pull the item from items array
     * Return updated cart via getCart()
   - clearCart(userId)
     * Set items to [] on Cart document
   - getCartTotal(userId)
     * Aggregate: sum of (effectivePrice * quantity) across all items

3. src/services/wishlist.service.js — export:
   - getWishlist(userId)
     * Find wishlist, populate productIds (name, price, salePrice, imageUrl, isActive)
     * Filter out inactive products from response
     * Return enriched array with effectivePrice
   - addToWishlist(userId, productId)
     * Check product exists and isActive — throw 404 if not
     * Check productId not already in productIds array — throw 409 if duplicate
     * $addToSet productId to Wishlist (upsert:true)
   - removeFromWishlist(userId, productId)
     * $pull productId from productIds array

4. src/controllers/cart.controller.js — handlers:
   getCart, addItem, updateItem, removeItem, clearCart, getCartTotal

5. src/controllers/wishlist.controller.js — handlers:
   getWishlist, addToWishlist, removeFromWishlist

6. src/routes/cart.routes.js (all routes require authenticate)
   GET    /              → getCart
   GET    /total         → getCartTotal
   POST   /items         → validate(addToCartSchema) → addItem
   PUT    /items/:productId → validate(updateCartItemSchema) → updateItem
   DELETE /items/:productId → removeItem
   DELETE /              → clearCart

7. src/routes/wishlist.routes.js (all routes require authenticate)
   GET    /              → getWishlist
   POST   /items/:productId → addToWishlist
   DELETE /items/:productId → removeFromWishlist

8. Update src/routes/index.js to mount cart and wishlist routers.

After generating all files show me:
- curl to add an item to cart (with a product that has limited stock)
- curl that triggers the 'Insufficient stock' error
- curl to add the same product twice (should accumulate quantity)
- curl to get the cart with computed totals
- curl to add/remove a wishlist item and confirm the duplicate guard works
```

### ✅ Phase 5 test checklist

- [ ] `POST /api/cart/items` adds item, returns full enriched cart
- [ ] Adding same product twice accumulates quantity (no duplicates in array)
- [ ] Adding more than available stock returns 400
- [ ] `PUT /api/cart/items/:productId` updates quantity
- [ ] `DELETE /api/cart/items/:productId` removes item
- [ ] `DELETE /api/cart` clears all items
- [ ] `GET /api/cart/total` returns correct sum
- [ ] Wishlist add works, duplicate returns 409
- [ ] Wishlist remove works
- [ ] `GET /api/wishlist` excludes inactive products

---

---

## Phase 6 — Orders & Payments

> **Builds:** order lifecycle, Stripe payment intent, inventory reservation, promotion application

---

### Prompt

```
Using the project from Phases 1–5 (ESM, Express, auth middleware, Mongoose Order +
Cart + Product + Promotion models, apiResponse/apiError, pino logger), build the
Orders and Payments modules.

1. src/validations/order.validation.js — Joi schemas:
   - checkoutSchema: shippingAddress (required), billingAddress (required),
     paymentMethod (required), promotionCode (string, optional, uppercase)
   - processPaymentSchema: paymentIntentId (string, required)
   - updateStatusSchema: status (enum of all valid order statuses, required)

2. src/services/inventory.service.js — export:
   - reserveStock(productId, quantity)
     * findOneAndUpdate Product where _id=productId AND stockQty >= quantity
     * $inc stockQty by -quantity
     * Return true if document found (reservation succeeded), false if not
   - releaseStock(productId, quantity)
     * $inc stockQty by +quantity on Product
   - getLowStockProducts(threshold=10)
     * Find products where stockQty <= threshold AND isActive:true

3. src/services/promotion.service.js — export:
   - applyPromotion(code, orderSubtotal)
     * Find active Promotion by code (case-insensitive), where startDate<=now<=endDate
     * Throw 404 if not found
     * Check minOrderAmount — throw 400 if subTotal too low
     * Check usageLimit — throw 400 if limit reached
     * Calculate discount: percentage → subTotal*(value/100), fixed_amount → value,
       free_shipping → return { discount: 0, freeShipping: true }
     * $inc usageCount on Promotion document
     * Return { discount, freeShipping: false }
   - getActivePromotions() — find all active, unexpired promotions
   - createPromotion(dto) — create and return Promotion

4. src/services/payment.service.js — export:
   - createPaymentIntent(orderId)
     * Load order — throw 404 if not found
     * Create Stripe PaymentIntent with amount (totalAmount*100, cents), currency 'usd',
       metadata: { orderId, orderNumber }
     * Save paymentIntentId to Order document
     * Return the Stripe clientSecret
   - processPayment(orderId, paymentIntentId)
     * Load order, verify paymentIntentId matches stored value
     * Retrieve PaymentIntent from Stripe API and check status === 'succeeded'
     * Update order: paymentStatus='completed', status='confirmed'
     * Return true
   - refundPayment(orderId)
     * Load order, verify paymentStatus='completed'
     * Create Stripe Refund for the paymentIntentId
     * Update order: paymentStatus='refunded', status='refunded'
     * Return true

5. src/services/order.service.js — export:
   - createOrder(userId, dto)
     * Load cart — throw 400 'Cart is empty' if no items
     * For each item: call inventoryService.reserveStock() — throw 400 with product name if fails
       (wrap in try/catch: release already-reserved items if a later one fails)
     * Calculate subTotal (salePrice ?? price * qty per item)
     * taxAmount = subTotal * 0.18
     * shippingCost = subTotal > 500 ? 0 : 50
     * If dto.promotionCode: call promotionService.applyPromotion() — catch and ignore if invalid
     * totalAmount = subTotal + taxAmount + shippingCost - discountAmount
     * Generate orderNumber: 'ORD-' + Date.now() + '-' + random 4-digit suffix
     * Create Order document with all fields and snapshot items (name, unitPrice, totalPrice)
     * Clear the user's cart
     * Return created order
   - getUserOrders(userId) — find orders by userId, sort by createdAt desc
   - getOrderById(orderId, userId)
     * Find by _id AND userId — throw 404 if not found
   - getOrderByIdAdmin(orderId) — find by _id only (no userId filter)
   - cancelOrder(orderId, userId)
     * Find order, verify ownership and status==='pending'
     * Set status='cancelled'
     * Release all item stock via inventoryService.releaseStock()
   - updateOrderStatus(orderId, status)
     * Find order by _id
     * Update status; if status='shipped' set shippedAt=now; if 'delivered' set deliveredAt=now

6. src/controllers/order.controller.js — handlers:
   getUserOrders, getOrder, checkout, processPayment, cancelOrder, updateOrderStatus, getOrderAdmin

7. src/routes/order.routes.js
   GET    /              → authenticate → getUserOrders
   GET    /admin/:id     → authenticate → authorise('admin') → getOrderAdmin
   GET    /:id           → authenticate → getOrder
   POST   /checkout      → authenticate → validate(checkoutSchema) → checkout
   POST   /:id/payment   → authenticate → validate(processPaymentSchema) → processPayment
   POST   /:id/cancel    → authenticate → cancelOrder
   PUT    /:id/status    → authenticate → authorise('admin','seller') → validate(updateStatusSchema) → updateOrderStatus

8. Update src/routes/index.js to mount the orders router.

After generating all files show me:
- curl sequence: add items → checkout → get clientSecret → (simulate Stripe success)
  → processPayment → check order status becomes 'confirmed'
- curl to cancel a pending order and confirm stock is released
- curl to trigger the partial-reservation rollback (second item has no stock)
- curl to apply WELCOME10 promo code at checkout
```

### ✅ Phase 6 test checklist

- [ ] Checkout with empty cart returns 400
- [ ] Checkout with valid cart creates order, returns `clientSecret`
- [ ] Cart is cleared after successful checkout
- [ ] Stock is decremented after checkout
- [ ] Cancelling a pending order restores stock and sets status to `cancelled`
- [ ] Cancelling a non-pending order returns 400
- [ ] `PUT /api/orders/:id/status` to `shipped` sets `shippedAt` timestamp
- [ ] Valid promo code reduces `discountAmount`
- [ ] Promo above usage limit returns 400
- [ ] `processPayment` with mismatched `paymentIntentId` returns error
- [ ] Inventory rollback works when second item has insufficient stock

---

---

## Phase 7 — Reviews & Notifications

> **Builds:** review CRUD with rating recalculation, notification creation and delivery

---

### Prompt

```
Using the project from Phases 1–6 (ESM, Express, auth middleware, Mongoose Review +
Notification + Product models, productService.recalculateRating, apiResponse/apiError),
build the Reviews and Notifications modules.

1. src/validations/review.validation.js — Joi schemas:
   - createReviewSchema: productId (ObjectId string, required), rating (integer 1–5, required),
     comment (string, max 1000)

2. src/services/review.service.js — export:
   - getProductReviews(productId, { page=1, pageSize=10 })
     * Find reviews where productId=productId AND isApproved=true
     * Populate userId (firstName, lastName)
     * Sort by createdAt desc, skip/limit for pagination
     * Return { items, totalCount, page, pageSize }
   - createReview(userId, dto)
     * Check product exists — throw 404 if not
     * Check no existing review from this user for this product — throw 409 if duplicate
     * Create Review
     * Call productService.recalculateRating(dto.productId)
     * Return created review
   - approveReview(reviewId)
     * Find review — throw 404 if not found
     * Set isApproved=true, save
     * Call productService.recalculateRating(review.productId)
   - deleteReview(reviewId, requestingUser)
     * Find review — throw 404 if not found
     * If requestingUser.role !== 'admin' AND review.userId.toString() !== requestingUser.id → throw 403
     * Delete review
     * Call productService.recalculateRating(review.productId)

3. src/services/notification.service.js — export:
   - getUserNotifications(userId)
     * Find where userId=userId, sort by createdAt desc, limit 50
   - markAsRead(notificationId, userId)
     * Find where _id=notificationId AND userId=userId — throw 404 if not found
     * Set isRead=true
   - markAllAsRead(userId)
     * updateMany where userId=userId AND isRead=false → set isRead=true
   - createNotification(userId, { title, message, type })
     * Create and save Notification — internal helper used by other services
   - sendOrderConfirmation(userId, orderId, orderNumber)
     * Call createNotification with title 'Order Confirmed',
       message 'Your order #<orderNumber> is confirmed and being processed.', type 'order'
   - sendOrderUpdate(userId, orderId, orderNumber, status)
     * createNotification: title 'Order Update', message with status, type 'order'
   - sendLowStockAlert(adminUserIds, productName, stockQty)
     * For each adminId: createNotification with title 'Low Stock Alert', type 'system'
   - sendWelcome(userId)
     * createNotification: title 'Welcome!', type 'system'

4. src/controllers/review.controller.js — handlers:
   getProductReviews, createReview, approveReview, deleteReview

5. src/controllers/notification.controller.js — handlers:
   getNotifications, markAsRead, markAllAsRead

6. src/routes/review.routes.js
   GET    /product/:productId → validate({ page, pageSize }, 'query') → getProductReviews
   POST   /                   → authenticate → authorise('customer') → validate(createReviewSchema) → createReview
   PUT    /:id/approve        → authenticate → authorise('admin') → approveReview
   DELETE /:id                → authenticate → deleteReview

7. src/routes/notification.routes.js (all routes require authenticate)
   GET    /              → getNotifications
   PUT    /:id/read      → markAsRead
   PUT    /mark-all-read → markAllAsRead

8. Update src/routes/index.js to mount reviews and notifications routers.
   Update orderService.createOrder to call notificationService.sendOrderConfirmation after order creation.
   Update orderService.updateOrderStatus to call notificationService.sendOrderUpdate.

After generating all files show me:
- curl to submit a review as a customer, then check product averageRating updated
- curl to submit a second review for the same product (should return 409)
- curl to approve the review as admin, check it appears in GET reviews
- curl to delete the review as the owner
- curl to check notifications after placing an order
```

### ✅ Phase 7 test checklist

- [ ] `POST /api/reviews` creates review (isApproved=false by default)
- [ ] Duplicate review returns 409
- [ ] Unapproved review does not appear in `GET /api/reviews/product/:id`
- [ ] `PUT /api/reviews/:id/approve` approves review, it appears in list
- [ ] Product `averageRating` and `reviewCount` update after approve
- [ ] `DELETE /api/reviews/:id` by owner works
- [ ] `DELETE /api/reviews/:id` by another customer returns 403
- [ ] Order confirmation creates a notification for the user
- [ ] `GET /api/notifications` returns latest 50 for the authenticated user
- [ ] `PUT /api/notifications/:id/read` marks one as read
- [ ] `PUT /api/notifications/mark-all-read` marks all unread as read

---

---

## Phase 8 — Admin module

> **Builds:** dashboard metrics, user management, promotions, and sales analytics

---

### Prompt

```
Using the project from Phases 1–7 (ESM, Express, all models, all services,
authenticate + authorise('admin') middleware, apiResponse/apiError), build the
Admin module. All routes in this module require authenticate + authorise('admin').

1. src/controllers/admin.controller.js — export these handlers:

   getDashboard
   - Total users: User.countDocuments()
   - Total orders: Order.countDocuments()
   - Total revenue: Order.aggregate sum of totalAmount where paymentStatus='completed'
   - Pending orders: Order.countDocuments({ status: 'pending' })
   - Low stock products: inventoryService.getLowStockProducts()
   - Return all as a single object

   getUsers(page=1, pageSize=10)
   - Paginate User documents, exclude passwordHash and refreshToken
   - Return { users, totalCount, page, pageSize }

   updateUserStatus(userId, isActive)
   - findByIdAndUpdate User, set isActive
   - Throw 404 if not found

   getAllOrders(page=1, pageSize=10)
   - Paginate Order documents, sort by createdAt desc
   - Populate userId (firstName, lastName, email)
   - Return { orders, totalCount, page, pageSize }

   createPromotion(dto)
   - Validate with Joi inside the controller or via middleware
   - Call promotionService.createPromotion(dto)

   getSalesAnalytics({ startDate, endDate })
   - salesByDay: aggregate Orders (paymentStatus=completed) grouped by date,
     sum totalAmount and count orders. Filter by startDate/endDate if provided.
   - topProducts: aggregate OrderItems (from Order.items) across completed orders,
     group by productId, sum quantity and revenue, sort by revenue desc, limit 10
   - Return { salesByDay, topProducts }

2. src/validations/admin.validation.js — Joi schemas:
   - updateUserStatusSchema: isActive (boolean, required)
   - createPromotionSchema: name, code, type (enum), value (number),
     minOrderAmount (number, optional), usageLimit (integer, optional),
     startDate (date), endDate (date)
   - salesAnalyticsSchema (query): startDate (date, optional), endDate (date, optional)
   - paginationSchema (query): page (integer min:1, default:1), pageSize (integer 1–100, default:10)

3. src/routes/admin.routes.js
   All routes: authenticate → authorise('admin')
   GET    /dashboard             → getDashboard
   GET    /users                 → validate(paginationSchema,'query') → getUsers
   PUT    /users/:userId/status  → validate(updateUserStatusSchema) → updateUserStatus
   GET    /orders                → validate(paginationSchema,'query') → getAllOrders
   POST   /promotions            → validate(createPromotionSchema) → createPromotion
   GET    /analytics/sales       → validate(salesAnalyticsSchema,'query') → getSalesAnalytics

4. Update src/routes/index.js to mount admin router at /admin.

After generating all files show me:
- curl for dashboard (admin token required)
- curl to deactivate a user then confirm they cannot login
- curl for sales analytics with a date range
- curl to create a new promo code and immediately test it at checkout
```

### ✅ Phase 8 test checklist

- [ ] `GET /api/admin/dashboard` returns all 5 metrics
- [ ] Revenue only counts `paymentStatus=completed` orders
- [ ] `GET /api/admin/users` paginates correctly
- [ ] Deactivated user gets 403 on login
- [ ] `GET /api/admin/orders` returns all orders with populated user info
- [ ] `POST /api/admin/promotions` creates promo, code is stored uppercase
- [ ] `GET /api/admin/analytics/sales` returns `salesByDay` and `topProducts`
- [ ] Date range filter narrows analytics results
- [ ] Any of these routes with a seller or customer token returns 403

---

---

## Phase 9 — Email & Swagger docs

> **Builds:** Nodemailer email service, Swagger JSDoc annotations on all routes

---

### Prompt

```
Using the complete project from Phases 1–8, add email notifications and
full Swagger/OpenAPI documentation.

1. src/services/email.service.js
   - Create a Nodemailer transporter using env.smtp config (SMTP_HOST, SMTP_PORT,
     SMTP_USER, SMTP_PASS)
   - In development: use nodemailer.createTransport with the real SMTP config
     but wrap sendMail in a try/catch that logs the error and does NOT throw
     (email failure should never crash the API)
   - Export these functions (each builds an HTML email and calls transporter.sendMail):
     * sendWelcomeEmail(user) — subject 'Welcome to E-commerce!'
     * sendOrderConfirmationEmail(user, order) — lists order items and totals
     * sendOrderStatusEmail(user, order) — current status update
     * sendPasswordChangedEmail(user) — security alert email
   - Call sendWelcomeEmail from authService.register
   - Call sendOrderConfirmationEmail from orderService.createOrder
   - Call sendOrderStatusEmail from orderService.updateOrderStatus

2. Update src/config/swagger.js with a complete OpenAPI 3.0 definition:
   - Info: title, version, description
   - Servers: localhost:PORT/api
   - Components → securitySchemes → bearerAuth (HTTP Bearer JWT)
   - Components → schemas: define reusable schemas for
     ApiResponse, PaginatedResult, User, Product, Category, Cart, Order,
     Review, Wishlist, Notification, Promotion
   - apis: ['./src/routes/*.js'] — swagger-jsdoc will pick up JSDoc comments

3. Add JSDoc @swagger comments to every route file covering:
   - Summary, description, tags, security
   - Request body schema ($ref to component schema or inline)
   - Query parameters (search, page, pageSize, filters)
   - Path parameters (:id, :productId, etc.)
   - Responses: 200 with data shape, 400 validation error, 401, 403, 404

   Routes to document: auth, products, categories, cart, orders,
   reviews, wishlist, notifications, admin

After generating, show me:
- How to test email in development without a real SMTP server
  (hint: use Ethereal — generate test account with nodemailer.createTestAccount)
- The Swagger UI URL and how to authorise with a JWT token in the UI
- One complete @swagger JSDoc example for a route
```

### ✅ Phase 9 test checklist

- [ ] `GET http://localhost:5000/api-docs` shows all routes documented
- [ ] Swagger UI "Authorize" button accepts JWT token
- [ ] All routes appear under correct tags in Swagger UI
- [ ] Request bodies and query params are documented with correct types
- [ ] All response schemas are documented (200, 400, 401, 403, 404)
- [ ] Email sends (or logs) on register without crashing the request
- [ ] Email sends (or logs) on order creation without crashing the request
- [ ] Email failure is caught silently — API still returns 200

---

---

## Phase 10 — Seed data & final middleware

> **Builds:** `src/utils/seed.js`, `src/middlewares/rateLimiter.middleware.js`, final error middleware review

---

### Prompt

```
Using the complete project from Phases 1–9, add the database seeder,
production-grade rate limiter, and review all middleware for completeness.

1. src/utils/seed.js
   - Import all models (User, Product, Category, Promotion, Order, Review, Wishlist)
   - Connect to MongoDB using connectDB()
   - Seed in this order (skip each block if documents already exist):
     a. Users — 3 users: admin, seller, customer (use the pre-save hook for password hashing)
        admin@ecommerce.com / Password@123 / role: admin
        seller@ecommerce.com / Password@123 / role: seller
        customer@ecommerce.com / Password@123 / role: customer
     b. Categories — Electronics, Clothing, Books, Home & Garden (no parent)
        Add subcategories: Smartphones + Laptops under Electronics, Men + Women under Clothing
     c. Products — 12 products (3 per category), with realistic names, prices, SKUs,
        stockQty, averageRating, reviewCount
     d. Promotions — WELCOME10 (10% off, min $50), FLAT20 ($20 off, min $200), FREESHIP (free shipping)
     e. Reviews — one approved review per product, authored by the customer user
     f. Wishlist — first 5 products added to customer wishlist
     g. Orders — 2 orders for customer: one 'delivered' (paymentStatus completed),
        one 'shipped' (paymentStatus completed)
   - Log progress at each step using pino logger
   - Disconnect after seeding
   - Handle errors: log and exit with code 1

2. src/middlewares/rateLimiter.middleware.js
   - Create with express-rate-limit:
     windowMs: env.rateLimit.windowMs (default 60000)
     max: env.rateLimit.max (default 100)
     standardHeaders: true
     legacyHeaders: false
     handler: (req, res) → apiError(res, 'Too many requests, please try again later.', 429)
   - Export as default rateLimiter
   - Apply it globally in app.js (before route mounting)

3. Review src/middlewares/error.middleware.js — ensure it handles:
   - Mongoose ValidationError → 400 with field-level messages
   - Mongoose CastError (invalid ObjectId) → 400 'Invalid ID format'
   - Mongoose duplicate key error (code 11000) → 409 with field name in message
   - JWT JsonWebTokenError → 401 'Invalid token'
   - JWT TokenExpiredError → 401 'Token expired'
   - Stripe errors → 402 with Stripe message
   - Generic Error → 500 (hide message in production, show in development)
   - All using apiError() helper and logging with pino

4. Add a 404 handler in app.js (after all routes, before error middleware):
   app.use((req, res) => apiError(res, `Route ${req.method} ${req.originalUrl} not found`, 404))

After generating all files show me:
- How to run the seeder and expected console output
- How to trigger a 429 response (reduce RATE_LIMIT_MAX to 3 temporarily)
- How to trigger each error type (invalid ObjectId, duplicate email, expired token)
  and verify the correct status code and message
```

### ✅ Phase 10 test checklist

```bash
npm run seed
```

- [ ] Seed runs without errors
- [ ] All 3 users are created and can log in
- [ ] 12 products across 4 categories exist
- [ ] Promotions, reviews, wishlist, and orders are seeded
- [ ] Re-running seed does not duplicate data (idempotent)
- [ ] Rate limiter returns 429 after the configured request limit
- [ ] `GET /api/invalid-route` returns 404 with `Route GET /api/invalid-route not found`
- [ ] `GET /api/products/not-a-valid-id` returns 400 `Invalid ID format`
- [ ] Register with existing email returns 409
- [ ] Expired JWT returns 401 `Token expired`
- [ ] Stripe error returns 402

---

---

## Phase 11 — Tests

> **Builds:** full Jest + Supertest test suite

---

### Prompt

```
Using the complete project from Phases 1–10, write a comprehensive Jest + Supertest
test suite. The project uses ESM ("type":"module") so tests must use import syntax
and Jest must be invoked with --experimental-vm-modules.

Test environment setup:
- Create tests/setup.js: connect to a test MongoDB (MONGODB_URI_TEST or append '-test'
  to MONGODB_URI), run the seeder, export helpers: getAdminToken(), getSellerToken(),
  getCustomerToken() that log in and return JWT strings
- In package.json jest config: globalSetup and globalTeardown pointing to tests/setup.js

1. tests/auth.test.js
   - POST /register: success, duplicate email (409), weak password (400)
   - POST /login: success, wrong password (401), inactive user (403)
   - POST /logout: clears refreshToken
   - POST /refresh-token: returns new accessToken
   - POST /change-password: success, wrong current password (400)
   - Protected route without token: 401
   - Protected route with wrong role: 403

2. tests/product.test.js
   - GET /products: returns paginated list
   - GET /products?search=...: filters by name
   - GET /products?minPrice=&maxPrice=: price range filter
   - GET /products?sortBy=price&sortOrder=desc: correct order
   - GET /products/featured: only rating >= 4
   - GET /products/:id: returns product
   - GET /products/:id with invalid id: 400
   - GET /products/:id with non-existent id: 404
   - POST /products with seller token: creates product
   - POST /products with customer token: 403
   - PUT /products/:id: updates product
   - DELETE /products/:id: soft-deletes (isActive=false), no longer in search results

3. tests/order.test.js
   - POST /orders/checkout with empty cart: 400
   - POST /orders/checkout with items: creates order, returns clientSecret
   - Cart is empty after successful checkout
   - Stock is decremented after checkout
   - POST /orders/:id/cancel (pending): succeeds, stock restored, status='cancelled'
   - POST /orders/:id/cancel (non-pending): 400
   - PUT /orders/:id/status to 'shipped': sets shippedAt, 403 for customer

Show me the complete test files with all assertions.
Use beforeAll/afterAll for DB connection and afterEach to clean up test data.
Show how to run only one test file: npm test -- --testPathPattern=auth
```

### ✅ Phase 11 test checklist

```bash
npm test
```

- [ ] All auth tests pass
- [ ] All product tests pass
- [ ] All order tests pass
- [ ] No test pollutes another (afterEach cleanup works)
- [ ] Test database is separate from dev database
- [ ] `npm test -- --testPathPattern=auth` runs only auth tests
- [ ] Coverage report shows > 70% coverage on services

---

---

## Final sanity check — full stack run

Once all phases pass, do one complete end-to-end flow:

```bash
# Fresh start
npm run seed

# 1. Register a new customer
# 2. Login and save the access token
# 3. Browse products with filters
# 4. Add 2 products to cart
# 5. Add one product to wishlist
# 6. Apply promo code WELCOME10 at checkout
# 7. Confirm order created, payment intent returned
# 8. (Simulate payment success)
# 9. Check notifications — order confirmation should appear
# 10. Submit a review as the customer
# 11. Approve the review as admin
# 12. Check product averageRating updated
# 13. GET /api/admin/dashboard — confirm metrics updated
# 14. GET /api-docs — confirm all routes documented
```

- [ ] Full flow completes without errors
- [ ] All responses match the `{ success, message, data, errors, timestamp }` envelope
- [ ] Swagger UI documents every endpoint
- [ ] `npm test` passes all tests
- [ ] No console errors or unhandled promise rejections in dev logs
```
