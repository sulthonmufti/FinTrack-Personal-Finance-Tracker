const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // Import koneksi DB dari folder config
const authenticateToken = require("../middleware/authMiddleware"); // Import middleware

const JWT_SECRET = process.env.JWT_SECRET;

// Endpoint Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword],
    );
    res.json({ message: "User berhasil dibuat!", user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Username atau Email sudah terdaftar" });
  }
});

// Endpoint Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0)
      return res.status(401).json({ message: "Email tidak terdaftar" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res.status(401).json({ message: "Password salah!" });

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      JWT_SECRET,
      { expiresIn: "24h" },
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
    res.status(500).send("Terjadi kesalahan pada server");
  }
});

// Endpoint Pendaftaran User
router.post("/api/auth/register", async (req, res) => {
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
router.post("/api/auth/login", async (req, res) => {
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

//Endpoint untuk Update Profile + autentikasi (endpointnya /api/auth/update-profile sudah tidak di gunakan lagi)
router.put("/update-profile", authenticateToken, async (req, res) => {
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

//endpoint change password + autentikasi (endpointnya /api/auth/change-password sudah tidak di gunakan lagi)
router.put("/change-password", authenticateToken, async (req, res) => {
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

module.exports = router;
