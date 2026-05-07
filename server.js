const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const PORT = 3000;

app.use(express.json());

const db = new sqlite3.Database("./scores.db");

db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerName TEXT NOT NULL,
    score INTEGER NOT NULL
  )
`);

app.get("/", (req, res) => {
  res.send("Game Score Tracker API is active");
});

// GET all scores
app.get("/scores", (req, res) => {
  db.all("SELECT * FROM scores", (error, rows) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
