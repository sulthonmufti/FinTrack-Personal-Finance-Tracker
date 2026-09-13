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

// 2. Tambah dompet baru (DENGAN OTOMATIS TRANSAKSI SALDO AWAL)
router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, account_number, balance, color } = req.body;
    const userId = req.user.id;
    const initialBalance = parseFloat(balance) || 0;

    await client.query("BEGIN");

    const walletResult = await client.query(
      "INSERT INTO wallets (name, account_number, balance, color, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, account_number, initialBalance, color || "bg-indigo-600", userId],
    );
    const newWallet = walletResult.rows[0];

    if (initialBalance > 0) {
      const categoryCheck = await client.query(
        "SELECT id FROM categories WHERE type = 'income' AND (user_id = $1 OR user_id IS NULL) LIMIT 1",
        [userId],
      );

      let categoryId;

      if (categoryCheck.rows.length > 0) {
        categoryId = categoryCheck.rows[0].id;
      } else {
        const newCategory = await client.query(
          "INSERT INTO categories (name, type, user_id) VALUES ($1, $2, $3) RETURNING id",
          ["Pemasukan", "income", userId],
        );
        categoryId = newCategory.rows[0].id;
      }

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

    await client.query("COMMIT");
    res.json(newWallet);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saat membuat dompet & saldo awal:", err.message);
    res.status(500).send("Gagal membuat dompet baru");
  } finally {
    client.release();
  }
});

// 3. TRANSFER ANTAR DOMPET (ENDPOINT BARU)
router.post("/transfer", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { from_wallet_id, to_wallet_id, amount } = req.body;
    const userId = req.user.id;
    const transferAmount = parseFloat(amount);

    if (
      !from_wallet_id ||
      !to_wallet_id ||
      isNaN(transferAmount) ||
      transferAmount <= 0
    ) {
      return res.status(400).json({ message: "Data transfer tidak valid." });
    }

    if (String(from_wallet_id) === String(to_wallet_id)) {
      return res
        .status(400)
        .json({ message: "Dompet asal dan dompet tujuan tidak boleh sama." });
    }

    await client.query("BEGIN");

    // Cek keberadaan dan saldo dompet asal
    const sourceWallet = await client.query(
      "SELECT balance FROM wallets WHERE id = $1 AND user_id = $2",
      [from_wallet_id, userId],
    );

    if (sourceWallet.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Dompet asal tidak ditemukan." });
    }

    if (parseFloat(sourceWallet.rows[0].balance) < transferAmount) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Saldo dompet asal tidak mencukupi." });
    }

    // Cek keberadaan dompet tujuan
    const targetWallet = await client.query(
      "SELECT id FROM wallets WHERE id = $1 AND user_id = $2",
      [to_wallet_id, userId],
    );

    if (targetWallet.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Dompet tujuan tidak ditemukan." });
    }

    // Kurangi saldo dompet asal
    await client.query(
      "UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_id = $3",
      [transferAmount, from_wallet_id, userId],
    );

    // Tambah saldo dompet tujuan
    await client.query(
      "UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_id = $3",
      [transferAmount, to_wallet_id, userId],
    );

    await client.query("COMMIT");
    res.json({ message: "Transfer berhasil diproses." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saat memproses transfer:", err.message);
    res.status(500).send("Gagal memproses transfer antar dompet.");
  } finally {
    client.release();
  }
});

// 4. Edit detail dompet
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

// 5. Hapus Dompet
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
