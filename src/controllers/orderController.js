const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, address, email, phone, shippingFee, totalAmount, payment, paymentMethod, discount, items } = req.body;

        // Validate input
        if (!name || !address || !email || !phone || !shippingFee || !totalAmount || !payment || !paymentMethod || !items) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let calculatedTotal = shippingFee;
        for (const item of items) {
            const foodItem = await FoodItem.findById(item.foodItemId);
            if (!foodItem) {
                return res.status(404).json({ message: `Food item ${item.foodItemId} not found` });
            }
            calculatedTotal += foodItem.price * item.quantity;
        }

        const finalPayment = calculatedTotal - discount;

        if (finalPayment < 0) {
            return res.status(400).json({ message: 'Discount exceeds total amount' });
        }

        // Tạo order mới
        const order = new Order({
            userId, // Sử dụng userId từ token
            name,
            address,
            email,
            phone,
            shippingFee,
            totalAmount: calculatedTotal,
            payment: finalPayment,
            paymentMethod,
            discount,
            items
        });

        await order.save();

        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ token

        const orders = await Order.find({ userId })
            .populate('items.foodItemId') // Populate để lấy thông tin chi tiết của food items
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Order history retrieved successfully',
            orders
        });
    } catch (error) {
        console.error('Error getting order history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};