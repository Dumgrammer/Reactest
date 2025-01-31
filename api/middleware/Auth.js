require('dotenv').config();
const jwt = require('jsonwebtoken');
const send = require('../utils/Response');
const User = require('../models/User');

const protect = async (req, res, next) =>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
            req.user = await User.findById(decodedToken.id).select("-password");
            next();
        } catch (error) {
            return send.sendUnAuthResponse(res, "Unauthorized Access");
        }
    }
    if (!token) {
        return send.sendUnAuthResponse(res, "Unauthorized Access");
    }
}

module.exports = protect;