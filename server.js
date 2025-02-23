// server.js - Backend dengan Express.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Endpoint untuk menerima pesanan top-up
app.post("/topup", async (req, res) => {
  const { playerId, serverId, diamond, paymentMethod } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO transactions (player_id, server_id, diamond, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [playerId, serverId, diamond, paymentMethod, "pending"]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Endpoint untuk melihat transaksi
app.get("/transactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
