const express = require("express");
require("dotenv").config();

const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
//console.log("Cek Secret:", JWT_SECRET);

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi koneksi ke Database PostgreSQL di Docker
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware untuk verifikasi Token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Token biasanya dikirim dengan format "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak, token tidak ada!" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token tidak valid atau sudah kadaluwarsa!" });
    }
    // Simpan data user dari token ke dalam request agar bisa dipakai di endpoint
    req.user = user;
    next(); // Lanjut ke fungsi endpoint berikutnya
  });
};

// Endpoint untuk cek server
app.get("/", (req, res) => {
  res.send("Server FinTrack di Drive D Berhasil Jalan!");
});

// Endpoint untuk mengambil data transaksi (untuk React nanti) + autentikasi
app.get("/api/transactions", authenticateToken, async (req, res) => {
  try {
    // Ambil ID dari token yang sudah diverifikasi middleware
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

// Endpoint untuk mengambil daftar kategori (untuk dropdown di Modal)
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal mengambil data kategori");
  }
});

//endpoint untuk menambahkan data transaksi (post)
app.post("/api/transactions", authenticateToken, async (req, res) => {
  try {
    const { amount, description, category_id } = req.body;
    const userId = req.user.id; // Ini mengambil ID dari Token JWT kamu

    if (!amount || !description || !category_id) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // UPDATE: Tambahkan user_id di kolom dan di VALUES ($4)
    const newTransaction = await pool.query(
      "INSERT INTO transactions (amount, description, category_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [amount, description, category_id, userId], // Pastikan userId dimasukkan di sini
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error("Error Input:", err.message);
    res.status(500).send("Gagal menyimpan transaksi ke database");
  }
});

// Endpoint Pendaftaran User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash password sebelum disimpan ke DB agar aman
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword],
    );

    res.json({ message: "User berhasil dibuat!", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Username atau Email sudah terdaftar" });
  }
});

// Endpoint Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user berdasarkan email
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Email tidak terdaftar" });
    }

    // 2. Bandingkan password yang diinput dengan yang ada di DB (yang sudah di-hash)
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json({ message: "Password salah!" });
    }

    // 3. Buat Token JWT sebagai "ID Card" digital
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      JWT_SECRET,
      { expiresIn: "24h" }, // Token berlaku selama 24 jam
    );

    res.json({
      message: "Login Berhasil!",
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Terjadi kesalahan pada server");
  }
});

//Endpoint untuk Update Profile + autentikasi
app.put("/api/auth/update-profile", authenticateToken, async (req, res) => {
  try {
    const { id, username, email } = req.body;
    const userId = req.user.id; // Gunakan ID dari token, bukan dari body agar lebih aman

    //Jalankan Query Update
    const updatedUser = await pool.query(
      "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email",
      [username, email, userId],
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // 2. Kirim data yang sudah diperbarui kembali ke frontend
    res.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: "Gagal memperbarui profil. Mungkin email sudah digunakan.",
    });
  }
});

//endpoint change password + autentikasi
app.put("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    //ambil password lama (verifikasi)
    const user = await pool.query("SELECT password FROM users WHERE id = $1", [
      userId,
    ]);

    //cek password lama cocok
    const validPassword = await bcrypt.compare(
      oldPassword,
      user.rows[0].password,
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Password lama salah!" });
    }

    //hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    //update ke database
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedNewPassword,
      userId,
    ]);

    res.json({ message: "Password berhasil diperbarui!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
