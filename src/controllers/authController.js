// src/controllers/authController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password, address, phone } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password,
            address,
            phone
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ success: true, message: 'User logged out' });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    // Fix: Make sure JWT_EXPIRE is properly converted to milliseconds
    // The error occurs because we're trying to multiply a string by numbers
    const expiresIn = process.env.JWT_EXPIRE || '30d';
    let expiryTime;

    if (typeof expiresIn === 'string') {
        // Handle string expiry formats like '30d', '24h', etc.
        const match = expiresIn.match(/^(\d+)([dh])$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];

            if (unit === 'd') {
                // Convert days to milliseconds
                expiryTime = value * 24 * 60 * 60 * 1000;
            } else if (unit === 'h') {
                // Convert hours to milliseconds
                expiryTime = value * 60 * 60 * 1000;
            }
        } else {
            // Default to 30 days if no valid format
            expiryTime = 30 * 24 * 60 * 60 * 1000;
        }
    } else {
        // Default to 30 days if JWT_EXPIRE is not a string
        expiryTime = 30 * 24 * 60 * 60 * 1000;
    }

    const options = {
        expires: new Date(Date.now() + expiryTime),
        httpOnly: true
    };

    // Use secure flag in production
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
            }
        });
};