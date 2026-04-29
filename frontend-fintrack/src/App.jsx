import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Wallets from './pages/Wallets';
import Login from './pages/Login';
import EditProfile from './pages/EditProfile';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {isAuthenticated && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        {/* Header Global DIHAPUS agar judul halaman bisa naik ke paling atas */}
        
        <div className="p-4 md:p-8 max-w-[1440px] w-full mx-auto">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/wallets" element={isAuthenticated ? <Wallets setIsSidebarOpen={setIsSidebarOpen} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            <Route path="/edit-profile" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </main>
    </div>
  </Router>
  );
}

export default App;