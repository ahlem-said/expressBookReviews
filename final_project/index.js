const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();


// Middleware to read JSON body
app.use(express.json());


// Session configuration for customer routes
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true
    })
);


// Authentication middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {

    if (req.session.authorization) {

        const token = req.session.authorization.accessToken;

        jwt.verify(token, "access-secret-key", (err, decoded) => {

            if (err) {
                return res.status(403).json({
                    message: "Invalid token"
                });
            }

            req.user = decoded;
            next();

        });

    } else {

        return res.status(401).json({
            message: "User not logged in"
        });

    }

});


// Routes for registered users
app.use("/customer", customer_routes);


// Routes for public users
app.use("/", genl_routes);


// Server port
const PORT = 5000;

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});