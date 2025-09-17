import React, { useState, useEffect } from 'react';
import { Heart, Menu, X, MapPin } from 'lucide-react';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const navItems = [
  { id: 'inicio', label: 'Inicio', color: 'hover:text-blue-800' },
  { id: 'informacion', label: 'Información', color: 'hover:text-blue-700' },
  { id: 'registro', label: 'Registro', color: 'hover:text-blue-600' },
  { id: 'salon-fama', label: 'Salón de la Fama', color: 'hover:text-gray-400' },
  { id: 'trayectoria', label: 'Historia', color: 'hover:text-gray-400' },
  { id: 'patrocinadores', label: 'Patrocinadores', color: 'hover:text-gray-400' },
  { id: 'contacto', label: 'Contacto', color: 'hover:text-red-600' }
];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-blue-900/95 backdrop-blur-xl shadow-2xl border-b border-blue-900' 
        : 'bg-blue-900/90 backdrop-blur-lg shadow-lg'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo mejorado con imagen personalizada */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveSection('inicio')}
          >
            <div className="relative">
              {!logoError ? (
                <img 
                  src="/images/logo.png" 
                  alt="Logo Carrera del Médico"
                  className="w-14 h-14 object-contain group-hover:scale-110 transition-all duration-300"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Heart className="text-red-600 w-10 h-10 animate-heartbeat group-hover:scale-110 transition-all duration-300" style={{ transform: undefined }} />
              )}
            </div>
            <div>
              <span className="text-xl font-black text-white group-hover:text-blue-300 transition-all duration-300">
                Carrera del Médico
              </span>
              <div className="text-xs text-blue-200 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-red-600" />
                Tuxtla Gutiérrez, Chiapas
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group overflow-hidden ${
                  activeSection === item.id
                    ? 'bg-blue-800 text-white shadow-lg transform scale-105'
                    : `text-blue-100 ${item.color} hover:bg-blue-800 hover:shadow-md`
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="relative z-10">{item.label}</span>
                {activeSection === item.id && (
                  <div className="absolute inset-0 bg-blue-800 opacity-20 animate-pulse"></div>
                )}
                <div className={`absolute inset-0 bg-blue-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-3 rounded-xl hover:bg-blue-800 transition-all duration-300 transform hover:scale-110 relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="relative">
              {isOpen ? (
                <X className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen 
            ? 'max-h-96 opacity-100 pb-6 border-t border-blue-900 mt-4 pt-4' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-3">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeSection === item.id
                    ? 'bg-blue-800 text-white shadow-lg'
                    : `text-blue-100 ${item.color} hover:bg-blue-800 hover:shadow-md`
                }`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: isOpen ? 'slideInUp 0.5s ease-out' : 'none'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};


export default Navbar;
