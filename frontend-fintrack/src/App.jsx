import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import EditProfile from './pages/EditProfile';
import Transactions from './pages/Transactions';
import Register from './pages/Register';
import Settings from './pages/Settings';

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
          <div className="p-4 md:p-8 max-w-[1440px] w-full mx-auto">
            <Routes>
              {/* ----- Public Routes: Bisa diakses siapa saja -----*/}
              {/* Login Page */}
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
              {/* Register */}
              <Route path="/register" element={<Register />} />

              {/* ----- Protected Routes ------*/}
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard setIsSidebarOpen={setIsSidebarOpen} /> : <Navigate to="/login" />} />
              
              <Route path="/transactions" element={isAuthenticated ? <Transactions setIsSidebarOpen={setIsSidebarOpen} /> : <Navigate to="/login" />} />
              
              <Route path="/wallets" element={isAuthenticated ? <Wallets setIsSidebarOpen={setIsSidebarOpen} /> : <Navigate to="/login" />} />
              
              <Route path="/edit-profile" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} />

              {/* Placeholder untuk halaman yang belum dibuat agar tidak putih/error */}
              <Route path="/reports" element={isAuthenticated ? <div className="p-8"><h1>Reports Page (Coming Soon)</h1></div> : <Navigate to="/login" />} />
              
              <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />

              {/* Catch-all Route diletakkan paling bawah */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;