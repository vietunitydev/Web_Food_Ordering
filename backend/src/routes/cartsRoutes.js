const express = require('express');
const router = express.Router();
const CartsRoutes = require('../models/Cart');
const { protect } = require('../middleware/authMiddleWare'); // Giả định có middleware xác thực

// Lấy giỏ hàng của user (Read)
router.get('/my-cart', protect, async (req, res) => {
    try {
        const cart = await CartsRoutes.findOne({ userId: req.user._id }).populate('list.foodItemId');
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error });
    }
});

// Thêm item vào giỏ hàng (Create/Update)
router.post('/add', protect, async (req, res) => {
    const { foodItemId, quantity } = req.body;

    if (!foodItemId || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Vui lòng cung cấp foodItemId và quantity hợp lệ' });
    }

    try {
        let cart = await CartsRoutes.findOne({ userId: req.user._id });

        if (!cart) {
            // Tạo giỏ hàng mới nếu chưa có
            cart = new CartsRoutes({
                userId: req.user._id,
                list: [{ foodItemId, quantity }],
            });
        } else {
            // Kiểm tra xem item đã có trong giỏ chưa
            const itemIndex = cart.list.findIndex((item) => item.foodItemId.toString() === foodItemId);
            if (itemIndex > -1) {
                // Cập nhật quantity nếu item đã tồn tại
                cart.list[itemIndex].quantity += quantity;
            } else {
                // Thêm item mới vào danh sách
                cart.list.push({ foodItemId, quantity });
            }
        }

        const updatedCart = await cart.save();
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng', error });
    }
});

// Cập nhật quantity của item trong giỏ hàng (Update)
router.put('/update', protect, async (req, res) => {
    const { foodItemId, quantity } = req.body;

    if (!foodItemId || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Vui lòng cung cấp foodItemId và quantity hợp lệ' });
    }

    try {
        const cart = await CartsRoutes.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        const itemIndex = cart.list.findIndex((item) => item.foodItemId.toString() === foodItemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item không tồn tại trong giỏ hàng' });
        }

        cart.list[itemIndex].quantity = quantity;
        const updatedCart = await cart.save();
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error });
    }
});

// Cập nhật toàn bộ giỏ hàng
router.put('/update-all', protect, async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.some(item => !item.foodItemId || !item.quantity || item.quantity < 1)) {
        return res.status(400).json({ message: 'Dữ liệu giỏ hàng không hợp lệ' });
    }

    try {
        const cart = await CartsRoutes.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Cập nhật danh sách items
        cart.list = items.map(item => ({
            foodItemId: item.foodItemId,
            quantity: item.quantity
        }));

        const updatedCart = await cart.save();
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error });
    }
});

// Xóa item khỏi giỏ hàng (Delete)
router.delete('/remove/:foodItemId', protect, async (req, res) => {
    const { foodItemId } = req.params;

    try {
        const cart = await CartsRoutes.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        cart.list = cart.list.filter((item) => item.foodItemId.toString() !== foodItemId);
        const updatedCart = await cart.save();
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa item khỏi giỏ hàng', error });
    }
});

// Xóa toàn bộ giỏ hàng (Delete all)
router.delete('/clear', protect, async (req, res) => {
    try {
        const cart = await CartsRoutes.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        cart.list = [];
        const updatedCart = await cart.save();
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa toàn bộ giỏ hàng', error });
    }
});

module.exports = router;