const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// 1. Ambal semua dompet milik user yang sedang login
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

// 2. Tambah dompet baru (DENGAN OTOMATIS TRANSAKSI SALDO AWAL)
router.post("/", authenticateToken, async (req, res) => {
  // Menggunakan client khusus dari pool untuk mengisolasi Database Transaction
  const client = await pool.connect();
  try {
    const { name, account_number, balance, color } = req.body;
    const userId = req.user.id;
    const initialBalance = parseFloat(balance) || 0;

    // Memulai Transaksi Database
    await client.query("BEGIN");

    // A. Masukkan data dompet baru ke tabel wallets
    const walletResult = await client.query(
      "INSERT INTO wallets (name, account_number, balance, color, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, account_number, initialBalance, color || "bg-indigo-600", userId],
    );
    const newWallet = walletResult.rows[0];

    // B. JIKA saldo awal lebih besar dari 0, buatkan data transaksi otomatis
    if (initialBalance > 0) {
      // Cari ID kategori bertipe 'income' milik user ini atau kategori bawaan sistem (user_id IS NULL)
      const categoryCheck = await client.query(
        "SELECT id FROM categories WHERE type = 'income' AND (user_id = $1 OR user_id IS NULL) LIMIT 1",
        [userId],
      );

      let categoryId;

      if (categoryCheck.rows.length > 0) {
        categoryId = categoryCheck.rows[0].id;
      } else {
        // Antisipasi jika user belum memiliki kategori tipe income sama sekali, buatkan otomatis
        const newCategory = await client.query(
          "INSERT INTO categories (name, type, user_id) VALUES ($1, $2, $3) RETURNING id",
          ["Pemasukan", "income", userId],
        );
        categoryId = newCategory.rows[0].id;
      }

      // Masukkan baris baru ke tabel transactions sebagai record "Saldo Awal"
      await client.query(
        `INSERT INTO transactions (amount, description, transaction_date, category_id, wallet_id, user_id) 
         VALUES ($1, $2, NOW(), $3, $4, $5)`,
        [
          initialBalance,
          `Saldo Awal - ${name}`,
          categoryId,
          newWallet.id,
          userId,
        ],
      );
    }

    // Jika semua proses di atas sukses tanpa error, simpan permanen ke database
    await client.query("COMMIT");
    res.json(newWallet);
  } catch (err) {
    // Jika ada satu saja proses yang gagal, batalkan seluruh rangkaian insert di atas
    await client.query("ROLLBACK");
    console.error("Error saat membuat dompet & saldo awal:", err.message);
    res.status(500).send("Gagal membuat dompet baru");
  } finally {
    // Selalu lepaskan client kembali ke pool agar tidak terjadi memory leak
    client.release();
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
      return res.status(403).json({
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
      return res.status(403).json({
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
