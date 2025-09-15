import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const HeroSection = ({ setActiveSection }) => {
  const eventDate = '2025-10-18T07:00:00';
  const location = 'Parque central - Tuxtla Gutiérrez, Chiapas';
  const timeLeft = useCountdown(eventDate);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo animado con gradientes médicos */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/40 to-blue-400/30"></div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          {/* Título con efectos */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                XXXII Carrera anual "Día del Médico"
              </h1>
            </div>
            <span className="block text-3xl md:text-5xl lg:text-6xl font-bold text-blue-200">
              2025
            </span>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light text-blue-100">
              La constancia y perseverancia en el ejercicio dan más vida a tus años, y años a tu vida.
            </p>
          </div>
          
          {/* Información del evento con efectos */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12 text-lg">
            <div className="flex items-center gap-2 bg-blue-900/60 px-6 py-3 rounded-full backdrop-blur-md border border-blue-400/30 hover:bg-blue-800/80 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Calendar className="w-5 h-5 text-blue-200 animate-pulse" />
              <span className="font-semibold text-blue-100">18 de Octubre, 2025</span>
            </div>
            <a
              href="https://share.google/kiqf73sfJqLAGAsp3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-900/60 px-6 py-3 rounded-full backdrop-blur-md border border-blue-400/30 hover:bg-blue-800/80 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-blue-200 animate-pulse" />
              <span className="font-semibold text-blue-100 underline">{location}</span>
            </a>
          </div>

          {/* Contador Regresivo con efectos */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-blue-900/70 backdrop-blur-xl rounded-3xl p-8 border border-blue-400/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-blue-900/90">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-blue-100 flex items-center justify-center">
                Cuenta Regresiva 
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { value: timeLeft.days, label: 'Días', color: 'from-blue-400 to-blue-600' },
                  { value: timeLeft.hours, label: 'Horas', color: 'from-blue-300 to-blue-500' },
                  { value: timeLeft.minutes, label: 'Minutos', color: 'from-blue-200 to-blue-400' },
                  { value: timeLeft.seconds, label: 'Segundos', color: 'from-yellow-200 to-yellow-400' }
                ].map((item, index) => (
                  <div key={index} className="group">
                    <div className={`bg-gradient-to-br ${item.color} backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-blue-400/30 shadow-xl transition-all duration-300`}>
                      <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">
                        {String(item.value || 0).padStart(2, '0')}
                      </div>
                      <div className="text-sm md:text-base text-white/90 font-bold uppercase tracking-wider">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botón de registro con efectos */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setActiveSection && setActiveSection('registro')}
              className="group relative bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 hover:from-blue-300 hover:via-blue-400 hover:to-blue-600 text-white px-10 py-5 rounded-full text-xl font-black transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 inline-block text-center"
            >
              <span className="relative z-10">¡Regístrate Ahora!</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <p className="text-sm text-blue-100">
              Únete a más de 2,000 participantes
            </p>
          </div>
        </div>
      </div>
      
      {/* Decoración inferior con animación */}
  <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20" style={{ fill: 'url(#hero-footer-gradient)' }}>
          <defs>
            <linearGradient id="hero-footer-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;