import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, User, Bell, Check, Menu } from 'lucide-react';
import axios from 'axios';

export default function Navbar({ user, onLogout, onToggleSidebar }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace unos instantes';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch recent data concurrently
        const [resOrders, resFacturas, resGastos] = await Promise.allSettled([
          axios.get('/api/ordentrabajo', { headers }),
          axios.get('/api/factura', { headers }),
          axios.get('/api/gasto', { headers })
        ]);

        const notifs = [];

        // Process Orders
        if (resOrders.status === 'fulfilled' && Array.isArray(resOrders.value.data)) {
          resOrders.value.data.forEach(o => {
            notifs.push({
              id: `orden-${o.id_orden}`,
              text: `Nueva orden de trabajo #${o.id_orden} (${o.tipo_maquina})`,
              rawDate: o.fecha_ingreso || o.created_at,
              unread: o.estado === 'INGRESADA',
              type: 'order'
            });
          });
        }

        // Process Invoices
        if (resFacturas.status === 'fulfilled' && Array.isArray(resFacturas.value.data)) {
          resFacturas.value.data.forEach(f => {
            notifs.push({
              id: `factura-${f.id_factura}`,
              text: `Factura F-${f.numero_factura} emitida por $${f.total_facturado.toLocaleString('es-CL')}`,
              rawDate: f.fecha_emision || f.created_at,
              unread: f.estado === 'EMITIDA',
              type: 'invoice'
            });
          });
        }

        // Process Expenses
        if (resGastos.status === 'fulfilled' && Array.isArray(resGastos.value.data)) {
          resGastos.value.data.forEach(g => {
            notifs.push({
              id: `gasto-${g.id_gasto}`,
              text: `Gasto registrado: ${g.descripcion} ($${g.monto.toLocaleString('es-CL')})`,
              rawDate: g.fecha || g.created_at,
              unread: false,
              type: 'expense'
            });
          });
        }

        // Sort by date descending
        notifs.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        // Format and set top 5 notifications
        const topNotifs = notifs.slice(0, 5).map(n => ({
          id: n.id,
          text: n.text,
          time: formatRelativeTime(n.rawDate),
          unread: n.unread
        }));

        // Fallback mock notifications if database is empty
        if (topNotifs.length === 0) {
          setNotifications([
            { id: 1, text: "Nueva orden #1042 ingresada", time: "Hace 10 min", unread: true },
            { id: 2, text: "Factura F-899 pagada", time: "Hace 1 hora", unread: true },
            { id: 3, text: "Stock de repuestos bajo", time: "Hace 2 horas", unread: true }
          ]);
        } else {
          setNotifications(topNotifs);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Set interval to refresh relative times every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={onToggleSidebar}
          className="text-gray-500 hover:text-corporativoAzul hover:bg-gray-100 p-2 rounded-lg transition-colors focus:outline-none"
          title="Colapsar / Expandir Menú"
        >
          <Menu size={24} />
        </button>

        {(showNotif || showProfile) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => { setShowNotif(false); setShowProfile(false); }}
          ></div>
        )}
        <div className="flex items-center space-x-6 relative z-50">
          <button 
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="text-gray-400 hover:text-corporativoAzul relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-corporativoRojo text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-12 top-10 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-corporativoAzul hover:text-blue-800 font-semibold transition-colors"
                  >
                    Marcar todas leídas
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No tienes notificaciones</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`px-4 py-3 hover:bg-gray-50/80 cursor-pointer transition-colors flex items-start ${n.unread ? 'bg-blue-50/20' : ''}`}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${n.unread ? 'bg-corporativoRojo animate-pulse' : 'bg-gray-300'} mr-3 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <p className={`text-sm text-gray-900 ${n.unread ? 'font-semibold' : 'font-medium'}`}>{n.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 p-2 pr-4 rounded-full transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-corporativoAzul"
            >
              <div className="h-8 w-8 bg-corporativoAzul rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {user?.nombre ? user.nombre.charAt(0) : '?'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-700 leading-tight">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-gray-500 font-medium">{user?.rol || 'Rol'}</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 mb-2 md:hidden">
                  <p className="text-sm font-bold text-gray-700">{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user?.rol || 'Rol'}</p>
                </div>
                <NavLink
                  to="/perfil"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-corporativoAzul transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <User className="mr-3 h-4 w-4" /> Mi Perfil
                </NavLink>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border-t border-gray-50 mt-1"
                >
                  <LogOut className="mr-3 h-4 w-4" /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
