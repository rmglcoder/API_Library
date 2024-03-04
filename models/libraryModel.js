//  Import the mongoose library
const mongoose = require('mongoose');


// Create the user schema (template)
const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false

    }
},
{
    timestamps: true
})


// Export the schema

module.exports = new mongoose.model('User', userSchema)