import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CreditCard, PieChart, ArrowRight, Menu, Globe, ShieldCheck, Zap, Lock, ChevronRight } from 'lucide-react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import heroPremium from './assets/hero_premium.png';

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      {/* 1. TOP UTILITY BAR */}
      <div style={{ background: '#000', padding: '10px 0', borderBottom: '1px solid #222' }}>
        <div className="container-premium flex-between" style={{ fontSize: '11px', fontWeight: '900', color: '#666', letterSpacing: '2px' }}>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span style={{ color: 'var(--gold-primary)' }}>PERSONAS</span>
            <span>BANCA PRIVADA</span>
            <span>INVERSIONES</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span className="flex-center" style={{ gap: '5px' }}><Globe size={14} /> CHILE</span>
            <span className="flex-center" style={{ gap: '5px' }}><ShieldCheck size={14} /> SEGURIDAD</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION */}
      <nav className="navbar-gold">
        <div className="container-premium flex-between">
          <div className="logo-container">
            <div className="logo-icon">
              <Shield size={28} />
            </div>
            <span style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>GOLD<span className="gold-text">BANK</span></span>
          </div>
          
          <div className="nav-links">
            <a href="#cuentas">Cuentas</a>
            <a href="#tarjetas">Tarjetas</a>
            <a href="#inversiones">Inversiones</a>
            <Link to="/login" className="btn-outline-gold">ACCESO CLIENTES</Link>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="hero-section">
        <img src={heroPremium} className="hero-image" alt="Luxury Banking" />
        <div className="hero-overlay"></div>
        <div className="container-premium">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="hero-content"
          >
            <h1 className="hero-title">
              La Evolución del <br />
              <span className="gold-text">Privilegio</span>
            </h1>
            <p style={{ fontSize: '1.4rem', color: '#ccc', marginBottom: '40px', maxWidth: '600px' }}>
              Experimente la banca privada de próxima generación. Seguridad absoluta, tecnología de punta y un diseño pensado para su éxito financiero.
            </p>
            <Link to="/register" className="btn-gold">
              ABRIR CUENTA GOLD <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid-features">
            <FeatureCard 
              icon={<CreditCard size={40} />} 
              title="Cuentas Exclusivas" 
              desc="Gestione su patrimonio con herramientas diseñadas para la alta dirección."
            />
            <FeatureCard 
              icon={<Zap size={40} />} 
              title="Inversiones Gold" 
              desc="Acceso preferencial a mercados globales con asesoría de expertos."
            />
            <FeatureCard 
              icon={<Lock size={40} />} 
              title="Seguridad Nivel 5" 
              desc="Protección multinivel con los más altos estándares internacionales."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 0', borderTop: '1px solid #222', textAlign: 'center' }}>
        <div className="container-premium">
          <p style={{ color: '#444', fontWeight: '800', letterSpacing: '1px' }}>
            © 2026 GOLD BANK S.A. | MIEMBRO DEL GRUPO DE PRESTIGIO MUNDIAL
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card text-center">
    <div className="gold-text" style={{ marginBottom: '25px', display: 'inline-block' }}>{icon}</div>
    <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>{title}</h3>
    <p style={{ color: 'var(--text-gray)' }}>{desc}</p>
  </div>
);

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
