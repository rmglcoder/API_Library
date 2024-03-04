const User = require ('../models/libraryModel.js')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')

const generate = require('../utility/generateToken');

const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = req.user;

        // Check if the logged-in user is an admin
        if ( user.isAdmin == true ) {
            const userExists = await User.findOne({ email: email });

            if (userExists) {
                return res.status(409).json({ error: 'User Already Exists' });
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            const library_user = await User.create({
                name: name,
                email: email,
                password: hashedPassword,
            });
        
        if (library_user) {
            return res.status(201).json({
                _id: library_user._id,
                name: library_user.name,
                email: library_user.email,
                password: library_user.password,
                isAdmin: library_user.isAdmin,
            })
        }
        else {
            return res.staus(400).json({message: "Invalid User"});
        }
    }
        else {
            return res.status(401).json({ message: "Unauthorized"})
        }
    }

        catch (error) {
            res.status(500).json({
                error: error.message,
                stack: error.stack
            });
        }
    };

       

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email:email});
        if (!user) {
            return res.status(400).json({message: 'User  doesn\'t exist'})
        }

        const matchedPassword = await bcrypt.compare(password, user.password);

        if (user && matchedPassword){
            generate(res, user._id);
            return res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            })
        } else {
            return res.status(400).json ({ message: "Wrong email or password"})
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        })
        
    }

}

const logoutUser = async (req, res) => {
    try {

        res.cookie("jwt", "", {
            httpOnly: true,
            expires: new Date(0)
        });

        return res.status(200).json({ message: "User Logged Out"});

    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        
        })
    }
}


const deleteUser = async (req, res) => {
    try {
        const user = req.user;

        if (user.isAdmin) {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "No such user" });
            }

            const deletedUser = await User.findOneAndDelete({ _id: id });

            if (!deletedUser) {
                return res.status(400).json({ error: "No such user" });
            }

            return res.status(200).json({ message: "User Successfully Deleted" });
        } else {
            // Admin not logged in, return unauthorized
            return res.status(401).json({ message: "Unauthorized" });
        }

    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}

const getAllUserProfiles = async (req, res) => {
    const user = req.user;

    if (user.isAdmin) {
        // Admin is logged in, proceed with fetching user profiles
        const allUsers = await User.find({}, 'password -createdAt -updatedAt -__v');
        return res.status(200).json(allUsers);
    } else {
        // Admin not logged in, return unauthorized
        return res.status(401).json({ message: "Unauthorized" });
    }
}
const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the provided ID is a valid mongoose ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Find the specific user profile by its ID
        const userProfile = await User.findById(id).select('-createdAt -updatedAt -__v password ');

        if (!userProfile) {
            return res.status(404).json({ error: "User profile not found" });
        }

        return res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};


const updateUser = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        // Check if the logged-in user is an admin or the owner of the profile
        if (user.isAdmin || user._id.toString() === id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid user ID" });
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: id }, { ...req.body }, { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            return res.status(200).json(updatedUser);
        } else {
            // User is not an admin and not the owner of the profile
            return res.status(401).json({ message: "Unauthorized" });
        }

    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

module.exports = {  createUser, 
                    loginUser, 
                    logoutUser, 
                    getUserProfile,
                    deleteUser,
                    getAllUserProfiles,
                    updateUser}