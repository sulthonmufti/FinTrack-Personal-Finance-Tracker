const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

// Konfigurasi koneksi ke Database PostgreSQL di Docker
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Endpoint untuk cek server
app.get("/", (req, res) => {
  res.send("Server FinTrack di Drive D Berhasil Jalan!");
});

// Endpoint untuk mengambil data transaksi (untuk React nanti)
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.amount, t.description, t.transaction_date, c.name AS category
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ada masalah di server nih");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
