import React from 'react';
import { Heart, Phone, MapPin, Facebook, Building2 } from 'lucide-react';

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

  const medicaSur = {
    name: 'Médica Sur',
    director: 'Dr. Francisco A. Ramos Narváez.',
    address: [
      '2a. Avenida Sur Poniente. # 557, colonia Centro.',
      'C.P. 29000, Tuxtla Gutiérrez, Chiapas, México.'
    ],
    phones: [
      { text: '(961) 61 3 66 66', tel: '9616136666' },
      { text: '(961) 61 1 12 84', tel: '9616111284' },
      { text: '(961) 61 1 13 96', tel: '9616111396' },
      { text: '(961) 61 2 56 68', tel: '9616125668' }
    ]
  };

  const mapsUrl = 'https://maps.app.goo.gl/DGZKGP9dpCddKzTa9';

  const supportInfo = [
    { name: 'Ing. Felipe Morales', text: '961 610 6469', tel: '9616106469' },
    { name: 'Ing. Cesar Gomez', text: '962 354 6362', tel: '9623546362' }
  ];

  const servicios = [
    'Diseño de Proyectos',
    'Equipo de Cómputo y Accesorios',
    'Redes y Sistemas de Cableado Estructurado',
    'Equipos para Telecomunicaciones',
    'Internet Satelital',
    'Soporte Técnico',
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

            {/* Información de contacto del evento (Médica Sur) */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-gray-100">Contacto</h4>
              <div className="space-y-4">
                <div className="flex items-start text-gray-400">
                  <div className="bg-blue-900 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-sm leading-relaxed">
                    <span className="block font-semibold text-gray-200">{medicaSur.name}</span>
                    <span className="block">{medicaSur.director}</span>
                  </div>
                </div>

                <div className="flex items-start text-gray-400">
                  <div className="bg-blue-900 p-2 rounded-lg mr-3 flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver ubicación en Google Maps"
                    className="hover:text-blue-400 transition-colors duration-200"
                  >
                    <address className="text-sm not-italic leading-relaxed">
                      {medicaSur.address.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </address>
                  </a>
                </div>

                <div className="flex items-start text-gray-400">
                  <div className="bg-blue-900 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-sm leading-relaxed">
                    <span className="block text-gray-500 text-xs mb-1">Teléfonos:</span>
                    {medicaSur.phones.map((phone) => (
                      <a
                        key={phone.tel}
                        href={`tel:${phone.tel}`}
                        className="block hover:text-blue-400 transition-colors duration-200"
                      >
                        {phone.text}
                      </a>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed pt-1">
                  Para dudas o fallas con tu inscripción o registro en línea.
                </p>
              </div>
            </div>

            {/* Soluciones tecnológicas */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-gray-100">Soluciones Tecnológicas</h4>
              <div className="space-y-4">
                <p className="text-base font-semibold text-gray-200">Numma</p>

                {supportInfo.map((contact) => (
                  <div key={contact.tel} className="flex items-start text-gray-400">
                    <div className="bg-blue-900 p-2 rounded-lg mr-3 flex-shrink-0">
                      <Phone className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-sm leading-relaxed">
                      <span className="block text-gray-200">{contact.name}</span>
                      <a
                        href={`tel:${contact.tel}`}
                        className="hover:text-blue-400 transition-colors duration-200"
                      >
                        {contact.text}
                      </a>
                    </div>
                  </div>
                ))}

                <ul className="space-y-2">
                  {servicios.map((servicio) => (
                    <li key={servicio} className="flex items-start text-sm text-gray-400">
                      <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      {servicio}
                    </li>
                  ))}
                </ul>

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