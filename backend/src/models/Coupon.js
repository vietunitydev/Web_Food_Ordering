const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
    },
    discountType: {
        type: String,
        enum: ['fixed', 'percentage'],
        required: true,
    },
    expiresAt: {
        type: Date,
    },
    maxUses: {
        type: Number,
        min: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);