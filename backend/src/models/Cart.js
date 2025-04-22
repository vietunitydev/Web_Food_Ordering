// src/models/Cart.js
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const foodItemSchema = new mongoose.Schema({
    foodItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    list: [foodItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

cartSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// cartSchema.methods.save = function(enteredPassword) {
//     this.updatedAt = Date.now();
//     next();
// };

module.exports = mongoose.model('Cart', cartSchema);