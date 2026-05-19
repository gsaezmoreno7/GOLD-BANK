import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Edit2, Trash2, X, Coins, Calendar, Tag, FileText, TrendingDown } from 'lucide-react';

export default function Gastos({ user }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    categoria: 'INSUMOS',
    fecha: new Date().toISOString().split('T')[0],
    tipo_documento: 'FACTURA',
    afecto_iva: true
  });

  useEffect(() => {
    fetchGastos();
  }, []);

  const fetchGastos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/gasto', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGastos(res.data);
    } catch (error) {
      console.error('Error fetching gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descripcion || !formData.monto) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingGasto 
        ? `/api/gasto/${editingGasto.id_gasto}` 
        : '/api/gasto';
      
      const payload = {
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        categoria: formData.categoria,
        fecha: new Date(formData.fecha).toISOString(),
        tipo_documento: formData.tipo_documento,
        afecto_iva: formData.afecto_iva
      };

      if (editingGasto) {
        await axios.put(url, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(url, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      setEditingGasto(null);
      setFormData({
        descripcion: '',
        monto: '',
        categoria: 'INSUMOS',
        fecha: new Date().toISOString().split('T')[0],
        tipo_documento: 'FACTURA',
        afecto_iva: true
      });
      fetchGastos();
    } catch (error) {
      console.error('Error saving gasto:', error);
      alert('Hubo un error al guardar el registro de gasto.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (gasto) => {
    setEditingGasto(gasto);
    setFormData({
      descripcion: gasto.descripcion,
      monto: gasto.monto.toString(),
      categoria: gasto.categoria,
      fecha: new Date(gasto.fecha).toISOString().split('T')[0],
      tipo_documento: gasto.tipo_documento || 'FACTURA',
      afecto_iva: gasto.afecto_iva !== undefined ? gasto.afecto_iva : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este gasto?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/gasto/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGastos();
    } catch (error) {
      console.error('Error deleting gasto:', error);
      alert('Hubo un error al intentar eliminar el gasto.');
    }
  };

  const getCategoriaStyle = (categoria) => {
    switch (categoria) {
      case 'INSUMOS':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'REPUESTOS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SERVICIOS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'HERRAMIENTAS':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Metrics
  const totalGastos = gastos.reduce((sum, curr) => sum + curr.monto, 0);
  const countGastos = gastos.length;

  const filteredGastos = gastos.filter(g => 
    g.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Gastos y Egresos</h1>
          <p className="text-sm text-gray-500 mt-1">Registra y administra los egresos operativos del taller</p>
        </div>
        {(user.rol === 'ADMIN' || user.rol === 'ADMINISTRATIVO') && (
          <button 
            onClick={() => {
              setEditingGasto(null);
              setFormData({
                descripcion: '',
                monto: '',
                categoria: 'INSUMOS',
                fecha: new Date().toISOString().split('T')[0]
              });
              setShowModal(true);
            }}
            className="bg-corporativoRojo text-white px-4 py-2.5 rounded-xl font-medium flex items-center hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2" size={20} />
            Registrar Gasto
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Total Egresos</p>
            <p className="text-2xl font-bold text-corporativoRojo">${totalGastos.toLocaleString('es-CL')}</p>
          </div>
          <div className="p-3 bg-red-50 text-corporativoRojo rounded-xl border border-red-100">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Registros de Gastos</p>
            <p className="text-2xl font-bold text-gray-900">{countGastos} transacciones</p>
          </div>
          <div className="p-3 bg-blue-50 text-corporativoAzul rounded-xl border border-blue-100">
            <Coins size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Categoría Mayoritaria</p>
            <p className="text-lg font-bold text-gray-900">
              {gastos.length > 0 
                ? [...new Set(gastos.map(g => g.categoria))].reduce((a, b) => 
                    gastos.filter(g => g.categoria === a).length >= gastos.filter(g => g.categoria === b).length ? a : b
                  )
                : 'Ninguna'}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Tag size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Buscar gasto por descripción o categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-corporativoAzul/20 focus:border-corporativoAzul transition-all text-sm outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Descripción del Gasto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold">Documento</th>
                <th className="p-4 font-semibold">IVA Crédito</th>
                <th className="p-4 font-semibold">Monto Total</th>
                <th className="p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando registros...</td></tr>
              ) : filteredGastos.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">No se encontraron registros de gastos</td></tr>
              ) : (
                filteredGastos.map((g) => {
                  const ivaCreditoEst = g.afecto_iva 
                    ? Math.round(g.monto - (g.monto / 1.19)) 
                    : 0;
                  
                  const getDocumentBadgeStyle = (tipo) => {
                    switch (tipo) {
                      case 'FACTURA': return 'bg-blue-50 text-blue-700 border-blue-200';
                      case 'BOLETA': return 'bg-slate-50 text-slate-700 border-slate-200';
                      case 'HONORARIOS': return 'bg-amber-50 text-amber-700 border-amber-200';
                      default: return 'bg-gray-50 text-gray-600 border-gray-200';
                    }
                  };

                  return (
                    <tr key={g.id_gasto} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1.5 text-gray-400" />
                          {new Date(g.fecha).toLocaleDateString('es-CL')}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-900">{g.descripcion}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase ${getCategoriaStyle(g.categoria)}`}>
                          {g.categoria}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getDocumentBadgeStyle(g.tipo_documento || 'FACTURA')}`}>
                          {g.tipo_documento || 'FACTURA'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold">
                        {g.afecto_iva ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 text-xs font-bold">
                            +${ivaCreditoEst.toLocaleString('es-CL')}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium">Exento</span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-bold text-corporativoRojo">
                        ${g.monto.toLocaleString('es-CL')}
                      </td>
                    <td className="p-4">
                      {(user.rol === 'ADMIN' || user.rol === 'ADMINISTRATIVO') && (
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(g)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(g.id_gasto)}
                            className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Gasto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingGasto ? 'Editar Registro de Gasto' : 'Registrar Gasto del Taller'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingGasto(null);
                }} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción del Gasto</label>
                  <input 
                    type="text" 
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo focus:border-corporativoRojo outline-none transition-all text-sm" 
                    placeholder="Ej. Balde de grasa multipropósito Litio" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Monto ($ CL)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo focus:border-corporativoRojo outline-none transition-all text-sm" 
                      placeholder="Ej. 25000" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                    <input 
                      type="date" 
                      required
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo focus:border-corporativoRojo outline-none transition-all text-sm text-gray-700" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría del Gasto</label>
                  <select 
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo focus:border-corporativoRojo outline-none transition-all text-sm text-gray-700"
                  >
                    <option value="INSUMOS">Insumos de Taller</option>
                    <option value="REPUESTOS">Repuestos y Piezas</option>
                    <option value="SERVICIOS">Servicios Básicos (Luz, Agua, Gas, Internet)</option>
                    <option value="HERRAMIENTAS">Herramientas y Maquinaria</option>
                    <option value="OTROS">Otros Gastos Varios</option>
                    <option value="IMPUESTOS">Impuestos y Contribuciones</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo Documento</label>
                    <select 
                      value={formData.tipo_documento || 'FACTURA'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ 
                          ...formData, 
                          tipo_documento: val,
                          afecto_iva: val === 'FACTURA'
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo focus:border-corporativoRojo outline-none transition-all text-sm text-gray-700"
                    >
                      <option value="FACTURA">Factura Afecta</option>
                      <option value="BOLETA">Boleta de Ventas</option>
                      <option value="HONORARIOS">Boleta Honorarios</option>
                      <option value="OTRO">Otro / Sin Documento</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={formData.afecto_iva || false}
                        onChange={(e) => setFormData({ ...formData, afecto_iva: e.target.checked })}
                        className="w-4.5 h-4.5 text-corporativoRojo rounded border-gray-300 focus:ring-corporativoRojo cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-gray-700">¿Afecto a IVA Crédito?</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingGasto(null);
                  }} 
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-4 py-2 bg-corporativoRojo text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-75 text-sm"
                >
                  {saving ? 'Guardando...' : editingGasto ? 'Guardar Cambios' : 'Registrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
