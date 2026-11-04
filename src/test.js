process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("test working");
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running");
});

// const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
// const db = new sqlite3.Database("database.db");
// const app = express();

// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("test2 working");
// });

// app.listen(3000, "127.0.0.1", () => {
//     console.log("running on http://127.0.0.1:3000");
// });