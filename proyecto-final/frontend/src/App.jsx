import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Ordenes from './pages/Ordenes';
import Materiales from './pages/Materiales';
import Facturas from './pages/Facturas';
import Perfil from './pages/Perfil';
import Gastos from './pages/Gastos';
import Impuestos from './pages/Impuestos';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <Router>
      <Routes>
        {!user ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <Route path="*" element={
            <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
              <Sidebar user={user} open={sidebarOpen} setOpen={setSidebarOpen} />
              <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
                <Navbar user={user} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-6 relative">
                  {/* Subtle Background Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none z-0">
                    <img src="/logo.png" alt="Watermark" className="w-[500px] max-w-[80vw] object-contain" />
                  </div>
                  <div className="relative z-10">
                    <Routes>
                      <Route path="/" element={<Dashboard user={user} />} />
                      <Route path="/clientes" element={<Clientes user={user} />} />
                      <Route path="/ordenes" element={<Ordenes user={user} />} />
                      <Route path="/materiales" element={<Materiales user={user} />} />
                      <Route path="/gastos" element={<Gastos user={user} />} />
                      <Route path="/facturas" element={<Facturas user={user} />} />
                      <Route path="/impuestos" element={<Impuestos user={user} />} />
                      <Route path="/perfil" element={<Perfil user={user} onUpdateUser={handleUpdateUser} />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          } />
        )}
      </Routes>
    </Router>
  );
}

export default App;
