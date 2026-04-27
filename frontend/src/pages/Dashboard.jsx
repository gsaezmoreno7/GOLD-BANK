import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, ArrowUpRight, ArrowDownLeft, 
  LogOut, Bell, History, Send, Wallet, Plus, 
  Zap, TrendingUp, ShieldCheck, ChevronRight,
  PieChart, Settings, LayoutDashboard, Lock, Unlock,
  Copy, Eye, Search, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Componentes internos
const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', 
      borderRadius: '15px', cursor: 'pointer', transition: '0.3s',
      background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
      color: active ? '#d4af37' : '#555',
      fontWeight: '800'
    }}
  >
    {icon} <span>{label}</span>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} style={{ position: 'relative', background: '#121214', width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '35px', border: '1px solid #222', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d4af37', marginBottom: '25px' }}>{title}</h2>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Dashboard = () => {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'transfer' | 'deposit'
  const [amount, setAmount] = useState('');
  const [destRut, setDestRut] = useState('');
  const [opLoading, setOpLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const apiURL = import.meta.env.VITE_API_URL || '';
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [accRes, transRes] = await Promise.all([
        axios.get(`${apiURL}/api/accounts/me`, config),
        axios.get(`${apiURL}/api/transactions/history`, config)
      ]);
      setAccount(accRes.data.data);
      setTransactions(transRes.data.data || []);
    } catch (err) { navigate('/login'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOperation = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiURL = import.meta.env.VITE_API_URL || '';
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (activeModal === 'transfer') {
        await axios.post(`${apiURL}/api/transactions/transfer`, { destination_rut: destRut, amount: parseFloat(amount), description: 'Transferencia Gold' }, config);
      } else {
        await axios.post(`${apiURL}/api/transactions/deposit`, { amount: parseFloat(amount) }, config);
      }
      
      alert('Operación exitosa');
      setActiveModal(null);
      setAmount('');
      setDestRut('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error en la operación');
    } finally { setOpLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  if (loading) return <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>Portal Gold Cargando...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', fontFamily: "'Outfit', sans-serif", display: 'flex' }}>
      <style>{`
        .sidebar { width: 280px; background: #0a0a0b; border-right: 1px solid #1a1a1a; padding: 40px 20px; display: flex; flex-direction: column; position: fixed; height: 100vh; }
        .main { flex: 1; padding: 50px; margin-left: 280px; }
        .gold-card { background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); padding: 45px; border-radius: 40px; color: black; box-shadow: 0 25px 60px rgba(212, 175, 55, 0.15); }
        .virtual-card { 
          width: 400px; height: 240px; border-radius: 25px; padding: 35px;
          background: ${isBlocked ? 'linear-gradient(135deg, #222, #444)' : 'linear-gradient(135deg, #161618 0%, #000 100%)'};
          border: 1px solid ${isBlocked ? '#444' : 'rgba(212,175,55,0.3)'};
          display: flex; flex-direction: column; justify-content: space-between; position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6); transition: 0.5s;
          filter: ${isBlocked ? 'grayscale(1)' : 'none'}; opacity: ${isBlocked ? 0.7 : 1};
        }
        .btn-premium { background: black; color: white; border: none; padding: 15px 25px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
        .btn-premium:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
        .input-gold { background: #1a1a1c; border: 1px solid #333; padding: 15px; border-radius: 12px; width: 100%; color: white; margin-bottom: 20px; outline: none; }
        .input-gold:focus { border-color: #d4af37; }
        .card-label { font-size: 0.65rem; font-weight: 900; color: #555; letter-spacing: 2px; text-transform: uppercase; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px' }}>
          <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #d4af37, #f2d388)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}><Shield size={24} /></div>
          <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-1.5px' }}>GOLD BANK</span>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SidebarItem icon={<LayoutDashboard size={22} />} label="Resumen" active />
          <SidebarItem icon={<Wallet size={22} />} label="Mis Cuentas" />
          <SidebarItem icon={<CreditCard size={22} />} label="Mis Tarjetas" />
          <SidebarItem icon={<History size={22} />} label="Auditoría" />
        </nav>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>
          <LogOut size={22} /> Cerrar Sesión
        </button>
      </aside>

      <main className="main">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '5px' }}>Hola, <span style={{ color: '#d4af37' }}>{user.full_name?.split(' ')[0]}</span></h1>
            <p style={{ color: '#555', fontWeight: '700', fontSize: '1.1rem' }}>Banca Privada de Gestión Patrimonial</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ background: '#0f0f11', border: '1px solid #222', padding: '15px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%' }}></div>
              <span style={{ fontWeight: '800', fontSize: '0.8rem' }}>CONEXIÓN SEGURA</span>
            </div>
            <button style={{ background: '#0f0f11', border: '1px solid #222', color: 'white', padding: '15px', borderRadius: '18px' }}><Bell size={24} /></button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '50px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* SALDO */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gold-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: '800', opacity: 0.6, fontSize: '0.9rem', marginBottom: '15px', letterSpacing: '2px' }}>DISPONIBILIDAD TOTAL</p>
                  <h2 style={{ fontSize: '5.5rem', fontWeight: '900', marginBottom: '45px', letterSpacing: '-3px' }}>${account?.balance?.toLocaleString('es-CL')}</h2>
                </div>
                <Zap size={60} style={{ opacity: 0.2 }} />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <button className="btn-premium" onClick={() => setActiveModal('transfer')}><Send size={20} /> Transferir</button>
                <button className="btn-premium" style={{ background: 'none', border: '3px solid black', color: 'black' }} onClick={() => setActiveModal('deposit')}><Plus size={20} /> Abonar</button>
              </div>
            </motion.div>

            {/* WIDGETS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
              <div style={{ background: '#0f0f11', padding: '30px', borderRadius: '30px', border: '1px solid #1a1a1a' }}>
                <p className="card-label">Rendimiento</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#4ade80', marginTop: '10px' }}>+12.4%</h3>
              </div>
              <div style={{ background: '#0f0f11', padding: '30px', borderRadius: '30px', border: '1px solid #1a1a1a' }}>
                <p className="card-label">Ahorro Gold</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d4af37', marginTop: '10px' }}>$1.2M</h3>
              </div>
              <div style={{ background: '#0f0f11', padding: '30px', borderRadius: '30px', border: '1px solid #1a1a1a' }}>
                <p className="card-label">Estado</p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', marginTop: '10px' }}>PREMIUM ELITE</h3>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* TARJETA VIRTUAL */}
            <div style={{ position: 'relative' }}>
              <motion.div whileHover={{ scale: 1.02 }} className="virtual-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '55px', height: '40px', background: 'linear-gradient(135deg, #d4af37, #9a7d46)', borderRadius: '8px' }}></div>
                  <Shield size={32} color={isBlocked ? '#ff4444' : '#d4af37'} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '5px', marginBottom: '25px' }}>
                    {isBlocked ? '•••• •••• •••• ••••' : '•••• •••• •••• 8892'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p className="card-label" style={{ marginBottom: '5px', color: '#aaa' }}>Titular</p>
                      <p style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '1rem' }}>{user.full_name}</p>
                    </div>
                    <div>
                      <p className="card-label" style={{ marginBottom: '5px', color: '#aaa' }}>{showCVV ? 'CVV' : 'Exp'}</p>
                      <p style={{ fontWeight: '800' }}>{showCVV ? '912' : '12/28'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setIsBlocked(!isBlocked)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #222', background: isBlocked ? '#ff4444' : '#111', color: isBlocked ? 'black' : 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {isBlocked ? <Unlock size={18} /> : <Lock size={18} />} {isBlocked ? 'DESBLOQUEAR' : 'BLOQUEAR'}
                </button>
                <button onClick={() => setShowCVV(!showCVV)} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #222', background: '#111', color: 'white', cursor: 'pointer' }}>
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* MOVIMIENTOS */}
            <div style={{ background: '#0f0f11', padding: '35px', borderRadius: '35px', border: '1px solid #1a1a1a', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900' }}>Movimientos</h3>
                <Link to="#" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: '800', fontSize: '0.8rem' }}>VER TODO</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {transactions.slice(0, 4).map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ background: '#1a1a1c', padding: '12px', borderRadius: '12px' }}>
                        {t.type === 'income' ? <ArrowDownLeft size={20} color="#4ade80" /> : <ArrowUpRight size={20} color="#f87171" />}
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '0.95rem' }}>{t.description}</p>
                        <p style={{ fontSize: '0.75rem', color: '#444' }}>{new Date(t.created_at).toLocaleDateString()}</p>
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

      {/* MODALES */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={activeModal === 'transfer' ? 'Transferencia Gold' : 'Abonar a Cuenta'}>
        <form onSubmit={handleOperation}>
          {activeModal === 'transfer' && (
            <input type="text" placeholder="RUT del destinatario" className="input-gold" value={destRut} onChange={(e) => setDestRut(e.target.value)} required />
          )}
          <input type="number" placeholder="Monto ($)" className="input-gold" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <button type="submit" disabled={opLoading} className="btn-premium" style={{ width: '100%', background: 'var(--gold-gradient)', color: 'black' }}>
            {opLoading ? 'Procesando...' : 'CONFIRMAR OPERACIÓN'}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default Dashboard;
