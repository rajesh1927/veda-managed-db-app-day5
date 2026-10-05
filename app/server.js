require("dotenv").config();

const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    application: "Managed Database Demo",
    status: "running"
  });
});

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "healthy",
      database: "connected",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve users"
    });
  }
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "name and email are required"
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create user"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Application running on port ${PORT}`);
});
