const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory } = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth'); // Middleware để xác thực người dùng

// Tạo order (chỉ cho phép người dùng đã đăng nhập)
router.post('/create', authMiddleware, createOrder);

// Lấy lịch sử order (chỉ cho phép người dùng đã đăng nhập)
router.get('/history', authMiddleware, getOrderHistory);

module.exports = router;