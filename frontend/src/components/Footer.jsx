import React from 'react';
import { Heart, Phone, MapPin, Facebook, Headphones } from 'lucide-react';

// Función de scroll suave
const scrollToSection = (sectionId, setActiveSection) => {
  setActiveSection(sectionId);
  const sectionElement = document.getElementById(sectionId);
  if (sectionElement) {
    sectionElement.scrollIntoView({ behavior: 'smooth' });
  }
};

const Footer = ({ setActiveSection }) => {
  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-500' }
  ];

  const contactInfo = [
    { icon: Phone, text: '961 613 66 66' },
    { icon: MapPin, text: 'Tuxtla Gutiérrez, Chiapas' }
  ];

  const supportInfo = [
    { icon: Phone, text: '961 610 64 69' }
  ];

  return (
    <footer className="bg-blue-950 text-gray-200 relative overflow-hidden">
      <div className="relative z-10">
        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-10">

            {/* Logo y descripción */}
            <div>
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
                  <p className="text-gray-400 text-sm">Chiapas 2026</p>
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
                      className="bg-blue-900 hover:bg-blue-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110 text-blue-400"
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Información de contacto del evento */}
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
                <p className="text-xs text-gray-500 leading-relaxed pt-1">
                  Para dudas o fallas con tu inscripción o registro en línea.
                </p>
              </div>
            </div>

            {/* Soluciones tecnológicas */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-gray-100">Soluciones Tecnológicas</h4>
              <div className="space-y-4">
                {supportInfo.map((contact, index) => {
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
                <p className="text-xs text-gray-500 leading-relaxed pt-1">
                  Desarrollo web y soporte técnico del sitio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-800/60 to-transparent"></div>

        {/* Copyright */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2026 Carrera del Día del Médico. Todos los derechos reservados.</p>
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