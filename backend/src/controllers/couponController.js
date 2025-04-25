const Coupon = require('../models/Coupon');

// Tạo mã giảm giá (admin only)
exports.createCoupon = async (req, res) => {
    try {
        const { code, discount, discountType, expiresAt, maxUses, status } = req.body;

        if (!code || !discount || !discountType) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code,
            discount,
            discountType,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            maxUses,
            status,
        });

        const savedCoupon = await coupon.save();
        res.status(201).json({ success: true, data: savedCoupon });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json({coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getCoupons = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            code,
            discountType,
            status,
            expiresFrom,
            expiresTo,
        } = req.query;

        // Build query object for filtering
        let query = {};

        if (code) {
            query.code = { $regex: code, $options: 'i' };
        }

        if (discountType) {
            query.discountType = discountType;
        }

        if (status) {
            query.status = status;
        }

        if (expiresFrom || expiresTo) {
            query.expiresAt = {};
            if (expiresFrom) query.expiresAt.$gte = new Date(expiresFrom);
            if (expiresTo) query.expiresAt.$lte = new Date(expiresTo);
        }

        const options = {
            skip: (parseInt(page) - 1) * parseInt(limit),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        };

        const totalItems = await Coupon.countDocuments(query);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        const coupons = await Coupon.find(query, null, options);

        res.status(200).json({
            success: true,
            data: {
                coupons,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    itemsPerPage: parseInt(limit),
                    hasMore: parseInt(page) < totalPages,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Cập nhật mã giảm giá (admin only)
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discount, discountType, expiresAt, maxUses, status } = req.body;

        const updateData = {
            code,
            discount,
            discountType,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            maxUses,
            status,
        };

        const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedCoupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({ success: true, data: updatedCoupon });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Xóa mã giảm giá (admin only)
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.applyCoupon = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code || !orderTotal) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const coupon = await Coupon.findOne({ code, status: 'active' });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found or inactive' });
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ success: false, message: 'Coupon has reached maximum uses' });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discount;
        } else if (coupon.discountType === 'percentage') {
            discountAmount = (coupon.discount / 100) * orderTotal;
        }

        coupon.usedCount += 1;
        await coupon.save();

        res.status(200).json({
            success: true,
            data: {
                discountAmount,
                newTotal: orderTotal - discountAmount,
            },
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};