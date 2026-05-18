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

// gets a score by id
app.get("/scores/:id", (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM scores WHERE id = ?";

  db.get(sql, [id], (error, row) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Score not found" });
    }

    res.status(200).json(row);
  });
});

// GET scores using query parameter
app.get("/scores/search", (req, res) => {
  const minScore = req.query.minScore;

  if (!minScore) {
    return res.status(400).json({ error: "minScore query is required" });
  }

  const sql = "SELECT * FROM scores WHERE score >= ?";

  db.all(sql, [minScore], (error, rows) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(rows);
  });
});

// POST create new score
app.post("/scores", (req, res) => {
  const playerName = req.body.playerName;
  const score = req.body.score;

  // Validation
  if (!playerName) {
    return res.status(400).json({ error: "Player name is required" });
  }

  if (score === undefined) {
    return res.status(400).json({ error: "Score is required" });
  }

  if (typeof score !== "number") {
    return res.status(400).json({ error: "Score must be a number" });
  }

  const sql = "INSERT INTO scores (playerName, score) VALUES (?, ?)";

  db.run(sql, [playerName, score], function (error) {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      message: "Score created successfully",
      id: this.lastID,
    });
  });
});

// PUT update score
app.put("/scores/:id", (req, res) => {
  const id = req.params.id;

  const playerName = req.body.playerName;
  const score = req.body.score;

  // Validation
  if (!playerName) {
    return res.status(400).json({ error: "Player name is required" });
  }

  if (score === undefined) {
    return res.status(400).json({ error: "Score is required" });
  }

  if (typeof score !== "number") {
    return res.status(400).json({ error: "Score must be a number" });
  }

  const sql = "UPDATE scores SET playerName = ?, score = ? WHERE id = ?";

  db.run(sql, [playerName, score, id], function (error) {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Score not found" });
    }

    res.status(200).json({ message: "Score updated successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
