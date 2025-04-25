const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, updateOrderStatus, getAllOrders, updateOrder, createCheckoutSession,
    verifySession, getOrders
} = require('../controllers/orderController');
const { authMiddleware, userMiddleware, adminMiddleware, protect} = require('../middleware/authMiddleWare');

// User routes
router.post('/create', authMiddleware, userMiddleware, createOrder);
router.get('/history', authMiddleware, userMiddleware, getOrderHistory);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/', authMiddleware, adminMiddleware, getOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.put('/:id', authMiddleware, adminMiddleware, updateOrder);

// Route mới cho Stripe
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify-session/:sessionId', protect, verifySession);

module.exports = router;