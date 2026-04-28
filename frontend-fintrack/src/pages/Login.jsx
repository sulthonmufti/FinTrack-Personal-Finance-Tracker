import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState(''); // Error message

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Simpan token dan data user ke localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      //console.log(response.data.user);
      setError('');
      navigate('/Dashboard'); // Pindah ke halaman utama
      window.location.reload(); // Refresh untuk update state sidebar
    } catch (err) {
      setError(err.response?.data?.message || "Login Gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">FinTrack</h2>
        <p className="text-slate-500 mb-8 text-sm">Silakan login untuk mengelola keuanganmu.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4">{error}</div>}
          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}