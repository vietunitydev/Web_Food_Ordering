const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, updateOrderStatus, getAllOrders, updateOrder } = require('../controllers/orderController');
const { authMiddleware, userMiddleware, adminMiddleware } = require('../middleware/authMiddleWare');

// User routes
router.post('/create', authMiddleware, userMiddleware, createOrder);
router.get('/history', authMiddleware, userMiddleware, getOrderHistory);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.put('/:id', authMiddleware, adminMiddleware, updateOrder);

module.exports = router;