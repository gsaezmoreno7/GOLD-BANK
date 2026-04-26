import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, IdCard, ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = ({ mode = 'login' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        alert('Registro exitoso. Ahora puede iniciar sesión.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .glass-card { background: rgba(20, 20, 22, 0.9); backdrop-filter: blur(20px); padding: 40px; border-radius: 30px; border: 1px solid rgba(212, 175, 55, 0.2); width: 100%; max-width: 450px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .gold-text { background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .input-premium { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 12px; width: 100%; color: white; margin-bottom: 20px; outline: none; transition: 0.3s; }
        .input-premium:focus { border-color: #d4af37; background: rgba(255,255,255,0.08); }
        .btn-gold { background: linear-gradient(135deg, #d4af37 0%, #f2d388 100%); color: black; padding: 15px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }
      `}</style>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #d4af37 0%, #f2d388 100%)', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={30} color="black" />
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }} className="gold-text">
            {mode === 'login' ? 'Acceso Gold' : 'Membresía'}
          </h2>
        </div>

        {error && <div style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <input name="full_name" type="text" placeholder="Nombre Completo" className="input-premium" onChange={handleChange} required />
              <input name="rut" type="text" placeholder="RUT" className="input-premium" onChange={handleChange} required />
            </>
          )}
          <input name="email" type="email" placeholder="Correo Electrónico" className="input-premium" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Clave Maestra" className="input-premium" onChange={handleChange} required />

          <button type="submit" disabled={loading} className="btn-gold">
            {loading ? <Loader2 className="animate-spin" /> : (
              <>{mode === 'login' ? 'ENTRAR' : 'REGISTRARME'} <ChevronRight size={20} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <Link to={mode === 'login' ? '/register' : '/login'} style={{ color: '#aaa', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
            {mode === 'login' ? '¿No tiene cuenta? Regístrese' : '¿Ya es miembro? Acceda'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
