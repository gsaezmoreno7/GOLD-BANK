import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CreditCard, PieChart, Users, ArrowRight, Menu, X, ChevronRight, Globe, ShieldCheck, BadgeDollarSign, Zap, Lock, User } from 'lucide-react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#333]">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-white border-b border-gray-100 py-2 px-8 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="flex gap-8">
            <span className="text-gold-dark font-black cursor-pointer hover:text-gold-primary transition-colors">Personas</span>
            <span className="cursor-pointer hover:text-gold-primary transition-colors">Banca Privada</span>
            <span className="cursor-pointer hover:text-gold-primary transition-colors">Inversiones</span>
            <span className="cursor-pointer hover:text-gold-primary transition-colors">Empresas</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 cursor-pointer hover:text-gold-primary transition-colors">
              <Globe size={14} /> <span>Chile</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gold-primary transition-colors">
              <ShieldCheck size={14} /> <span>Seguridad</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <nav className="bg-white sticky top-0 z-50 shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <div className="flex items-center gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold">
                <Shield className="text-black" size={28} />
              </div>
              <span className="text-3xl font-black tracking-tighter text-black uppercase">Gold<span className="text-gold-dark">Bank</span></span>
            </div>
            
            <div className="hidden lg:flex gap-10 text-sm font-black text-gray-700 uppercase tracking-wider">
              <span className="hover:text-gold-primary cursor-pointer transition-colors">Cuentas</span>
              <span className="hover:text-gold-primary cursor-pointer transition-colors">Tarjetas</span>
              <span className="hover:text-gold-primary cursor-pointer transition-colors">Créditos</span>
              <span className="hover:text-gold-primary cursor-pointer transition-colors">Seguros</span>
            </div>
          </div>

          <div className="flex gap-5">
            <Link to="/register" className="hidden md:flex items-center px-8 py-3.5 border-2 border-gold-primary text-gold-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-primary/5 transition-all">
              Hazte Cliente
            </Link>
            <Link to="/login" className="flex items-center px-10 py-3.5 bg-gold-gradient text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-gold-lg hover:scale-105 transition-all">
              Acceso Clientes <User size={18} className="ml-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="relative h-[650px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/src/assets/hero_premium.png" 
            alt="Premium Banking" 
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-8">
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              La Evolución del <br />
              <span className="gold-text italic">Privilegio Bancario</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed font-light max-w-xl">
              Experimente la banca privada de próxima generación. Seguridad absoluta, tecnología de punta y un diseño pensado para su éxito financiero.
            </p>
            <div className="flex gap-6">
              <Link to="/register" className="btn-premium btn-gold px-12 py-5 text-lg shadow-gold-xl">
                Abrir Cuenta Gold <ChevronRight size={22} />
              </Link>
              <button className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full font-black text-white text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                Conocer Más
              </button>
            </div>
          </motion.div>
        </div>

        {/* 4. QUICK ACTION CARDS */}
        <div className="absolute bottom-0 w-full px-8 translate-y-1/2 left-0">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <CreditCard size={36} />, title: "Cuentas", desc: "Gestione su patrimonio con exclusividad." },
              { icon: <BadgeDollarSign size={36} />, title: "Inversiones", desc: "Haga crecer sus activos con nosotros." },
              { icon: <Zap size={36} />, title: "Créditos", desc: "Financiamiento inmediato tasa Gold." },
              { icon: <Lock size={36} />, title: "Seguridad", desc: "Protección multinivel garantizada." }
            ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-2xl border-b-[6px] border-gold-primary hover:-translate-y-3 transition-all cursor-pointer group">
                <div className="text-gold-dark mb-6 group-hover:scale-110 transition-transform inline-block">
                  {card.icon}
                </div>
                <h3 className="font-black text-xl mb-2 text-black">{card.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-snug">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="mt-48 bg-white border-t border-gray-100 py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3 grayscale opacity-70">
             <Shield className="text-gold-dark" size={24} />
             <span className="text-xl font-black tracking-tighter text-black uppercase">GoldBank</span>
          </div>
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">
            © 2026 GOLD BANK S.A. | MIEMBRO DEL GRUPO DE PRESTIGIO MUNDIAL
          </div>
          <div className="flex gap-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span className="hover:text-gold-primary cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-gold-primary cursor-pointer transition-colors">Términos</span>
            <span className="hover:text-gold-primary cursor-pointer transition-colors">Contacto</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
