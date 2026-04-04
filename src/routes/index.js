import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';

const router = Router();

// Phase 3 — Auth
router.use('/auth', authRoutes);

// Phase 4 — Products & Categories
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

// Stubs — wired up in subsequent phases
router.use('/cart', (req, res) => res.status(200).json({ message: 'Cart routes coming soon' }));
router.use('/orders', (req, res) => res.status(200).json({ message: 'Order routes coming soon' }));
router.use('/reviews', (req, res) => res.status(200).json({ message: 'Review routes coming soon' }));
router.use('/wishlist', (req, res) => res.status(200).json({ message: 'Wishlist routes coming soon' }));
router.use('/notifications', (req, res) => res.status(200).json({ message: 'Notification routes coming soon' }));
router.use('/admin', (req, res) => res.status(200).json({ message: 'Admin routes coming soon' }));

export default router;
