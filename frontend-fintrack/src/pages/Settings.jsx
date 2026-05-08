import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, Tag, Settings as SettingsIcon, Plus, Loader2, CheckCircle2, ShieldCheck, XCircle, ArrowRight, Menu } from 'lucide-react';
import { HiOutlineMenuAlt2 } from "react-icons/hi";

export default function Settings({ setIsSidebarOpen }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'success', title: '', message: '' });
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (err) { console.error("Failed to fetch categories"); }
  };

  const triggerModal = (type, title, message) => {
    setModalConfig({ type, title, message });
    setShowModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.put('http://localhost:5000/api/auth/update-profile', profile, { headers });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      triggerModal('success', 'Profile Updated', 'Information saved successfully.');
    } catch (err) {
      triggerModal('error', 'Update Failed', 'Email might already be in use.');
    } finally { setIsLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      triggerModal('error', 'Error', 'Password confirmation does not match.');
      return;
    }
    setIsLoading(true);
    try {
      await axios.put('http://localhost:5000/api/auth/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      }, { headers });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      triggerModal('success', 'Success', 'Password has been updated.');
    } catch (err) {
      triggerModal('error', 'Failed', 'Current password is incorrect.');
    } finally { setIsLoading(false); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/transactions/categories', 
        { name: newCatName, type: newCatType }, 
        { headers }
      );
      setNewCatName('');
      fetchCategories();
      triggerModal('success', 'Added', 'New category created.');
    } catch (err) {
      triggerModal('error', 'Failed', 'Could not add category.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 px-4 md:px-8">
      {/* 1. Header & Hamburger Inline */}
      <div className="flex items-center gap-4 py-6 mb-4 md:mb-8">
        {/* Hamburger Menu: Muncul di Mobile/Tablet */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-600 active:scale-90 transition-all shadow-sm"
        >
          <HiOutlineMenuAlt2 size={24} />
        </button>

        <div className="flex items-center gap-3">
          
          {/* Judul dan Deskripsi Baru */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
            <p className="text-slate-500 text-xs hidden md:block mt-0.5">
              Manage your account preferences and transaction categories
            </p>
          </div>
        </div>
      </div>

      {/* 2. Tabs Navigation - Full Width on Mobile */}
      <div className="mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-2 min-w-max">
            <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <User size={16} /> Profile
            </button>
            <button onClick={() => setActiveTab('security')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Lock size={16} /> Security
            </button>
            <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Tag size={16} /> Categories
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Card Content - Back to Normal Width */}
      <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[450px]">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-md animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-8">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <input type="email" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
              </div>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="max-w-md animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-8">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <input type="password" placeholder="Current Password" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} />
              <input type="password" placeholder="New Password" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
              <input type="password" placeholder="Confirm New Password" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-8">Manage Categories</h2>
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-10 bg-slate-50 p-4 rounded-[2rem]">
              <input type="text" placeholder="New Category Name" className="flex-1 px-6 py-4 bg-white border-none rounded-2xl text-sm outline-none shadow-sm" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              <select className="px-5 py-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-600 outline-none shadow-sm" value={newCatType} onChange={(e) => setNewCatType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Add</>}
              </button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
                  <p className="text-sm font-bold text-slate-700">{cat.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${cat.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{cat.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Overlay Modal Feedback */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${modalConfig.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {modalConfig.type === 'success' ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{modalConfig.title}</h3>
            <p className="text-slate-500 mb-8 text-sm">{modalConfig.message}</p>
            <button onClick={() => setShowModal(false)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}