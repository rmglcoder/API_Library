const jwt = require('jsonwebtoken');
const User = require('../models/libraryModel');

// Create a function to verify the token credibility. 

const verify = async (req, res , next ) => {
    // Initialize the variable to hold the token value.

    let token;

    token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: 'Token does not exist'});
    }

    try {
        // Decode the token value
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET);

        // let decoded_token = [];
        req.user = await User.findById(decoded_token.user_id);

        if (!req.user){
            return res.status(401).json({ error: "User not found"});
        }

        next();
    } catch (error) {
        return res.status(401).json({message: "Invalid Token"});
        
    }
}

module.exports = verify;