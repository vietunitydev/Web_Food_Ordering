const FoodItem = require('../models/FoodItem');
const cloudinary = require('cloudinary').v2;

// Middleware: Validate food info before upload
exports.validateFoodInfoBeforeUpload = async (req, res, next) => {
    const { title, description, price, type } = req.body;
    if (!title || !description || !price || !type || !req.file) {
        console.log(title, description, price, type, req.file);
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin sản phẩm.' });
    }
    next();
};

// Create a new food item
exports.createFoodItem = async (req, res) => {
    try {
        const { title, description, price, type } = req.body;

        if (!title || !description || !price || !type || !req.file) {
            console.log(title, description, price, type, req.file);
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin sản phẩm.' });
        }

        const imageURL = req.file.path;

        const newFoodItem = new FoodItem({
            title,
            description,
            imageURL,
            price: parseFloat(price),
            type,
        });

        const savedItem = await newFoodItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Lỗi MongoDB:', error);

        // Delete image in Cloudinary if creation fails
        if (req.file) {
            const publicId = req.file.path.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`food-app/${publicId}`);
        }

        res.status(500).json({ message: 'Lỗi khi thêm sản phẩm', error });
    }
};

// Get food items with pagination and filtering
exports.getFoodItems = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search, featured, sort, order } = req.query;
        let query = {};
        let options = {};

        if (featured === 'true') {
            query.isFeatured = true;
        }

        if (category) {
            query.type = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        options = {
            skip: (parseInt(page) - 1) * parseInt(limit),
            limit: parseInt(limit),
        };

        if (sort) {
            options.sort = { [sort]: order === 'desc' ? -1 : 1 };
        }

        const totalItems = await FoodItem.countDocuments(query);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        const foodItems = await FoodItem.find(query, null, options);
        res.status(200).json({
            items: foodItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit),
                hasMore: parseInt(page) < totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách món ăn.' });
    }
};

// Get food items for homepage
exports.getFoodItemsHome = async (req, res) => {
    try {
        const { featured, sort, order, limit } = req.query;
        let query = {};
        let options = {};

        if (featured === 'true') {
            query.isFeatured = true;
        }

        if (sort) {
            options.sort = { [sort]: order === 'desc' ? -1 : 1 };
        }

        if (limit) {
            options.limit = parseInt(limit);
        }

        const foodItems = await FoodItem.find(query, null, options);
        res.status(200).json(foodItems);
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách món ăn.' });
    }
};

// Get food items for admin
exports.getFoodItemsForAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            id,
            title,
            description,
            type,
            priceFrom,
            priceTo,
        } = req.query;

        let query = {};

        if (id) {
            query._id = id;
        }

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        if (description) {
            query.description = { $regex: description, $options: 'i' };
        }

        if (type) {
            query.type = { $regex: type, $options: 'i' };
        }

        if (priceFrom || priceTo) {
            query.price = {};
            if (priceFrom) query.price.$gte = parseFloat(priceFrom);
            if (priceTo) query.price.$lte = parseFloat(priceTo);
        }

        const options = {
            skip: (parseInt(page) - 1) * parseInt(limit),
            limit: parseInt(limit),
        };

        const totalItems = await FoodItem.countDocuments(query);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        const foodItems = await FoodItem.find(query, null, options);

        res.status(200).json({
            items: foodItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit),
                hasMore: parseInt(page) < totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error });
    }
};

exports.getFoodItemById = async (req, res) => {
    try {
        const foodItem = await FoodItem.findById(req.params.id);
        if (!foodItem) {
            return res.status(404).json({ message: 'Món ăn không tồn tại' });
        }
        res.status(200).json(foodItem);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin món ăn:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin món ăn' });
    }
};


// Get all food items
exports.getAllFoodItems = async (req, res) => {
    try {
        const { limit } = req.query;
        let query = {};
        let options = {};

        if (limit) {
            options.limit = parseInt(limit);
        }

        const foodItems = await FoodItem.find(query, null, options);
        const totalItems = await FoodItem.countDocuments();

        res.status(200).json({
            foodItem: foodItems,
            total: totalItems,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error });
    }
};

// Update food item
exports.updateFoodItem = async (req, res) => {
    try {
        const { title, description, price, type } = req.body;
        const item = await FoodItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // If a new image is uploaded, delete the old one from Cloudinary
        if (req.file && item.imageURL) {
            const oldPublicId = item.imageURL.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`food-app/${oldPublicId}`);
        }

        const updateData = {
            title,
            description,
            price: parseFloat(price),
            type,
            imageURL: req.file ? req.file.path : item.imageURL, // Use new image if provided, otherwise keep the old one
        };

        const updatedItem = await FoodItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json(updatedItem);
    } catch (error) {
        // If there's an error and a new image was uploaded, delete it
        if (req.file) {
            const publicId = req.file.path.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`food-app/${publicId}`);
        }
        res.status(500).json({ message: 'Lỗi khi sửa sản phẩm', error });
    }
};

// Delete food item
exports.deleteFoodItem = async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        if (item.imageURL) {
            const publicId = item.imageURL.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`food-app/${publicId}`);
        }

        await FoodItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Sản phẩm đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error });
    }
};