require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*', // For development only
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', require('./routes/assets'));
app.use('/api/deposit', require('./routes/deposit'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/withdraw', require('./routes/withdraw'));

app.get('/', (req, res) => {
    res.send('API server is running');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// 🛠 Connect using MONGO_URI from .env
const PORT = process.env.PORT || 4500;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection failed:', err.message);
    });
