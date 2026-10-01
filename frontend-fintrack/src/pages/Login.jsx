import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Cek tema saat komponen dimuat
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handler Toggle Dark Mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa kembali email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      
      {/* Tombol Toggle Dark Mode di Pojok Kanan Atas */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-5 right-5 p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-md hover:scale-105 active:scale-95 transition-all"
        title="Toggle Dark Mode"
      >
        {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 tracking-tight">FinTrack</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Silakan login untuk mengelola keuanganmu.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
              >
                Forgot password?
              </Link>
            </div>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold border border-rose-100 dark:border-rose-900/50 animate-in fade-in">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>

          <p className="text-center mt-8 text-slate-500 dark:text-slate-400 text-sm">
            Don't have an account? {' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}