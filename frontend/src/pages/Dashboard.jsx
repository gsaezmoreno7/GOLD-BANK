import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, CreditCard, ArrowUpRight, ArrowDownLeft, 
  LogOut, Bell, History, Send, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const apiURL = import.meta.env.VITE_API_URL || '';
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [accRes, transRes] = await Promise.all([
          axios.get(`${apiURL}/api/accounts`, config),
          axios.get(`${apiURL}/api/transactions`, config)
        ]);
        setAccount(accRes.data.data[0]);
        setTransactions(transRes.data.data);
      } catch (err) { navigate('/login'); } finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  if (loading) return <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>Cargando portal...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', fontFamily: "'Outfit', sans-serif", display: 'flex' }}>
      <style>{`
        .sidebar { width: 260px; background: #0a0a0b; border-right: 1px solid #1a1a1a; padding: 40px 20px; }
        .main { flex: 1; padding: 50px; }
        .gold-card { background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); padding: 40px; border-radius: 30px; color: black; box-shadow: 0 15px 30px rgba(212, 175, 55, 0.2); }
        .glass-card { background: #0f0f11; padding: 30px; border-radius: 25px; border: 1px solid #1a1a1a; }
        .btn-action { background: black; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      `}</style>

      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '50px' }}>
          <Shield size={24} color="#d4af37" />
          <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>GOLD BANK</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '15px', background: 'rgba(212,175,55,0.1)', color: '#d4af37', borderRadius: '10px', fontWeight: '700' }}>Dashboard</div>
            <div style={{ padding: '15px', color: '#555' }}>Cuentas</div>
            <div style={{ padding: '15px', color: '#555' }}>Tarjetas</div>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontWeight: '700' }}>Cerrar Sesión</button>
      </aside>

      <main className="main">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Hola, <span style={{ color: '#d4af37' }}>{user.full_name?.split(' ')[0]}</span></h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
          <div className="gold-card">
            <p style={{ fontWeight: '800', opacity: 0.6, fontSize: '0.8rem', marginBottom: '10px' }}>SALDO TOTAL</p>
            <h2 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '30px' }}>${account?.balance?.toLocaleString('es-CL')}</h2>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-action"><Send size={18} /> Transferir</button>
              <button className="btn-action" style={{ background: 'rgba(0,0,0,0.1)', color: 'black' }}><Wallet size={18} /> Recargar</button>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>Movimientos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {transactions.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ background: '#1a1a1c', padding: '10px', borderRadius: '10px' }}>{t.type === 'income' ? <ArrowDownLeft size={16} color="green" /> : <ArrowUpRight size={16} color="red" />}</div>
                    <div><p style={{ fontWeight: '700' }}>{t.description}</p><p style={{ fontSize: '0.8rem', color: '#555' }}>{new Date(t.created_at).toLocaleDateString()}</p></div>
                  </div>
                  <p style={{ fontWeight: '900' }}>${Math.abs(t.amount).toLocaleString('es-CL')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
