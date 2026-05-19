import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Mail, CheckCircle } from 'lucide-react';

export default function Perfil({ user, onUpdateUser }) {
  const [correo, setCorreo] = useState(user.correo || '');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (nuevaContrasena && nuevaContrasena !== confirmarContrasena) {
      return setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/auth/perfil', 
        { correo, nuevaContrasena },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMensaje({ tipo: 'exito', texto: 'Perfil actualizado correctamente.' });
      setNuevaContrasena('');
      setConfirmarContrasena('');
      
      if (onUpdateUser && res.data.user) {
        onUpdateUser(res.data.user);
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al actualizar.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500">Actualiza tus credenciales de acceso al sistema.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center space-x-4">
          <div className="h-16 w-16 bg-corporativoAzul rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.nombre.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.nombre}</h2>
            <p className="text-sm text-gray-500 font-medium">{user.rol}</p>
          </div>
        </div>

        <div className="p-6">
          {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <CheckCircle className="h-5 w-5 mr-2" />
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="pl-10 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corporativoAzul focus:border-transparent transition-all"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cambiar Contraseña</h3>
              <p className="text-sm text-gray-500 mb-4">Deja estos campos en blanco si no deseas cambiar tu contraseña.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      className="pl-10 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corporativoAzul focus:border-transparent transition-all"
                      placeholder="••••••••"
                      value={nuevaContrasena}
                      onChange={(e) => setNuevaContrasena(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      className="pl-10 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corporativoAzul focus:border-transparent transition-all"
                      placeholder="••••••••"
                      value={confirmarContrasena}
                      onChange={(e) => setConfirmarContrasena(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-corporativoAzul text-white font-bold rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-corporativoAzul transition-all shadow-md disabled:opacity-70"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
