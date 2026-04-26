import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, ArrowUpRight, ArrowDownLeft, 
  LogOut, Bell, History, Send, Wallet, Plus, 
  Zap, TrendingUp, ShieldCheck, ChevronRight,
  PieChart, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
          console.warn('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        const apiURL = import.meta.env.VITE_API_URL || '';
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Fetching dashboard data from:', apiURL);
        const [accRes, transRes] = await Promise.all([
          axios.get(`${apiURL}/api/accounts`, config),
          axios.get(`${apiURL}/api/transactions`, config)
        ]);

        if (accRes.data.data && accRes.data.data.length > 0) {
          setAccount(accRes.data.data[0]);
        } else {
          console.error('No account found for user');
          setError('No se encontró una cuenta activa. Contacte a soporte.');
        }
        setTransactions(transRes.data.data || []);
      } catch (err) {
        console.error('Dashboard Error:', err);
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
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: '50px', height: '50px', border: '4px solid #111', borderTopColor: '#d4af37', borderRadius: '50%', marginBottom: '20px' }}
        />
        <p style={{ fontWeight: '800', letterSpacing: '2px' }}>VERIFICANDO ACCESO GOLD...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', textAlign: 'center' }}>
        <Shield size={60} color="#ff4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ marginBottom: '10px' }}>{error}</h2>
        <button onClick={handleLogout} className="btn-gold" style={{ marginTop: '20px' }}>Volver al Login</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', fontFamily: "'Outfit', sans-serif", display: 'flex' }}>
      <style>{`
        .sidebar { width: 280px; background: #0a0a0b; border-right: 1px solid #1a1a1a; padding: 40px 20px; display: flex; flexDirection: column; position: fixed; height: 100vh; z-index: 100; }
        .main { flex: 1; padding: 50px; margin-left: 280px; }
        .gold-card { background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); padding: 40px; border-radius: 35px; color: black; box-shadow: 0 20px 50px rgba(212, 175, 55, 0.2); position: relative; overflow: hidden; }
        .glass-card { background: #0f0f11; padding: 30px; border-radius: 25px; border: 1px solid #1a1a1a; transition: 0.3s; }
        .glass-card:hover { border-color: rgba(212, 175, 55, 0.4); }
        .btn-action { background: black; color: white; border: none; padding: 14px 25px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; alignItems: center; gap: 10px; transition: 0.3s; }
        .btn-action:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); background: #111; }
        
        .virtual-card {
          width: 380px; height: 230px; background: linear-gradient(135deg, #1a1a1c 0%, #000 100%);
          border-radius: 20px; border: 1px solid rgba(212,175,55,0.3); padding: 30px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.8);
        }
        .chip { width: 50px; height: 40px; background: linear-gradient(135deg, #d4af37, #9a7d46); border-radius: 8px; margin-bottom: 20px; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #d4af37, #f2d388)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
            <Shield size={24} />
          </div>
          <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-1px' }}>GOLD BANK</span>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SidebarItem icon={<LayoutDashboard size={22} />} label="Resumen" active />
            <SidebarItem icon={<Wallet size={22} />} label="Cuentas" />
            <SidebarItem icon={<CreditCard size={22} />} label="Tarjetas" />
            <SidebarItem icon={<History size={22} />} label="Movimientos" />
            <SidebarItem icon={<TrendingUp size={22} />} label="Inversiones" />
        </nav>

        <div style={{ padding: '20px', background: 'rgba(212,175,55,0.05)', borderRadius: '15px', marginBottom: '30px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#666', marginBottom: '10px' }}>NIVEL DE SEGURIDAD</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80', fontWeight: '800', fontSize: '0.9rem' }}>
            <ShieldCheck size={18} /> MÁXIMO
          </div>
        </div>

        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>
          <LogOut size={22} /> Cerrar Sesión
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '5px' }}>
              Bienvenido, <span style={{ color: '#d4af37' }}>{user.full_name?.split(' ')[0]}</span>
            </h1>
            <p style={{ color: '#555', fontWeight: '700', fontSize: '1.1rem' }}>Estado de su membresía Gold Premium</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={{ background: '#111', border: '1px solid #222', color: 'white', padding: '12px', borderRadius: '15px', cursor: 'pointer' }}><Bell size={24} /></button>
            <button style={{ background: '#111', border: '1px solid #222', color: 'white', padding: '12px', borderRadius: '15px', cursor: 'pointer' }}><Settings size={24} /></button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '40px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* BALANCE CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gold-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: '800', opacity: 0.6, fontSize: '0.85rem', marginBottom: '10px', letterSpacing: '2px' }}>SALDO DISPONIBLE</p>
                  <h2 style={{ fontSize: '5rem', fontWeight: '900', marginBottom: '40px', letterSpacing: '-2px' }}>
                    ${account?.balance?.toLocaleString('es-CL')}
                  </h2>
                </div>
                <Zap size={60} style={{ opacity: 0.2 }} />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <button className="btn-action"><Send size={20} /> Transferir Fondos</button>
                <button className="btn-action" style={{ background: 'rgba(0,0,0,0.1)', border: '2px solid black', color: 'black' }}><Plus size={20} /> Añadir Saldo</button>
              </div>
            </motion.div>

            {/* QUICK STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
               <StatCard label="Inversiones" value="+12.5%" color="#4ade80" />
               <StatCard label="Ahorro" value="$1.2M" color="#d4af37" />
               <StatCard label="Puntos Gold" value="4.5k" color="#f2d388" />
            </div>
          </div>

          {/* VIRTUAL CARD & TRANSACTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <motion.div whileHover={{ scale: 1.02, rotateY: 5 }} className="virtual-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="chip"></div>
                <Shield size={30} color="#d4af37" />
              </div>
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: '500', letterSpacing: '4px', marginBottom: '20px' }}>•••• •••• •••• 8892</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: '700', textTransform: 'uppercase' }}>{user.full_name}</p>
                  <p style={{ fontWeight: '700' }}>12/28</p>
                </div>
              </div>
            </motion.div>

            <div className="glass-card" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Movimientos</h3>
                <Link to="#" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '800' }}>VER TODO</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {transactions.slice(0, 4).map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ background: '#1a1a1c', padding: '12px', borderRadius: '12px' }}>
                        {t.type === 'income' ? <ArrowDownLeft size={20} color="#4ade80" /> : <ArrowUpRight size={20} color="#f87171" />}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '1rem' }}>{t.description}</p>
                        <p style={{ fontSize: '0.8rem', color: '#444' }}>{new Date(t.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p style={{ fontWeight: '900', color: t.type === 'income' ? '#4ade80' : 'white' }}>
                      {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString('es-CL')}
                    </p>
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
  <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ fontSize: '1.5rem', fontWeight: '900', color: color }}>{value}</p>
  </div>
);

export default Dashboard;
