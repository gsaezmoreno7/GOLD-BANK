import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Impuestos({ user }) {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('ventas');
  const [savingPayment, setSavingPayment] = useState(false);

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  const anios = [2025, 2026, 2027, 2028];

  useEffect(() => {
    fetchProyeccion();
  }, [mes, anio]);

  const fetchProyeccion = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/api/impuesto/proyeccion?mes=${mes}&anio=${anio}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching proyeccion tributaria:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async () => {
    if (!data || !data.resumen || data.resumen.tipoResultado !== 'PAGAR') return;
    
    const montoIVA = data.resumen.diferenciaNeto;
    if (montoIVA <= 0) return;

    const confirmacion = window.confirm(
      `¿Está seguro de registrar el pago de este IVA (F29) por $${montoIVA.toLocaleString('es-CL')} en el módulo de Gastos?\n` +
      `Esto creará un egreso automático en la categoría de IMPUESTOS para documentar la salida de caja.`
    );
    if (!confirmacion) return;

    setSavingPayment(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        descripcion: `Pago F29 - Impuesto IVA ${meses.find(m => m.value === mes).label} ${anio}`,
        monto: montoIVA,
        categoria: 'IMPUESTOS',
        fecha: new Date().toISOString(),
        tipo_documento: 'OTRO',
        afecto_iva: false
      };

      await axios.post('http://localhost:3001/api/gasto', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('¡Pago de IVA F29 registrado exitosamente en el módulo de Gastos!');
      fetchProyeccion();
    } catch (error) {
      console.error('Error al registrar pago de IVA:', error);
      alert('Hubo un error al intentar registrar el pago tributario.');
    } finally {
      setSavingPayment(false);
    }
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return today.getMonth() + 1 === mes && today.getFullYear() === anio;
  };

  const getDueDate = () => {
    // En Chile el F29 se paga hasta el 20 del mes siguiente si es facturador electrónico
    let dueMonth = mes + 1;
    let dueYear = anio;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }
    return `20 de ${meses.find(m => m.value === dueMonth).label} de ${dueYear}`;
  };

  const getDaysRemaining = () => {
    let dueMonth = mes; // vencimiento es el mes siguiente de la actividad declarada
    let dueYear = anio;
    
    // Crear la fecha límite el 20 del mes siguiente
    const deadline = new Date(dueYear, dueMonth, 20, 23, 59, 59);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (user.rol === 'TECNICO') {
    return (
      <div className="p-8">
        <div className="bg-red-50 p-4 border border-red-200 text-red-800 rounded-md flex items-center">
          <ShieldAlert className="mr-3" size={24} />
          No tienes permisos para ver el módulo de Planificación Tributaria.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Percent className="mr-3 text-corporativoRojo" size={32} />
            Planificación y Control de IVA (F29)
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Proyección en tiempo real del IVA Débito (Ventas) y Crédito (Compras) para Maestranza R.S
          </p>
        </div>
        
        {/* Filtros de Fecha */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-gray-150 shadow-sm">
          <div className="flex items-center text-gray-500 pl-2">
            <Calendar size={18} className="mr-1.5" />
          </div>
          <select 
            value={mes} 
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="bg-transparent text-sm font-semibold text-gray-700 outline-none pr-6 border-none cursor-pointer focus:ring-0"
          >
            {meses.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="h-5 w-px bg-gray-200"></div>
          <select 
            value={anio} 
            onChange={(e) => setAnio(parseInt(e.target.value))}
            className="bg-transparent text-sm font-semibold text-gray-700 outline-none pr-6 border-none cursor-pointer focus:ring-0"
          >
            {anios.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button 
            onClick={fetchProyeccion} 
            className="p-1.5 text-corporativoAzul hover:bg-blue-50 rounded-xl transition-colors"
            title="Refrescar Proyección"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin mb-4 text-corporativoRojo" size={40} />
          <span className="font-semibold text-base">Calculando proyección e indicadores tributarios...</span>
        </div>
      ) : !data ? (
        <div className="p-8 bg-red-50 border border-red-200 text-red-800 rounded-2xl">
          Error al cargar la proyección tributaria.
        </div>
      ) : (
        <>
          {/* Banner de Estado / Vencimiento */}
          <div className={`p-4 rounded-2xl border mb-8 flex items-start md:items-center ${
            getDaysRemaining() > 0 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="p-2 bg-white/80 rounded-xl mr-4 shadow-sm border border-black/5">
              <AlertTriangle className={getDaysRemaining() > 0 ? "text-blue-600" : "text-amber-600"} size={22} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">
                Plazo de Declaración F29 - Período Tributario {meses.find(m => m.value === mes).label} {anio}
              </h4>
              <p className="text-xs font-medium opacity-90 mt-0.5">
                {isCurrentMonth() 
                  ? `Este período está actualmente en curso (proyección dinámica). Se declara hasta el ${getDueDate()}.`
                  : `Este período está cerrado. Vence el ${getDueDate()} (${getDaysRemaining() > 0 ? `quedan ${getDaysRemaining()} días` : 'plazo regular cumplido'}).`
                }
              </p>
            </div>
            <div className="hidden lg:flex items-center text-xs font-bold bg-white/80 px-3.5 py-2 rounded-xl border border-black/5">
              Declaración SII
            </div>
          </div>

          {/* Fila de Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Card 1: IVA Débito Fiscal */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-115"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">IVA Débito Fiscal (Ventas)</p>
                  <h3 className="text-3xl font-extrabold text-corporativoAzul">${data.resumen.ivaDebito.toLocaleString('es-CL')}</h3>
                  <div className="mt-4 flex items-center space-x-1.5 text-xs text-gray-500 font-semibold">
                    <span>Ventas Afectas:</span>
                    <strong className="text-gray-900">${data.resumen.totalFacturado.toLocaleString('es-CL')}</strong>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 text-corporativoAzul rounded-xl border border-blue-100">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Card 2: IVA Crédito Fiscal */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-115"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">IVA Crédito Fiscal (Compras)</p>
                  <h3 className="text-3xl font-extrabold text-corporativoRojo">${data.resumen.ivaCredito.toLocaleString('es-CL')}</h3>
                  <div className="mt-4 flex items-center space-x-1.5 text-xs text-gray-500 font-semibold">
                    <span>Gastos con IVA:</span>
                    <strong className="text-gray-900">${data.resumen.totalGastadoAfecto.toLocaleString('es-CL')}</strong>
                  </div>
                </div>
                <div className="p-3 bg-red-50 text-corporativoRojo rounded-xl border border-red-100">
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>

            {/* Card 3: Impuesto Neto Estimado (A Pagar / Remanente) */}
            <div className={`p-6 rounded-2xl border shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300 text-white ${
              data.resumen.tipoResultado === 'PAGAR' 
                ? 'bg-gradient-to-br from-corporativoRojo to-red-950 border-red-800' 
                : 'bg-gradient-to-br from-emerald-600 to-teal-900 border-emerald-700'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-115"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs text-white/80 font-bold uppercase tracking-wider mb-1">
                    {data.resumen.tipoResultado === 'PAGAR' ? 'F29 Estimado a Pagar' : 'Remanente de IVA a Favor'}
                  </p>
                  <h3 className="text-3xl font-black tracking-tight">${data.resumen.diferenciaNeto.toLocaleString('es-CL')}</h3>
                  
                  <div className="mt-4 flex items-center text-xs font-semibold text-white/95">
                    {data.resumen.tipoResultado === 'PAGAR' ? (
                      <span className="flex items-center">
                        <AlertTriangle className="mr-1 text-yellow-300" size={14} />
                        Reservar flujo antes del vencimiento.
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle2 className="mr-1 text-emerald-200" size={14} />
                        Se acumula para el próximo mes.
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                  <Coins size={24} />
                </div>
              </div>
            </div>

          </div>

          {/* Sección de Acción e Integración Financiera */}
          {data.resumen.tipoResultado === 'PAGAR' && data.resumen.diferenciaNeto > 0 && (
            <div className="bg-gradient-to-r from-slate-900 to-corporativoAzul text-white p-6 rounded-2xl shadow-sm border border-slate-800 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 text-yellow-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-base flex items-center">
                    Integración Financiera ERP
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-corporativoRojo text-white">Smart</span>
                  </h4>
                  <p className="text-xs text-blue-100 mt-1 font-medium max-w-xl">
                    ¿Ya declaraste y pagaste el IVA en el SII? Registra este pago automáticamente en tu flujo de caja. Se creará un egreso en la categoría "IMPUESTOS" con el monto de <strong>${data.resumen.diferenciaNeto.toLocaleString('es-CL')}</strong>.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleRegistrarPago}
                disabled={savingPayment}
                className="px-5 py-3 bg-corporativoRojo hover:bg-red-800 text-white rounded-xl text-sm font-bold flex items-center transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-70 relative z-10"
              >
                {savingPayment ? 'Registrando Pago...' : 'Registrar Pago F29 en Gastos'}
                <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
          )}

          {/* Pestañas Libro de Ventas y Compras */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
            <div className="border-b border-gray-150 bg-gray-50/50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Controles de Tab */}
              <div className="flex space-x-2 bg-gray-200/60 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('ventas')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'ventas' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Libro de Ventas (Emitidas)
                </button>
                <button 
                  onClick={() => setActiveTab('compras')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'compras' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Libro de Compras (Gastos Afectos)
                </button>
              </div>

              {/* Título de la sección */}
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {activeTab === 'ventas' ? 'DTE Emitidos en el Período' : 'Gastos Calificados como Crédito'}
              </span>
            </div>

            {/* Contenido de Tab: Ventas */}
            {activeTab === 'ventas' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="p-4 font-semibold">N° Factura</th>
                      <th className="p-4 font-semibold">Fecha Emisión</th>
                      <th className="p-4 font-semibold">Razón Social Cliente</th>
                      <th className="p-4 font-semibold text-right">Monto Neto</th>
                      <th className="p-4 font-semibold text-right">IVA (19%)</th>
                      <th className="p-4 font-semibold text-right">Monto Total</th>
                      <th className="p-4 font-semibold text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {data.ventas.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-500 font-medium">
                          No se registraron ventas facturadas en este período.
                        </td>
                      </tr>
                    ) : (
                      data.ventas.map((v) => (
                        <tr key={v.id_factura} className={`hover:bg-gray-50/80 transition-colors ${v.estado === 'ANULADA' ? 'opacity-50 line-through bg-red-50/20' : ''}`}>
                          <td className="p-4 font-bold text-corporativoAzul">FAC-{v.numero_factura}</td>
                          <td className="p-4 text-gray-600">
                            {new Date(v.fecha_emision).toLocaleDateString('es-CL', {
                              day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                          </td>
                          <td className="p-4 font-semibold text-gray-900">{v.cliente}</td>
                          <td className="p-4 text-right font-medium text-gray-600">${v.neto.toLocaleString('es-CL')}</td>
                          <td className="p-4 text-right font-bold text-corporativoAzul">${v.iva.toLocaleString('es-CL')}</td>
                          <td className="p-4 text-right font-bold text-gray-900">${v.total.toLocaleString('es-CL')}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                              v.estado === 'PAGADA' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : v.estado === 'ANULADA' 
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {v.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contenido de Tab: Compras */}
            {activeTab === 'compras' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="p-4 font-semibold">Fecha Gasto</th>
                      <th className="p-4 font-semibold">Descripción del Egresos</th>
                      <th className="p-4 font-semibold">Categoría</th>
                      <th className="p-4 font-semibold">Documento</th>
                      <th className="p-4 font-semibold text-right">Neto Estimado</th>
                      <th className="p-4 font-semibold text-right">IVA Crédito (19%)</th>
                      <th className="p-4 font-semibold text-right">Total Pagado</th>
                      <th className="p-4 font-semibold text-center">Tributable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {data.compras.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-500 font-medium">
                          No se registraron gastos en este período.
                        </td>
                      </tr>
                    ) : (
                      data.compras.map((c) => (
                        <tr key={c.id_gasto} className={`hover:bg-gray-50/80 transition-colors ${!c.afecto_iva ? 'bg-gray-50/40 text-gray-400' : ''}`}>
                          <td className="p-4 text-gray-600">
                            {new Date(c.fecha).toLocaleDateString('es-CL', {
                              day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                          </td>
                          <td className="p-4 font-semibold text-gray-900">{c.descripcion}</td>
                          <td className="p-4">
                            <span className="text-xs uppercase font-bold text-gray-500">{c.categoria}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-gray-200 bg-gray-100 text-gray-700">
                              {c.tipo_documento}
                            </span>
                          </td>
                          <td className="p-4 text-right font-medium text-gray-600">${c.neto.toLocaleString('es-CL')}</td>
                          <td className="p-4 text-right font-bold text-corporativoRojo">
                            {c.afecto_iva ? `$${c.iva.toLocaleString('es-CL')}` : '$0'}
                          </td>
                          <td className="p-4 text-right font-bold text-gray-900">${c.total.toLocaleString('es-CL')}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                              c.afecto_iva 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {c.afecto_iva ? 'Afecto IVA' : 'Exento'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
