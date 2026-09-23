const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    const currentYear = parseInt(year) || new Date().getFullYear();

    const queryText = `
      SELECT 
        b.id,
        b.category_id,
        c.name AS category_name,
        b.amount_limit,
        b.month,
        b.year,
        COALESCE(SUM(ABS(t.amount)), 0) AS spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = b.user_id
        AND EXTRACT(MONTH FROM t.transaction_date) = b.month
        AND EXTRACT(YEAR FROM t.transaction_date) = b.year
      WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
      GROUP BY b.id, c.name
      ORDER BY c.name ASC
    `;

    const result = await pool.query(queryText, [
      userId,
      currentMonth,
      currentYear,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching budgets:", err.message);
    res.status(500).send("Gagal mengambil data anggaran");
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { category_id, amount_limit, month, year } = req.body;
    const userId = req.user.id;

    if (!category_id || !amount_limit || !month || !year) {
      return res.status(400).json({ message: "Semua field harus diisi." });
    }

    const numericLimit = parseFloat(amount_limit);

    const queryText = `
      INSERT INTO budgets (user_id, category_id, amount_limit, month, year)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, category_id, month, year)
      DO UPDATE SET amount_limit = EXCLUDED.amount_limit
      RETURNING *
    `;

    const result = await pool.query(queryText, [
      userId,
      category_id,
      numericLimit,
      parseInt(month),
      parseInt(year),
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error saving budget:", err.message);
    res.status(500).send("Gagal menyimpan batas anggaran");
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Budget tidak ditemukan." });
    }

    res.json({ message: "Batas anggaran berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting budget:", err.message);
    res.status(500).send("Gagal menghapus anggaran");
  }
});

module.exports = router;
