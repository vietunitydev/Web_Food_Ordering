const FoodItem = require('../models/FoodItem');

exports.createFoodItem = async (req, res) => {
    console.log('Request received');
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    try {
        const { title, description, price, type } = req.body;
        if (!title || !description || !price || !type || !req.file) {
            console.log('Missing fields:', { title, description, price, type, file: req.file });
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin sản phẩm.' });
        }

        const imageURL = `/uploads/${req.file.filename}`;
        const newFoodItem = new FoodItem({
            title,
            description,
            imageURL,
            price: parseFloat(price),
            type,
        });

        console.log('Dữ liệu sẽ lưu:', newFoodItem);
        const savedItem = await newFoodItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Lỗi MongoDB:', error);
        res.status(500).json({ message: 'Lỗi khi thêm sản phẩm', error });
    }
};

exports.getFoodItems = async (req, res) => {
    try {
        const { featured, sort, order, limit, category, search } = req.query;
        let query = {};
        let options = {};

        if (featured === 'true') {
            query.isFeatured = true;
        }

        if (req.query.category) {
            query.type = req.query.category;
        }

        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
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

exports.getAllFoodItems = async (req, res) => {
    try {
        const { limit } = req.query;

        let options = {};

        if (limit) {
            options.limit = parseInt(limit);
        }

        const foodItems = await FoodItem.find(options);
        res.status(200).json(foodItems);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error });
    }
};


exports.updateFoodItem = async (req, res) => {
    try {
        const { title, description, price, type } = req.body;
        const updateData = { title, description, price: parseFloat(price), type };

        if (req.file) {
            updateData.imageURL = `/uploads/${req.file.filename}`;
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

exports.deleteFoodItem = async (req, res) => {
    try {
        const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        res.status(200).json({ message: 'Sản phẩm đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error });
    }
};