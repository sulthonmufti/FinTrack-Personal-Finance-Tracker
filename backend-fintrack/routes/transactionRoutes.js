const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// 1. Ambil semua transaksi user (endpoint /api/transactions/)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT t.*, c.name AS category, c.type 
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.transaction_date DESC`,
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 2. Ambil semua kategori (untuk dropdown) (endpoint /api/transactions/categories)
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Pastikan menggunakan middleware authenticateToken
    const result = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC",
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Gagal mengambil data kategori");
  }
});

// 3. Tambah transaksi baru (endpoint /api/transactions/)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { amount, description, category_id } = req.body;
    const userId = req.user.id;
    const newTransaction = await pool.query(
      "INSERT INTO transactions (amount, description, category_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [amount, description, category_id, userId],
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    res.status(500).send("Gagal menyimpan transaksi");
  }
});

// 4. endpoint hapus transaksi berdasarkan ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal menghapus transaksi");
  }
});

// 5. endpoint tambah kategori baru
router.post("/categories", authenticateToken, async (req, res) => {
  try {
    const { name, type } = req.body; // type: 'income' atau 'expense'
    const userId = req.user.id;

    const newCategory = await pool.query(
      "INSERT INTO categories (name, type, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, type, userId],
    );

    res.json(newCategory.rows[0]);
  } catch (err) {
    res.status(500).send("Gagal menambah kategori");
  }
});

module.exports = router;
