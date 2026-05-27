const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// 1. Ambil semua transaksi user (Mendukung filter dinamis & opsi 'All')
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let queryText = `
      SELECT t.*, c.name AS category, c.type 
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;

    const queryParams = [userId];
    let paramIndex = 2;

    // Hanya tambahkan filter BULAN jika dikirim dan nilainya bukan 'All'
    if (month && month !== "All") {
      queryText += ` AND EXTRACT(MONTH FROM t.transaction_date) = $${paramIndex}`;
      queryParams.push(parseInt(month));
      paramIndex++;
    }

    // Hanya tambahkan filter TAHUN jika dikirim dan nilainya bukan 'All'
    if (year && year !== "All") {
      queryText += ` AND EXTRACT(YEAR FROM t.transaction_date) = $${paramIndex}`;
      queryParams.push(parseInt(year));
      paramIndex++;
    }

    queryText += ` ORDER BY t.transaction_date DESC`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal mengambil data transaksi");
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
    const { amount, description, category_id, wallet_id, transaction_date } =
      req.body;
    const userId = req.user.id;
    const newTransaction = await pool.query(
      "INSERT INTO transactions (amount, description, category_id, wallet_id, user_id, transaction_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [amount, description, category_id, wallet_id, userId, transaction_date],
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message); // menampilkan detail jika error
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

// 6. endpoint edit transaksi berdasarkan ID
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category_id, wallet_id } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      "UPDATE transactions SET amount = $1, description = $2, category_id = $3, wallet_id = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [amount, description, category_id, wallet_id, id, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal memperbarui transaksi");
  }
});

module.exports = router;
