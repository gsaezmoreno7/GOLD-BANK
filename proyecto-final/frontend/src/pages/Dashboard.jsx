import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  CheckCircle, 
  FileText, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Users, 
  Building, 
  Plus, 
  ShieldAlert, 
  ArrowUpRight, 
  LayoutDashboard, 
  Wrench, 
  Package, 
  Sparkles,
  Upload
} from 'lucide-react';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activas: 0,
    egresos: 0,
    facturado: 0,
    utilidad: 0,
    internasActivas: 0,
    mantenimientoCosto: 0
  });
  const [newClientes, setNewClientes] = useState([]);
  const [recentFacturas, setRecentFacturas] = useState([]);
  const [urgentOrders, setUrgentOrders] = useState([]);
  const [operationalMetrics, setOperationalMetrics] = useState({
    avgTicket: 0,
    expenseRatio: 0,
    totalOrders: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all needed resources
      const [resOrdenes, resClientes, resFacturas, resGastos] = await Promise.all([
        axios.get('/api/ordentrabajo', { headers }),
        axios.get('/api/cliente', { headers }),
        axios.get('/api/factura', { headers }),
        axios.get('/api/gasto', { headers })
      ]);

      const ordenes = resOrdenes.data;
      const clientes = resClientes.data;
      const facturas = resFacturas.data;
      const gastos = resGastos.data;

      // Calculate statistics
      const activas = ordenes.filter(o => 
        ['INGRESADA', 'EN_DIAGNOSTICO', 'EN_REPARACION'].includes(o.estado) && 
        o.cliente?.rut !== '76.123.456-K'
      ).length;
      const totalGastos = gastos.reduce((acc, curr) => acc + curr.monto, 0);
      const totalFacturado = facturas.filter(f => f.estado !== 'ANULADA').reduce((acc, curr) => acc + curr.total_facturado, 0);
      const utilidadReal = totalFacturado - totalGastos;

      const ordenesInternas = ordenes.filter(o => o.cliente?.rut === '76.123.456-K');
      const internasActivas = ordenesInternas.filter(o => 
        ['INGRESADA', 'EN_DIAGNOSTICO', 'EN_REPARACION'].includes(o.estado)
      ).length;

      let mantenimientoCosto = 0;
      ordenesInternas.forEach(o => {
        if (o.materiales_usados) {
          o.materiales_usados.forEach(mu => {
            mantenimientoCosto += mu.costo_real * mu.cantidad;
          });
        }
      });

      setStats({
        activas,
        egresos: totalGastos,
        facturado: totalFacturado,
        utilidad: utilidadReal,
        internasActivas,
        mantenimientoCosto
      });

      // Filter 3 most urgent active orders
      const urgent = ordenes.filter(o => 
        ['INGRESADA', 'EN_DIAGNOSTICO', 'EN_REPARACION'].includes(o.estado) && 
        o.prioridad === 'ALTA'
      ).slice(0, 3);
      setUrgentOrders(urgent);

      // Compute operational metrics
      const totalPaidFacturas = facturas.filter(f => f.estado === 'PAGADA');
      const avgTicket = totalPaidFacturas.length > 0 
        ? Math.round(totalPaidFacturas.reduce((acc, curr) => acc + curr.total_facturado, 0) / totalPaidFacturas.length)
        : 0;
      const expenseRatio = totalFacturado > 0 ? Math.round((totalGastos / totalFacturado) * 100) : 0;
      setOperationalMetrics({
        avgTicket,
        expenseRatio,
        totalOrders: ordenes.length
      });

      // Get latest 3 clients
      setNewClientes(clientes.slice(-3).reverse());

      // Get latest 5 invoices
      setRecentFacturas(facturas.slice(-5).reverse());

      // Generate dynamic 6-month comparison chart
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const today = new Date();
      const tempChartData = [];
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        tempChartData.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
          ingresos: 0,
          egresos: 0
        });
      }

      // Populate ingresos (invoices not annulled)
      facturas.forEach(f => {
        if (f.estado === 'ANULADA') return;
        const date = new Date(f.fecha_emision);
        if (isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const match = tempChartData.find(m => m.key === key);
        if (match) {
          match.ingresos += f.total_facturado;
        }
      });

      // Populate egresos (expenses)
      gastos.forEach(g => {
        const date = new Date(g.fecha);
        if (isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const match = tempChartData.find(m => m.key === key);
        if (match) {
          match.egresos += g.monto;
        }
      });

      setChartData(tempChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'INGRESADA': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'EN_DIAGNOSTICO': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'EN_REPARACION': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <LayoutDashboard className="text-corporativoAzul mr-2.5" size={26} />
            Panel de Control General
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 font-semibold">
            Bienvenido nuevamente, <span className="text-corporativoAzul font-bold">{user?.nombre}</span>. Control operativo interno de Maestranza R.S SPA.
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg font-bold">
          Actualizado: {new Date().toLocaleDateString('es-CL')} | Rol: {user?.rol}
        </div>
      </div>

      {/* Quick Actions Operations Menu */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Operaciones Rápidas</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <button 
            onClick={() => navigate('/ordenes')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-50/50 hover:bg-blue-50 text-corporativoAzul rounded-xl border border-blue-100 font-bold text-xs transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Nueva Orden</span>
          </button>
          
          <button 
            onClick={() => navigate('/gastos')}
            className="flex items-center justify-center space-x-2 p-3 bg-red-50/50 hover:bg-red-50 text-corporativoRojo rounded-xl border border-red-100 font-bold text-xs transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Registrar Gasto</span>
          </button>

          <button 
            onClick={() => navigate('/clientes')}
            className="flex items-center justify-center space-x-2 p-3 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-xs transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Agregar Cliente</span>
          </button>

          <button 
            onClick={() => navigate('/materiales')}
            className="flex items-center justify-center space-x-2 p-3 bg-purple-50/50 hover:bg-purple-50 text-purple-700 rounded-xl border border-purple-100 font-bold text-xs transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Agregar Material</span>
          </button>

          <button 
            onClick={() => navigate('/importar')}
            className="flex items-center justify-center space-x-2 p-3 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-bold text-xs transition-all hover:scale-[1.02] col-span-2 sm:col-span-1"
          >
            <Upload size={16} />
            <span>Importar Excel</span>
          </button>
        </div>
      </div>
      
      {/* 4 KPIs Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Órdenes Activas */}
        <div 
          onClick={() => navigate('/ordenes')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Órdenes Activas</p>
              <p className="text-3xl font-black text-gray-900">{stats.activas}</p>
            </div>
            <div className="p-3 bg-blue-100 text-corporativoAzul rounded-xl border border-blue-200">
              <Activity size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600 font-bold">
            <span>Operaciones en curso &rarr;</span>
          </div>
        </div>

        {/* Card 2: Egresos Totales */}
        <div 
          onClick={() => navigate('/gastos')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Egresos Totales</p>
              <p className="text-3xl font-black text-corporativoRojo">${stats.egresos.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-red-100 text-corporativoRojo rounded-xl border border-red-200">
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-red-600 font-bold">
            <span>Gastos registrados &rarr;</span>
          </div>
        </div>

        {/* Card 3: Facturado (Ingresos) */}
        <div 
          onClick={() => navigate('/facturas')}
          className="bg-gradient-to-br from-corporativoAzul to-slate-800 p-6 rounded-2xl shadow-md relative overflow-hidden group hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 duration-300 text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-1">Facturado (Ingresos)</p>
              <p className="text-3xl font-black text-white">${stats.facturado.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10">
              <TrendingUp size={22} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-100 font-bold">
            <span>Facturación del taller &rarr;</span>
          </div>
        </div>

        {/* Card 4: Utilidad Real */}
        <div 
          onClick={() => navigate('/facturas')}
          className="bg-gradient-to-br from-emerald-600 to-teal-800 p-6 rounded-2xl shadow-md relative overflow-hidden group hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 duration-300 text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider mb-1">Utilidad Real</p>
              <p className="text-3xl font-black text-white">${stats.utilidad.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10">
              <Coins size={22} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-100 font-bold">
            <span>Ingresos menos Egresos &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Operational and Financial Panels */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Financial + Urgent Orders) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Financial Performance Chart Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Rendimiento Financiero de Maestranza</h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Historial comparativo de ingresos y egresos últimos 6 meses</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-corporativoAzul rounded-sm mr-1.5"></span>
                  <span className="text-xs text-gray-650 font-bold">Ingresos</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-corporativoRojo rounded-sm mr-1.5"></span>
                  <span className="text-xs text-gray-650 font-bold">Egresos</span>
                </div>
              </div>
            </div>
            
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm font-semibold bg-gray-50 rounded-xl border border-gray-100">
                Cargando datos financieros...
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between space-x-4 px-2 mt-4">
                {chartData.map((data, index) => {
                  const maxVal = Math.max(...chartData.map(m => Math.max(m.ingresos, m.egresos)), 1);
                  const ingresoPct = (data.ingresos / maxVal) * 100;
                  const egresoPct = (data.egresos / maxVal) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center w-full">
                      <div className="h-40 w-full flex items-end justify-center space-x-1.5 relative border-b border-gray-100 pb-1">
                        {/* Bar 1: Ingresos (Blue) */}
                        <div 
                          className="w-5 sm:w-6 bg-corporativoAzul rounded-t-md transition-all duration-300 hover:opacity-90 relative group cursor-pointer"
                          style={{ height: `${ingresoPct}%`, minHeight: data.ingresos > 0 ? '4px' : '0px' }}
                        >
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded whitespace-nowrap z-20 pointer-events-none shadow-lg font-bold">
                            Ingresos: ${data.ingresos.toLocaleString('es-CL')}
                          </span>
                        </div>
                        
                        {/* Bar 2: Egresos (Red) */}
                        <div 
                          className="w-5 sm:w-6 bg-corporativoRojo rounded-t-md transition-all duration-300 hover:opacity-90 relative group cursor-pointer"
                          style={{ height: `${egresoPct}%`, minHeight: data.egresos > 0 ? '4px' : '0px' }}
                        >
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded whitespace-nowrap z-20 pointer-events-none shadow-lg font-bold">
                            Egresos: ${data.egresos.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold mt-2 text-center whitespace-nowrap">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* New Section: Urgent Active Work Orders */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <ShieldAlert className="text-corporativoRojo mr-2" size={20} />
                  Alertas Operativas: Órdenes Críticas (Prioridad Alta)
                </h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Órdenes de trabajo activas de máxima urgencia</p>
              </div>
              <button 
                onClick={() => navigate('/ordenes')}
                className="text-[11px] text-corporativoAzul hover:text-blue-900 bg-blue-50 hover:bg-blue-100 font-bold px-2.5 py-1.5 rounded-lg border border-blue-100 transition-colors"
              >
                Ver Todas
              </button>
            </div>
            
            <div className="space-y-3">
              {urgentOrders.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-xs font-semibold">
                  🚀 No hay órdenes activas de alta prioridad. ¡Excelente control de taller!
                </div>
              ) : (
                urgentOrders.map((o) => (
                  <div key={o.id_orden} className="flex items-center justify-between p-4 border border-red-100 bg-red-50/20 hover:bg-red-50/40 rounded-xl transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 bg-red-100 text-corporativoRojo rounded-lg flex items-center justify-center font-black text-sm">
                        #{o.id_orden}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-850">
                          {o.cliente?.nombre || 'Cliente General'} | <span className="text-gray-500 font-semibold">{o.maquina?.tipo_maquina || 'Equipo'}</span>
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium truncate max-w-sm sm:max-w-md mt-0.5">{o.descripcion_inicial}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(o.estado)}`}>
                        {o.estado.replace('_', ' ')}
                      </span>
                      <button 
                        onClick={() => navigate('/ordenes')}
                        className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
                        title="Gestionar en Órdenes"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Analytical Column */}
        <div className="space-y-8">
          {/* Operational Efficiency Metrics Dashboard Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Eficiencia Operativa</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Ticket Promedio Facturado</span>
                  <span className="text-[10px] text-gray-450 font-semibold">Valor medio de facturas cobradas</span>
                </div>
                <span className="text-sm font-black text-emerald-700">${operationalMetrics.avgTicket.toLocaleString('es-CL')}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-t border-gray-50 pt-3">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Ratio de Egresos Operacionales</span>
                  <span className="text-[10px] text-gray-450 font-semibold">Gastos frente al total facturado</span>
                </div>
                <span className="text-sm font-black text-corporativoRojo">{operationalMetrics.expenseRatio}%</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-gray-50 pt-3">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Total Histórico de Órdenes</span>
                  <span className="text-[10px] text-gray-455 font-semibold">Órdenes generadas en total</span>
                </div>
                <span className="text-sm font-black text-corporativoAzul">{operationalMetrics.totalOrders} Trabajos</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-gray-50 pt-3">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Mantenimiento Activo (Taller)</span>
                  <span className="text-[10px] text-gray-450 font-semibold">Órdenes internas en curso</span>
                </div>
                <span className="text-sm font-black text-purple-750 flex items-center">
                  <Wrench size={12} className="mr-1 inline text-purple-500" />
                  {stats.internasActivas} Activas
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-gray-50 pt-3">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Inversión en Mantenimiento</span>
                  <span className="text-[10px] text-gray-450 font-semibold">Materiales consumidos internamente</span>
                </div>
                <span className="text-sm font-black text-indigo-700">${stats.mantenimientoCosto.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* SII Invoices Panel Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
                <Building size={16} className="mr-2 text-corporativoRojo" />
                Últimas Facturas (SII)
              </h2>
            </div>
            <div className="space-y-3.5">
              {recentFacturas.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 font-semibold">No hay facturas emitidas.</p>
              ) : (
                recentFacturas.map((f) => {
                  const isPaid = f.estado === 'PAGADA';
                  const isCanceled = f.estado === 'ANULADA';
                  const color = isPaid ? 'emerald' : (isCanceled ? 'red' : 'blue');
                  const border = isPaid ? 'emerald-200' : (isCanceled ? 'red-200' : 'blue-200');
                  return (
                    <div key={f.id_factura} className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-900">SII F-{f.numero_factura}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded border font-bold bg-${color}-50 text-${color}-700 border-${border}`}>
                          {f.estado}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-3">
                        <span className="text-[10px] text-gray-450 font-semibold">{new Date(f.fecha_emision).toLocaleDateString('es-CL')}</span>
                        <span className="text-xs font-black text-corporativoAzul">${f.total_facturado.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* New Clients Panel Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center mb-4">
              <Users size={16} className="mr-2 text-corporativoAzul" />
              Nuevos Clientes
            </h2>
            <div className="space-y-3">
              {newClientes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 font-semibold">No hay clientes registrados.</p>
              ) : (
                newClientes.map((c) => (
                  <div key={c.id_cliente} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 text-corporativoAzul rounded-full flex items-center justify-center font-black text-xs">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{c.nombre}</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">RUT: {c.rut || 'Sin RUT'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
