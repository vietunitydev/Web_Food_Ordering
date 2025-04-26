const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const FoodItem = require('../models/FoodItem');

dotenv.config();


// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Đường dẫn đến thư mục uploads
const uploadsDir = path.join(__dirname, 'src', 'uploads');

console.log(uploadsDir);


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB' + process.env.MONGODB_URI))
    .catch(err => console.error('Failed to connect to MongoDB:', err));


// Hàm upload file lên Cloudinary
const uploadToCloudinary = (filePath) => {
    return new Promise((resolve, reject) => {
        // Tên thư mục trên Cloudinary
        const folderName = 'food-app';

        cloudinary.uploader.upload(filePath, {
            folder: folderName,
            use_filename: true, // Giữ tên file gốc
        }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
    });
};

// Hàm chính để di chuyển ảnh
const migrateImages = async () => {
    try {
        // Lấy tất cả FoodItem từ database
        const foodItems = await FoodItem.find({});
        console.log(`Tìm thấy ${foodItems.length} sản phẩm cần di chuyển ảnh`);

        // Duyệt qua từng sản phẩm
        for (const item of foodItems) {
            try {
                // Kiểm tra nếu imageURL là đường dẫn tương đối (bắt đầu bằng /)
                if (item.imageURL && item.imageURL.startsWith('/uploads/')) {
                    // Lấy tên file từ đường dẫn
                    const fileName = path.basename(item.imageURL);
                    // Tạo đường dẫn đầy đủ đến file
                    const filePath = path.join(uploadsDir, fileName);

                    // Kiểm tra file có tồn tại
                    if (fs.existsSync(filePath)) {
                        console.log(`Đang upload file: ${fileName}`);

                        // Upload lên Cloudinary
                        const cloudinaryUrl = await uploadToCloudinary(filePath);
                        console.log(`Upload thành công: ${cloudinaryUrl}`);

                        // Cập nhật URL trong database
                        item.imageURL = cloudinaryUrl;
                        await item.save();
                        console.log(`Đã cập nhật database cho sản phẩm: ${item._id}`);
                    } else {
                        console.warn(`File không tồn tại: ${filePath}`);
                    }
                } else {
                    console.log(`Bỏ qua sản phẩm ${item._id}: imageURL không phải đường dẫn tương đối hoặc đã được cập nhật`);
                }
            } catch (itemError) {
                console.error(`Lỗi khi xử lý sản phẩm ${item._id}:`, itemError);
                // Tiếp tục với sản phẩm tiếp theo
            }
        }

        console.log('Hoàn thành quá trình di chuyển ảnh!');
    } catch (error) {
        console.error('Lỗi trong quá trình di chuyển:', error);
    } finally {
        // Đóng kết nối MongoDB
        mongoose.connection.close();
        console.log('Đã đóng kết nối MongoDB');
    }
};

// Chạy script
migrateImages();