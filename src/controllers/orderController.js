const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, address, email, phone, shippingFee, totalAmount, payment, paymentMethod, discount, items } = req.body;

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

        const finalPayment = calculatedTotal - (discount || 0);
        if (finalPayment < 0) {
            return res.status(400).json({ message: 'Discount exceeds total amount' });
        }

        const order = new Order({
            userId,
            name,
            address,
            email,
            phone,
            shippingFee,
            totalAmount: calculatedTotal,
            payment: finalPayment,
            paymentMethod,
            discount: discount || 0,
            items
        });

        await order.save();

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId })
            .populate('items.foodItemId')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error getting order history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.foodItemId')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error getting all orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, email, phone, shippingFee, totalAmount, payment, paymentMethod, discount, items, status } = req.body;

        const updateData = { name, address, email, phone, shippingFee, totalAmount, payment, paymentMethod, discount, items, status };

        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('items.foodItemId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};