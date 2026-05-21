import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Edit2, Camera, FileText, X, UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function Ordenes({ user }) {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('activas');
  
  // Evidencia state
  const [evidenciaModalOpen, setEvidenciaModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fotoDescripcion, setFotoDescripcion] = useState('');
  
  // Order Form State
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id_cliente: '',
    tipo_maquina: '',
    descripcion_inicial: '',
    prioridad: 'MEDIA'
  });

  // Edit Order State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrden, setEditingOrden] = useState(null);
  const [editFormData, setEditFormData] = useState({
    prioridad: 'MEDIA',
    estado: 'INGRESADA',
    descripcion_inicial: '',
    diagnostico: ''
  });

  // Presupuesto State
  const [createPresupuestoModalOpen, setCreatePresupuestoModalOpen] = useState(false);
  const [viewPresupuestoModalOpen, setViewPresupuestoModalOpen] = useState(false);
  const [presupuestoTotal, setPresupuestoTotal] = useState('');
  const [presupuestoAnticipo, setPresupuestoAnticipo] = useState('');
  const [generatingPresupuesto, setGeneratingPresupuesto] = useState(false);

  const handleOpenEdit = (orden) => {
    setEditingOrden(orden);
    setEditFormData({
      prioridad: orden.prioridad,
      estado: orden.estado,
      descripcion_inicial: orden.descripcion_inicial || '',
      diagnostico: orden.diagnostico || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/ordentrabajo/${editingOrden.id_orden}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditModalOpen(false);
      fetchOrdenes();
      alert('Orden de trabajo actualizada con éxito.');
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      alert('Hubo un error al actualizar la orden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrden = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta orden de trabajo?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/ordentrabajo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Orden de trabajo eliminada.');
      fetchOrdenes();
    } catch (error) {
      console.error('Error al eliminar orden:', error);
      alert('Hubo un error al intentar eliminar la orden.');
    }
  };

  const handlePresupuestoClick = (orden) => {
    setSelectedOrden(orden);
    if (orden.presupuestos && orden.presupuestos.length > 0) {
      setViewPresupuestoModalOpen(true);
    } else {
      setPresupuestoTotal('');
      setPresupuestoAnticipo('');
      setCreatePresupuestoModalOpen(true);
    }
  };

  const handleCreatePresupuestoSubmit = async (e) => {
    e.preventDefault();
    if (!presupuestoTotal) return;
    setGeneratingPresupuesto(true);
    try {
      const token = localStorage.getItem('token');
      const total = parseFloat(presupuestoTotal);
      const anticipo = parseFloat(presupuestoAnticipo || 0);
      const payload = {
        id_orden: selectedOrden.id_orden,
        numero_presupuesto: `PRE-${Date.now()}`,
        total_final_iva_incluido: total,
        anticipo_requerido: anticipo,
        saldo_pendiente: total - anticipo,
        estado: 'APROBADO'
      };

      await axios.post('/api/presupuesto', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Presupuesto técnico generado y aprobado exitosamente.');
      setCreatePresupuestoModalOpen(false);
      fetchOrdenes();
    } catch (error) {
      console.error('Error al generar presupuesto:', error);
      alert('Hubo un error al generar el presupuesto.');
    } finally {
      setGeneratingPresupuesto(false);
    }
  };

  const handleDownloadPresupuestoPDF = async (presupuestoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/presupuesto/${presupuestoId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `presupuesto_${presupuestoId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Hubo un error al generar y descargar el PDF.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_cliente) {
      alert('Por favor seleccione un cliente.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/ordentrabajo', 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setFormData({
        id_cliente: '',
        tipo_maquina: '',
        descripcion_inicial: '',
        prioridad: 'MEDIA'
      });
      fetchOrdenes();
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert('Hubo un error al generar la orden.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/cliente', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(res.data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/ordentrabajo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrdenes(res.data);
    } catch (error) {
      console.error('Error fetching ordenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvidencia = (orden) => {
    setSelectedOrden(orden);
    setSelectedFile(null);
    setEvidenciaModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadFoto = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataUpload = new FormData();
      formDataUpload.append('foto', selectedFile);
      formDataUpload.append('id_orden', selectedOrden.id_orden);
      formDataUpload.append('descripcion', fotoDescripcion || 'Evidencia');

      const res = await axios.post('/api/evidenciafotografica/upload', 
        formDataUpload,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      alert("Fotografía de evidencia subida exitosamente.");
      
      // Update selectedOrden evidences in real-time
      const updatedOrden = { 
        ...selectedOrden, 
        evidencias: [...(selectedOrden.evidencias || []), res.data] 
      };
      setSelectedOrden(updatedOrden);
      
      // Update general ordenes state
      setOrdenes(ordenes.map(o => o.id_orden === selectedOrden.id_orden ? updatedOrden : o));
      
      setSelectedFile(null);
      setFotoDescripcion('');
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert('Hubo un error al subir la fotografía.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'INGRESADA': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_DIAGNOSTICO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_REPARACION': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'FINALIZADA': return 'bg-green-100 text-green-800 border-green-200';
      case 'ENTREGADA': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
          <p className="text-sm text-gray-500 mt-1">Control de reparaciones y diagnósticos</p>
        </div>
        {(user.rol !== 'TECNICO') && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-corporativoAzul text-white px-4 py-2.5 rounded-xl font-medium flex items-center hover:bg-blue-900 transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2" size={20} />
            Nueva Orden
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Buscar por ID, Cliente o Equipo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-corporativoAzul/20 focus:border-corporativoAzul transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <div className="flex bg-gray-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('activas')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'activas'
                  ? 'bg-corporativoAzul text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Órdenes Activas ({ordenes.filter(o => o.estado !== 'FINALIZADA' && o.estado !== 'ENTREGADA').length})
            </button>
            <button
              onClick={() => setActiveTab('terminadas')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'terminadas'
                  ? 'bg-corporativoAzul text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Órdenes Terminadas ({ordenes.filter(o => o.estado === 'FINALIZADA' || o.estado === 'ENTREGADA').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-100">ID Orden</th>
                <th className="p-4 font-semibold border-b border-gray-100">Fecha Ingreso</th>
                <th className="p-4 font-semibold border-b border-gray-100">Prioridad</th>
                <th className="p-4 font-semibold border-b border-gray-100">Estado</th>
                <th className="p-4 font-semibold border-b border-gray-100">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando órdenes...</td></tr>
              ) : ordenes.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No hay órdenes registradas en el taller</td></tr>
              ) : (
                ordenes
                  .filter((o) => {
                    const isTerminada = o.estado === 'FINALIZADA' || o.estado === 'ENTREGADA';
                    if (activeTab === 'activas' && isTerminada) return false;
                    if (activeTab === 'terminadas' && !isTerminada) return false;

                    const searchLower = searchTerm.toLowerCase();
                    return (
                      o.id_orden.toString().includes(searchLower) ||
                      (o.cliente?.nombre || '').toLowerCase().includes(searchLower) ||
                      (o.maquina?.tipo_maquina || '').toLowerCase().includes(searchLower) ||
                      o.estado.toLowerCase().replace('_', ' ').includes(searchLower) ||
                      o.prioridad.toLowerCase().includes(searchLower)
                    );
                  })
                  .map((o) => (
                  <tr key={o.id_orden} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 font-bold text-corporativoAzul">#{o.id_orden}</td>
                    <td className="p-4 text-gray-600">{new Date(o.fecha_ingreso).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${o.prioridad === 'ALTA' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {o.prioridad}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(o.estado)}`}>
                        {o.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOpenEdit(o)}
                          className="text-corporativoAzul hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Gestionar Orden"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenEvidencia(o)}
                          className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors" 
                          title="Evidencia Fotográfica"
                        >
                          <Camera size={18} />
                        </button>
                        {(user.rol !== 'TECNICO') && (
                          <button 
                            onClick={() => handlePresupuestoClick(o)}
                            className="text-corporativoRojo hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                            title={o.presupuestos && o.presupuestos.length > 0 ? "Ver Presupuesto" : "Generar Presupuesto"}
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        {(user.rol !== 'TECNICO') && (
                          <button 
                            onClick={() => handleDeleteOrden(o.id_orden)}
                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Eliminar Orden"
                          >
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

      {/* Modal Nueva Orden */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Crear Orden de Trabajo</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
                       <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <select 
                      required
                      value={formData.id_cliente}
                      onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all"
                    >
                      <option value="">Seleccione un cliente...</option>
                      {clientes.map((c) => (
                        <option key={c.id_cliente} value={c.id_cliente}>
                          {c.nombre} ({c.rut})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Máquina o Equipo</label>
                    <input 
                      type="text" 
                      required
                      value={formData.tipo_maquina}
                      onChange={(e) => setFormData({ ...formData, tipo_maquina: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="Ej. Cilindro Hidráulico Komatsu" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Inicial (Falla)</label>
                    <textarea 
                      rows="3" 
                      required
                      value={formData.descripcion_inicial}
                      onChange={(e) => setFormData({ ...formData, descripcion_inicial: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all" 
                      placeholder="Descripción del problema reportado..."
                    ></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                    <select 
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul focus:border-corporativoAzul outline-none transition-all"
                    >
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-corporativoAzul text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-75">
                  {saving ? 'Guardando...' : 'Generar Orden'}
                </button>
              </div>
            </form>          </div>
          </div>
        </div>
      )}

      {/* Modal Evidencia Fotográfica */}
      {evidenciaModalOpen && selectedOrden && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center">
                <Camera className="text-corporativoAzul mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Evidencia Fotográfica</h3>
                  <p className="text-xs text-gray-500 font-medium">Orden #{selectedOrden.id_orden}</p>
                </div>
              </div>
              <button onClick={() => setEvidenciaModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {/* Sección de carga */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Subir nueva foto</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    {selectedFile ? (
                      <>
                        <ImageIcon size={40} className="text-green-500 mb-3" />
                        <p className="text-sm font-bold text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                          <UploadCloud size={24} className="text-corporativoAzul" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Haz clic o arrastra una imagen aquí</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 10MB (Recepción, Proceso o Final)</p>
                      </>
                    )}
                  </div>
                </div>
                
                 {selectedFile && (
                  <div className="mt-4 space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descripción de la Foto</label>
                      <input 
                        type="text" 
                        value={fotoDescripcion}
                        onChange={(e) => setFotoDescripcion(e.target.value)}
                        placeholder="Ej: Estado Inicial, Desarme, Listo para Entrega"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={handleUploadFoto}
                        disabled={uploading}
                        className="px-4 py-2 bg-corporativoAzul text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm flex items-center"
                      >
                        {uploading ? (
                          <>Subiendo...</>
                        ) : (
                          <>
                            <UploadCloud size={18} className="mr-2" />
                            Guardar Fotografía
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Galería actual */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-4 border-b pb-2">Galería de la Orden</h4>
                <div className="grid grid-cols-3 gap-4">
                  {selectedOrden.evidencias && selectedOrden.evidencias.length > 0 ? (
                    selectedOrden.evidencias.map((ev) => (
                      <div key={ev.id_foto} className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm group relative">
                        <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img 
                            src={ev.url_imagen} 
                            alt={ev.descripcion || 'Evidencia'} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                            onError={(e) => {
                              // Si falla la carga del host local, mostramos una imagen de repuesto bonita
                              e.target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop';
                            }}
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-800 text-center truncate">{ev.descripcion}</p>
                        <p className="text-[10px] text-gray-500 text-center">{new Date(ev.fecha_subida).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <span className="text-sm font-medium">Aún no hay fotos registradas para esta orden</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Orden */}
      {editModalOpen && editingOrden && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Gestionar Orden de Trabajo #{editingOrden.id_orden}</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Inicial (Falla)</label>
                  <textarea 
                    rows="3" 
                    required
                    value={editFormData.descripcion_inicial}
                    onChange={(e) => setEditFormData({ ...editFormData, descripcion_inicial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul outline-none transition-all" 
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Técnico</label>
                  <textarea 
                    rows="3" 
                    placeholder="Ingrese detalles del diagnóstico técnico y reparaciones..."
                    value={editFormData.diagnostico}
                    onChange={(e) => setEditFormData({ ...editFormData, diagnostico: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul outline-none transition-all" 
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select 
                      value={editFormData.estado}
                      onChange={(e) => setEditFormData({ ...editFormData, estado: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul outline-none transition-all"
                    >
                      <option value="INGRESADA">Ingresada</option>
                      <option value="EN_DIAGNOSTICO">En Diagnóstico</option>
                      <option value="EN_REPARACION">En Reparación</option>
                      <option value="FINALIZADA">Finalizada</option>
                      <option value="ENTREGADA">Entregada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                    <select 
                      value={editFormData.prioridad}
                      onChange={(e) => setEditFormData({ ...editFormData, prioridad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul outline-none transition-all"
                    >
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-corporativoAzul text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-75">
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Generar Presupuesto */}
      {createPresupuestoModalOpen && selectedOrden && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Generar Presupuesto - Orden #{selectedOrden.id_orden}</h3>
              <button onClick={() => setCreatePresupuestoModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePresupuestoSubmit}>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
                  <p className="font-bold">Máquina: {selectedOrden.maquina?.tipo_maquina}</p>
                  <p className="mt-1">Cliente: {selectedOrden.cliente?.nombre}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total Presupuestado ($ IVA Incluido)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={presupuestoTotal}
                    onChange={(e) => setPresupuestoTotal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul outline-none text-sm font-bold" 
                    placeholder="Ej. 150000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo Requerido ($ - Opcional)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={presupuestoAnticipo}
                    onChange={(e) => setPresupuestoAnticipo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoAzul outline-none text-sm" 
                    placeholder="Ej. 50000"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setCreatePresupuestoModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={generatingPresupuesto} className="px-4 py-2 bg-corporativoRojo text-white font-medium rounded-lg hover:bg-red-800 transition-colors shadow-sm disabled:opacity-75">
                  {generatingPresupuesto ? 'Generando...' : 'Generar y Aprobar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Presupuesto */}
      {viewPresupuestoModalOpen && selectedOrden && selectedOrden.presupuestos && selectedOrden.presupuestos.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Detalle del Presupuesto - Orden #{selectedOrden.id_orden}</h3>
              <button onClick={() => setViewPresupuestoModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-medium">N° Presupuesto:</span>
                  <span className="text-sm font-bold text-gray-800">{selectedOrden.presupuestos[0].numero_presupuesto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-medium">Fecha Emisión:</span>
                  <span className="text-sm font-medium text-gray-800">{new Date(selectedOrden.presupuestos[0].fecha).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-gray-500 font-medium">Total (IVA Incluido):</span>
                  <span className="text-sm font-bold text-corporativoRojo">${selectedOrden.presupuestos[0].total_final_iva_incluido.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-medium">Anticipo Solicitado:</span>
                  <span className="text-sm font-bold text-gray-800">${selectedOrden.presupuestos[0].anticipo_requerido.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-gray-500 font-semibold">Saldo Pendiente:</span>
                  <span className="text-sm font-bold text-blue-900">${selectedOrden.presupuestos[0].saldo_pendiente.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDownloadPresupuestoPDF(selectedOrden.presupuestos[0].id_presupuesto)}
                className="w-full bg-corporativoAzul text-white font-medium py-2.5 rounded-xl hover:bg-blue-900 transition-colors shadow-sm flex items-center justify-center"
              >
                <FileText size={18} className="mr-2" />
                Descargar Documento PDF Oficial
              </button>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setViewPresupuestoModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
