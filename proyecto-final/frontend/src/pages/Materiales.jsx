import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Edit2, Trash2, X } from 'lucide-react';

export default function Materiales({ user }) {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'ACERO',
    unidad_medida: 'KG',
    precio_referencia: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        unidad_medida: formData.unidad_medida,
        precio_referencia: parseFloat(formData.precio_referencia || 0)
      };

      if (editingMaterial) {
        await axios.put(`/api/material/${editingMaterial.id_material}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/material', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      setEditingMaterial(null);
      setFormData({
        nombre: '',
        tipo: 'ACERO',
        unidad_medida: 'KG',
        precio_referencia: ''
      });
      fetchMateriales();
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Hubo un error al guardar el material.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      nombre: material.nombre,
      tipo: material.tipo || 'ACERO',
      unidad_medida: material.unidad_medida || 'KG',
      precio_referencia: material.precio_referencia.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este material del inventario?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/material/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMateriales();
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Hubo un error al intentar eliminar el material.');
    }
  };

  useEffect(() => {
    fetchMateriales();
  }, []);

  const fetchMateriales = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/material', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMateriales(res.data);
    } catch (error) {
      console.error('Error fetching materiales:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Materiales</h1>
          <p className="text-sm text-gray-500 mt-1">Control de insumos y repuestos del taller</p>
        </div>
        {(user.rol === 'ADMIN' || user.rol === 'ADMINISTRATIVO') && (
          <button 
            onClick={() => {
              setEditingMaterial(null);
              setFormData({
                nombre: '',
                tipo: 'ACERO',
                unidad_medida: 'KG',
                precio_referencia: ''
              });
              setShowModal(true);
            }}
            className="bg-corporativoAzul text-white px-4 py-2.5 rounded-xl font-medium flex items-center hover:bg-blue-900 transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2" size={20} />
            Nuevo Material
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Buscar material..." 
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
                <th className="p-4 font-semibold border-b border-gray-100">Nombre del Material</th>
                <th className="p-4 font-semibold border-b border-gray-100">Tipo</th>
                <th className="p-4 font-semibold border-b border-gray-100">Unidad de Medida</th>
                <th className="p-4 font-semibold border-b border-gray-100">Precio Referencia</th>
                <th className="p-4 font-semibold border-b border-gray-100">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando inventario...</td></tr>
              ) : materiales.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No hay materiales registrados en el inventario</td></tr>
              ) : (
                materiales
                  .filter((m) => 
                    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (m.tipo || '').toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((m) => (
                  <tr key={m.id_material} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 font-medium text-gray-900">{m.nombre}</td>
                    <td className="p-4 text-gray-600">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-gray-50 text-gray-700 border-gray-200">
                        {m.tipo || 'GENERAL'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{m.unidad_medida || 'UNIDAD'}</td>
                    <td className="p-4 text-corporativoRojo font-bold">${m.precio_referencia.toLocaleString('es-CL')}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(m)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id_material)}
                          className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Material */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingMaterial ? 'Editar Material / Insumo' : 'Registrar Material / Insumo'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingMaterial(null);
                }} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Material</label>
                    <input 
                      type="text" 
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="Ej. Acero Inoxidable 304" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Insumo</label>
                    <select 
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all"
                    >
                      <option value="ACERO">Acero</option>
                      <option value="SOLDADURA">Soldadura</option>
                      <option value="REPUESTO">Repuesto</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                    <select 
                      value={formData.unidad_medida}
                      onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all"
                    >
                      <option value="KG">Kilogramos (KG)</option>
                      <option value="MT">Metros (MT)</option>
                      <option value="UN">Unidades (UN)</option>
                      <option value="LT">Litros (LT)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario de Referencia ($)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.precio_referencia}
                      onChange={(e) => setFormData({ ...formData, precio_referencia: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="0" 
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingMaterial(null);
                  }} 
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-corporativoAzul text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-75">
                  {saving ? 'Guardando...' : editingMaterial ? 'Guardar Cambios' : 'Guardar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
