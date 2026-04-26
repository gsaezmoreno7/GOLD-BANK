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
        {/* Adorno decorativo de luz */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-primary opacity-10 blur-3xl rounded-full"></div>

        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gold-primary mb-6 hover:opacity-80 transition-opacity">
            <ArrowLeft size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Regresar</span>
          </Link>
          <h2 className="text-4xl font-bold gold-text mb-2">
            {isLogin ? 'Bienvenido' : 'Nueva Cuenta'}
          </h2>
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
