const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const foodItemRoutes = require('./src/routes/foodItemsRoutes');
const cartRoutes = require('./src/routes/cartsRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const userRoutes = require('./src/routes/userRoutes');
// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
// CORS stands for Cross-Origin Resource Sharing.
app.use(cors({
    origin: 'http://localhost:3000', // Chỉ định origin cụ thể
    credentials: true, // Cho phép gửi cookie/credentials
}))

// Helps analyze and read cookies from client requests.
app.use(cookieParser());
// upload static file
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foodItems', foodItemRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Start server
const PORT = process.env.PORT || 4999;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});