const Order = require('../models/Order');
const Product = require('../models/Product');
const send = require('../utils/Response');

exports.orderProduct = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, shippingPrice, taxPrice, totalPrice, price  } = req.body;

        if (orderItems && orderItems.length ===  0) {
            return send.sendBadRequestResponse(res, "No items found!");
        }

        const order = new Order({
            orderItems, 
            shippingAddress, 
            paymentMethod, 
            shippingPrice, 
            price,
            taxPrice, 
            totalPrice, 
            user: req.user.id 
        });

        const createdOrder =  await order.save();
        return send.sendResponse(res, 201, createdOrder, "Order has been placed!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
}