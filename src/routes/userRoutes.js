// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateUser, deleteUser, getAllUsers } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleWare");

router.put('/update', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUser);

// Lấy tất cả người dùng (chỉ cho admin)
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;