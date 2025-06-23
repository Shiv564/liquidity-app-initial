// index.js 
require('dotenv').config();
const cors = require('cors');




const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');



const PORT = 4500;  // Or any port you want

const app = express();
app.use(express.json());

// ✅ Setup CORS (Put this BEFORE routes)
// app.use(cors({
//     origin: 'http://localhost:5173', // Replace with your frontend URL
//     credentials: true
// }));

app.use(cors({
    origin: '*', // For development only — allows all origins
}));

app.use('/api/auth', authRoutes);
const { auth, isAdmin } = require("./middleware/authMiddleware");

app.use('/api/assets', require('./routes/assets'));

const depositRoutes = require('./routes/deposit');
app.use('/api/deposit', depositRoutes);


const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const withdrawRoutes = require('./routes/withdraw');
app.use('/api/withdraw', withdrawRoutes);


app.get('/', (req, res) => {
    console.log('Root route hit');
    res.send('API server is running');
});

// ✅ Error handler middleware (last thing)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

mongoose.connect("mongodb://localhost:27017/hdwallets")
    .then(() => {


        // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        app.listen(4500, '0.0.0.0', () => console.log("Server running on all interfaces"));


    })
    .catch(console.error);



