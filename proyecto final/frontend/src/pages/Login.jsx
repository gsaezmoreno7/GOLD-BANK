import { useState } from 'react';
import axios from 'axios';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { 
        correo: correo.trim(), 
        contrasena: contrasena.trim() 
      });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img src="/logo.png" alt="Maestranza R.S Logo" className="mx-auto h-24 w-auto object-contain mb-6 drop-shadow-md" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Bienvenido de vuelta
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Ingresa tus credenciales para acceder al sistema ERP
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-corporativoRojo p-4 rounded-md">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-corporativoAzul focus:border-transparent transition-all"
                  placeholder="admin@maestranzars.cl"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-corporativoAzul focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-corporativoRojo hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-corporativoRojo transition-all shadow-lg hover:shadow-red-900/30 disabled:opacity-70"
              >
                {loading ? 'Verificando...' : 'Ingresar al Sistema'}
                <LogIn className="absolute right-4 top-3 h-5 w-5 text-red-200 group-hover:text-white transition-colors" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 relative bg-corporativoAzul overflow-hidden justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002244] to-corporativoAzul"></div>
        <div 
          className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: "url('/logo.png')", transform: 'scale(1.5)' }}
        ></div>
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full border-[60px] border-white opacity-5"></div>
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full border-8 border-corporativoRojo opacity-20"></div>
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full border-8 border-yellow-400 opacity-10"></div>
        
        <div className="relative z-10 w-full flex flex-col items-center justify-center p-12 text-center text-white">
          <ShieldCheck size={80} className="mb-8 text-blue-200 opacity-80 drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Gestión Industrial <br/> Inteligente
          </h1>
          <p className="text-lg text-blue-200 max-w-md font-medium drop-shadow-md">
            Control centralizado de órdenes de trabajo, inventario y facturación para Maestranza R.S SPA.
          </p>
        </div>
      </div>
    </div>
  );
}
