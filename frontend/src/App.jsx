import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CreditCard, ArrowRight, Globe, ShieldCheck, Zap, Lock } from 'lucide-react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import heroPremium from './assets/hero_premium.png';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    :root {
      --gold-primary: #d4af37;
      --gold-light: #f2d388;
      --gold-dark: #9a7d46;
      --bg-black: #0a0a0b;
      --bg-card: #141416;
      --text-white: #ffffff;
      --text-gray: #a1a1aa;
      --gold-gradient: linear-gradient(135deg, #d4af37 0%, #f2d388 50%, #9a7d46 100%);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background-color: var(--bg-black); 
      color: var(--text-white); 
      font-family: 'Outfit', sans-serif; 
      overflow-x: hidden; 
    }
    .container-premium { max-width: 1200px; margin: 0 auto; padding: 0 20px; width: 100%; }
    .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .flex-center { display: flex; align-items: center; justify-content: center; }
    
    .navbar-gold {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(10, 10, 11, 0.9);
      backdrop-filter: blur(15px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      padding: 15px 0;
    }
    .logo-container { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 40px; height: 40px;
      background: var(--gold-gradient);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #000;
      box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
    }
    .nav-links { display: flex; gap: 30px; align-items: center; }
    .nav-links a { color: white; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: 0.3s; }
    .nav-links a:hover { color: var(--gold-primary); }

    .hero-section {
      position: relative; height: 80vh; min-height: 600px;
      display: flex; align-items: center; overflow: hidden;
    }
    .hero-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
    .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.3) 100%); z-index: -1; }
    
    .hero-title { font-size: 4.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 25px; }
    .gold-text { background: var(--gold-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .btn-gold {
      background: var(--gold-gradient); color: black;
      padding: 16px 35px; border-radius: 12px;
      font-weight: 800; border: none; cursor: pointer;
      text-decoration: none; display: inline-flex; align-items: center; gap: 10px;
      transition: 0.3s;
    }
    .btn-gold:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4); }
    
    .btn-outline-gold {
      border: 1px solid var(--gold-primary); color: var(--gold-primary);
      padding: 10px 20px; border-radius: 10px;
      text-decoration: none; font-weight: 700; transition: 0.3s;
    }

    .grid-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; padding: 80px 0; }
    .feature-card { background: var(--bg-card); padding: 40px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
  `}</style>
);

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      <GlobalStyles />
      {/* 1. TOP UTILITY BAR */}
      <div style={{ background: '#000', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
        <div className="container-premium flex-between" style={{ fontSize: '10px', fontWeight: '800', color: '#555', letterSpacing: '1.5px' }}>
          <div style={{ display: 'flex', gap: '25px' }}>
            <span style={{ color: 'var(--gold-primary)' }}>PERSONAS</span>
            <span>BANCA PRIVADA</span>
            <span>INVERSIONES</span>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span className="flex-center" style={{ gap: '5px' }}><Globe size={12} /> CHILE</span>
            <span className="flex-center" style={{ gap: '5px' }}><ShieldCheck size={12} /> SEGURIDAD</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION */}
      <nav className="navbar-gold">
        <div className="container-premium flex-between">
          <div className="logo-container">
            <div className="logo-icon"><Shield size={24} /></div>
            <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>GOLD<span className="gold-text">BANK</span></span>
          </div>
          <div className="nav-links">
            <a href="#cuentas">Cuentas</a>
            <a href="#tarjetas">Tarjetas</a>
            <Link to="/login" className="btn-outline-gold">ACCESO</Link>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="hero-section">
        <img src={heroPremium} className="hero-image" alt="Luxury" />
        <div className="hero-overlay"></div>
        <div className="container-premium">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="hero-title">La Evolución del <br /><span className="gold-text">Privilegio</span></h1>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '35px', maxWidth: '550px' }}>
              Seguridad absoluta y diseño pensado para su éxito financiero.
            </p>
            <Link to="/register" className="btn-gold">ABRIR CUENTA GOLD <ArrowRight size={18} /></Link>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section className="container-premium">
        <div className="grid-features">
          <div className="feature-card">
            <div className="gold-text" style={{ marginBottom: '20px' }}><CreditCard size={35} /></div>
            <h3>Cuentas Exclusivas</h3>
            <p style={{ color: 'var(--text-gray)', marginTop: '10px' }}>Gestión patrimonial de alta dirección.</p>
          </div>
          <div className="feature-card">
            <div className="gold-text" style={{ marginBottom: '20px' }}><Zap size={35} /></div>
            <h3>Inversiones Gold</h3>
            <p style={{ color: 'var(--text-gray)', marginTop: '10px' }}>Acceso preferencial a mercados globales.</p>
          </div>
          <div className="feature-card">
            <div className="gold-text" style={{ marginBottom: '20px' }}><Lock size={35} /></div>
            <h3>Seguridad Nivel 5</h3>
            <p style={{ color: 'var(--text-gray)', marginTop: '10px' }}>Protección multinivel garantizada.</p>
          </div>
        </div>
      </section>
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
