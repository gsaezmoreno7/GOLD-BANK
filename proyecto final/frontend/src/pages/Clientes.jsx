import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Edit2, Trash2, X } from 'lucide-react';

export default function Clientes({ user }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    telefono: '',
    correo: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/cliente', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(res.data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRUT = (value) => {
    let rut = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rut.length <= 1) return rut;
    const dv = rut.slice(-1);
    let cuerpo = rut.slice(0, -1);
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpo}-${dv}`;
  };

  const handleRutChange = (e) => {
    setFormData({ ...formData, rut: formatRUT(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/cliente', 
        { ...formData, id_empresa: user.id_empresa },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setFormData({ nombre: '', rut: '', telefono: '', correo: '' });
      fetchClientes();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('Hubo un error al guardar el cliente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Administra el directorio de clientes corporativos</p>
        </div>
        {(user?.rol === 'ADMIN' || user?.rol === 'ADMINISTRATIVO') && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-corporativoAzul text-white px-4 py-2.5 rounded-xl font-medium flex items-center hover:bg-blue-900 transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2" size={20} />
            Nuevo Cliente
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Buscar por RUT o Nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-corporativoAzul/20 focus:border-corporativoAzul transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-100">Nombre</th>
                <th className="p-4 font-semibold border-b border-gray-100">RUT</th>
                <th className="p-4 font-semibold border-b border-gray-100">Teléfono</th>
                <th className="p-4 font-semibold border-b border-gray-100">Correo</th>
                <th className="p-4 font-semibold border-b border-gray-100">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando directorio...</td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No hay clientes registrados en el sistema</td></tr>
              ) : (
                clientes
                  .filter((c) => 
                    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.rut.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((c) => (
                  <tr key={c.id_cliente} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 font-medium text-gray-900">{c.nombre}</td>
                    <td className="p-4 text-gray-600">{c.rut}</td>
                    <td className="p-4 text-gray-600">{c.telefono || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{c.correo || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit2 size={18} />
                        </button>
                        {(user?.rol === 'ADMIN') && (
                          <button className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social / Nombre</label>
                    <input 
                      type="text" 
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="Ej. Constructora SPA" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                    <input 
                      type="text" 
                      required
                      value={formData.rut}
                      onChange={handleRutChange}
                      maxLength={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="12.345.678-9" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      maxLength={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="+56 9..." 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={formData.correo}
                      onChange={(e) => setFormData({...formData, correo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="contacto@empresa.cl" 
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-corporativoAzul text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-70">
                  {saving ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
