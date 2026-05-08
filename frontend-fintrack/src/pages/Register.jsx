import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
        });
        
        // Simpan token dan data user agar bisa langsung login
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Tampilkan modal sukses
        setShowSuccessModal(true);
    } catch (err) {
        alert(err.response?.data?.message || "Gagal mendaftar.");
    } finally {
        setIsLoading(false);
    }
    };

    const handleGoToDashboard = () => {
        // Melakukan reload agar App.jsx membaca ulang token di localStorage
        window.location.href = '/dashboard'; 
    };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-xl shadow-indigo-100">
            F
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-2">Join FinTrack to manage your finance</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Input Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  placeholder="johndoe"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Get Started
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          {/* komponen sukses modal modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop Blur */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
                
                {/* Modal Content */}
                <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center transform transition-all scale-100">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to FinTrack!</h2>
                <p className="text-slate-500 mb-8 text-sm">Account created successfully. Your financial journey starts now.</p>
                
                <button 
                    onClick={handleGoToDashboard} 
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    Go to Dashboard
                </button>
                </div>
            </div>
            )}
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-slate-500 text-sm">
          Already have an account? {' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}