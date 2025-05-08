const Logs = require('../models/Logs');
const send = require('../utils/Response');

exports.getLogs = async (req, res) => {
    try {
        const logs = await Logs.find()
            .populate('user', 'firstname middlename lastname email')
            .populate('productId', 'name')
            .sort({ createdAt: -1 }); // Sort by newest first

        return send.sendResponse(res, 200, logs, "Logs retrieved successfully!");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
}; 