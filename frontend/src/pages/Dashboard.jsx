import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, ArrowUpRight, ArrowDownLeft, 
  LogOut, Bell, History, Send, Wallet, Plus, 
  Zap, TrendingUp, ShieldCheck, ChevronRight,
  PieChart, Settings, LayoutDashboard, Lock, Unlock,
  Copy, Eye, EyeOff, Search, AlertCircle, CheckCircle2,
  Cpu, Crown, Landmark, Award, Fingerprint
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// --- COMPONENTES PREMIUM ---

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <motion.div 
    whileHover={{ x: 5, backgroundColor: 'rgba(212,175,55,0.08)' }}
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px', 
      borderRadius: '16px', cursor: 'pointer', transition: '0.3s',
      background: active ? 'linear-gradient(90deg, rgba(212,175,55,0.15) 0%, transparent 100%)' : 'transparent',
      color: active ? '#f2d388' : '#555',
      borderLeft: active ? '3px solid #d4af37' : '3px solid transparent',
      fontWeight: active ? '800' : '600',
      marginBottom: '5px'
    }}
  >
    {icon} <span style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>{label}</span>
  </motion.div>
);

const GlassCard = ({ children, style, glowColor = 'rgba(212,175,55,0.1)' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ 
      background: 'rgba(20, 20, 22, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRadius: '30px',
      border: '1px solid rgba(255,255,255,0.05)',
      padding: '30px',
      position: 'relative',
      boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 50px ${glowColor}`,
      ...style 
    }}
  >
    {children}
  </motion.div>
);

const Dashboard = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || {});
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [securityPrompt, setSecurityPrompt] = useState(false);
  const [passConfirm, setPassConfirm] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'accounts', 'cards', 'audit'
  const [amount, setAmount] = useState('');
  const [destRut, setDestRut] = useState('');
  const [destAccount, setDestAccount] = useState('');
  const [destName, setDestName] = useState('');
  const [destEmail, setDestEmail] = useState('');
  const [destBankUrl, setDestBankUrl] = useState('');
  const [isExternalBank, setIsExternalBank] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const navigate = useNavigate();

  const formatRut = (rut) => {
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleanRut.length === 0) return '';
    if (cleanRut.length <= 1) return cleanRut;
    let body = cleanRut.slice(0, -1);
    const checkDigit = cleanRut.slice(-1);
    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${body}-${checkDigit}`;
  };

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
      setAccount(accRes.data.data.account);
      setUser(prev => ({ ...prev, ...accRes.data.data.profile }));
      setTransactions(transRes.data.data || []);
    } catch (err) { navigate('/login'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSecurityCheck = (e) => {
    e.preventDefault();
    // Simulación de validación de clave maestra
    if (passConfirm.length >= 4) {
      setSecurityPrompt(false);
      setShowFullDetails(true);
      setPassConfirm('');
    } else {
      alert('Clave de seguridad incorrecta');
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  if (loading) return (
    <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: '50px', height: '50px', border: '2px solid rgba(212,175,55,0.1)', borderTopColor: '#d4af37', borderRadius: '50%' }} />
      <p style={{ marginTop: '20px', color: '#d4af37', fontWeight: '900', letterSpacing: '3px', fontSize: '0.7rem' }}>GOLD TERMINAL 2.0</p>
    </div>
  );

  const generateCardNumber = (str) => {
    if (!str) return '4152 8812 0000 0000';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const numStr = Math.abs(hash).toString().padStart(8, '0').slice(0, 8);
    return `4152 8812 ${numStr.slice(0, 4)} ${numStr.slice(4)}`;
  };

  const generateCVV = (str) => {
    if (!str) return '912';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash).toString().padStart(3, '0').slice(0, 3);
  };

  const cardNumber = generateCardNumber(user.rut || user.id);
  const cardCvv = generateCVV(user.id || user.rut);

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 0% 0%, #151515 0%, #050505 100%)', color: 'white', fontFamily: "'Outfit', sans-serif", display: 'flex' }}>
      <style>{`
        .sidebar { width: 280px; background: rgba(5,5,5,0.8); backdrop-filter: blur(30px); border-right: 1px solid rgba(255,255,255,0.03); padding: 50px 25px; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
        .main-content { flex: 1; margin-left: 280px; padding: 60px 80px; }
        .gold-gradient-text { background: linear-gradient(135deg, #d4af37 0%, #f2d388 50%, #9a7d46 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .btn-luxury { 
          background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); 
          color: black; border: none; padding: 16px 30px; border-radius: 20px; 
          font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 12px; 
          transition: 0.4s; box-shadow: 0 10px 20px rgba(212,175,55,0.2); 
        }
        .btn-luxury:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(212,175,55,0.4); }
        .btn-ghost { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; padding: 16px 30px; border-radius: 20px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: #d4af37; }
        .stat-label { font-size: 0.7rem; font-weight: 900; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .input-premium-icon { position: relative; width: 100%; }
        .input-premium-icon span { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #d4af37; font-weight: 900; }
      `}</style>

      {/* --- SIDEBAR (Traducido) --- */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '80px' }}>
          <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #d4af37, #f2d388)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(212,175,55,0.3)' }}>
            <Landmark size={22} color="black" />
          </div>
          <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-1.5px' }}>GOLD<span style={{ color: '#d4af37' }}>BANK</span></span>
        </div>

        <nav style={{ flex: 1 }}>
          <p style={{ color: '#333', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '25px', paddingLeft: '20px' }}>NAVEGACIÓN PRINCIPAL</p>
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Resumen" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<Wallet size={20} />} label="Cuentas Tesorería" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
          <SidebarItem icon={<CreditCard size={20} />} label="Tarjetas Platinum" active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} />
          <SidebarItem icon={<History size={20} />} label="Registro Auditoría" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
          <div style={{ margin: '30px 0', height: '1px', background: 'rgba(255,255,255,0.03)' }} />
          <SidebarItem icon={<PieChart size={20} />} label="Inversiones" />
          <SidebarItem icon={<Settings size={20} />} label="Seguridad" />
        </nav>

        <motion.button whileHover={{ x: 5 }} onClick={handleLogout} style={{ background: 'rgba(255,68,68,0.05)', border: 'none', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '20px', fontWeight: '800', cursor: 'pointer', marginTop: 'auto' }}>
          <LogOut size={20} /> Finalizar Sesión
        </motion.button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '5px' }}>
              Bienvenido, <span className="gold-gradient-text">{user.full_name?.split(' ')[0]}</span>
            </h1>
            <p style={{ color: '#555', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Tus activos están protegidos y en crecimiento.</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '15px 25px', borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }}></div>
              <span style={{ fontWeight: '900', fontSize: '0.75rem', color: '#4ade80', letterSpacing: '1px' }}>CONEXIÓN ENCRIPTADA</span>
            </motion.div>
            <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '15px', borderRadius: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={22} /></button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={handleLogout} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', padding: '15px 25px', borderRadius: '22px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogOut size={18} /> Cerrar Sesión
            </motion.button>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '60px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <GlassCard style={{ padding: '60px', overflow: 'hidden' }} glowColor="rgba(212,175,55,0.05)">
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'var(--gold-gradient)', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }}></div>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '1px', background: 'rgba(212,175,55,0.5)' }}></div>
                    <Crown size={20} color="#d4af37" />
                    <span style={{ fontWeight: '900', fontSize: '0.85rem', color: '#888', letterSpacing: '3px' }}>VALOR TOTAL DE ACTIVOS</span>
                    <div style={{ width: '40px', height: '1px', background: 'rgba(212,175,55,0.5)' }}></div>
                  </div>
                  <h2 style={{ fontSize: '6rem', fontWeight: '900', letterSpacing: '-3px', marginBottom: '60px' }}>
                    <span style={{ fontSize: '3rem', verticalAlign: 'super', color: '#d4af37', marginRight: '15px' }}>$</span>
                    {account?.balance?.toLocaleString('es-CL')}
                  </h2>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn-luxury" onClick={() => setActiveModal('transfer')}><Send size={20} /> Nueva Transferencia</button>
                    <button className="btn-ghost" onClick={() => setActiveModal('receive')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ArrowDownLeft size={20} /> Recibir Fondos</button>
                    <button className="btn-ghost" onClick={() => setActiveModal('deposit')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Plus size={20} /> Cargar Saldo</button>
                  </div>
                </div>
              </GlassCard>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
                <StatWidget label="Rendimiento Mercado" value="+18.2%" color="#4ade80" icon={<TrendingUp size={16} />} />
                <StatWidget label="Reserva de Oro" value="2.4 Kg" color="#d4af37" icon={<Zap size={16} />} />
                <StatWidget label="Puntos Elite" value="84.200" color="#f2d388" icon={<Award size={16} />} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ perspective: '1000px' }}>
                <motion.div whileHover={{ rotateY: 5, rotateX: -5 }} style={{ width: '100%', height: '260px', borderRadius: '30px', padding: '40px', background: isBlocked ? 'rgba(30,30,30,0.8)' : 'linear-gradient(135deg, rgba(30,30,35,0.9) 0%, rgba(10,10,12,1) 100%)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(30px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 40px 80px rgba(0,0,0,0.8)', position: 'relative', overflow: 'hidden', transition: '0.5s' }}>
                  {!isBlocked && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, transparent 40%, rgba(212,175,55,0.05) 50%, transparent 60%)', transition: '0.5s' }}></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ width: '60px', height: '45px', background: 'linear-gradient(135deg, #d4af37, #9a7d46)', borderRadius: '10px' }}></div><Shield size={32} color={isBlocked ? '#ff4444' : '#d4af37'} /></div>
                  <div>
                    <p style={{ fontSize: '1.6rem', fontWeight: '500', letterSpacing: '6px', marginBottom: '30px', color: isBlocked ? '#444' : '#fff' }}>{isBlocked ? '•••• •••• •••• ••••' : cardNumber}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <p className="stat-label">TITULAR</p>
                        <p style={{ fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>{user.full_name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#a0a0a0', fontWeight: '600' }}>RUT: {user.rut}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="stat-label">EXP</p>
                        <p style={{ fontWeight: '900', color: '#d4af37' }}>12/28</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                  <button onClick={() => setIsBlocked(!isBlocked)} style={{ flex: 1, padding: '16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', background: isBlocked ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.03)', color: isBlocked ? '#ff4444' : '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>{isBlocked ? <Unlock size={18} /> : <Lock size={18} />} {isBlocked ? 'ACTIVAR' : 'BLOQUEAR'}</button>
                  <button onClick={() => setSecurityPrompt(true)} style={{ padding: '16px 25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)', color: '#d4af37', fontWeight: '800', cursor: 'pointer' }}>VER DETALLES</button>
                </div>
              </div>

              <GlassCard style={{ padding: '40px', flex: 1 }} glowColor="transparent">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Actividad Reciente</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#d4af37', borderBottom: '2px solid rgba(212,175,55,0.2)', paddingBottom: '4px', cursor: 'pointer' }}>VER TODO</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  {transactions.slice(0, 4).map(t => {
                    const isIncome = t.type === 'income' || t.type === 'deposit' || t.type === 'transfer_in';
                    return (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>{isIncome ? <ArrowDownLeft size={22} color="#4ade80" /> : <ArrowUpRight size={22} color="#f87171" />}</div>
                          <div><p style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>{t.description}</p><p style={{ fontSize: '0.75rem', color: '#444', fontWeight: '700' }}>{new Date(t.created_at).toLocaleDateString()}</p></div>
                        </div>
                        <p style={{ fontWeight: '900', fontSize: '1.1rem', color: isIncome ? '#4ade80' : '#fff' }}>{isIncome ? '+' : '-'}${Math.abs(t.amount).toLocaleString('es-CL')}</p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </div>
        ) : (
          <GlassCard style={{ padding: '100px', textAlign: 'center' }}>
             <ShieldCheck size={80} color="#d4af37" style={{ marginBottom: '30px' }} />
             <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Sección encriptada</h2>
             <p style={{ color: '#555', marginTop: '20px', fontSize: '1.2rem' }}>Esta área del portal está bajo mantenimiento de seguridad de alto nivel.</p>
             <button onClick={() => setActiveTab('overview')} className="btn-luxury" style={{ marginTop: '40px', marginInline: 'auto' }}>VOLVER AL RESUMEN</button>
          </GlassCard>
        )}
      </main>

      {/* --- MODALES --- */}
      <AnimatePresence>
        {activeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} style={{ position: 'relative', background: '#121214', width: '100%', maxWidth: '480px', padding: '50px', borderRadius: '40px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px' }} className="gold-gradient-text">
                {activeModal === 'transfer' ? 'Enviar Fondos' : activeModal === 'receive' ? 'Datos de Recepción' : 'Abonar Saldo'}
              </h2>
              <p style={{ color: '#555', marginBottom: '35px', fontWeight: '700' }}>
                {activeModal === 'receive' ? 'Comparte tu información bancaria.' : 'Confirma tu operación elite a continuación.'}
              </p>

              {activeModal === 'receive' ? (
                <div>
                  <p style={{ color: '#aaa', marginBottom: '25px', lineHeight: '1.6', fontSize: '0.9rem' }}>
                    Para que otro banco (o tu profesor) te envíe dinero, envíale los siguientes datos exactos. El sistema procesará el abono automáticamente.
                  </p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="stat-label">TU RUT (DESTINO)</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{user.rut}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(user.rut); alert('RUT copiado!'); }} style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer' }}><Copy size={22} /></button>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="stat-label">TU NÚMERO DE CUENTA</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{account?.account_number}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(account?.account_number); alert('N° de Cuenta copiado!'); }} style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer' }}><Copy size={22} /></button>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <p className="stat-label">URL DE TU BANCO (API EXTERNA)</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', wordBreak: 'break-all' }}>https://gold-bank-api.vercel.app/api/transactions/external-transfer</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText('https://gold-bank-api.vercel.app/api/transactions/external-transfer'); alert('URL copiada!'); }} style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', marginLeft: '15px' }}><Copy size={22} /></button>
                  </div>

                  <button onClick={() => setActiveModal(null)} className="btn-luxury" style={{ width: '100%', justifyContent: 'center', padding: '20px', fontSize: '1.2rem' }}>ENTENDIDO</button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                e.preventDefault();
                setOpLoading(true);
                try {
                  const token = localStorage.getItem('token');
                  const apiURL = import.meta.env.VITE_API_URL || '';
                  const config = { headers: { Authorization: `Bearer ${token}` } };
                  if (activeModal === 'transfer') {
                    const payload = { 
                      destination: destAccount || destRut, 
                      amount: parseFloat(amount), 
                      description: 'Transferencia Elite',
                      receiver_name: destName,
                      receiver_rut: destRut,
                      receiver_email: destEmail
                    };
                    if (isExternalBank && destBankUrl) {
                      payload.destination_bank_url = destBankUrl;
                    }
                    await axios.post(`${apiURL}/api/transactions/transfer`, payload, config);
                  } else {
                    await axios.post(`${apiURL}/api/transactions/deposit`, { amount: parseFloat(amount) }, config);
                  }
                  setActiveModal(null); fetchData(); setAmount(''); setDestRut(''); setDestAccount(''); setDestName(''); setDestEmail(''); setDestBankUrl(''); setIsExternalBank(false);
                } catch (err) { alert(err.response?.data?.error || err.response?.data?.message || err.message || 'Fallo en la transacción'); } finally { setOpLoading(false); }
              }}>
                {activeModal === 'transfer' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <div>
                        <p className="stat-label">RUT DESTINATARIO</p>
                        <input type="text" className="btn-ghost" style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '15px' }} value={destRut} onChange={(e) => setDestRut(formatRut(e.target.value))} required maxLength="12" />
                      </div>
                      <div>
                        <p className="stat-label">NÚMERO DE CUENTA</p>
                        <input type="text" className="btn-ghost" style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '15px' }} value={destAccount} onChange={(e) => setDestAccount(e.target.value)} required />
                      </div>
                      <div>
                        <p className="stat-label">NOMBRE COMPLETO</p>
                        <input type="text" className="btn-ghost" style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '15px' }} value={destName} onChange={(e) => setDestName(e.target.value)} required />
                      </div>
                      <div>
                        <p className="stat-label">CORREO ELECTRÓNICO</p>
                        <input type="email" className="btn-ghost" style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '15px' }} value={destEmail} onChange={(e) => setDestEmail(e.target.value)} required />
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" id="externalBank" checked={isExternalBank} onChange={(e) => setIsExternalBank(e.target.checked)} style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#d4af37' }} />
                      <label htmlFor="externalBank" style={{ cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', color: '#888' }}>¿Transferir a otro banco? (API Externa)</label>
                    </div>

                    <AnimatePresence>
                      {isExternalBank && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '20px' }}>
                          <p className="stat-label">URL DEL BANCO DESTINO (API DEL PROFESOR)</p>
                          <input type="url" placeholder="https://banco-profesor.vercel.app/api/webhook" className="btn-ghost" style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '20px' }} value={destBankUrl} onChange={(e) => setDestBankUrl(e.target.value)} required={isExternalBank} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
                <div style={{ marginBottom: '40px' }}>
                  <p className="stat-label">MONTO (CLP)</p>
                  <div className="input-premium-icon">
                    <span>$</span>
                    <input type="number" className="btn-ghost" style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '20px 20px 20px 45px', fontSize: '1.5rem', color: '#d4af37' }} value={amount} onChange={(e) => setAmount(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" disabled={opLoading} className="btn-luxury" style={{ width: '100%', justifyContent: 'center', padding: '20px', fontSize: '1.2rem' }}>{opLoading ? 'PROCESANDO...' : 'EJECUTAR TRANSACCIÓN'}</button>
              </form>
              )}
            </motion.div>
          </div>
        )}

        {/* SECURITY CHECK MODAL */}
        {securityPrompt && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSecurityPrompt(false)} style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(30px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ position: 'relative', background: '#0a0a0b', width: '100%', maxWidth: '400px', padding: '50px', borderRadius: '40px', border: '1px solid #d4af37', textAlign: 'center' }}>
              <Fingerprint size={60} color="#d4af37" style={{ marginBottom: '20px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '10px' }}>Verificación de Identidad</h2>
              <p style={{ color: '#444', marginBottom: '30px', fontWeight: '700' }}>Para ver datos sensibles, ingrese su Clave Maestra.</p>
              <form onSubmit={handleSecurityCheck}>
                <input type="password" placeholder="••••••••" className="btn-ghost" style={{ width: '100%', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', marginBottom: '30px' }} value={passConfirm} onChange={(e) => setPassConfirm(e.target.value)} required autoFocus />
                <button type="submit" className="btn-luxury" style={{ width: '100%', justifyContent: 'center' }}>AUTENTICAR ACCESO</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* FULL DETAILS MODAL */}
        {showFullDetails && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFullDetails(false)} style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(40px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ position: 'relative', background: 'linear-gradient(135deg, #121214 0%, #000 100%)', width: '100%', maxWidth: '420px', padding: '50px', borderRadius: '40px', border: '1px solid #d4af37', textAlign: 'center' }}>
              <ShieldCheck size={60} color="#d4af37" style={{ marginBottom: '30px' }} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '40px' }}>Credenciales de Tarjeta</h2>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div><p className="stat-label">NÚMERO COMPLETO</p><p style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '4px' }}>{cardNumber}</p></div>
                <div style={{ display: 'flex', gap: '50px' }}>
                  <div><p className="stat-label">VENCIMIENTO</p><p style={{ fontSize: '1.2rem', fontWeight: '700' }}>12/2028</p></div>
                  <div><p className="stat-label">CÓDIGO CVV</p><p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d4af37' }}>{cardCvv}</p></div>
                </div>
              </div>
              <button onClick={() => setShowFullDetails(false)} className="btn-luxury" style={{ width: '100%', marginTop: '50px', justifyContent: 'center' }}>CERRAR VISTA SEGURA</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const StatWidget = ({ label, value, color, icon }) => (
  <GlassCard style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }} glowColor="transparent">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p className="stat-label" style={{ margin: 0 }}>{label}</p>
      <div style={{ color: color }}>{icon}</div>
    </div>
    <p style={{ fontSize: '1.6rem', fontWeight: '900', color: color }}>{value}</p>
  </GlassCard>
);

export default Dashboard;
