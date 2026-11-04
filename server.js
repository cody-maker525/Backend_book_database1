process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});

console.log("FILE STARTED");
const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db", (err) => {
    if (err) {
        console.error(" Database connection failed:", err.message);
        process.exit(1);
    }
    console.log("Database connected successfully");
});

app.use(express.json());

app.get("/", (req, res) => {
    // to check if server is running
    console.log("GET / route was hit");
    return res.send("Server is running");

});




const sql = `
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER,
    status TEXT CHECK(status IN ('to-read', 'reading', 'completed'))
);
`;

db.run(sql, (err) => {
    //to check if table is built
    if (err) {
        console.error("Create table failed", err.message);
        return;
    }
    console.log("books table created");
});

app.get("/books", (req, res) => {
    const status = req.query.status; //query url matching
    //IF STATUS ONLY
    if (status) {
        db.all(
            "SELECT * FROM books WHERE status = ?",
            [status],
            function (err, rows) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                return res.json(rows);
            },
        );
        return;
    }
    //IF NO STATUS STILL PRINT
    db.all("SELECT * FROM books", [], function (err, rows) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    }); // return all files in json                     
});
app.get("/books/:id", (req, res) => {
    const id = req.params.id;

    db.get("SELECT * FROM books WHERE id = ?", [id], function (err, row) {
        if (err) {
            return res.status(500).json({ "Database failed to work": err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "404 not found" });
        }
        res.json(row); // return row
    });
});


app.post("/books", (req, res) => {
    const { title, author, year, status } = req.body;
    // validate all words there
    if (!title || !author || !status) {
        return res.status(400).json({ error: "Title, author and status required" });
    }
    //validate status
    const allowedStatus = ["to-read", "reading", "completed"];
    if (!allowedStatus.includes(status)) {
        return res
            .status(400)
            .json({ error: "Status must be 'to-read', 'reading' or'completed' " });
    }
    //to insert
    const sql =
        "INSERT INTO books (title, author, year, status) VALUES (?,?,?,?)";
    db.run(sql, [title, author, year ?? null, status], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log("New book inserted");
        return res.status(201).json({ id: this.lastID });
    });
});

app.put("/books/:id", (req, res) => {
    const id = req.params.id;
    const { title, year, status } = req.body; // shortcut to writing out each variable

    const allowedStatus = ["to-read", "reading", "completed"];
    if (status && !allowedStatus.includes(status)) {
        return res
            .status(400)
            .json({ error: "Status must be 'to-read', 'reading' or'completed'" });
    }

    db.get("SELECT * FROM books WHERE id = ?", [id], function (err, row) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "404 book not found" });
        }

        const sql = "UPDATE books SET title=?, year=?,status=? WHERE id =?";
        db.run(sql, [title, year ?? null, status, id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            db.get(
                "SELECT * FROM books WHERE id = ?",
                [id],
                function (err, updatedRow) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    console.log("Book updated successfully");
                    res.json(updatedRow);
                },
            );
        });
    });
});

app.delete("/books/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM books WHERE id=?";

    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "404 not found" });
        }
        console.log("Rows deleted:", this.changes);
        res.json({ message: "Book deleted successfully" });
    });
});


// app.listen(3000, () => {
//     // to listen to port
//     console.log("Listening on port 3000");
// });
app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
}).on("error", (err) => {
    console.error("Server failed to start:", err);
});
// setInterval(() => { }, 1000);
console.log("10");

