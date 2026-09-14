import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import RegistrationForm from './RegistrationForm';
import { apiService } from '../services/api';

const REGISTRATION_STEPS = [
  {
    step: '1',
    title: 'Selecciona tu categoría',
    description: 'Varonil o Femenil',
    gradient: 'from-purple-800 to-violet-800'
  },
  {
    step: '2',
    title: 'Completa el formulario',
    description: 'De tus datos personales y de contacto',
    gradient: 'from-purple-800 to-violet-800'
  },
  {
    step: '3',
    title: 'Dale clik para finalizar',
    description: 'Obtén tu número de participante',
    gradient: 'from-purple-800 to-violet-800'
  },
  {
    step: '4',
    title: '¡Descarga tu imagen y preparate para correr!',
    description: '¡Prepárate para el evento!',
    gradient: 'from-purple-800 to-violet-800'
  }
];

const REGISTRATION_OPEN = true;
const PARTICIPANTS_POLL_INTERVAL_MS = 30000;

const RegistrationSection = ({ setActiveSection }) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);

  const handleShowRegistrationForm = () => {
    setShowRegistrationForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Obtener el total de participantes desde el endpoint
  useEffect(() => {
    let isMounted = true;

    const fetchTotal = async () => {
      try {
        const res = await apiService.getTotalParticipantes();
        if (isMounted) setParticipantsCount(res.total);
      } catch (error) {
        if (isMounted) setParticipantsCount(0);
      }
    };

    fetchTotal();
    const interval = setInterval(fetchTotal, PARTICIPANTS_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Si se muestra el formulario de registro
  if (showRegistrationForm) {
    return <RegistrationForm onBack={() => setShowRegistrationForm(false)} setActiveSection={setActiveSection} />;
  }

  return (
    <section id="registro" className="relative py-12 md:py-20 bg-blue-950 min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 animate-zoom-in">
          <div className="relative inline-flex items-center justify-center mb-4 md:mb-6">
            <div className="relative w-12 h-12 md:w-16 md:h-16 bg-blue-800 rounded-full flex items-center justify-center border-2 md:border-4 border-white/30 shadow-2xl">
              <Heart className="w-7 h-7 md:w-10 md:h-10 text-red-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-100 mb-3 md:mb-4 px-2">
            ¡Inscríbete Ahora!
          </h2>
          <p className="text-sm sm:text-base md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-2">
            Sé parte de esta gran celebración del Día del Médico. Corre por la salud,
            corre por la vida, corre por nuestra comunidad médica.
          </p>
        </div>

        <div className="flex justify-center items-center">
          <div className="animate-slide-in-right w-full max-w-xl mx-auto">
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-5 md:p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/15 md:hover:scale-105">
              <h3 className="text-xl md:text-3xl font-black text-white mb-6 md:mb-8 text-center">
                Proceso de Registro
              </h3>
              <div className="space-y-4 md:space-y-6">
                {REGISTRATION_STEPS.map((step, index) => (
                  <div
                    key={step.step}
                    className="group flex items-start transform md:hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mr-3 md:mr-4 shadow-xl group-hover:scale-110 transition-transform duration-300 border-2 md:border-4 border-white`}>
                      <span className="text-white font-black text-sm md:text-lg group-hover:animate-pulse">{step.step}</span>
                    </div>
                    <div className="flex-1 pt-1.5 md:pt-3">
                      <h4 className="text-sm md:text-lg font-black text-gray-200 mb-0.5 md:mb-1 group-hover:text-blue-300 transition-all duration-300">
                        {step.title}
                      </h4>
                      <p className="text-xs md:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                <button
                  type="button"
                  onClick={REGISTRATION_OPEN ? handleShowRegistrationForm : undefined}
                  disabled={!REGISTRATION_OPEN}
                  aria-disabled={!REGISTRATION_OPEN}
                  className={`group w-full py-3.5 md:py-5 px-5 md:px-6 rounded-xl md:rounded-2xl text-base md:text-xl font-black transition-all duration-300 shadow-xl relative overflow-hidden ${
                    REGISTRATION_OPEN
                      ? 'bg-red-700 hover:bg-red-800 text-gray-100 transform hover:scale-105 hover:shadow-blue-900/40'
                      : 'bg-gray-600/60 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {REGISTRATION_OPEN ? 'Inscríbete Aquí' : 'Inscripciones cerradas'}
                </button>
                <div className="text-center">
                  <p className="text-gray-400 text-xs md:text-sm px-2">
                    ¡Inscripción gratuita para todos los participantes, no olvides llevar tu número de participante!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de participantes inscritos */}
        <div className="mt-10 md:mt-16 flex justify-center animate-fade-in delay-1000">
          <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 md:border-4 border-green-300/40 text-center transform md:hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 group max-w-md w-full">
            <div className="text-4xl md:text-7xl font-black text-white mb-2 md:mb-3 group-hover:animate-pulse drop-shadow-2xl">
              {participantsCount.toLocaleString()}
            </div>
            <div className="text-white/90 font-black text-base md:text-xl mb-1 md:mb-2 group-hover:text-white transition-colors duration-300">
              Participantes inscritos
            </div>
            <div className="text-white/70 font-bold text-xs md:text-sm group-hover:text-white/90 transition-colors duration-300">
              ¡Únete a la comunidad médica!
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 md:mt-12 grid md:grid-cols-1 gap-6 md:gap-8 animate-fade-in delay-1000">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-5 md:p-6 border border-white/20 text-center transform md:hover:scale-110 transition-all duration-300 hover:bg-white/20 group">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-1 md:mb-2 group-hover:animate-pulse">
              XXXIII
            </div>
            <div className="text-white/80 text-sm md:text-base font-bold group-hover:text-white transition-colors duration-300">
              Edición del evento
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-zoom-in {
          animation: zoom-in 1s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default RegistrationSection;