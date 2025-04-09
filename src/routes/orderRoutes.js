const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, getAllOrder} = require('../controllers/orderController');
const {authMiddleware, adminMiddleware} = require("../middleware/authMiddleWare");

// Tạo order (chỉ cho phép người dùng đã đăng nhập)
router.post('/create', authMiddleware, createOrder);

// Lấy lịch sử order (chỉ cho phép người dùng đã đăng nhập)
router.get('/history', authMiddleware, getOrderHistory);

// Lấy lịch sử order (chỉ cho phép người dùng đã đăng nhập và là admin)
router.get('/all', authMiddleware, adminMiddleware, getAllOrder);

module.exports = router;