import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, FileText, Package, Coins, Percent } from 'lucide-react';

export default function Sidebar({ user, open }) {
  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
    { name: 'Órdenes', path: '/ordenes', icon: <Wrench size={20} /> },
    { name: 'Materiales', path: '/materiales', icon: <Package size={20} /> },
    { name: 'Gastos', path: '/gastos', icon: <Coins size={20} /> },
    { name: 'Facturación', path: '/facturas', icon: <FileText size={20} /> },
    { name: 'Impuestos', path: '/impuestos', icon: <Percent size={20} /> },
  ];

  return (
    <div className={`${open ? 'w-72' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'} bg-gradient-to-b from-[#002244] to-corporativoAzul text-white flex flex-col h-full shadow-2xl relative z-10 transition-all duration-300 overflow-hidden`}>
      {/* Brand Section */}
      <div className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        <img 
          src="/logo.png" 
          alt="Maestranza R.S Logo" 
          className={`${open ? 'h-20' : 'h-10'} w-auto object-contain transition-all duration-300 mb-4 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20`} 
        />
        {open && (
          <>
            <h1 className="text-xl font-extrabold uppercase tracking-widest text-white drop-shadow-md whitespace-nowrap">
              Maestranza R.S
            </h1>
            <p className="text-xs text-blue-200 mt-1 font-medium tracking-wide whitespace-nowrap">SISTEMA ERP INTEGRAL</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {open && <p className="px-4 text-xs font-bold text-blue-300 uppercase tracking-wider mb-4">Menú Principal</p>}
        
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            title={!open ? link.name : ''}
            className={({ isActive }) =>
              `flex items-center ${open ? 'space-x-3 px-4' : 'justify-center'} py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-corporativoRojo text-white shadow-lg shadow-red-900/50 translate-x-1' 
                  : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && open && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md"></div>
                )}
                <div className={`${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'} transition-colors`}>
                  {link.icon}
                </div>
                {open && <span className="font-semibold text-sm tracking-wide whitespace-nowrap">{link.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      {open && (
        <div className="p-4 m-4 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-blue-200 font-medium">Sistema en línea</p>
          </div>
        </div>
      )}
    </div>
  );
}
