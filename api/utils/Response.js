exports.sendResponse = async (res, status, info, msg) => {
    return res.status(status).json({
        data: info,
        message: msg
    });
}

exports.sendNotFoundResponse = async (res, msg) => {
    return res.status(404).json({
        message: msg
    });
}

exports.sendBadRequestResponse = async (res, msg) => {
    return res.status(400).json({
        message: msg
    });
}

exports.sendUnAuthResponse = async (res, msg) => {
    return res.status(401).json({
        message: msg
    });
}

exports.sendISEResponse = async (res, error) => {
    return res.status(500).json({
        message: "Internal Server Error",
        err: error.message
    });
}

