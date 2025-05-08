const FoodItem = require('../models/FoodItem');
const cloudinary = require('cloudinary').v2;

exports.validateFoodInfoBeforeUpload = async (req, res, next) => {
    const { title, description, price, type } = req.body;
    if (!title || !description || !price || !type || !req.file) {
        console.log(title, description, price, type, req.file);
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin sản phẩm.' });
    }

    next();
}

exports.createFoodItem = async (req, res) => {
    try {
        console.log("create");
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

        // delete image in cloudinary
        const publicId = imageURL.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`food-app/${publicId}`);

        res.status(500).json({ message: 'Lỗi khi thêm sản phẩm', error });
    }
};

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
                hasMore: parseInt(page) < totalPages
            },
        });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách món ăn.' });
    }
};

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

        // Build query object for filtering
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

        // Pagination options
        const options = {
            skip: (parseInt(page) - 1) * parseInt(limit),
            limit: parseInt(limit),
        };

        // Fetch total items for pagination
        const totalItems = await FoodItem.countDocuments(query);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        // Fetch food items
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

exports.getAllFoodItems = async (req, res) => {
    try {
        const { limit } = req.query;


        if (limit) {
            options.limit = parseInt(limit);
        }
        let query = {};
        const foodItems = await FoodItem.find(options);
        const totalItems = await FoodItem.countDocuments();

        res.status(200).json({
            foodItem: foodItems,
            total : totalItems
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error });
    }
};


exports.updateFoodItem = async (req, res) => {
    try {
        const { title, description, price, type } = req.body;
        const updateData = { title, description, price: parseFloat(price), type };

        if (req.file) {
            updateData.imageURL = req.file.path;
        }

        const updatedItem = await FoodItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi sửa sản phẩm', error });
    }
};

// Xóa ảnh trên Cloudinary khi xóa sản phẩm
exports.deleteFoodItem = async (req, res) => {
    try {
        console.log("delete")
        const item = await FoodItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        if (item.imageURL) {
            const publicId = item.imageURL.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`food-app/${publicId}`);
        }

        const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Sản phẩm đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error });
    }
};