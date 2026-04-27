import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, ArrowUpRight, ArrowDownLeft, 
  LogOut, Bell, History, Send, Wallet, Plus, 
  Zap, TrendingUp, ShieldCheck, ChevronRight,
  PieChart, Settings, LayoutDashboard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Componentes internos para el Dashboard
const SidebarItem = ({ icon, label, active = false }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', 
    borderRadius: '12px', cursor: 'pointer', transition: '0.3s',
    background: active ? 'rgba(212,175,55,0.1)' : 'transparent',
    color: active ? '#d4af37' : '#555',
    fontWeight: '800'
  }}>
    {icon} <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div style={{ background: '#0f0f11', padding: '25px', borderRadius: '25px', border: '1px solid #1a1a1a', textAlign: 'center' }}>
    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ fontSize: '1.5rem', fontWeight: '900', color: color }}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) { return {}; }
  });
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const apiURL = import.meta.env.VITE_API_URL || '';
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [accRes, transRes] = await Promise.all([
          axios.get(`${apiURL}/api/accounts/me`, config),
          axios.get(`${apiURL}/api/transactions/history`, config)
        ]);

        if (accRes.data.data) {
          setAccount(accRes.data.data);
        } else {
          setError('No se encontró una cuenta activa.');
        }
        setTransactions(transRes.data.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Error de conexión con el servidor.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontFamily: 'Outfit' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: '40px', height: '40px', border: '3px solid #111', borderTopColor: '#d4af37', borderRadius: '50%', marginBottom: '20px' }} />
        <p style={{ fontWeight: '800', letterSpacing: '2px', fontSize: '0.8rem' }}>AUTENTICANDO NIVEL GOLD...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', fontFamily: "'Outfit', sans-serif", display: 'flex' }}>
      <style>{`
        .sidebar { width: 280px; background: #0a0a0b; border-right: 1px solid #1a1a1a; padding: 40px 20px; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
        .main { flex: 1; padding: 50px; margin-left: 280px; }
        .gold-card { background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); padding: 40px; border-radius: 35px; color: black; box-shadow: 0 20px 50px rgba(212, 175, 55, 0.2); position: relative; overflow: hidden; }
        .btn-action { background: black; color: white; border: none; padding: 14px 25px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
        .virtual-card { width: 380px; height: 230px; background: linear-gradient(135deg, #1a1a1c 0%, #000 100%); border-radius: 20px; border: 1px solid rgba(212,175,55,0.3); padding: 30px; display: flex; flex-direction: column; justify-content: space-between; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.8); }
        .chip { width: 50px; height: 40px; background: linear-gradient(135deg, #d4af37, #9a7d46); border-radius: 8px; }
      `}</style>

      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--gold-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}><Shield size={22} /></div>
          <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>GOLD BANK</span>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Resumen" active />
          <SidebarItem icon={<Wallet size={20} />} label="Cuentas" />
          <SidebarItem icon={<CreditCard size={20} />} label="Tarjetas" />
          <SidebarItem icon={<History size={20} />} label="Movimientos" />
        </nav>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', fontWeight: '800', cursor: 'pointer' }}><LogOut size={20} /> Salir</button>
      </aside>

      <main className="main">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Bienvenido, <span style={{ color: '#d4af37' }}>{user.full_name?.split(' ')[0]}</span></h1>
            <p style={{ color: '#555', fontWeight: '700' }}>Portal Bancario de Alta Dirección</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gold-card">
              <p style={{ fontWeight: '800', opacity: 0.6, fontSize: '0.8rem', marginBottom: '10px' }}>SALDO DISPONIBLE</p>
              <h2 style={{ fontSize: '4.5rem', fontWeight: '900', marginBottom: '40px' }}>${account?.balance?.toLocaleString('es-CL')}</h2>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-action"><Send size={18} /> Transferir</button>
                <button className="btn-action" style={{ background: 'none', border: '2px solid black', color: 'black' }}><Plus size={18} /> Abonar</button>
              </div>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
               <StatCard label="Inversiones" value="+12%" color="#4ade80" />
               <StatCard label="Ahorro" value="$1.2M" color="#d4af37" />
               <StatCard label="Puntos" value="4.5k" color="#f2d388" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <motion.div whileHover={{ scale: 1.02 }} className="virtual-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><div className="chip"></div><Shield size={24} color="#d4af37" /></div>
              <div>
                <p style={{ fontSize: '1.2rem', fontWeight: '500', letterSpacing: '4px', marginBottom: '15px' }}>•••• •••• •••• 8892</p>
                <p style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem' }}>{user.full_name}</p>
              </div>
            </motion.div>
            <div style={{ background: '#0f0f11', padding: '30px', borderRadius: '25px', border: '1px solid #1a1a1a' }}>
              <h3 style={{ marginBottom: '25px', fontWeight: '800' }}>Movimientos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {transactions.slice(0, 3).map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ background: '#1a1a1c', padding: '10px', borderRadius: '10px' }}>{t.type === 'income' ? <ArrowDownLeft size={16} color="#4ade80" /> : <ArrowUpRight size={16} color="#f87171" />}</div>
                      <div><p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t.description}</p></div>
                    </div>
                    <p style={{ fontWeight: '900' }}>${Math.abs(t.amount).toLocaleString('es-CL')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
