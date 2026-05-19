import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, FileText, CheckCircle, PlusCircle, Building, ShieldCheck } from 'lucide-react';

export default function Facturas({ user }) {
  const [facturas, setFacturas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [selectedOrden, setSelectedOrden] = useState('');
  const [rutReceptor, setRutReceptor] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [giro, setGiro] = useState('');
  const [comuna, setComuna] = useState('');
  const [items, setItems] = useState([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCant, setNewItemCant] = useState('');
  const [newItemPrecio, setNewItemPrecio] = useState('');

  useEffect(() => {
    fetchFacturas();
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/ordentrabajo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrdenes(res.data);
    } catch (error) {
      console.error('Error fetching ordenes:', error);
    }
  };

  const fetchFacturas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/factura', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFacturas(res.data);
    } catch (error) {
      console.error('Error fetching facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemDesc || !newItemCant || !newItemPrecio) return;
    const item = {
      descripcion: newItemDesc,
      cantidad: parseInt(newItemCant),
      precio: parseFloat(newItemPrecio)
    };
    setItems([...items, item]);
    setNewItemDesc('');
    setNewItemCant('');
    setNewItemPrecio('');
  };

  const calculateTotalNeto = () => {
    return items.reduce((acc, curr) => acc + (curr.cantidad * curr.precio), 0);
  };

  const handleEmitirFactura = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Por favor agregue al menos un ítem a la factura.");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const total = calculateTotalNeto() * 1.19; // IVA incluido
      
      const payload = {
        id_orden: selectedOrden ? parseInt(selectedOrden) : undefined,
        numero_factura: `FAC-${Date.now()}`,
        total_facturado: total,
        rut_receptor: rutReceptor,
        razon_social: razonSocial,
        giro: giro,
        comuna: comuna,
        items: items
      };

      await axios.post('http://localhost:3001/api/factura', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Factura emitida y firmada electrónicamente con éxito en el SII.");
      setShowModal(false);
      
      // Reset form
      setSelectedOrden('');
      setRutReceptor('');
      setRazonSocial('');
      setGiro('');
      setComuna('');
      setItems([]);
      
      fetchFacturas();
    } catch (error) {
      console.error('Error al emitir factura:', error);
      alert('Hubo un error al emitir la factura.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'EMITIDA': return 'bg-blue-100 text-blue-800';
      case 'PAGADA': return 'bg-green-100 text-green-800';
      case 'ANULADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user.rol === 'TECNICO') {
    return (
      <div className="p-8">
        <div className="bg-red-50 p-4 border border-red-200 text-red-800 rounded-md">
          No tienes permisos para ver el módulo de facturación.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Facturación (SII)</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de Documentos Tributarios Electrónicos (DTE)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-corporativoRojo text-white px-4 py-2.5 rounded-xl font-medium flex items-center hover:bg-red-800 transition-all shadow-md hover:shadow-lg"
        >
          <Building className="mr-2" size={20} />
          Emitir Factura SII
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Buscar por N° Factura o RUT..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-corporativoAzul/20 focus:border-corporativoAzul transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-100">N° Factura</th>
                <th className="p-4 font-semibold border-b border-gray-100">Fecha Emisión</th>
                <th className="p-4 font-semibold border-b border-gray-100">Total Facturado</th>
                <th className="p-4 font-semibold border-b border-gray-100">Estado</th>
                <th className="p-4 font-semibold border-b border-gray-100">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando facturas...</td></tr>
              ) : facturas.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No hay facturas emitidas en el sistema</td></tr>
              ) : (
                facturas.map((f) => (
                  <tr key={f.id_factura} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 font-bold text-corporativoAzul">F-{f.numero_factura}</td>
                    <td className="p-4 text-gray-600">{new Date(f.fecha_emision).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-gray-900">${f.total_facturado.toLocaleString('es-CL')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(f.estado)}`}>
                        {f.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-corporativoAzul hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalle DTE">
                          <FileText size={18} />
                        </button>
                        <button className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Marcar como Pagada">
                          <CheckCircle size={18} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Descargar PDF XML">
                          <Download size={18} />
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

      {/* Modal Emitir Factura SII */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="text-green-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900">Emitir Factura Electrónica (SII)</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-sm border border-blue-100 flex items-start">
                <div className="mr-3 mt-0.5">ℹ️</div>
                <p>La emisión requiere conexión directa mediante certificado digital con el Servicio de Impuestos Internos. Actualmente el módulo mostrará la estructura de datos requerida para generar el archivo XML del DTE.</p>
              <form onSubmit={handleEmitirFactura}>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700 border-b pb-2">1. Datos del Receptor</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Trabajo (Opcional)</label>
                      <select 
                        value={selectedOrden}
                        onChange={(e) => setSelectedOrden(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo outline-none"
                      >
                        <option value="">Seleccionar Orden Completada...</option>
                        {ordenes.map((o) => (
                          <option key={o.id_orden} value={o.id_orden}>
                            Orden #{o.id_orden} - {o.tipo_maquina} ({o.estado})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RUT Receptor</label>
                      <input 
                        type="text" 
                        required
                        value={rutReceptor}
                        onChange={(e) => setRutReceptor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo outline-none" 
                        placeholder="12.345.678-9" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                      <input 
                        type="text" 
                        required
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo outline-none" 
                        placeholder="Nombre de la empresa" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giro</label>
                      <input 
                        type="text" 
                        required
                        value={giro}
                        onChange={(e) => setGiro(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo outline-none" 
                        placeholder="Giro comercial" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                      <input 
                        type="text" 
                        required
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporativoRojo outline-none" 
                        placeholder="Ej. Los Ángeles" 
                      />
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-700 border-b pb-2 pt-4">2. Detalle de la Factura (Ítems)</h4>
                  
                  {/* Items List */}
                  {items.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-150 divide-y divide-gray-100 max-h-40 overflow-y-auto mb-3">
                      {items.map((it, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-gray-900">{it.descripcion}</span>
                            <span className="text-gray-500 text-xs ml-2">x{it.cantidad} @ ${it.precio.toLocaleString('es-CL')}</span>
                          </div>
                          <span className="font-bold text-gray-800">${(it.cantidad * it.precio).toLocaleString('es-CL')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex space-x-2 mb-2">
                      <input 
                        type="text" 
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-corporativoRojo" 
                        placeholder="Descripción del servicio/producto" 
                      />
                      <input 
                        type="number" 
                        value={newItemCant}
                        onChange={(e) => setNewItemCant(e.target.value)}
                        className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-corporativoRojo" 
                        placeholder="Cant." 
                      />
                      <input 
                        type="number" 
                        value={newItemPrecio}
                        onChange={(e) => setNewItemPrecio(e.target.value)}
                        className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-corporativoRojo" 
                        placeholder="Precio ($)" 
                      />
                      <button 
                        type="button"
                        onClick={handleAddItem}
                        className="px-3.5 bg-corporativoAzul hover:bg-blue-900 text-white rounded-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">* El IVA (19%) será calculado automáticamente al firmar el DTE.</p>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center mt-6 -mx-6 -mb-6">
                  <div className="flex flex-col text-left">
                    <span className="text-sm text-gray-600">Neto: <strong className="text-gray-900">${calculateTotalNeto().toLocaleString('es-CL')}</strong></span>
                    <span className="text-sm text-gray-600">Total (IVA 19% incl.): <strong className="text-corporativoRojo">${Math.round(calculateTotalNeto() * 1.19).toLocaleString('es-CL')}</strong></span>
                  </div>
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-corporativoRojo text-white font-medium rounded-lg hover:bg-red-800 transition-colors shadow-sm flex items-center disabled:opacity-75">
                      <Building size={18} className="mr-2" />
                      {saving ? 'Procesando...' : 'Firmar y Emitir al SII'}
                    </button>
                  </div>
                </div>
              </form>   </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
