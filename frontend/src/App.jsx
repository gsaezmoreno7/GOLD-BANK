import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, CreditCard, ArrowRight, Globe, ShieldCheck, 
  Zap, Lock, Landmark, Award, Users, ChevronRight,
  TrendingUp, Fingerprint, Smartphone
} from 'lucide-react';
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
      --bg-card: #121214;
      --text-white: #ffffff;
      --text-gray: #71717a;
      --gold-gradient: linear-gradient(135deg, #d4af37 0%, #f2d388 50%, #9a7d46 100%);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background-color: var(--bg-black); 
      color: var(--text-white); 
      font-family: 'Outfit', sans-serif; 
      overflow-x: hidden; 
      line-height: 1.6;
    }
    .container-premium { max-width: 1300px; margin: 0 auto; padding: 0 40px; width: 100%; }
    .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .flex-center { display: flex; align-items: center; justify-content: center; }
    
    .navbar-gold {
      position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
      background: rgba(10, 10, 11, 0.85);
      backdrop-filter: blur(25px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
      padding: 20px 0;
      transition: 0.4s;
    }
    .logo-container { display: flex; align-items: center; gap: 15px; }
    .logo-icon {
      width: 42px; height: 42px;
      background: var(--gold-gradient);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: #000;
      box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2);
    }
    .nav-links { display: flex; gap: 40px; align-items: center; }
    .nav-links a { color: #aaa; text-decoration: none; font-weight: 700; font-size: 0.85rem; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px; }
    .nav-links a:hover { color: var(--gold-primary); }

    .hero-section {
      position: relative; height: 100vh; min-height: 800px;
      display: flex; align-items: center; overflow: hidden;
    }
    .hero-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; scale: 1.1; }
    .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.4) 100%); z-index: -1; }
    
    .hero-title { font-size: 6rem; font-weight: 900; line-height: 1; margin-bottom: 30px; letter-spacing: -3px; }
    .gold-text { background: var(--gold-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .btn-gold {
      background: var(--gold-gradient); color: black;
      padding: 20px 45px; border-radius: 15px;
      font-weight: 900; border: none; cursor: pointer;
      text-decoration: none; display: inline-flex; align-items: center; gap: 12px;
      transition: 0.4s; font-size: 1.1rem; letter-spacing: 0.5px;
    }
    .btn-gold:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(212, 175, 55, 0.4); }
    
    .btn-outline-gold {
      border: 1px solid var(--gold-primary); color: var(--gold-primary);
      padding: 14px 28px; border-radius: 12px;
      text-decoration: none; font-weight: 800; transition: 0.3s;
      font-size: 0.9rem; text-transform: uppercase;
    }
    .btn-outline-gold:hover { background: rgba(212, 175, 55, 0.1); color: white; border-color: white; }

    .grid-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; }
    .feature-card { 
      background: var(--bg-card); padding: 60px 40px; border-radius: 35px; 
      border: 1px solid rgba(255,255,255,0.03); transition: 0.4s;
      position: relative; overflow: hidden;
    }
    .feature-card:hover { border-color: var(--gold-primary); transform: translateY(-10px); background: #161619; }
    .feature-card::after { content: ''; position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: var(--gold-gradient); opacity: 0.03; filter: blur(40px); }

    .trust-bar { background: #080809; border-top: 1px solid #111; border-bottom: 1px solid #111; padding: 40px 0; }
    .trust-item { color: #444; font-weight: 900; font-size: 1.5rem; letter-spacing: 2px; }
    
    footer { background: #050505; padding: 100px 0 50px; border-top: 1px solid #111; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; }
    .footer-title { color: white; font-weight: 900; margin-bottom: 25px; font-size: 1.1rem; }
    .footer-link { color: #555; text-decoration: none; display: block; margin-bottom: 12px; font-weight: 600; font-size: 0.9rem; transition: 0.3s; }
    .footer-link:hover { color: var(--gold-primary); }
  `}</style>
);

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      <GlobalStyles />
      
      {/* 1. TOP UTILITY BAR */}
      <div style={{ background: '#000', padding: '10px 0', borderBottom: '1px solid #0a0a0a', position: 'relative', zIndex: 1100 }}>
        <div className="container-premium flex-between" style={{ fontSize: '11px', fontWeight: '900', color: '#444', letterSpacing: '2px' }}>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span style={{ color: 'var(--gold-primary)' }}>GOLD PRIVATE</span>
            <span>CORPORATE</span>
            <span>WEALTH MANAGEMENT</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span className="flex-center" style={{ gap: '6px' }}><Globe size={13} /> SANTIAGO, CL</span>
            <span className="flex-center" style={{ gap: '6px', color: '#4ade80' }}><ShieldCheck size={13} /> SECURED BY GOLD-EYE</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION */}
      <nav className="navbar-gold">
        <div className="container-premium flex-between">
          <div className="logo-container">
            <div className="logo-icon"><Landmark size={22} /></div>
            <span style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-2px' }}>GOLD<span className="gold-text">BANK</span></span>
          </div>
          <div className="nav-links">
            <a href="#patrimonio">Patrimonio</a>
            <a href="#servicios">Servicios</a>
            <a href="#seguridad">Seguridad</a>
            <Link to="/login" className="btn-outline-gold">ACCESO CLIENTES</Link>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="hero-section">
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }} 
          animate={{ scale: 1.05, opacity: 0.7 }} 
          transition={{ duration: 2 }}
          src={heroPremium} className="hero-image" alt="Luxury" 
        />
        <div className="hero-overlay"></div>
        <div className="container-premium">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <div style={{ width: '50px', height: '1px', background: 'var(--gold-primary)' }}></div>
              <span style={{ color: 'var(--gold-primary)', fontWeight: '900', letterSpacing: '4px', fontSize: '0.8rem' }}>ESTABLECIDO EN 1924</span>
            </div>
            <h1 className="hero-title">Definiendo el <br /><span className="gold-text">Estándar de Oro</span></h1>
            <p style={{ fontSize: '1.4rem', color: '#888', marginBottom: '45px', maxWidth: '650px', fontWeight: '500' }}>
              Soluciones bancarias de élite para los líderes de hoy. Seguridad absoluta con un diseño inigualable.
            </p>
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
              <Link to="/register" className="btn-gold">SOLICITAR INGRESO <ChevronRight size={22} /></Link>
              <a href="#servicios" style={{ color: 'white', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem', borderBottom: '1px solid #333', paddingBottom: '5px' }}>Ver Servicios Wealth</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. TRUST BAR */}
      <div className="trust-bar">
        <div className="container-premium flex-between" style={{ opacity: 0.3 }}>
          <span className="trust-item">FORBES 500</span>
          <span className="trust-item">BLOOMBERG EXCLUSIVE</span>
          <span className="trust-item">PRIVATE BANKING AWARD</span>
          <span className="trust-item">S&P GLOBAL AA+</span>
        </div>
      </div>

      {/* 5. SERVICES FEATURES */}
      <section id="servicios" style={{ padding: '150px 0' }}>
        <div className="container-premium">
          <div style={{ textAlign: 'center', marginBottom: '100px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1.5px' }}>Servicios <span className="gold-text">Sin Fronteras</span></h2>
            <p style={{ color: '#555', maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem', fontWeight: '600' }}>
              Diseñamos experiencias financieras personalizadas para la gestión de grandes patrimonios.
            </p>
          </div>

          <div className="grid-features">
            <FeatureCard 
              icon={<Fingerprint size={40} />} 
              title="Seguridad Biométrica" 
              desc="Acceso protegido por los estándares más altos de encriptación y biometría avanzada."
            />
            <FeatureCard 
              icon={<TrendingUp size={40} />} 
              title="Gestión de Activos" 
              desc="Estrategias de inversión personalizadas para preservar y crecer su legado familiar."
            />
            <FeatureCard 
              icon={<Smartphone size={40} />} 
              title="Banca Omnicanal" 
              desc="Controle sus activos desde cualquier lugar del mundo con nuestra plataforma dedicada."
            />
          </div>
        </div>
      </section>

      {/* 6. SECONDARY HERO */}
      <section style={{ background: '#080809', padding: '120px 0' }}>
        <div className="container-premium flex-between">
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '30px', letterSpacing: '-1px' }}>Un Banco <span className="gold-text">A Su Medida</span></h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '40px' }}>
              En Gold Bank entendemos que su tiempo es el activo más valioso. Por eso, cada cliente cuenta con un gestor personal disponible 24/7.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div><h4 style={{ color: '#d4af37', marginBottom: '10px' }}>+50 Países</h4><p style={{ fontSize: '0.8rem', color: '#444' }}>Presencia global en los principales centros financieros.</p></div>
              <div><h4 style={{ color: '#d4af37', marginBottom: '10px' }}>100% Digital</h4><p style={{ fontSize: '0.8rem', color: '#444' }}>Operaciones instantáneas sin necesidad de sucursales físicas.</p></div>
            </div>
          </div>
          <div style={{ width: '450px', height: '450px', background: 'var(--gold-gradient)', borderRadius: '40px', opacity: 0.05, filter: 'blur(60px)', position: 'absolute', right: '10%' }}></div>
          <div style={{ position: 'relative' }}>
             <Shield size={250} color="#d4af37" style={{ opacity: 0.1 }} />
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <Award size={80} color="#d4af37" />
             </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer>
        <div className="container-premium">
          <div className="footer-grid">
            <div>
              <div className="logo-container" style={{ marginBottom: '30px' }}>
                <div className="logo-icon"><Landmark size={20} /></div>
                <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-1.5px' }}>GOLD<span className="gold-text">BANK</span></span>
              </div>
              <p style={{ color: '#333', fontSize: '0.85rem', fontWeight: '700', lineHeight: 2 }}>
                Institución financiera regulada internacionalmente. <br />
                © 2026 Gold Bank Corporation. <br />
                Todos los derechos reservados.
              </p>
            </div>
            <div>
              <h4 className="footer-title">Privacidad</h4>
              <a href="#" className="footer-link">Términos de Uso</a>
              <a href="#" className="footer-link">Política de Cookies</a>
              <a href="#" className="footer-link">Protección de Datos</a>
            </div>
            <div>
              <h4 className="footer-title">Servicios</h4>
              <a href="#" className="footer-link">Private Banking</a>
              <a href="#" className="footer-link">Inversiones</a>
              <a href="#" className="footer-link">Tarjetas Black</a>
            </div>
            <div>
              <h4 className="footer-title">Contacto</h4>
              <a href="#" className="footer-link">Soporte 24/7</a>
              <a href="#" className="footer-link">Directorio Ejecutivo</a>
              <a href="#" className="footer-link">Oficinas Globales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="gold-text" style={{ marginBottom: '30px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '20px' }}>{title}</h3>
    <p style={{ color: '#666', fontWeight: '600' }}>{desc}</p>
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
