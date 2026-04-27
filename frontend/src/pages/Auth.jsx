import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Mail, Lock, User, IdCard,
  ArrowLeft, Loader2, ChevronRight,
  Eye, EyeOff, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = ({ mode = 'login' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    rut: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL || '';
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`${apiURL}${endpoint}`, formData);

      if (mode === 'login') {
        localStorage.setItem('token', response.data.data.session.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        navigate('/dashboard');
      } else {
        alert('Membresía creada con éxito. Ya puede acceder.');
        navigate('/login');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error de conexión';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at center, #111 0%, #000 100%)', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .glass-card { background: rgba(10, 10, 12, 0.95); backdrop-filter: blur(20px); padding: 50px; border-radius: 40px; border: 1px solid rgba(212, 175, 55, 0.15); width: 100%; max-width: 480px; box-shadow: 0 40px 100px rgba(0,0,0,0.8); }
        .gold-text { background: linear-gradient(135deg, #d4af37 0%, #f2d388 50%, #9a7d46 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .input-group { position: relative; margin-bottom: 20px; }
        .input-premium { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 18px 20px 18px 50px; border-radius: 15px; width: 100%; color: white; outline: none; transition: 0.3s; font-size: 1rem; }
        .input-premium:focus { border-color: #d4af37; background: rgba(212, 175, 55, 0.05); box-shadow: 0 0 20px rgba(212,175,55,0.1); }
        .input-icon { position: absolute; left: 18px; top: 20px; color: #555; }
        .eye-icon { position: absolute; right: 18px; top: 20px; color: #555; cursor: pointer; transition: 0.3s; }
        .eye-icon:hover { color: #d4af37; }
        .btn-gold { background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); color: black; padding: 18px; border-radius: 15px; font-weight: 900; border: none; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.4s; font-size: 1rem; letter-spacing: 1px; }
        .btn-gold:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(212, 175, 55, 0.4); }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#555', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase' }}>
            <ArrowLeft size={14} /> Volver al Inicio
          </Link>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #d4af37 0%, #f2d388 100%)', borderRadius: '20px', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(212,175,55,0.3)' }}>
            <Shield size={35} color="black" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>
            {mode === 'login' ? 'Bienvenido a ' : 'Únase a '}
            <span className="gold-text">GOLD BANK</span>
          </h2>
          <p style={{ color: '#666', marginTop: '10px', fontWeight: '600' }}>
            {mode === 'login' ? 'Ingrese sus credenciales de acceso privado' : 'Complete su solicitud de ingreso premium'}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '15px', borderRadius: '12px', marginBottom: '25px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(255,0,0,0.2)', fontWeight: '700' }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="input-group">
                <User className="input-icon" size={18} />
                <input name="full_name" type="text" placeholder="Nombre Completo" className="input-premium" onChange={handleChange} required autoComplete="name" />
              </div>
              <div className="input-group">
                <IdCard className="input-icon" size={18} />
                <input name="rut" type="text" placeholder="RUT (ej: 12.345.678-9)" className="input-premium" onChange={handleChange} required autoComplete="on" />
              </div>
            </>
          )}

          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input name="email" type="email" placeholder="Correo Electrónico" className="input-premium" onChange={handleChange} required autoComplete="email" />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Clave Maestra" className="input-premium" onChange={handleChange} required />
            <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold">
            {loading ? <Loader2 className="animate-spin" /> : (
              <>{mode === 'login' ? 'ACCEDER AL PORTAL' : 'CONFIRMAR SOLICITUD'} <ChevronRight size={20} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '35px', textAlign: 'center' }}>
          <p style={{ color: '#444', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>
            {mode === 'login' ? '¿Aún no es miembro?' : '¿Ya tiene una cuenta?'}
          </p>
          <Link to={mode === 'login' ? '/register' : '/login'} style={{ color: '#d4af37', textDecoration: 'none', fontWeight: '800', fontSize: '1rem', transition: '0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#d4af37'}>
            {mode === 'login' ? 'SOLICITAR MEMBRESÍA' : 'INICIAR SESIÓN PRIVADA'}
          </Link>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '20px', color: '#333' }}>
          <ShieldCheck size={20} />
          <p style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>ENCRYPTED END-TO-END</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
