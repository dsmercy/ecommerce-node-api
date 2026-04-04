import { Router } from 'express';

const router = Router();

// Stub — routes will be wired up in subsequent phases
router.use('/auth', (req, res) => res.status(200).json({ message: 'Auth routes coming soon' }));
router.use('/products', (req, res) => res.status(200).json({ message: 'Product routes coming soon' }));
router.use('/categories', (req, res) => res.status(200).json({ message: 'Category routes coming soon' }));
router.use('/cart', (req, res) => res.status(200).json({ message: 'Cart routes coming soon' }));
router.use('/orders', (req, res) => res.status(200).json({ message: 'Order routes coming soon' }));
router.use('/reviews', (req, res) => res.status(200).json({ message: 'Review routes coming soon' }));
router.use('/wishlist', (req, res) => res.status(200).json({ message: 'Wishlist routes coming soon' }));
router.use('/notifications', (req, res) => res.status(200).json({ message: 'Notification routes coming soon' }));
router.use('/admin', (req, res) => res.status(200).json({ message: 'Admin routes coming soon' }));

export default router;
