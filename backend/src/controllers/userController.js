// src/controllers/userController.js
const User = require('../models/User');

exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, phone, address } = req.body;

        if (!name || !email || !phone || !address) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, phone, address },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        if (userId === req.user.id) {
            return res.status(403).json({ success: false, message: 'Admin cannot delete their own account' });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            name,
            email,
            phone,
            address,
            role,
        } = req.query;

        let query = {};

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }

        if (phone) {
            query.phone = { $regex: phone, $options: 'i' };
        }

        if (address) {
            query.address = { $regex: address, $options: 'i' };
        }

        if (role) {
            query.role = { $regex: role, $options: 'i' };
        }

        // Pagination options
        const options = {
            skip: (parseInt(page) - 1) * parseInt(limit),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        };

        // Fetch total items for pagination
        const totalItems = await User.countDocuments(query);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        // Fetch users
        const users = await User.find(query, 'name email address phone role createdAt', options);

        res.status(200).json({
            message: 'Users retrieved successfully',
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit),
                hasMore: parseInt(page) < totalPages,
            },
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};