const express = require('express');
const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");

let users = require("./general.js").users;

const regd_users = express.Router();
// Check if username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};


// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};



// ===============================
// Task 7: Login registered user
// Endpoint: /customer/login
// ===============================

regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;


    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }


    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }


    const accessToken = jwt.sign(
        {
            username: username
        },
        "access-secret-key",
        {
            expiresIn: "1h"
        }
    );


    // Save user session
    req.session.authorization = {
        accessToken: accessToken,
        username: username
    };


    return res.status(200).json({
        message: "User successfully logged in",
        token: accessToken
    });

});




// ======================================
// Task 8: Add or modify book review
// Endpoint: PUT /customer/auth/review/:isbn
// ======================================

regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;


    // Check login
    if (!req.session.authorization) {
        return res.status(401).json({
            message: "User not logged in"
        });
    }


    const username = req.session.authorization.username;


    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }


    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }


    // Create reviews object if missing
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }



    // Update existing review
    if (books[isbn].reviews[username]) {

        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review updated successfully"
        });

    }



    // Add new review
    books[isbn].reviews[username] = review;


    return res.status(200).json({
        message: "Review added successfully"
    });

});





// ======================================
// Task 9: Delete book review
// Endpoint: DELETE /customer/auth/review/:isbn
// ======================================

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;


    // Check login
    if (!req.session.authorization) {
        return res.status(401).json({
            message: "User not logged in"
        });
    }


    const username = req.session.authorization.username;



    // Check book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }



    // Check review exists
    if (
        !books[isbn].reviews ||
        !books[isbn].reviews[username]
    ) {

        return res.status(404).json({
            message: "Review not found"
        });

    }



    // Delete only user's review
    delete books[isbn].reviews[username];


    return res.status(200).json({
        message: "Review deleted successfully"
    });

});





module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;