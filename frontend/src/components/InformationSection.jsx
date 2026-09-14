import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Trophy, Calendar, Users, Route } from 'lucide-react';

const InformationSection = () => {
  const navigate = useNavigate();

  const handleRegistro = () => {
    navigate('/registro');
  };

  const categories = [
    { 
      name: 'Varonil', 
      description: 'Para profesionales de la salud y público en general', 
      price: 'Inscripción gratuita',
      icon: Users,
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      shadow: 'hover:shadow-green-500/50',
      participants: 'Lleva ropa cómoda, calienta adecuadamente'
    },
    { 
      name: 'Femenil', 
      description: 'Para profesionales de la salud y público en general', 
      price: 'Inscripción gratuita',
      icon: Users,
      gradient: 'from-blue-400 via-cyan-500 to-blue-600',
      shadow: 'hover:shadow-blue-500/50',
      participants: 'lleva ropa cómoda, calienta adecuadamente'
    },
  ];

  const schedule = [
    { time: '6:00 AM', activity: 'LLegada al punto de encuentro', icon: Calendar, color: 'text-blue-500' },
    { time: '7:00 AM', activity: 'Salida oficial de la carrera', icon: Users, color: 'text-green-500' },
    { time: '09:00 AM', activity: 'Premiación', icon: Trophy, color: 'text-yellow-500' }
  ];

  return (
    <>
      {/* ============ INFORMACIÓN ============ */}
      <section className="py-12 md:py-20 bg-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-100 mb-3">
              Información del Evento
            </h2>
            <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Todo lo que necesitas saber para participar en la carrera más importante del sector
              salud en Chiapas
            </p>
          </div>

          {/* Programación y Ubicación */}
          <div className="grid lg:grid-cols-2 gap-6 mb-10 md:mb-16">
            <div className="bg-blue-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-8 border border-blue-900/40">
              <div className="flex items-center mb-5">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-3 shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-100">Programación</h3>
              </div>
              <div className="space-y-3">
                {schedule.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.time}
                      className="flex items-center p-3 bg-blue-950 rounded-xl border border-blue-900/40"
                    >
                      <div className="bg-white p-2.5 rounded-lg shadow-md mr-3">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-black text-blue-400 text-base sm:text-lg">
                          {item.time}
                        </div>
                        <div className="text-gray-300 text-sm sm:text-base">{item.activity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-8 border border-blue-900/40">
              <div className="flex items-center mb-5">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl mr-3 shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-100">Punto de Encuentro</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-gray-100 text-base sm:text-lg">
                      Parque Central
                    </div>
                    <div className="text-gray-400 text-sm sm:text-base">
                      Tuxtla Gutiérrez, Chiapas
                    </div>
                  </div>
                </div>
                <div className="bg-blue-950 p-4 sm:p-6 rounded-xl border border-blue-900/40">
                  <h4 className="font-bold text-gray-100 mb-2 flex items-center text-sm sm:text-base">
                    <Route className="w-4 h-4 mr-2 text-blue-400" />
                    Recorrido:
                  </h4>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    Salida desde el Parque Central, recorriendo la principal avenida de la ciudad,
                    pasando por el parque de la marimba, Hotel Bonampak entrando al parque
                    cañahueca, y por último su pista de atletismo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="mb-10 md:mb-16">
            <div className="text-center mb-6 md:mb-10">
              <h3 className="text-xl sm:text-3xl font-black text-gray-100 mb-2">
                Categorías de Participación
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="bg-blue-900/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 text-center border border-blue-900/40"
                >
                  <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-black mb-2 text-gray-100">{category.name}</h4>
                  <p className="text-gray-300 mb-2 text-sm sm:text-base">{category.description}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4">{category.participants}</p>
                  <div className="text-xl sm:text-2xl font-black text-blue-400">
                    {category.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-blue-900 rounded-2xl p-8 sm:p-12 text-gray-100 shadow-xl">
              <h3 className="text-xl sm:text-3xl font-black mb-3">¿Listo para el desafío?</h3>
              <p className="text-sm sm:text-xl mb-6 opacity-90">
                Únete a la comunidad médica más activa de Chiapas
              </p>
              <button
                onClick={handleRegistro}
                className="bg-blue-700 text-gray-100 px-8 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-xl font-black transition-transform active:scale-95 shadow-xl"
              >
                Registrarse Ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </>
  );
};

export default InformationSection;