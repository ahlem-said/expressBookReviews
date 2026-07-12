const express = require("express");
const axios = require("axios");

const general = express.Router();

let books = require("./booksdb.js");

const users = [];

const booksURL = "http://localhost:5000";


// ===============================
// Login
// ===============================

general.post("/login", (req, res) => {

    const { username, password } = req.body;

    const user = users.find(
        u => u.username === username &&
             u.password === password
    );


    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }


    res.status(200).json({
        message: "Login successful"
    });

});



// ===============================
// Task 1
// Get all books
// ===============================

general.get("/books", (req, res) => {

    res.status(200).json(books);

});



// ===============================
// Task 10
// Async get all books using Axios
// ===============================

general.get("/async/books", async (req, res) => {

    try {

        const response = await axios.get(
            `${booksURL}/books`
        );


        res.status(200).json(response.data);


    } catch(error) {

        res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });

    }

});



// ===============================
// Task 2
// Get book by ISBN
// ===============================

general.get("/books/isbn/:isbn", (req, res) => {


    const isbn = req.params.isbn;


    const book = books[isbn];


    if (!book) {

        return res.status(404).json({
            message: "Book not found"
        });

    }


    res.status(200).json(book);


});



// ===============================
// Task 11
// Async ISBN using Axios
// ===============================

general.get("/async/books/isbn/:isbn", async(req,res)=>{


    try {

        const isbn = req.params.isbn;


        const response = await axios.get(
            `${booksURL}/books/isbn/${isbn}`
        );


        res.status(200).json(response.data);


    } catch(error) {


        res.status(500).json({

            message:"Error fetching ISBN",
            error:error.message

        });


    }


});
