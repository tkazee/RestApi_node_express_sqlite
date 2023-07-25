const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", (request, response) => {});
//Get book API
app.get("/books/:bookId/", async (req, res) => {
  const { bookId } = req.params;
  const getBookQuery = `SELECT * FROM book where book_id= ${bookId};`;
  const book = await db.get(getBookQuery);
  res.send(book);
});
//ADD BOOK

app.use(express.json()); //middleware
app.post("/books/", async (req, res) => {
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO 
    book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
    (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
    );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse;
  res.send({ bookId: bookId });
});

//UPDATE BOOK API
app.put('/books/:bookId/',async (req,res)=>{
    const {bookId} = req.params;
    const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`; 
  await db.run(updateBookQuery);
  res.send('Updated Successfully ');

});

//DELETE BOOK API 
app.delete("/books/:bookId/",async (req,res)=>{
    const {bookId}=req.params;
    const deleteBookQuery = ` 
    DELETE FROM 
    book
    WHERE 
    book_id = ${bookId};
    `;
    await db.run(deleteBookQuery);
    res.send('Book Deleted Successfully');

});

//Get Author Book;

app.get('/authors/:authorId/books', async(req,res)=>{
    const {authorId}= req.params;
    const authorBookQuery=` 
    select * from book where author_id=${authorId}
    `;
    const bookArray = await db.all(authorBookQuery);
    res.send(bookArray);
})
