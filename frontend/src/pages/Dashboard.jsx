import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Send, 
  PlusCircle, 
  History, 
  Settings, 
  LogOut, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp,
  Wallet,
  ShieldCheck,
  Bell
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const accRes = await axios.get(`${API_URL}/api/accounts/me`, config);
      setUser(accRes.data.data.profile);
      setAccount(accRes.data.data.account);

      const histRes = await axios.get(`${API_URL}/api/transactions/history`, config);
      setTransactions(histRes.data.data);
    } catch (err) {
      console.error(err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex text-white font-['Outfit']">
      
      {/* Sidebar Sidebar */}
      <aside className="w-72 glass-card rounded-none border-r border-white border-opacity-5 flex flex-col p-8 fixed h-full z-40">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-black" size={24} />
          </div>
          <span className="text-xl font-bold gold-gradient tracking-tight">GOLD BANK</span>
        </div>

        <nav className="flex-1 space-y-4">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="RESUMEN" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarLink icon={<Send size={20} />} label="TRANSFERIR" active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} />
          <SidebarLink icon={<PlusCircle size={20} />} label="ABONAR" active={activeTab === 'deposit'} onClick={() => setActiveTab('deposit')} />
          <SidebarLink icon={<History size={20} />} label="HISTORIAL" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-4 text-dim hover:text-red-500 transition-colors pt-8 border-t border-white border-opacity-5 font-bold text-xs uppercase tracking-widest">
          <LogOut size={18} /> CERRAR SESIÓN
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12 bg-gradient-to-br from-black to-[#050505]">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bienvenido, {user?.full_name.split(' ')[0]}</h1>
            <p className="text-dim text-sm tracking-widest uppercase font-semibold">Membresía Premium Gold Active</p>
          </div>
          <div className="flex gap-4">
            <button className="p-3 glass-card rounded-2xl text-dim hover:text-gold-primary transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center text-black font-bold">
              {user?.full_name[0]}
            </div>
          </div>
        </header>

        <AnimatePresence mode='wait'>
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              
              {/* Financial Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                
                {/* Gold Card */}
                <div className="lg:col-span-2 bg-gold-gradient p-10 rounded-[35px] text-black relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[4px] mb-2 opacity-60">Saldo Disponible</p>
                        <h2 className="text-6xl font-bold leading-none">${parseFloat(account?.balance).toLocaleString('es-CL')}</h2>
                      </div>
                      <ShieldCheck size={40} className="opacity-40" />
                    </div>
                    
                    <div className="mt-20 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[3px] opacity-60 mb-1">Número de Cuenta</p>
                        <p className="text-xl font-mono font-bold tracking-[2px]">{account?.account_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[3px] opacity-60 mb-1">Titular</p>
                        <p className="text-lg font-bold">{user?.full_name.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="glass-card p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-500 bg-opacity-10 flex items-center justify-center text-green-500">
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">Ingresos Mes</p>
                      <p className="text-2xl font-bold text-green-500">+$2.500.000</p>
                    </div>
                  </div>
                  <div className="glass-card p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500 bg-opacity-10 flex items-center justify-center text-blue-500">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">Límite de Transferencia</p>
                      <p className="text-2xl font-bold">$5.000.000</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Transactions Section */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <div className="xl:col-span-2">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold">Movimientos Recientes</h3>
                    <button onClick={() => setActiveTab('history')} className="text-gold-primary text-sm font-bold tracking-widest hover:underline uppercase">Ver Todo</button>
                  </div>
                  
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="glass-card p-12 text-center text-dim">No hay movimientos registrados.</div>
                    ) : (
                      transactions.slice(0, 5).map((t, i) => (
                        <div key={i} className="glass-card p-6 flex items-center justify-between hover:bg-white hover:bg-opacity-[0.02] transition-colors cursor-pointer group">
                          <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.type.includes('in') || t.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'} bg-opacity-10`}>
                              {t.type.includes('in') || t.type === 'deposit' ? <ArrowDownLeft size={20} className="text-green-500" /> : <ArrowUpRight size={20} className="text-red-500" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm mb-1">{t.description}</p>
                              <p className="text-[10px] text-dim uppercase tracking-widest font-bold">{new Date(t.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${t.type.includes('in') || t.type === 'deposit' ? 'text-green-500' : 'text-white'}`}>
                              {t.type.includes('in') || t.type === 'deposit' ? '+' : '-'}${parseFloat(t.amount).toLocaleString('es-CL')}
                            </p>
                            <p className="text-[10px] text-dim uppercase tracking-widest font-bold">Completado</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Transfer Form (Mini) */}
                <div className="glass-card p-10 h-fit">
                   <h3 className="text-xl font-bold mb-8">Acceso Rápido</h3>
                   <div className="space-y-4">
                      <button onClick={() => setActiveTab('transfer')} className="w-full btn-premium bg-white bg-opacity-5 hover:bg-gold-primary hover:text-black transition-all">
                        <Send size={18} /> NUEVA TRANSFERENCIA
                      </button>
                      <button onClick={() => setActiveTab('deposit')} className="w-full btn-premium border border-gold-primary border-opacity-30 text-gold-primary hover:bg-gold-primary hover:text-black transition-all">
                        <PlusCircle size={18} /> CARGAR SALDO
                      </button>
                   </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'transfer' && <TransferForm onCancel={() => setActiveTab('overview')} onSuccess={fetchData} />}
          {activeTab === 'deposit' && <DepositForm onCancel={() => setActiveTab('overview')} onSuccess={fetchData} />}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Sub-components
const SidebarLink = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-[2px] ${
      active 
        ? 'bg-gold-gradient text-black shadow-lg shadow-gold-500/20' 
        : 'text-dim hover:text-gold-primary hover:bg-white hover:bg-opacity-5'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

const TransferForm = ({ onCancel, onSuccess }) => {
  const [dest, setDest] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/transactions/transfer', 
        { destination: dest, amount: parseFloat(amount), description: desc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('¡Transferencia Exitosa!');
      onSuccess();
      onCancel();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al transferir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Nueva Transferencia</h2>
      <form onSubmit={handleTransfer} className="glass-card p-10 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-dim uppercase tracking-widest">Destinatario (RUT o N° Cuenta)</label>
          <input required value={dest} onChange={e => setDest(e.target.value)} className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-4 outline-none focus:border-gold-primary transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-dim uppercase tracking-widest">Monto a Transferir</label>
          <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-4 outline-none focus:border-gold-primary transition-all text-2xl font-bold" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-dim uppercase tracking-widest">Glosa / Comentario</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-4 outline-none focus:border-gold-primary transition-all" />
        </div>
        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
        <div className="flex gap-4 pt-6">
          <button type="submit" disabled={loading} className="flex-1 btn-premium btn-gold py-5 font-bold">{loading ? 'PROCESANDO...' : 'CONFIRMAR ENVÍO'}</button>
          <button type="button" onClick={onCancel} className="flex-1 btn-premium bg-white bg-opacity-5 font-bold">CANCELAR</button>
        </div>
      </form>
    </motion.div>
  );
};

const DepositForm = ({ onCancel, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/transactions/deposit', 
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('¡Saldo Cargado!');
      onSuccess();
      onCancel();
    } catch (err) {
      alert('Error al cargar saldo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Abonar Saldo</h2>
      <form onSubmit={handleDeposit} className="glass-card p-10 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-dim uppercase tracking-widest">Monto del Abono</label>
          <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl p-4 outline-none focus:border-gold-primary transition-all text-4xl font-bold text-center" />
        </div>
        <div className="flex gap-4 pt-6">
          <button type="submit" disabled={loading} className="flex-1 btn-premium btn-gold py-5 font-bold uppercase">{loading ? 'Cargando...' : 'Confirmar Abono'}</button>
          <button type="button" onClick={onCancel} className="flex-1 btn-premium bg-white bg-opacity-5 font-bold">CANCELAR</button>
        </div>
      </form>
    </motion.div>
  );
};

export default Dashboard;
