const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/auth');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
// CORS stands for Cross-Origin Resource Sharing.
app.use(cors());

// Helps analyze and read cookies from client requests.
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Start server
const PORT = process.env.PORT || 4999;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});