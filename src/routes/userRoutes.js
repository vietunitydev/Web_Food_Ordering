// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateUser, deleteUser } = require('../controllers/userController');
const {authMiddleware} = require('../middleware/auth');

router.put('/update', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUser);

module.exports = router;