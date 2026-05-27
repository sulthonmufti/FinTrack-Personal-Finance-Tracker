const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// 1. Ambil semua dompet milik user yang sedang login
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal mengambil data dompet");
  }
});

// 2. Tambah dompet baru
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, account_number, balance, color } = req.body;
    const userId = req.user.id;

    const newWallet = await pool.query(
      "INSERT INTO wallets (name, account_number, balance, color, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, account_number, balance || 0, color || "bg-indigo-600", userId],
    );
    res.json(newWallet.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal membuat dompet baru");
  }
});

// 3. Edit detail dompet (Nama, No Rekening, Warna Kartu)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, account_number, color } = req.body;
    const userId = req.user.id;

    const updatedWallet = await pool.query(
      "UPDATE wallets SET name = $1, account_number = $2, color = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
      [name, account_number, color, id, userId],
    );

    if (updatedWallet.rows.length === 0) {
      return res
        .status(403)
        .json({
          message: "Dompet tidak ditemukan atau Anda tidak memiliki akses",
        });
    }
    res.json(updatedWallet.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal memperbarui dompet");
  }
});

// 4. Hapus Dompet
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM wallets WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({
          message: "Dompet tidak ditemukan atau Anda tidak memiliki akses",
        });
    }
    res.json({ message: "Dompet berhasil dihapus" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal menghapus dompet");
  }
});

module.exports = router;
