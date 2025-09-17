import React from 'react';
import { Heart, Users } from 'lucide-react';

const SponsorsSection = () => {
  const sponsors = [
    'Hospital San Juan',
    'Farmacia Central', 
    'Clínica La Esperanza',
    'Laboratorios Unidos',
    'Seguros Médicos Plus',
    'Equipos Médicos SA'
  ];

  const organizingCommittee = [
    { name: 'Dr. Francisco Antonio Ramos Narváez', position: 'Cirujano Gastroenterologo', image: '/images/Ramos.png' },
    { name: 'Dr. Tadeo Santoyo Espinosa', position: 'Director de Ingeniería Biomédica', image: '/images/Tadeo.png' },
    { name: 'Dr. Alexander Arroya Nuñez', position: 'Especialista', image: '/images/alexander.png' },
    { name: 'Dr. Juan Carlos Alvarez Ruiz', position: 'Especialista', image: '/images/juan_carlos.png' },
    { name: 'Dr. Humberto Rojas', position: 'Especialista', image: '/images/humberto.png' },
    { name: 'Dr. Hernán León Velasco', position: 'Especialista', image: '/images/hernan.png' },
    { name: 'Dr. Alejandro Bermúdez Montoya', position: 'Especialista', image: '/images/alejandro.png' },
    { name: 'Dr. Eric Torres Reyes', position: 'Especialista', image: '/images/eric.png' }
  ];

  const developmentTeam = [
    {  name: 'Ing. Cesar Gomez Aguilera', image: '/images/Aguilera.png' },
    {  name: 'Ing. Luis Felipe Morales Gutierrez', image: '/images/feli.png' }
  ];

  return (
    <div className="py-16 bg-blue-950">
      <div className="container mx-auto px-4">
        {/* Sección de Patrocinadores */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-gray-100">
            Nuestros Patrocinadores
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Gracias a estas instituciones y empresas que hacen posible que nuestra carrera crezca año tras año
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {sponsors.map((sponsor, index) => (
            <div 
              key={index} 
              className="bg-blue-900 rounded-lg shadow-lg p-6 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300 border border-blue-900/40 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-blue-400 group-hover:animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-gray-200 group-hover:text-blue-300 transition-colors duration-300">
                  {sponsor}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sección del Comité Organizador */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-gray-100">
              Comité Organizador
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              El equipo de profesionales dedicados que trabaja incansablemente para hacer realidad este evento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {organizingCommittee.map((member, index) => (
              <div 
                key={index} 
                className="bg-blue-900 rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-2 border border-blue-900/40 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-800 relative group-hover:border-blue-600 transition-colors duration-300">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-blue-800');
                      const fallbackIcon = document.createElement('div');
                      fallbackIcon.innerHTML = '<svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>';
                      e.target.parentNode.appendChild(fallbackIcon);
                    }}
                  />
                </div>
                <h4 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-blue-300 transition-colors duration-300">
                  {member.name}
                </h4>
                <p className="text-sm text-blue-300 font-medium group-hover:text-blue-200 transition-colors duration-300">
                  {member.position}
                </p>
              </div>
            ))}   
          </div>
        </div>

        {/* Sección del Equipo de Desarrollo */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-gray-100">
              Equipo de Desarrollo
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Equipo de desarrollo de la aplicación web
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-12 mb-16 max-w-md">
              {developmentTeam.map((developer, index) => (
                <div 
                  key={index} 
                  className="bg-blue-900 rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-2 border border-blue-900/40 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-800 relative group-hover:border-blue-600 transition-colors duration-300">
                    <img 
                      src={developer.image} 
                      alt={developer.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-blue-800');
                        const fallbackIcon = document.createElement('div');
                        fallbackIcon.innerHTML = '<svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>';
                        e.target.parentNode.appendChild(fallbackIcon);
                      }}
                    />
                  </div>
                  <h4 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    {developer.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mensaje de agradecimiento */}
        <div className="bg-blue-900 rounded-3xl p-12 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <Heart className="w-16 h-16 mx-auto mb-6 text-red-400 animate-pulse" />
            <h3 className="text-3xl font-black text-gray-100 mb-6">
              Gracias por Hacer Posible Este Evento
            </h3>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Sin el apoyo de nuestros patrocinadores y la dedicación incansable de nuestro comité organizador, 
              la Carrera del Día del Médico no sería posible. Juntos seguimos promoviendo la salud y el deporte 
              en nuestra bella Chiapas.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-950/50 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-blue-300 mb-2">31 Años de Historia</h4>
                <p className="text-gray-400 text-sm">
                  Más de tres décadas celebrando la medicina y el deporte
                </p>
              </div>
              <div className="bg-blue-950/50 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-blue-300 mb-2">Impacto Social</h4>
                <p className="text-gray-400 text-sm">
                  Miles de participantes unidos por la salud y el bienestar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SponsorsSection;