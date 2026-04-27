import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Wallets from './pages/Wallets';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-10 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Wallets setIsSidebarOpen={setIsSidebarOpen} />} />
            <Route path="/wallets" element={<Wallets setIsSidebarOpen={setIsSidebarOpen} />} />
            <Route path="/settings" element={<div>Halaman Settings</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;