const express = require('express');
const router = express.Router();
const User = require('./models/User');
const { users, hashPasswords } = require('./data/User');
const Product = require('./models/Product');
const products = require('./data/Product');

router.post('/users', async (req, res) => {
    try {
        await User.deleteMany({});
        const hashedUsers = await hashPasswords(users);
        const userSeeder = await User.insertMany(hashedUsers);
        res.send({ userSeeder });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        await Product.deleteMany({});
        const productSeeder = await Product.insertMany(products);
        res.send({ productSeeder });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


module.exports = router;
