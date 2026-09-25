import React, { useState, useEffect } from 'react';
import { Heart, Gift } from 'lucide-react';
import RegistrationForm from './RegistrationForm';
import { apiService } from '../services/api';

const REGISTRATION_STEPS = [
  {
    step: '1',
    title: 'Selecciona tu categoría',
    description: 'Varonil o Femenil'
  },
  {
    step: '2',
    title: 'Completa el formulario',
    description: 'Con tus datos personales y de contacto'
  },
  {
    step: '3',
    title: 'Dale clic para finalizar',
    description: 'Obtén tu número de participante'
  },
  {
    step: '4',
    title: 'Descarga tu imagen',
    description: '¡Y prepárate para correr!'
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
    <section id="registro" className="relative py-8 md:py-14 bg-blue-950 overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10 animate-fade-in">
        {/* Header */}
        <header className="text-center mb-6 md:mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2 md:mb-3">
            <span className="w-10 h-10 md:w-12 md:h-12 bg-blue-800 rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-600 animate-pulse" aria-hidden="true" />
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-100">
              ¡Inscríbete Ahora!
            </h2>
          </div>
          <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Sé parte de esta gran celebración del Día del Médico. Corre por la salud,
            corre por la vida, corre por nuestra comunidad médica.
          </p>
        </header>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-5 lg:items-stretch">
          {/* Proceso de registro */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-2xl rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl">
            <h3 className="text-lg md:text-2xl font-black text-white mb-4 md:mb-5 text-center">
              Proceso de Registro
            </h3>

            <ol className="space-y-3 md:space-y-4">
              {REGISTRATION_STEPS.map(({ step, title, description }) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 bg-gradient-to-r from-purple-800 to-violet-800 rounded-full flex items-center justify-center border-2 border-white shadow-lg text-white font-black text-sm md:text-base">
                    {step}
                  </span>
                  <div>
                    <h4 className="text-sm md:text-base font-black text-gray-200 leading-tight">
                      {title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-400">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Aviso de datos personales */}
            <div
              role="note"
              className="mt-4 md:mt-5 flex gap-3 rounded-xl border border-amber-300/40 bg-amber-400/10 p-3 md:p-4"
            >
              <div>
                <p className="text-sm md:text-base font-black text-amber-200 leading-tight">
                  Usa tus datos personales reales
                </p>
                <p className="mt-1 text-xs md:text-sm text-gray-300 leading-snug">
                  Tu nombre y número de celular son necesarios para reclamar premios en la tómbola de premios.
                </p>
              </div>
            </div>

            <div className="mt-4 md:mt-5">
              <button
                type="button"
                onClick={REGISTRATION_OPEN ? handleShowRegistrationForm : undefined}
                disabled={!REGISTRATION_OPEN}
                aria-disabled={!REGISTRATION_OPEN}
                className={`w-full py-3 md:py-4 px-5 rounded-xl text-base md:text-lg font-black transition-colors duration-300 shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 ${
                  REGISTRATION_OPEN
                    ? 'bg-red-700 hover:bg-red-800 active:bg-red-900 text-gray-100'
                    : 'bg-gray-600/60 text-gray-300 cursor-not-allowed'
                }`}
              >
                {REGISTRATION_OPEN ? 'Inscríbete Aquí' : 'Inscripciones cerradas'}
              </button>
              <p className="mt-2 text-center text-gray-400 text-xs md:text-sm">
                ¡Inscripción gratuita para todos los participantes, no olvides llevar tu número de participante!
              </p>
            </div>
          </div>

          {/* Contador y edición */}
          <aside className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-3 md:gap-4">
            <div className="flex flex-col justify-center bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 rounded-2xl p-4 md:p-6 border-2 border-green-300/40 text-center shadow-xl">
              <div className="text-3xl md:text-5xl font-black text-white drop-shadow-2xl">
                {participantsCount.toLocaleString()}
              </div>
              <div className="text-white/90 font-black text-sm md:text-lg leading-tight">
                Participantes inscritos
              </div>
              <div className="hidden sm:block mt-1 text-white/70 font-bold text-xs md:text-sm">
                ¡Únete a la comunidad médica!
              </div>
            </div>

            <div className="flex flex-col justify-center bg-white/10 backdrop-blur-2xl rounded-2xl p-4 md:p-6 border border-white/20 text-center">
              <div className="text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                XXXIII
              </div>
              <div className="text-white/80 text-sm md:text-lg font-bold leading-tight">
                Edición del evento
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default RegistrationSection;