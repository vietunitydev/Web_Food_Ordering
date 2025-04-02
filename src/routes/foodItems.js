// src/routes/foodItems.js
const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để lưu ảnh vào thư mục uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file với timestamp
    },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
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
});

// Lấy danh sách sản phẩm (Read)
router.get('/', async (req, res) => {
    try {
        const foodItems = await FoodItem.find();
        res.status(200).json(foodItems);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error });
    }
});

// Sửa sản phẩm (Update)
router.put('/:id', upload.single('image'), async (req, res) => {
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
});

// Xóa sản phẩm (Delete)
router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        res.status(200).json({ message: 'Sản phẩm đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error });
    }
});

module.exports = router;