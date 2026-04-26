import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, CreditCard, ArrowUpRight, ArrowDownLeft, 
  Settings, LogOut, Bell, Search, History,
  Plus, Send, LayoutDashboard, User, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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
          axios.get(`${apiURL}/api/accounts`, config),
          axios.get(`${apiURL}/api/transactions`, config)
        ]);

        setAccount(accRes.data.data[0]);
        setTransactions(transRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response?.status === 401) navigate('/login');
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
      <div className="flex-center" style={{ minHeight: '100vh', background: '#000' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #222', borderTopColor: 'var(--gold-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-black)' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '280px', background: 'var(--bg-card)', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', padding: '40px 20px', position: 'fixed', height: '100vh' }}>
        <div className="logo-container" style={{ marginBottom: '60px', justifyContent: 'center' }}>
          <div className="logo-icon"><Shield size={24} /></div>
          <span style={{ fontSize: '20px', fontWeight: '900' }}>GOLD<span className="gold-text">BANK</span></span>
        </div>

        <nav style={{ flex: 1 }}>
          <NavItem icon={<LayoutDashboard size={22} />} label="Dashboard" active />
          <NavItem icon={<Wallet size={22} />} label="Mis Cuentas" />
          <NavItem icon={<History size={22} />} label="Movimientos" />
          <NavItem icon={<CreditCard size={22} />} label="Tarjetas" />
        </nav>

        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', border: 'none', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}
        >
          <LogOut size={22} /> Cerrar Sesión
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: '280px', flex: 1, padding: '60px' }}>
        <header className="flex-between" style={{ marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '10px' }}>
              Hola, <span className="gold-text">{user.full_name?.split(' ')[0]}</span>
            </h1>
            <p style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Resumen de su cuenta exclusiva</p>
          </div>
          <div className="flex-center" style={{ gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={28} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: 'var(--gold-primary)', borderRadius: '50%', border: '2px solid black' }}></div>
            </div>
            <div className="logo-icon" style={{ borderRadius: '50%', width: '50px', height: '50px' }}><User size={24} /></div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
          {/* BALANCE CARD */}
          <div style={{ background: 'var(--gold-gradient)', borderRadius: '40px', padding: '50px', color: '#000', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(212, 175, 55, 0.2)' }}>
             <Shield size={200} style={{ position: 'absolute', right: '-40px', top: '-40px', opacity: 0.1 }} />
             <p style={{ fontWeight: '800', opacity: 0.6, marginBottom: '15px', letterSpacing: '2px' }}>SALDO DISPONIBLE</p>
             <h2 style={{ fontSize: '5rem', fontWeight: '900', marginBottom: '40px', letterSpacing: '-3px' }}>
               ${account?.balance?.toLocaleString('es-CL')}
             </h2>
             <div style={{ display: 'flex', gap: '20px' }}>
               <button className="btn-gold" style={{ background: '#000', color: '#fff' }}><Send size={20} /> Transferir</button>
               <button className="btn-gold" style={{ background: 'rgba(0,0,0,0.1)', border: '2px solid black' }}><Plus size={20} /> Recargar</button>
             </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="glass-card" style={{ padding: '40px' }}>
            <div className="flex-between" style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Movimientos</h3>
              <History size={20} style={{ color: 'var(--gold-primary)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {transactions.length > 0 ? transactions.map((t) => (
                <div key={t.id} className="flex-between">
                  <div className="flex-center" style={{ gap: '15px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                      {t.type === 'income' ? <ArrowDownLeft color="#4ade80" /> : <ArrowUpRight color="#f87171" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{t.description}</p>
                      <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '900', fontSize: '1.1rem', color: t.type === 'income' ? '#4ade80' : 'white' }}>
                      {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              )) : <p style={{ textAlign: 'center', color: '#444' }}>Sin actividad reciente</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    padding: '18px 25px', 
    borderRadius: '15px', 
    marginBottom: '10px', 
    cursor: 'pointer',
    background: active ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
    color: active ? 'var(--gold-primary)' : 'var(--text-gray)',
    fontWeight: '700'
  }}>
    {icon} <span>{label}</span>
  </div>
);

export default Dashboard;
