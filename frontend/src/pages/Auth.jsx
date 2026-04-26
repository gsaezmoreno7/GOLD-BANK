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
    <div className="flex-center" style={{ minHeight: '100vh', padding: '20px', background: 'var(--bg-black)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'rgba(154, 125, 70, 0.05)', borderRadius: '50%', filter: 'blur(100px)' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ maxWidth: '500px', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 25px', width: '70px', height: '70px' }}>
            <Shield size={35} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }} className="gold-text">
            {mode === 'login' ? 'Acceso Privado' : 'Membresía Gold'}
          </h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
            {mode === 'login' ? 'Bienvenido a su portal exclusivo' : 'Inicie su camino al éxito financiero'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '15px', borderRadius: '12px', marginBottom: '25px', fontSize: '0.9rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--gold-light)' }}>NOMBRE COMPLETO</label>
              <input name="full_name" type="text" placeholder="Juan Pérez" className="input-premium" onChange={handleChange} required />
              
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--gold-light)' }}>RUT</label>
              <input name="rut" type="text" placeholder="12.345.678-9" className="input-premium" onChange={handleChange} required />
            </>
          )}

          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--gold-light)' }}>CORREO ELECTRÓNICO</label>
          <input name="email" type="email" placeholder="usuario@email.com" className="input-premium" onChange={handleChange} required />

          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--gold-light)' }}>CLAVE MAESTRA</label>
          <input name="password" type="password" placeholder="••••••••••••" className="input-premium" onChange={handleChange} required />

          <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', marginTop: '20px', justifyContent: 'center', height: '60px' }}>
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {mode === 'login' ? 'ENTRAR AL PORTAL' : 'CONFIRMAR SOLICITUD'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link 
            to={mode === 'login' ? '/register' : '/login'} 
            style={{ color: 'var(--text-gray)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
          >
            {mode === 'login' ? (
              <>¿No tiene cuenta? <span style={{ color: 'var(--gold-primary)' }}>Regístrese aquí</span></>
            ) : (
              <div className="flex-center" style={{ gap: '8px' }}><ArrowLeft size={16} /> Volver al Acceso</div>
            )}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
