import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, IdCard, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
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
      // Use relative path in production to avoid localhost issues
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
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#030303] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-primary opacity-5 blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1E3A8A] opacity-5 blur-[150px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-12 relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gold-primary mb-8 hover:opacity-80 transition-opacity">
            <ArrowLeft size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Regresar al Inicio</span>
          </Link>
          
          <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
             <Shield className="text-black" size={32} />
          </div>

          <h2 className="text-4xl font-black gold-text mb-2">
            {mode === 'login' ? 'Bienvenido' : 'Nueva Cuenta'}
          </h2>
          <p className="text-dim text-sm font-medium tracking-wide">
            {mode === 'login' ? 'Acceda a su banca privada exclusiva' : 'Únase al círculo de privilegio Gold'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {mode === 'register' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gold-primary uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-primary/60" size={20} />
                  <input 
                    name="full_name"
                    type="text" 
                    placeholder="Ej: Juan Pérez"
                    className="input-premium"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gold-primary uppercase tracking-[0.2em] ml-1">RUT</label>
                <div className="relative">
                  <IdCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-primary/60" size={20} />
                  <input 
                    name="rut"
                    type="text" 
                    placeholder="12.345.678-9"
                    className="input-premium"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gold-primary uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-primary/60" size={20} />
              <input 
                name="email"
                type="email" 
                placeholder="usuario@goldbank.cl"
                className="input-premium"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gold-primary uppercase tracking-[0.2em] ml-1">Clave Maestra</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-primary/60" size={20} />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                className="input-premium"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs text-center font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-premium btn-gold w-full mt-4 py-5 shadow-gold-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>{mode === 'login' ? 'INICIAR SESIÓN' : 'SOLICITAR MEMBRESÍA'} <ShieldCheck size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-dim text-sm font-medium">
            {mode === 'login' ? '¿Aún no es cliente Gold?' : '¿Ya tiene una cuenta?'}
            <Link 
              to={mode === 'login' ? '/register' : '/login'}
              className="text-gold-primary font-black ml-2 hover:underline tracking-tight"
            >
              {mode === 'login' ? 'Registrarse Aquí' : 'Entrar Ahora'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
