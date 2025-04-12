const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

// Tạo Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, discount, promoCode, shippingFee, customerDetails } = req.body;

        if (!items || !items.length || !customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.address || !customerDetails.phone) {
            return res.status(400).json({ message: 'Thông tin giỏ hàng hoặc khách hàng không hợp lệ.' });
        }

        let calculatedSubtotal = 0;
        for (const item of items) {
            const foodItem = await FoodItem.findById(item.id);
            if (!foodItem) {
                return res.status(404).json({ message: `Food item ${item.id} not found` });
            }
            calculatedSubtotal += foodItem.price * item.quantity;
        }

        const lineItems = items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Delivery Fee',
                },
                unit_amount: Math.round(shippingFee * 100),
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'http://localhost:3000/checkout',
            discounts: discount > 0 ? [{
                coupon: await createStripeCoupon(discount),
            }] : [],
            metadata: {
                userId,
                customerName: customerDetails.name,
                customerEmail: customerDetails.email,
                customerPhone: customerDetails.phone,
                customerAddress: customerDetails.address,
                promoCode: promoCode || '',
                items: JSON.stringify(items),
                shippingFee: shippingFee.toString(),
                discount: discount.toString(),
            },
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ message: 'Lỗi khi tạo phiên thanh toán.' });
    }
};

// Xác minh Stripe Session và lưu đơn hàng
exports.verifySession = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        console.log("session", session);
        if (session.payment_status === 'paid') {
            console.log("paid");

            // Lưu đơn hàng vào database
            const orderData = {
                userId: session.metadata.userId,
                name: session.metadata.customerName,
                email: session.metadata.customerEmail,
                phone: session.metadata.customerPhone,
                address: session.metadata.customerAddress,
                shippingFee: parseFloat(session.metadata.shippingFee),
                totalAmount: (session.amount_total - (session.total_details.amount_discount || 0)) / 100,
                payment: session.amount_total / 100,
                paymentMethod: 'stripe',
                discount: parseFloat(session.metadata.discount) || 0,
                promoCode: session.metadata.promoCode || '',
                items: JSON.parse(session.metadata.items).map((item) => ({
                    foodItemId: item.id,
                    quantity: item.quantity,
                })),
                status: 'pending',
            };

            console.log("prepare oder");


            const order = new Order(orderData);
            await order.save();

            console.log("save oder");


            // Xóa giỏ hàng
            await Cart.updateOne(
                { userId: session.metadata.userId },
                { $set: { list: [] } }
            );


            console.log("delete oder");


            res.json({ success: true, order });
        } else {
            res.json({ success: false, message: 'Thanh toán chưa hoàn tất.' });
        }
    } catch (error) {
        console.error('Error verifying session:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xác minh thanh toán.' });
    }
};

async function createStripeCoupon(discountAmount) {
    const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100), // Chuyển sang cent
        currency: 'usd',
        duration: 'once',
    });
    return coupon.id;
}