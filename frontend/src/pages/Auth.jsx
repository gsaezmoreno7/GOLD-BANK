import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, IdCard, ArrowLeft, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black">
      {/* Orbes de Fondo dinámicos */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold-dark/10 rounded-full blur-[120px] animate-pulse"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] glass-card p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-gold-lg"
          >
            <Shield size={42} className="text-black" />
          </motion.div>
          <h2 className="text-4xl font-black mb-3 text-gold-gradient">
            {mode === 'login' ? 'Bienvenido de Nuevo' : 'Nueva Cuenta Gold'}
          </h2>
          <p className="text-text-dim text-lg">
            {mode === 'login' ? 'Acceda a su círculo de privilegio' : 'Únase a la élite financiera global'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3"
          >
            <ShieldCheck size={20} />
            <span className="font-medium text-sm">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gold-light ml-1">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-gold-primary transition-colors" size={20} />
                  <input 
                    name="full_name"
                    type="text" 
                    placeholder="Juan Pérez"
                    className="input-premium pl-12"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gold-light ml-1">RUT</label>
                <div className="relative group">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-gold-primary transition-colors" size={20} />
                  <input 
                    name="rut"
                    type="text" 
                    placeholder="12.345.678-9"
                    className="input-premium pl-12"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gold-light ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-gold-primary transition-colors" size={20} />
              <input 
                name="email"
                type="email" 
                placeholder="usuario@email.com"
                className="input-premium pl-12"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gold-light ml-1">Clave Maestra</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-gold-primary transition-colors" size={20} />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••••••"
                className="input-premium pl-12"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-premium w-full mt-4 h-14 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {mode === 'login' ? 'ENTRAR AL PORTAL' : 'SOLICITAR MEMBRESÍA'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link 
            to={mode === 'login' ? '/register' : '/login'} 
            className="text-text-dim hover:text-gold-primary transition-all flex items-center justify-center gap-2 font-medium"
          >
            {mode === 'login' ? (
              <>¿No es miembro? <span className="text-gold-primary">Únase aquí</span></>
            ) : (
              <><ArrowLeft size={16} /> Volver al Acceso</>
            )}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
