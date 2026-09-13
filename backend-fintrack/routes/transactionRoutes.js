const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// 1. Ambil semua transaksi user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let queryText = `
      SELECT t.*, c.name AS category, c.type, w.name AS wallet_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      WHERE t.user_id = $1
    `;
    const queryParams = [userId];
    let paramIndex = 2;

    if (month && month !== "All") {
      queryText += ` AND EXTRACT(MONTH FROM t.transaction_date) = $${paramIndex}`;
      queryParams.push(parseInt(month));
      paramIndex++;
    }
    if (year && year !== "All") {
      queryText += ` AND EXTRACT(YEAR FROM t.transaction_date) = $${paramIndex}`;
      queryParams.push(parseInt(year));
      paramIndex++;
    }

    queryText += ` ORDER BY t.transaction_date DESC, t.id DESC`;
    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Gagal mengambil data transaksi");
  }
});

// 2. Ambil kategori
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC",
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Gagal mengambil data kategori");
  }
});

// 3. TAMBAH TRANSAKSI (Dengan Validasi Kecukupan Saldo)
router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, description, category_id, wallet_id, transaction_date } =
      req.body;
    const userId = req.user.id;
    const numericAmount = parseFloat(amount);

    await client.query("BEGIN");

    if (wallet_id) {
      // Cek saldo dompet saat ini
      const walletCheck = await client.query(
        "SELECT balance FROM wallets WHERE id = $1 AND user_id = $2",
        [wallet_id, userId],
      );

      if (walletCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Dompet tidak ditemukan." });
      }

      const currentBalance = parseFloat(walletCheck.rows[0].balance);

      // Jika nominal bernilai minus (pengeluaran) dan saldo kurang, cegah transaksi
      if (currentBalance + numericAmount < 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({
            message:
              "Saldo dompet tidak mencukupi untuk melakukan transaksi ini.",
          });
      }

      // Update saldo dompet
      await client.query(
        "UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_id = $3",
        [numericAmount, wallet_id, userId],
      );
    }

    const newTransaction = await client.query(
      "INSERT INTO transactions (amount, description, category_id, wallet_id, user_id, transaction_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        numericAmount,
        description,
        category_id,
        wallet_id,
        userId,
        transaction_date,
      ],
    );

    await client.query("COMMIT");
    res.json(newTransaction.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Gagal menyimpan transaksi");
  } finally {
    client.release();
  }
});

// 4. HAPUS TRANSAKSI (Kembalikan Saldo)
router.delete("/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query("BEGIN");

    const transCheck = await client.query(
      "SELECT amount, wallet_id FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (transCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    const { amount, wallet_id } = transCheck.rows[0];

    if (wallet_id) {
      await client.query(
        "UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_id = $3",
        [amount, wallet_id, userId],
      );
    }

    await client.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    await client.query("COMMIT");
    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Gagal menghapus transaksi");
  } finally {
    client.release();
  }
});

// 5. Tambah Kategori
router.post("/categories", authenticateToken, async (req, res) => {
  try {
    const { name, type } = req.body;
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

// 6. EDIT TRANSAKSI (Dengan Validasi Kecukupan Saldo Sisa)
router.put("/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { amount, description, category_id, wallet_id } = req.body;
    const userId = req.user.id;
    const newAmount = parseFloat(amount);

    await client.query("BEGIN");

    // Ambil data lama transaksi
    const oldCheck = await client.query(
      "SELECT amount, wallet_id FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    if (oldCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    const oldTrans = oldCheck.rows[0];

    // Kembalikan saldo lama sementara untuk pengecekan
    if (oldTrans.wallet_id) {
      await client.query(
        "UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_id = $3",
        [oldTrans.amount, oldTrans.wallet_id, userId],
      );
    }

    // Cek saldo dompet target setelah pembatalan transaksi lama
    if (wallet_id) {
      const targetWallet = await client.query(
        "SELECT balance FROM wallets WHERE id = $1 AND user_id = $2",
        [wallet_id, userId],
      );

      if (targetWallet.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Dompet tidak ditemukan." });
      }

      const availableBalance = parseFloat(targetWallet.rows[0].balance);

      if (availableBalance + newAmount < 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({
            message:
              "Saldo dompet tidak mencukupi untuk pembaruan transaksi ini.",
          });
      }

      // Terapkan penyesuaian nominal baru ke dompet target
      await client.query(
        "UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_id = $3",
        [newAmount, wallet_id, userId],
      );
    }

    // Update record transaksi
    const result = await client.query(
      "UPDATE transactions SET amount = $1, description = $2, category_id = $3, wallet_id = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [newAmount, description, category_id, wallet_id, id, userId],
    );

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Gagal memperbarui transaksi");
  } finally {
    client.release();
  }
});

module.exports = router;
