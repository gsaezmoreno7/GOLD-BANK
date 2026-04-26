import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CreditCard, PieChart, Users, ArrowRight, Menu, X } from 'lucide-react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed w-full z-50 px-8 py-6 flex justify-between items-center glass-card border-none rounded-none bg-opacity-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center">
            <Shield className="text-black" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tighter gold-gradient">GOLD BANK</span>
        </div>
        
        <div className="hidden md:flex gap-10 text-sm font-semibold tracking-widest text-dim">
          <a href="#services" className="hover:text-gold-primary transition-colors">SERVICIOS</a>
          <a href="#security" className="hover:text-gold-primary transition-colors">SEGURIDAD</a>
          <a href="#about" className="hover:text-gold-primary transition-colors">NOSOTROS</a>
        </div>

        <Link to="/login" className="btn-premium btn-gold">
          ACCESO CLIENTES
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-primary opacity-10 blur-[150px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-blue opacity-10 blur-[150px] -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
          >
            La Evolución del <br /> 
            <span className="gold-gradient">Privilegio Bancario</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-dim max-w-2xl mx-auto mb-12"
          >
            Experimente la banca privada de próxima generación. Seguridad absoluta, 
            tecnología de punta y un diseño pensado para el éxito financiero.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row gap-6 justify-center"
          >
            <Link to="/register" className="btn-premium btn-gold px-12 py-5 text-lg">
              ABRIR CUENTA GOLD <ArrowRight size={20} />
            </Link>
            <button className="btn-premium glass-card border-gold-primary border-opacity-30 px-12 py-5 text-lg">
              CONOCER MÁS
            </button>
          </motion.div>
        </div>

        {/* Feature Grid Preview */}
        <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <CreditCard size={32} />, title: "Tarjetas Titanium", desc: "Diseño elegante con beneficios mundiales exclusivos." },
            { icon: <PieChart size={32} />, title: "Gestión de Activos", desc: "Visualice su patrimonio con herramientas de precisión." },
            { icon: <Shield size={32} />, title: "Seguridad Cuántica", desc: "Protección multinivel para cada una de sus transacciones." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass-card p-10 text-center group transition-all"
            >
              <div className="text-gold-primary mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl mb-4">{feature.title}</h3>
              <p className="text-dim">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white border-opacity-5 text-center text-dim">
        <p>© 2024 GOLD BANK S.A. | SEGURIDAD Y PRESTIGIO</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Próximas rutas se agregarán aquí */}
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
