import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';

const router = Router();

// Phase 3 — Auth
router.use('/auth', authRoutes);

// Phase 4 — Products & Categories
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

// Phase 5 — Cart & Wishlist
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);

// Stubs — wired up in subsequent phases
router.use('/orders', (_req, res) => res.status(200).json({ message: 'Order routes coming soon' }));
router.use('/reviews', (_req, res) => res.status(200).json({ message: 'Review routes coming soon' }));
router.use('/notifications', (_req, res) => res.status(200).json({ message: 'Notification routes coming soon' }));
router.use('/admin', (_req, res) => res.status(200).json({ message: 'Admin routes coming soon' }));

export default router;
