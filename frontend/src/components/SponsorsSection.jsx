import React from 'react';
import { Heart, Users } from 'lucide-react';

const SponsorsSection = () => {
  const sponsors = [
    { name: 'Universidad Politécnica de Chiapas', image: '/images/patrocinadores/universidad-politecnica.webp' },
    { name: 'Diario de Chiapas', image: '/images/patrocinadores/diario-de-chiapas.png' },
    { name: 'Laboratorios Rovisan', image: '/images/patrocinadores/rovisan.jpg' },
    { name: 'Vips', image: '/images/patrocinadores/vips.png' },
    { name: 'Universidad Pablo Guardado Chavez', image: '/images/patrocinadores/pablo-guardado.jpg' },
    { name: 'Sporade', image: '/images/patrocinadores/sporade.png' },
    { name: 'Alfasigma', image: '/images/patrocinadores/alfasigma.jpg' },
    { name: 'BYD', image: '/images/patrocinadores/byd.png' },
    { name: 'Icard', image: '/images/patrocinadores/icard.jpg' },
    { name: 'Pisa', image: '/images/patrocinadores/pisa.jpg' },
    { name: 'Dixa Lab', image: '/images/patrocinadores/logo-provisional.svg' },
    { name: 'Fiesta Inn', image: '/images/patrocinadores/fiesta inn.png' },
    { name: 'Medica Sur', image: '/images/patrocinadores/logo-provisional.svg' },
    { name: 'Solcan Lab', image: '/images/patrocinadores/solcan.png' },
    { name: 'Tacos de la Comisión', image: '/images/patrocinadores/la-comision.jpg' },
    { name: 'Salud Digna', image: '/images/patrocinadores/salud-digna.jpg' },
    { name: 'Puritan Uniforms', image: '/images/patrocinadores/puritan.webp' },
    { name: 'HD (Hematology Diagnostic)', image: '/images/patrocinadores/HD.jpg' },
    { name: 'Xamaipak (Hospital de Alta Especialidad)', image: '/images/patrocinadores/xamaipak.avif' },
    { name: 'BS (Blood Service - Banco de Sangre)', image: '/images/patrocinadores/BS.jpg' },
    { name: 'Clinica Larrosa', image: '/images/patrocinadores/larosa.png' }
  ];

  const organizingCommittee = [
    { name: 'Dr. Francisco Antonio Ramos Narváez', position: 'Cirujano Gastroenterologo', image: '/images/Ramos.png' },
    { name: 'Dr. Tadeo Santoyo Espinosa', position: 'Director de Ingeniería Biomédica', image: '/images/Tadeo.png' },
    { name: 'Dr. Alexander Arroyo Nuñez', position: 'Especialista', image: '/images/alexander.png' },
    { name: 'Dr. Juan Carlos Alvarez Ruiz', position: 'Especialista', image: '/images/juan_carlos.png' },
    { name: 'Dr. Humberto Rojas', position: 'Especialista', image: '/images/humberto_rojas.jpg' },
    { name: 'Dr. Hernán León Velasco', position: 'Especialista', image: '/images/hernan_leon.jpg' },
    { name: 'Dr. Alejandro Bermúdez Montoya', position: 'Especialista', image: '/images/alejandro.png' },
    { name: 'Dr. Eric Torres Reyes', position: 'Especialista', image: '/images/eric.png' }
  ];

  const committeePhotos = ['comite3.jpg', 'comite.jpg', 'comite2.jpg'];

  const developmentTeam = [
    { name: 'Ing. Cesar Gomez Aguilera', image: '/images/Aguilera.png' },
    { name: 'Ing. Luis Felipe Morales Gutierrez', image: '/images/feli.jpeg' }
  ];

  // Duplicamos el arreglo para lograr el efecto de carrusel infinito sin saltos
  const sponsorsLoop = [...sponsors, ...sponsors];
  const committeeLoop = [...organizingCommittee, ...organizingCommittee];

  const getFallbackSvg = (name) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#0f172a"/>
        <circle cx="100" cy="100" r="90" fill="#1d4ed8" opacity="0.65"/>
        <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-size="48" fill="#e2e8f0" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
      </svg>
    `)}`;
  };

  return (
    <div className="py-16 bg-blue-950">
      <div className="container mx-auto px-4">
        {/* Sección de Patrocinadores */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">
            Nuestros Patrocinadores
          </h2>
          <p className="text-2sm text-gray-400 max-w-3xl mx-auto">
            Gracias a estas instituciones y empresas que hacen posible que nuestra carrera crezca año tras año
          </p>
        </div>

        {/* Carrusel de patrocinadores */}
        <div className="relative mb-16 overflow-hidden group/carousel">
          {/* Degradados en los bordes para suavizar la entrada/salida */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-blue-950 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-blue-950 to-transparent z-10" />

          <div className="sponsors-track flex w-max gap-6 md:gap-8">
            {sponsorsLoop.map((sponsor, index) => (
              <div
                key={`${sponsor.name}-${index}`}
                className="flex flex-col items-center justify-center text-center flex-shrink-0 w-24 sm:w-28 md:w-32 transition-transform duration-300 hover:scale-105"
              >
                <div className="w-25 h-25 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-blue-700 bg-blue-800 shadow-inner mb-2">
                  <img
                    src={sponsor.image || '/images/patrocinadores/logo-provisional.svg'}
                    alt={sponsor.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getFallbackSvg(sponsor.name);
                    }}
                  />
                </div>
                <p className="text-[9px] sm:text-[12px] font-semibold text-gray-200 text-center leading-tight">
                  {sponsor.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sección del Comité Organizador */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">
              Comité Organizador
            </h2>
            <p className="text-ms text-gray-400 max-w-3xl mx-auto">
              El equipo de profesionales dedicados que trabaja incansablemente para hacer realidad este evento
            </p>
          </div>

          {/* Fotografías del Comité */}
            <div className="grid sm:grid-cols-2 gap-5 mb-12">
              {committeePhotos.map((image, index) => {
                const isLastOdd =
                committeePhotos.length % 2 !== 0 &&
                  index === committeePhotos.length - 1;

                      return (
            <div
              key={image}
                className={`group overflow-hidden rounded-2xl shadow-xl border border-blue-900/40 w-full max-w-md mx-auto ${
                  isLastOdd ? 'sm:col-span-2' : ''
                    }`}
            >
            <div className="relative h-56 sm:h-80 overflow-hidden bg-blue-900">
              <img
                src={`/images/comite/${image}`}
                alt={`Miembro del comité ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-gray-100 font-bold text-center w-full">
                        Miembros del Comité
                      </div>
                    </div>
                  </div>
                </div>
                );
            })}
        </div>
          {/* Carrusel automático de miembros del comité */}
          <div className="relative overflow-hidden group/committee">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-blue-950 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-blue-950 to-transparent z-10" />

            <div className="committee-track flex w-max gap-6">
              {committeeLoop.map((member, index) => (
                <div
                  key={`${member.name}-${index}`}
                  className="bg-blue-900 rounded-lg shadow-lg p-5 text-center hover:shadow-xl transition-all duration-300 border border-blue-900/40 group flex-shrink-0 w-[200px]"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-blue-800 relative group-hover:border-blue-600 transition-colors duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
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
                  <h4 className="text-base font-bold text-gray-100 mb-1 group-hover:text-blue-300 transition-colors duration-300">
                    {member.name}
                  </h4>
                  <p className="text-xs text-blue-300 font-medium group-hover:text-blue-200 transition-colors duration-300">
                    {member.position}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

                {/* Sección del Equipo de Desarrollo */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">
              Equipo de Desarrollo
            </h2>
            <p className="text-ms text-gray-400 max-w-3xl mx-auto">
              Equipo de desarrollo de la aplicación web
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl px-12 py-3 sm:px-12 hover:bg-white/10 transition-all duration-500">
              <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
                {developmentTeam.map((developer, index) => (
                  <React.Fragment key={index}>
                    <div className="text-center group">
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-blue-400/40 relative group-hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                        <img
                          src={developer.image}
                          alt={developer.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-blue-800');
                            const fallbackIcon = document.createElement('div');
                            fallbackIcon.innerHTML = '<svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>';
                            e.target.parentNode.appendChild(fallbackIcon);
                          }}
                        />
                      </div>
                      <h4 className="text-sm font-bold text-gray-100 group-hover:text-blue-300 transition-colors duration-300 whitespace-nowrap">
                        {developer.name}
                      </h4>
                    </div>

                    {index < developmentTeam.length - 1 && (
                      <div className="hidden sm:block w-px h-16 bg-white/10" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de agradecimiento */}
        <div className="bg-blue-900 rounded-3xl p-12 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <Heart className="w-16 h-16 mx-auto mb-6 text-red-400 animate-pulse" />
            <h3 className="text-xl font-black text-gray-100 mb-6">
              Gracias por Hacer Posible Este Evento
            </h3>
            <p className="text-xl< text-gray-300 leading-relaxed mb-8">
              Sin el apoyo de nuestros patrocinadores y la dedicación incansable de nuestro comité organizador,
              la Carrera del Día del Médico no sería posible. Juntos seguimos promoviendo la salud y el deporte
              en nuestra bella Chiapas.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-950/50 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-blue-300 mb-2">32 Años de Historia</h4>
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

        @keyframes scroll-sponsors {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .sponsors-track {
          animation: scroll-sponsors 50s linear infinite;
        }
        .group\\/carousel:hover .sponsors-track {
          animation-play-state: paused;
        }

        @keyframes scroll-committee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .committee-track {
          animation: scroll-committee 35s linear infinite;
        }
        .group\\/committee:hover .committee-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default SponsorsSection;