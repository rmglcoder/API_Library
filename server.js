// Kunin ang lahat ng kailangan na libraries
require('dotenv').config();
const express = require ('express');
const mongoose = require ('mongoose');
const cookieParser = require('cookie-parser');


// Import the user routes
const libraryRoutes = require('./routes/libraryRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowBookRoutes = require('./routes/borrowBookRoutes');


//const BookRoutes = require('./routes/libraryRoutes')
// initialize ang express application

const app = express();



// Function to Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();


//  To be able to use and parse json.
app.use(express.json());
app.use(cookieParser());

// I-set ang port number
const PORT = process.env.PORT || 5000;


// Routes

app.use('/api/users', libraryRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow-book', borrowBookRoutes);


// app.use('/api/books', BookRoutes);


// Gamitin ang listen para paganahin ang server. 

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})