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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Outfit']">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-24 md:w-72 bg-bg-card border-r border-white/5 flex flex-col items-center py-10 z-50">
        <div className="w-14 h-14 bg-gold-gradient rounded-2xl flex items-center justify-center mb-16 shadow-gold-lg">
          <Shield size={30} className="text-black" />
        </div>

        <nav className="flex-1 space-y-4 w-full px-4">
          <NavItem icon={<LayoutDashboard size={24} />} label="Dashboard" active />
          <NavItem icon={<Wallet size={24} />} label="Cuentas" />
          <NavItem icon={<History size={24} />} label="Movimientos" />
          <NavItem icon={<CreditCard size={24} />} label="Tarjetas" />
          <NavItem icon={<User size={24} />} label="Perfil" />
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto p-4 text-text-dim hover:text-red-400 transition-colors flex items-center gap-4 w-full px-8 font-semibold"
        >
          <LogOut size={24} />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pl-24 md:pl-72 p-6 md:p-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              Bienvenido, <span className="text-gold-gradient">{user.full_name?.split(' ')[0]}</span>
            </h1>
            <p className="text-text-dim text-lg font-medium">Estado de su cuenta Gold Premium</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={20} />
              <input 
                type="text" 
                placeholder="Buscar transacción..." 
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-64 focus:border-gold-primary outline-none transition-all"
              />
            </div>
            <button className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all relative">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-3 h-3 bg-gold-primary rounded-full border-2 border-black"></span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* BALANCE CARD */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gold-gradient rounded-[40px] p-10 md:p-14 text-black relative overflow-hidden shadow-gold-2xl group"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Shield size={200} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] font-black opacity-60 mb-2">Saldo Disponible</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
                      ${account?.balance?.toLocaleString('es-CL')}
                    </h2>
                  </div>
                  <div className="bg-black/10 p-4 rounded-3xl backdrop-blur-sm">
                    <CreditCard size={32} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button className="flex-1 min-w-[140px] bg-black text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all shadow-xl">
                    <Send size={20} /> Transferir
                  </button>
                  <button className="flex-1 min-w-[140px] bg-black/20 text-black px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 backdrop-blur-md hover:bg-black/30 transition-all">
                    <Plus size={20} /> Recargar
                  </button>
                </div>
              </div>
            </motion.div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <QuickAction icon={<Send />} label="Transferir" />
              <QuickAction icon={<ArrowDownLeft />} label="Recibir" />
              <QuickAction icon={<CreditCard />} label="Tarjetas" />
              <QuickAction icon={<Settings />} label="Ajustes" />
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="lg:col-span-4">
            <div className="glass-card p-8 h-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Movimientos</h3>
                <button className="text-gold-primary text-sm font-bold hover:underline">Ver Todo</button>
              </div>

              <div className="space-y-6">
                {transactions.length > 0 ? transactions.map((t, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={t.id} 
                    className="flex items-center gap-5 group cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      t.type === 'income' ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'
                    }`}>
                      {t.type === 'income' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-0.5">{t.description}</p>
                      <p className="text-text-dim text-sm font-medium">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`text-right font-black text-lg ${
                      t.type === 'income' ? 'text-green-400' : 'text-white'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString('es-CL')}
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-20 opacity-30">
                    <History size={64} className="mx-auto mb-4" />
                    <p className="font-bold">Sin movimientos aún</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${
    active 
      ? 'bg-gold-primary/10 text-gold-primary' 
      : 'text-text-dim hover:bg-white/5 hover:text-white'
  }`}>
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

const QuickAction = ({ icon, label }) => (
  <button className="bg-bg-card border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-gold-primary/50 transition-all group">
    <div className="text-text-dim group-hover:text-gold-primary transition-colors">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <span className="text-sm font-bold text-text-dim group-hover:text-white">{label}</span>
  </button>
);

export default Dashboard;
