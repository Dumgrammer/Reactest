require('dotenv').config();
const nodemailer = require('nodemailer');
const send =  require('../utils/Response');
const argon2 = require('argon2');
const User = require('../models/User');
const generateToken = require('../utils/TokenGenerator');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "appgradesolutionsgcccsaco@gmail.com",
      pass: "eyqq yjeo ycqo peat",
    },
    logger: true,
    debug: true, 
  });

// Generate a 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// HTML template for verification email
const getVerificationEmailTemplate = (verificationCode) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 5px;
                    padding: 20px;
                    margin-top: 20px;
                    margin-bottom: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .verification-code {
                    background-color: #2c3e50;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Email Verification</h1>
                </div>
                <p>Thank you for registering! To complete your registration, please use the verification code below:</p>
                
                <div class="verification-code">
                    ${verificationCode}
                </div>
                
                <p>This code will expire in 30 minutes.</p>
                
                <p>If you didn't request this verification code, please ignore this email.</p>
                
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Function to send verification email
const sendVerificationEmail = async (email, verificationCode) => {
    try {
        await transporter.sendMail({
            from: '"Your App Name" <appgradesolutionsgcccsaco@gmail.com>',
            to: email,
            subject: "Email Verification Code",
            html: getVerificationEmailTemplate(verificationCode)
        });
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

//User Login
exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({email: email});

        if (!existingUser) {
            return send.sendNotFoundResponse(res, "Invalid Credential!");
        }

        // Check if user is verified
        if (!existingUser.isVerified) {
            return send.sendUnAuthResponse(res, "Please verify your email first!");
        }

        const verifiedPassword = await argon2.verify(existingUser.password, password);

        if(!verifiedPassword){
            return send.sendUnAuthResponse(res, "Invalid Credentials!")
        }
        
        const data = {
            _id: existingUser.id,
            name: existingUser.firstname + ' ' + existingUser.middlename + ' ' + existingUser.lastname,
            email: existingUser.email,
            isAdmin: existingUser.isAdmin,
            token:  generateToken.generateToken(existingUser.id),
            createdAt: existingUser.createdAt
        }

        return send.sendResponse(res, 200, data, "Logged in successfully!")

    } catch (error) {
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
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // First try to send the verification email
        const emailSent = await sendVerificationEmail(email, verificationCode);
        
        if (!emailSent) {
            return send.sendISEResponse(res, "Failed to send verification email. Please try again.");
        }

        // Only create the user if email was sent successfully
        const newUser = await User.create({
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpires
        });

        return send.sendResponse(res, 201, {
            message: "User Registered Successfully! Please check your email for verification code."
        }, "User Registered Successfully! Please check your email for verification code.");

    } catch (error) {
        // If there's an error, try to clean up any partially created user
        try {
            await User.findOneAndDelete({ email: req.body.email });
        } catch (cleanupError) {
            console.error("Error during cleanup:", cleanupError);
        }
        return send.sendISEResponse(res, error);
    }
};

// Verify user email
exports.verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return send.sendNotFoundResponse(res, "User not found!");
        }

        if (user.isVerified) {
            return send.sendBadRequestResponse(res, "Email already verified!");
        }

        if (!user.verificationCode || !user.verificationCodeExpires) {
            return send.sendBadRequestResponse(res, "No verification code found!");
        }

        if (user.verificationCodeExpires < new Date()) {
            return send.sendBadRequestResponse(res, "Verification code has expired!");
        }

        if (user.verificationCode !== verificationCode) {
            return send.sendBadRequestResponse(res, "Invalid verification code!");
        }

        // Update user verification status
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        return send.sendResponse(res, 200, user, "Email verified successfully!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

// Resend verification code
exports.resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return send.sendNotFoundResponse(res, "User not found!");
        }

        if (user.isVerified) {
            return send.sendBadRequestResponse(res, "Email already verified!");
        }

        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        // Send new verification email
        const emailSent = await sendVerificationEmail(email, verificationCode);
        
        if (!emailSent) {
            return send.sendISEResponse(res, "Failed to send verification email");
        }

        return send.sendResponse(res, 200, {
            message: "New verification code sent successfully!"
        }, "New verification code sent successfully!");

    } catch (error) {
        return send.sendISEResponse(res, error);
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
        const { 
            firstname, 
            middlename, 
            lastname, 
            email, 
            password, 
            oldPassword,
            address 
        } = req.body;

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
        
        // Update address if provided
        if (address) {
            userProfile.address = {
                street: address.street || userProfile.address.street,
                city: address.city || userProfile.address.city,
                postalCode: address.postalCode || userProfile.address.postalCode,
                country: address.country || userProfile.address.country
            };
        }

        const updatedProfile = await userProfile.save();
        
        const data = {
            _id: updatedProfile._id,
            firstname: updatedProfile.firstname,
            middlename: updatedProfile.middlename,
            lastname: updatedProfile.lastname,
            email: updatedProfile.email,
            address: updatedProfile.address,
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


