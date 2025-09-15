import React from 'react';
import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Calendar } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Registro', id: 'registro' },
    { name: 'Información', id: 'informacion' },
    { name: 'Resultados', id: 'salon-fama' },
    { name: 'Historia', id: 'trayectoria' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-500' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-500' },
  ];

  const contactInfo = [
    { icon: Phone, text: '+52 961 462 3839' },
    { icon: Mail, text: 'infocarreradelmedico@gmail.com' },
    { icon: MapPin, text: 'Tuxtla Gutiérrez, Chiapas' }
  ];

  return (
    <footer className="bg-blue-950 text-gray-200 relative overflow-hidden">
      {/* Fondo decorativo removido para mayor sobriedad */}
      <div className="relative z-10">
        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-full">
                  <img 
                    src="/images/logo.png" 
                    alt="Logo Carrera del Médico"
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <Heart className="text-red-600 w-8 h-8 hidden" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-100">Carrera del Médico</h3>
                  <p className="text-gray-400 text-sm">Chiapas 2025</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Celebrando la vida, la salud y el compromiso de nuestros profesionales médicos. 
                Únete a la comunidad deportiva más importante del sector salud en Chiapas.
              </p>
              
              {/* Redes sociales */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className={`bg-blue-900 hover:bg-blue-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110 text-blue-400`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-gray-100">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={`#${link.id}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-blue-700 rounded-full mr-3 group-hover:bg-blue-400 transition-colors"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Información de contacto */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-gray-100">Contacto</h4>
              <div className="space-y-4">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <div key={index} className="flex items-center text-gray-400">
                      <div className="bg-blue-900 p-2 rounded-lg mr-3">
                        <IconComponent className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm">{contact.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Próximo evento */}
              <div className="mt-6 bg-blue-900 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="font-semibold text-sm text-gray-100">Próximo Evento</span>
                </div>
                <p className="text-sm text-gray-200">18 de Octubre, 2025</p>
                <p className="text-xs opacity-80 text-gray-400">Parque Central</p>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
  <div className="border-t border-blue-900"></div>

        {/* Copyright */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2025 Carrera del Día del Médico. Todos los derechos reservados.</p>
            <div className="flex items-center mt-4 md:mt-0">
              <Heart className="w-4 h-4 text-red-500 mr-2" />
              <p>Desarrollado por Numma para la comunidad médica</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;