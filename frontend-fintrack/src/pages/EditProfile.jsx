import { useState } from 'react';
import axios from 'axios';
import { User, Mail, Save } from 'lucide-react'; // Menggunakan icon agar lebih cantik

export default function EditProfile() {
  // Ambil data user lama dari localStorage
  const storageUser = JSON.parse(localStorage.getItem('user') || '{}');

  // State untuk form
  const [username, setUsername] = useState(storageUser.username || '');
  const [email, setEmail] = useState(storageUser.email || '');
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh otomatis
    setStatus({ type: 'loading', msg: 'Menyimpan...' });

    try {
      // 1. Kirim data ke API PUT yang sudah kamu buat
      const response = await axios.put('http://localhost:5000/api/auth/update-profile', {
        id: storageUser.id,
        username: username,
        email: email
      });

      // 2. SINKRONISASI: Update localStorage dengan data baru dari database
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // 3. FEEDBACK: Tampilkan pesan sukses
      setStatus({ type: 'success', msg: 'Profil berhasil diperbarui!' });

      // 4. REDIRECT/REFRESH: Supaya ProfileHeader langsung berubah
      setTimeout(() => {
        window.location.reload(); 
      }, 1500);

    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Gagal update profil' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Edit Profile</h1>
        <p className="text-slate-500">Perbarui informasi akun Anda</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Username */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // Mengubah state saat diketik
              />
            </div>
          </div>

          {/* Input Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Pesan Status */}
          {status.msg && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {status.msg}
            </div>
          )}

          {/* Tombol Simpan */}
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Save size={20} />
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}