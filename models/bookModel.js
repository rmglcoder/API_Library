//  Import the mongoose library
const mongoose = require('mongoose');


// Create the user schema (template)
const bookSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    stocks: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
})


// Export the schema

module.exports = new mongoose.model('Book', bookSchema)