const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// GET /api/reports - Mengambil data analisis keuangan
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Ambil query parameter filter (Default ke 30 hari terakhir jika kosong)
    const { startDate, endDate, walletId } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({
          message: "Tanggal awal (startDate) dan akhir (endDate) harus diisi.",
        });
    }

    // 1. Base Query Conditions
    let queryCondition = `WHERE t.user_id = $1 AND t.transaction_date BETWEEN $2 AND $3`;
    const queryParams = [userId, startDate, endDate];
    let paramIndex = 4;

    // Jika ada filter dompet spesifik
    if (walletId && walletId !== "All") {
      queryCondition += ` AND t.wallet_id = $${paramIndex}`;
      queryParams.push(parseInt(walletId));
      paramIndex++;
    }

    // --- QUERY A: Total Ringkasan (Pemasukan vs Pengeluaran) ---
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END), 0)::FLOAT AS total_income,
        COALESCE(SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END), 0)::FLOAT AS total_expense
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${queryCondition}
    `;

    // --- QUERY B: Breakdown per Kategori ---
    const categoryQuery = `
      SELECT 
        c.name AS name,
        c.type AS type,
        SUM(t.amount)::FLOAT AS value
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${queryCondition}
      GROUP BY c.name, c.type
      ORDER BY value DESC
    `;

    // --- QUERY C: Tren Arus Kas dari waktu ke waktu (Grup per tanggal) ---
    const trendQuery = `
      SELECT 
        TO_CHAR(t.transaction_date, 'YYYY-MM-DD') AS date,
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END), 0)::FLOAT AS income,
        COALESCE(SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END), 0)::FLOAT AS expense
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${queryCondition}
      GROUP BY TO_CHAR(t.transaction_date, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    // Jalankan semua query secara bersamaan (Parallel execution)
    const [summaryResult, categoryResult, trendResult] = await Promise.all([
      pool.query(summaryQuery, queryParams),
      pool.query(categoryQuery, queryParams),
      pool.query(trendQuery, queryParams),
    ]);

    // Kirim response gabungan ke frontend
    res.json({
      summary: summaryResult.rows[0],
      categories: categoryResult.rows,
      trends: trendResult.rows,
    });
  } catch (err) {
    console.error("Error pada Report API:", err.message);
    res.status(500).send("Gagal memuat data laporan keuangan");
  }
});

module.exports = router;
