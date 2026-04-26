import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, IdCard, ArrowLeft, Loader2 } from 'lucide-react';
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
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`http://localhost:3000${endpoint}`, formData);
      
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-primary opacity-10 blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-blue opacity-10 blur-[150px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-10 relative z-10"
      >
        <Link to="/" className="flex items-center gap-2 text-dim hover:text-gold-primary transition-colors mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> VOLVER
        </Link>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Shield className="text-black" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2 uppercase tracking-tight">
            {mode === 'login' ? 'Bienvenido a Gold' : 'Únete al Prestigio'}
          </h2>
          <p className="text-dim text-sm">
            {mode === 'login' ? 'Ingrese sus credenciales de acceso seguro' : 'Complete sus datos para la membresía Gold'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase tracking-widest ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
                  <input 
                    name="full_name"
                    type="text" 
                    required
                    onChange={handleChange}
                    className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold-primary transition-all text-sm"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase tracking-widest ml-1">RUT</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
                  <input 
                    name="rut"
                    type="text" 
                    required
                    onChange={handleChange}
                    className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold-primary transition-all text-sm"
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-dim uppercase tracking-widest ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
              <input 
                name="email"
                type="email" 
                required
                onChange={handleChange}
                className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold-primary transition-all text-sm"
                placeholder="usuario@goldbank.cl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-dim uppercase tracking-widest ml-1">Clave Maestra</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
              <input 
                name="password"
                type="password" 
                required
                onChange={handleChange}
                className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold-primary transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-red-500 p-4 rounded-xl text-xs text-center font-bold"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-premium btn-gold py-5 text-sm font-bold shadow-2xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'ACCEDER AL PORTAL' : 'CREAR CUENTA PREMIUM')}
          </button>
        </form>

        <div className="mt-10 text-center text-sm">
          <p className="text-dim">
            {mode === 'login' ? '¿Aún no es cliente Gold?' : '¿Ya tiene una membresía?'} 
            <Link 
              to={mode === 'login' ? '/register' : '/login'} 
              className="text-gold-primary font-bold ml-2 hover:underline"
            >
              {mode === 'login' ? 'Solicitar Membresía' : 'Iniciar Sesión'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
