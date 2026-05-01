import { useState } from "react";
import axios from "axios";
import { User, Mail, Save, Lock, ShieldCheck } from "lucide-react";

export default function Profile() {
  // Ambil data user dari localStorage
  const storageUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // State untuk Tab (Profile vs Password)
  const [activeTab, setActiveTab] = useState("info");

  // State untuk Edit Info
  const [username, setUsername] = useState(storageUser.username || '');
  const [email, setEmail] = useState(storageUser.email || '');

  // State untuk Change Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State Status & Loading
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Handler Update Info Profil
  const handleUpdateProfile = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setStatus({ type: '', msg: '' });

      try {
          const response = await axios.put('http://localhost:5000/api/auth/update-profile', 
              { username, email },
              { headers: { Authorization: `Bearer ${token}` } }
          );

          localStorage.setItem('user', JSON.stringify(response.data.user));
          setStatus({ type: 'success', msg: 'Profil berhasil diperbarui!' });
          
          setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
          setStatus({ type: 'error', msg: err.response?.data?.message || 'Gagal update profil' });
      } finally {
          setIsLoading(false);
      }
  };

  // Handler Ganti Password
  const handleChangePassword = async (e) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
          return setStatus({ type: 'error', msg: 'Konfirmasi password tidak cocok!' });
      }
      
      setIsLoading(true);
      setStatus({ type: '', msg: '' });

      try {
          const response = await axios.put('http://localhost:5000/api/auth/change-password', 
              { oldPassword, newPassword },
              { headers: { Authorization: `Bearer ${token}` } }
          );

          setStatus({ type: 'success', msg: response.data.message });
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
      } catch (err) {
          setStatus({ type: 'error', msg: err.response?.data?.message || 'Gagal ganti password' });
      } finally {
          setIsLoading(false);
      }
  };

  return (
      <div className="max-w-3xl mx-auto pb-10">
          <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
              <p className="text-slate-500">Manage your profile and security preferences</p>
          </header>

          {/* TAB SELECTOR */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-8 w-fit">
              <button 
                  onClick={() => { setActiveTab('info'); setStatus({type:'', msg:''}); }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Profile Info
              </button>
              <button 
                  onClick={() => { setActiveTab('security'); setStatus({type:'', msg:''}); }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Security
              </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              {status.msg && (
                  <div className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
                      status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                      <ShieldCheck size={18} />
                      {status.msg}
                  </div>
              )}

              {activeTab === 'info' ? (
                  /* FORM EDIT PROFIL */
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                              <div className="relative">
                                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                  <input 
                                      type="text"
                                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                      value={username}
                                      onChange={(e) => setUsername(e.target.value)}
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                              <div className="relative">
                                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                  <input 
                                      type="email"
                                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>
                      <button 
                          type="submit"
                          disabled={isLoading}
                          className="w-full md:w-fit px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                          <Save size={18} />
                          {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                  </form>
              ) : (
                  /* FORM GANTI PASSWORD */
                  <form onSubmit={handleChangePassword} className="space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                          <div className="relative">
                              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                              <input 
                                  type="password"
                                  placeholder="Enter current password"
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                  value={oldPassword}
                                  onChange={(e) => setOldPassword(e.target.value)}
                                  required
                              />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                              <div className="relative">
                                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                  <input 
                                      type="password"
                                      placeholder="Min. 6 characters"
                                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      required
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                              <div className="relative">
                                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                  <input 
                                      type="password"
                                      placeholder="Repeat new password"
                                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      required
                                  />
                              </div>
                          </div>
                      </div>
                      <button 
                          type="submit"
                          disabled={isLoading}
                          className="w-full md:w-fit px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                          <ShieldCheck size={18} />
                          {isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                  </form>
              )}
          </div>
      </div>
  );
}