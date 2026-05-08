import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, Tag, Settings as SettingsIcon, Plus, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Settings() {
  // State untuk navigasi Tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'categories'

  // State untuk Profile
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // State untuk Password
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isPassLoading, setIsPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState('');

  // State untuk Categories
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [isCatLoading, setIsCatLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile({ username: userData.username || '', email: userData.email || '' });
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions/categories', { headers });
      setCategories(res.data);
    } catch (err) { console.error("Gagal mengambil kategori"); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMessage('');
    try {
      const res = await axios.put('http://localhost:5000/api/auth/update-profile', profile, { headers });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setProfileMessage('Profil berhasil diperbarui!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) { alert("Gagal update profil"); }
    finally { setIsProfileLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }
    setIsPassLoading(true);
    setPassMessage('');
    try {
      await axios.put('http://localhost:5000/api/auth/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      }, { headers });
      setPassMessage('Password berhasil diganti!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMessage(''), 3000);
    } catch (err) { alert(err.response?.data?.message || "Gagal ganti password"); }
    finally { setIsPassLoading(false); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsCatLoading(true);
    try {
      await axios.post('http://localhost:5000/api/transactions/categories', { name: newCatName, type: newCatType }, { headers });
      setNewCatName('');
      fetchCategories();
    } catch (err) { alert("Gagal menambah kategori"); }
    finally { setIsCatLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <SettingsIcon className="text-indigo-600" size={32} />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">Kelola preferensi akun dan kategori transaksi Anda</p>
      </header>

      {/* Navigasi Tab */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <User size={18} /> Profil
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Lock size={18} /> Keamanan
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Tag size={18} /> Kategori
        </button>
      </div>

      {/* Konten Berdasarkan Tab Aktif */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        {/* TAB 1: PROFIL */}
        {activeTab === 'profile' && (
          <div className="max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Informasi Profil</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Username</label>
                <input 
                  type="text"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Email Address</label>
                <input 
                  type="email"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                {isProfileLoading ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Perubahan'}
              </button>
              {profileMessage && <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold justify-center mt-2"><CheckCircle2 size={16}/> {profileMessage}</div>}
            </form>
          </div>
        )}

        {/* TAB 2: KEAMANAN (Ganti Password) */}
        {activeTab === 'security' && (
          <div className="max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-indigo-500" /> Ganti Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Password Lama</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Password Baru</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Konfirmasi Password Baru</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                />
              </div>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                {isPassLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
              </button>
              {passMessage && <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold justify-center mt-2"><CheckCircle2 size={16}/> {passMessage}</div>}
            </form>
          </div>
        )}

        {/* TAB 3: KATEGORI */}
        {activeTab === 'categories' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Manajemen Kategori</h2>
            <p className="text-slate-400 text-sm mb-8">Sesuaikan kategori untuk laporan keuangan yang lebih akurat.</p>
            
            <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-3 mb-10 bg-slate-50 p-4 rounded-3xl">
              <input 
                type="text"
                placeholder="Misal: Langganan App"
                className="flex-1 px-5 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <select 
                className="px-4 py-3 bg-white border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                {isCatLoading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Tambah</>}
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${cat.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {cat.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}