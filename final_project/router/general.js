const express = require("express");
const axios = require("axios");

const general = express.Router();

const books = require("./booksdb.js");

const users = [];

const booksURL = "http://localhost:5000";


// ===============================
// LOGIN
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
// GET ALL BOOKS
// Task 1
// ===============================

general.get("/books", (req, res) => {

    res.status(200).json(books);

});


// ===============================
// ASYNC GET ALL BOOKS
// Task 10
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
// GET BOOK BY ISBN
// Task 2
// ===============================

general.get("/books/isbn/:isbn", (req,res)=>{

    const isbn = req.params.isbn;

    const book = books[isbn];


    if(!book){

        return res.status(404).json({

            message:"Book not found"

        });

    }


    res.status(200).json(book);

});


// ===============================
// ASYNC ISBN
// Task 11
// ===============================

general.get("/async/books/isbn/:isbn", async(req,res)=>{

    try{

        const isbn = req.params.isbn;


        const response = await axios.get(
            `${booksURL}/books/isbn/${isbn}`
        );


        res.status(200).json(response.data);


    }catch(error){


        res.status(500).json({

            message:"Error fetching ISBN",
            error:error.message

        });

    }

});


// ===============================
// GET BOOKS BY AUTHOR
// Task 3
// ===============================

general.get("/books/author/:author",(req,res)=>{

    try {

        const author = req.params.author;


        if(!author){

            return res.status(400).json({

                message:"Author is required"

            });

        }


        const result = Object.keys(books)
        .filter(isbn => {

            const book = books[isbn];

            return book.author &&
                book.author
                .toLowerCase()
                .includes(author.toLowerCase());

        })
        .map(isbn => books[isbn]);



        if(result.length === 0){

            return res.status(404).json({

                message:"No books found for this author"

            });

        }


        res.status(200).json(result);


    }catch(error){


        res.status(500).json({

            message:"Error retrieving books by author",
            error:error.message

        });

    }

});


// ===============================
// ASYNC AUTHOR
// Task 12
// ===============================

general.get("/async/books/author/:author",async(req,res)=>{

    try{

        const author=req.params.author;


        const response = await axios.get(
            `${booksURL}/books/author/${author}`
        );


        res.status(200).json(response.data);


    }catch(error){


        res.status(
            error.response?.status || 500
        )
        .json({

            message:"Error fetching books by author"

        });

    }

});


// Async Author version
general.get("/async/books/author/:author",async(req,res)=>{


    try{


        const author=req.params.author;


        const response=await axios.get(
            `http://localhost:5000/books/author/${author}`
        );


        res.status(200).json(response.data);


    }catch(error){

        res.status(500).json({
            message:"Error fetching author",
            error:error.message
        });

    }


});






// ===============================
// Task 4 + Task 13
// Search by Title
// ===============================


general.get("/books/title/:title",(req,res)=>{


    const title=req.params.title;


    let result=[];


    Object.keys(books).forEach(isbn=>{


        if(
            books[isbn].title &&
            books[isbn].title
            .toLowerCase()
            .includes(title.toLowerCase())
        ){

            result.push(books[isbn]);

        }


    });


    res.status(200).json(result);


});




// Async Title version
general.get("/async/books/title/:title",async(req,res)=>{


    try{


        const title=req.params.title;


        const response=await axios.get(
            `http://localhost:5000/books/title/${title}`
        );


        res.status(200).json(response.data);


    }catch(error){

        res.status(500).json({
            message:"Error fetching title",
            error:error.message
        });

    }


});





// Register User

general.post("/register",(req,res)=>{


    const username=req.body.username;
    const password=req.body.password;


    if(!username || !password){

        return res.status(400).json({
            message:"Username and password required"
        });

    }


    users.push({
        username,
        password
    });


    res.status(200).json({
        message:"User registered successfully"
    });


});
// ===============================
// Add Review
// ===============================

general.post("/books/review/:id", (req, res) => {

    const id = req.params.id;

    const { username, review } = req.body;

    const book = books[id];

    if(!book){
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if(!username || !review){
        return res.status(400).json({
            message: "Username and review are required"
        });
    }

if (!Array.isArray(book.reviews)) {
    book.reviews = [];
}

book.reviews.push({
    username: username,
    review: review
});

    res.status(200).json({
        message: "Review added successfully",
        reviews: book.reviews
    });

});



// ===============================
// Modify Review
// ===============================

general.put("/books/review/:id", (req, res) => {

    const id = req.params.id;

    const { username, review } = req.body;

    const book = books[id];


    if(!book){
        return res.status(404).json({
            message: "Book not found"
        });
    }


    if(!book.reviews){
        return res.status(404).json({
            message: "No reviews found"
        });
    }


    const userReview = book.reviews.find(
        r => r.username === username
    );


    if(!userReview){
        return res.status(404).json({
            message: "Review not found for this user"
        });
    }


    userReview.review = review;


    res.status(200).json({
        message: "Review updated successfully",
        reviews: book.reviews
    });

});
// ===============================
// Delete Review
// ===============================

general.delete("/books/review/:id", (req, res) => {

    const id = req.params.id;

    const { username } = req.body;

    const book = books[id];


    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }


    if (!Array.isArray(book.reviews)) {
        return res.status(404).json({
            message: "No reviews found"
        });
    }


    const reviewIndex = book.reviews.findIndex(
        r => r.username === username
    );


    if (reviewIndex === -1) {
        return res.status(404).json({
            message: "Review not found"
        });
    }


    book.reviews.splice(reviewIndex, 1);


    res.status(200).json({
        message: "Review deleted successfully",
        reviews: book.reviews
    });

});
// ===============================
// View Book Reviews
// ===============================

general.get("/books/review/:id", (req, res) => {

    const id = req.params.id;

    const book = books[id];

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json({
        title: book.title,
        reviews: Array.isArray(book.reviews) ? book.reviews : []
    });

});
module.exports.general = general;
module.exports.users = users;
