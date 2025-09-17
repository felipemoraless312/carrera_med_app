import React from 'react';
import { Clock, MapPin, Trophy, Calendar, Users, Route} from 'lucide-react';

const InformationSection = () => {
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
    { time: '10:00 AM', activity: 'Premiación', icon: Trophy, color: 'text-yellow-500' }
  ];

    return (
      <>
        <section className="py-20 bg-blue-950 min-h-screen">
          <div className="container mx-auto px-4">
        {/* Header con efectos */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black text-gray-100 mb-4">
            Información del Evento
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Todo lo que necesitas saber para participar en la carrera más importante 
            del sector salud en Chiapas
          </p>
        </div>
        
        {/* Horarios y Ubicación con efectos */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Horarios */}
          <div className="group animate-slide-in-left">
            <div className="bg-blue-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-900/40">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors duration-300">
                  Programación
                </h3>
              </div>
              
              <div className="space-y-4">
                {schedule.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center p-4 bg-blue-950 rounded-2xl hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 border border-blue-900/40 hover:border-blue-800"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="bg-white p-3 rounded-xl shadow-md mr-4 group-hover:shadow-lg transition-shadow duration-300">
                        <IconComponent className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <div className="font-black text-blue-400 text-lg">{item.time}</div>
                        <div className="text-gray-300 font-medium">{item.activity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="group animate-slide-in-right">
            <div className="bg-blue-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-900/40">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-2xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors duration-300">
                  Punto de Encuentro
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0 animate-pulse" />
                  <div>
                    <div className="font-bold text-gray-100 text-lg">Parque Central</div>
                    <div className="text-gray-400">Tuxtla Gutiérrez, Chiapas</div>
                  </div>
                </div>
                
                <div className="bg-blue-950 p-6 rounded-2xl border border-blue-900/40 hover:border-blue-800 transition-all duration-300">
                  <h4 className="font-bold text-gray-100 mb-3 flex items-center">
                    <Route className="w-4 h-4 mr-2 text-blue-400 animate-pulse" />
                    Recorrido:
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    Salida desde el Parque Central, recorriendo la principal avenida
                    de la ciudad, pasando por el parque de la marimba, Hotel Bonampak
                    entrando al parque cañahueca, y por último su pista de atletismo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorías con efectos mejorados */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in delay-500">
            <h3 className="text-3xl md:text-4xl font-black text-gray-100 mb-4">
              Categorías de Participación
            </h3>
            <p className="text-lg text-gray-300">
              Elige la distancia que mejor se adapte a tu nivel
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="group animate-zoom-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="bg-blue-900/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 border border-blue-900/40">
                    {/* Icono */}
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-blue-800 rounded-full flex items-center justify-center mx-auto group-hover:scale-125 transition-all duration-500 shadow-2xl">
                        <IconComponent className="w-10 h-10 text-blue-400 group-hover:animate-pulse" />
                      </div>
                    </div>
                    {/* Contenido */}
                    <h4 className="text-2xl font-black mb-3 text-gray-100 group-hover:text-blue-400 transition-all duration-300">
                      {category.name}
                    </h4>
                    <p className="text-gray-300 mb-4 text-lg font-medium">
                      {category.description}
                    </p>
                    <p className="text-sm text-gray-400 mb-6 font-semibold">
                      {category.participants} 
                    </p>
                    {/* Precio */}
                    <div className="text-3xl font-black text-blue-400 mb-6 group-hover:animate-pulse">
                      {category.price}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action con efectos */}
        <div className="text-center animate-fade-in delay-1000">
          <div className="bg-blue-900 rounded-3xl p-12 text-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-4">
                ¿Listo para el desafío?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Únete a la comunidad médica más activa de Chiapas
              </p>
              <button className="bg-blue-700 text-gray-100 px-10 py-5 rounded-full text-xl font-black transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-blue-900/40">
                Registrarse Ahora
              </button>
            </div>
          </div>
        </div>
          </div>
        </section>
        <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out;
        }
        
        .animate-zoom-in {
          animation: zoom-in 0.8s ease-out;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
};

export default InformationSection;