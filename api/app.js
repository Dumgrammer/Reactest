require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const parser = require('body-parser');
const passport = require('./config/passportConfig');
const session = require('express-session');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Initialize session middleware
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false, 
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"),
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
            return res.status(200).json({

            });
        }
        next();
});

mongoose.connect(process.env.MONGODB_CONN)
.then(()=> {
    console.log("Database connected")
})
.catch((err) => {
    console.error(err);
});
mongoose.Promise = global.Promise;

const databaseSeeder = require('./seeder');
const userRoutes = require('./routes/User');
const productRoutes = require('./routes/Product');
const orderRoutes = require('./routes/Order');
const logsRoutes = require('./routes/Logs');

app.use('/api/seed', databaseSeeder);


//URL Path  for Users
app.use('/api/users', userRoutes);
//URL Path for Products
app.use('/api/products', productRoutes);
//URL Path for Orders
app.use('/api/orders', orderRoutes);

//URL Path for Logs
app.use('/api/logs', logsRoutes);

//paypal integration
app.use('/api/config/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT);
});

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});


//Error handler for functions
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;