import { Link } from 'react-router-dom';

export default function ProfileHeader() {
  // Ambil data dengan fallback objek kosong agar tidak error charAt
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Ambil data username dan email 
  const displayName = user.username || 'User';
  const displayEmail = user.email || 'email@example.com';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Link 
      // to="/edit-profile" 
      to="/settings" 
      className="flex items-center gap-3 bg-white p-1 md:p-1.5 md:pr-4 rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 cursor-pointer group"
    >
      {/* Avatar Bulat */}
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105">
        {initial}
      </div>

      {/* Info Teks: hidden di mobile */}
      <div className="hidden md:flex flex-col leading-tight">
        <span className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
          {displayName}
        </span>
        <span className="text-[9px] md:text-[10px] text-slate-400 font-medium lowercase">
          {displayEmail}
        </span>
      </div>
    </Link>
  );
}