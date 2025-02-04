require('dotenv').config();
const send =  require('../utils/Response');
const argon2 = require('argon2');
const User = require('../models/User');
const generateToken = require('../utils/TokenGenerator');

//User Login
exports.userLogin = async (req, res) => {
    try {
        
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({email: email});

        //Checks if the  is already registered
        if (!existingUser) {
            return send.sendNotFoundResponse(res, "Invalid Credential!");
        }

        //Verifies the password using argon library
        const verifiedPassword = await argon2.verify(existingUser.password, password);

        if(!verifiedPassword){
            return send.sendUnAuthResponse(res, "Invalid Credentials!")
        }
        
        //Signs the credential into jsonwebtoken
        const data = {
            _id: existingUser.id,
            name: existingUser.firstname + ' ' + existingUser.middlename + ' ' + existingUser.lastname,
            isAdmin: existingUser.isAdmin,
            token:  generateToken.generateToken(existingUser.id),
            createdAt: existingUser.createdAt
        }

        //Returns the message
        return send.sendResponse(res, 200, data, "Logged in successfully!")

    } catch (error) {
        //Error and Debugging tool
        return send.sendISEResponse(res, error)
    }
};

exports.userRegister = async(req, res) => {
    try {
        const {  firstname, middlename, lastname, email, password, confirmationpass } = req.body;

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return send.sendBadRequestResponse(res, "User Already Registered!");
        }

        if (password !== confirmationpass) {
            return send.sendBadRequestResponse(res, "Invalid Password!");
        }

        const hashedPassword = await argon2.hash(password, 10);

        const newUser = await User.create({
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            email: email,
            password: hashedPassword
        });

        return send.sendResponse(res, 201, newUser, "User Registered Successfully!");

    } catch (error) {
        return send.sendISEResponse(res, error)
    }
};

exports.getUserProfile = async(req, res) => {
    try {
        const id = req.user.id;

        const userProfile = await User.findById(id).select("-password");

        if (!userProfile) {
            return send.sendNotFoundResponse(res, "User not found!");
        }

        return send.sendResponse(res, 200, userProfile, "Profile Fetched Successfully!");

    } catch (error) {
        return send.sendBadRequestResponse(res, error);
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const { firstname, middlename, lastname, email, password, oldPassword } = req.body;

        const userProfile = await User.findById(id);

        //Sends a common 404 Message when the user is not existing
        if (!userProfile) {
            return send.sendNotFoundResponse(res, "User not found!");
        }

        // Verify old password before allowing password update
        if (password) {
            if (!oldPassword) {
                return send.sendBadRequestResponse(res, "Old password is required to update password.");
            }

            //Boolean checks if the old and new password match
            const isMatch = await argon2.verify(userProfile.password, oldPassword);

            if (!isMatch) {
                return send.sendBadRequestResponse(res, "Invalid old password.");
            }

            //if isMatch is true it would store the new password in the instance of userProfile.password
            userProfile.password = await argon2.hash(password);
        }

        // Update other fields if provided
        userProfile.firstname = firstname || userProfile.firstname;
        userProfile.middlename = middlename || userProfile.middlename;
        userProfile.lastname = lastname || userProfile.lastname;
        userProfile.email = email || userProfile.email;

        const updatedProfile = await userProfile.save();
        
        const data = {
            _id: updatedProfile._id,
            firstname: updatedProfile.firstname,
            middlename: updatedProfile.middlename,
            lastname: updatedProfile.lastname,
            email: updatedProfile.email,
            isAdmin: updatedProfile.isAdmin,
            createdAt: updatedProfile.createdAt,
            token: generateToken.generateToken(updatedProfile._id)
        };

        return send.sendResponse(res, 200, data, "Profile Updated Successfully!");
        
    } catch (error) {
        console.error("Error Updating Profile:", error); // Debugging
        return send.sendBadRequestResponse(res, error.message || "Something went wrong");
    }
};


