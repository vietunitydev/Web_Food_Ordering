const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUser, deleteUserById} = require('../controllers/userController');
const { authMiddleware, adminMiddleware, userMiddleware } = require('../middleware/authMiddleWare');

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUserById);

// User routes
router.put('/update', authMiddleware, userMiddleware, updateUser);
router.delete('/delete', authMiddleware, userMiddleware, deleteUser);

module.exports = router;