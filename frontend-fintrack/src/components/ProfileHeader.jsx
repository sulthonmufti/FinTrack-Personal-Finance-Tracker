// Komponen Kecil untuk Profile di Pojok Kanan Atas
export default function ProfileHeader() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log("Data User di Storage:", user);
  
  return (
    <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-pointer">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
        {user.username?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs md:text-sm font-bold text-slate-700">{user.username || 'User'}</span>
        <span className="text-[9px] md:text-[10px] text-slate-400 font-medium lowercase">{user.email || 'email'}</span>
      </div>
    </div>
  );
}