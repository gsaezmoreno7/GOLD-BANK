import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle, FileText, Activity, TrendingUp, TrendingDown, Coins, Users, Building } from 'lucide-react';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activas: 0,
    egresos: 0,
    facturado: 0,
    utilidad: 0
  });
  const [newClientes, setNewClientes] = useState([]);
  const [recentFacturas, setRecentFacturas] = useState([]);
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
      const activas = ordenes.filter(o => ['INGRESADA', 'EN_DIAGNOSTICO', 'EN_REPARACION'].includes(o.estado)).length;
      const totalGastos = gastos.reduce((acc, curr) => acc + curr.monto, 0);
      const totalFacturado = facturas.filter(f => f.estado !== 'ANULADA').reduce((acc, curr) => acc + curr.total_facturado, 0);
      const utilidadReal = totalFacturado - totalGastos;

      setStats({
        activas,
        egresos: totalGastos,
        facturado: totalFacturado,
        utilidad: utilidadReal
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

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel de Control</h1>
        <p className="text-gray-500 mt-1 font-medium">Bienvenido nuevamente, {user?.nombre}. Aquí tienes el resumen operativo.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1: Órdenes Activas */}
        <div 
          onClick={() => navigate('/ordenes')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Órdenes Activas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activas}</p>
            </div>
            <div className="p-3 bg-blue-100 text-corporativoAzul rounded-xl">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
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
              <p className="text-sm text-gray-500 font-semibold mb-1">Egresos Totales</p>
              <p className="text-3xl font-bold text-corporativoRojo">${stats.egresos.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-red-100 text-corporativoRojo rounded-xl">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600 font-medium">
            <span>Gastos registrados &rarr;</span>
          </div>
        </div>

        {/* Card 3: Facturado (Ingresos) */}
        <div 
          onClick={() => navigate('/facturas')}
          className="bg-gradient-to-br from-corporativoAzul to-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl cursor-pointer transition-all hover:-translate-y-1 duration-300 text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm text-blue-100 font-medium mb-1">Facturado (Ingresos)</p>
              <p className="text-3xl font-bold text-white">${stats.facturado.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-100 font-medium">
            <span>Facturación del taller &rarr;</span>
          </div>
        </div>

        {/* Card 4: Utilidad Real */}
        <div 
          onClick={() => navigate('/facturas')}
          className="bg-gradient-to-br from-emerald-600 to-teal-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl cursor-pointer transition-all hover:-translate-y-1 duration-300 text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm text-emerald-100 font-medium mb-1">Utilidad Real</p>
              <p className="text-3xl font-bold text-white">${stats.utilidad.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Coins size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-emerald-100 font-medium">
            <span>Ingresos menos Egresos &rarr;</span>
          </div>
        </div>
      </div>

      {/* Secciones detalladas */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Facturación y Clientes */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <h2 className="text-lg font-bold text-gray-900">Rendimiento Financiero (Últimos 6 Meses)</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-corporativoAzul rounded-sm mr-1.5"></span>
                  <span className="text-xs text-gray-600 font-medium">Ingresos</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-corporativoRojo rounded-sm mr-1.5"></span>
                  <span className="text-xs text-gray-600 font-medium">Egresos</span>
                </div>
              </div>
            </div>
            
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                Cargando datos financieros...
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between space-x-4 px-2">
                {chartData.map((data, index) => {
                  const maxVal = Math.max(...chartData.map(m => Math.max(m.ingresos, m.egresos)), 1);
                  const ingresoPct = (data.ingresos / maxVal) * 100;
                  const egresoPct = (data.egresos / maxVal) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center w-full">
                      <div className="h-40 w-full flex items-end justify-center space-x-2 relative border-b border-gray-100 pb-1">
                        {/* Bar 1: Ingresos (Blue) */}
                        <div 
                          className="w-5 sm:w-6 bg-corporativoAzul rounded-t-sm transition-all duration-300 hover:opacity-90 relative group cursor-pointer"
                          style={{ height: `${ingresoPct}%`, minHeight: data.ingresos > 0 ? '4px' : '0px' }}
                        >
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded whitespace-nowrap z-20 pointer-events-none shadow-lg">
                            Ingresos: ${data.ingresos.toLocaleString('es-CL')}
                          </span>
                        </div>
                        
                        {/* Bar 2: Egresos (Red) */}
                        <div 
                          className="w-5 sm:w-6 bg-corporativoRojo rounded-t-sm transition-all duration-300 hover:opacity-90 relative group cursor-pointer"
                          style={{ height: `${egresoPct}%`, minHeight: data.egresos > 0 ? '4px' : '0px' }}
                        >
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded whitespace-nowrap z-20 pointer-events-none shadow-lg">
                            Egresos: ${data.egresos.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-500 font-semibold mt-2 text-center whitespace-nowrap">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Users size={20} className="mr-2 text-corporativoAzul" />
                Nuevos Clientes
              </h2>
            </div>
            <div className="space-y-4">
              {newClientes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay clientes registrados.</p>
              ) : (
                newClientes.map((c) => (
                  <div key={c.id_cliente} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-corporativoAzul font-bold">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{c.nombre}</p>
                        <p className="text-xs text-gray-500">RUT: {c.rut || 'Sin RUT'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{c.comuna || 'Chile'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Facturas Recientes */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Building size={20} className="mr-2 text-corporativoRojo" />
              Últimas Facturas (SII)
            </h2>
          </div>
          <div className="space-y-4">
            {recentFacturas.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay facturas emitidas.</p>
            ) : (
              recentFacturas.map((f) => {
                const isPaid = f.estado === 'PAGADA';
                const isCanceled = f.estado === 'ANULADA';
                const color = isPaid ? 'green' : (isCanceled ? 'red' : 'blue');
                return (
                  <div key={f.id_factura} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">F-{f.numero_factura}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold bg-${color}-100 text-${color}-800`}>
                        {f.estado}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-xs text-gray-400">{new Date(f.fecha_emision).toLocaleDateString()}</span>
                      <span className="font-bold text-corporativoAzul">${f.total_facturado.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
