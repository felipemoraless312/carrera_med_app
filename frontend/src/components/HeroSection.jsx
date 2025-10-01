import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Imágenes del carrusel
  const images = [
    '/images/6.jpg',
    '/images/2.jpg', 
    '/images/7.jpg',
    '/images/1.jpg',
    '/images/3.jpg',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleRegistro = () => {
    alert('Redirigiendo al formulario de registro...');
  };

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
        <div className="container mx-auto px-4 py-20">
          {/* Título con efectos */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                XXXII Carrera Anual "Día Del Médico"
              </h1>
            </div>
            <span className="block text-3xl md:text-5xl lg:text-6xl font-bold text-blue-200">
              2025
            </span>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light text-blue-100">
              La constancia y perseverancia en el ejercicio dan más vida a tus años, y años a tu vida.
            </p>
          </div>
          
          {/* Grid con información del evento e imágenes */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
            
            {/* Columna izquierda - Información del evento */}
            <div className="space-y-8">
              {/* Información del evento */}
              <div className="flex flex-col gap-4 text-lg">
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

              {/* Fechas importantes */}
              <div className="bg-blue-900/70 backdrop-blur-xl rounded-3xl p-6 border border-blue-400/20 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-blue-100 flex items-center gap-2">
                  Fechas Importantes
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-800/50 rounded-xl p-4 border border-blue-400/20">
                    <p className="text-blue-200 font-semibold mb-1">Fecha de término de Registro</p>
                    <p className="text-white text-sm">15 de Octubre - 23:59 PM</p>
                  </div>
                  <div className="bg-blue-800/50 rounded-xl p-4 border border-blue-400/20">
                    <p className="text-blue-200 font-semibold mb-2">Entrega de Números</p>
                    <p className="text-white text-sm mb-2">15 al 17 de Octubre</p>
                    <p className="text-blue-100 text-xs mb-2">Horario: 9:00 AM - 5:30 PM</p>
                    <a
                      href="https://maps.app.goo.gl/SzuFcev2roHYynDU8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-300 hover:text-blue-100 transition-colors underline"
                    >
                      <MapPin className="w-3 h-3" />
                      Ver ubicación en mapa
                    </a>
                  </div>
                </div>
              </div>

              {/* Contador Regresivo */}
              <div className="bg-blue-900/70 backdrop-blur-xl rounded-3xl p-6 border border-blue-400/20 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-blue-100 text-center">
                  Cuenta Regresiva 
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: timeLeft.days, label: 'Días', color: 'from-blue-400 to-blue-600' },
                    { value: timeLeft.hours, label: 'Horas', color: 'from-blue-300 to-blue-500' },
                    { value: timeLeft.minutes, label: 'Minutos', color: 'from-blue-200 to-blue-400' },
                    { value: timeLeft.seconds, label: 'Segundos', color: 'from-yellow-200 to-yellow-400' }
                  ].map((item, index) => (
                    <div key={index} className="group">
                      <div className={`bg-gradient-to-br ${item.color} backdrop-blur-sm rounded-xl p-3 border border-blue-400/30 shadow-xl transition-all duration-300`}>
                        <div className="text-2xl md:text-3xl font-black text-white mb-1 text-center">
                          {String(item.value || 0).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-white/90 font-bold uppercase tracking-wider text-center">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha - Carrusel de imágenes */}
            <div className="relative">
              <div className="bg-blue-900/70 backdrop-blur-xl rounded-3xl p-6 border border-blue-400/20 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-blue-100 text-center">
                  Momentos Memorables
                </h3>
                
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Carrera imagen ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  
                  {/* Controles del carrusel */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {/* Indicadores de imagen */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de registro centrado */}
          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={handleRegistro}
              className="group relative bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 hover:from-blue-300 hover:via-blue-400 hover:to-blue-600 text-white px-10 py-5 rounded-full text-xl font-black transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 inline-block text-center"
            >
              <span className="relative z-10">¡Regístrate Ahora!</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <p className="text-sm text-blue-100">
              ¡Cupos limitados! Asegura tu lugar en la carrera más esperada del año.
            </p>
          </div>
        </div>
      </div>
      
      {/* Decoración inferior con animación */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg viewBox="0 0 1440 120" className="w-full h-16 md:h-24 lg:h-32" style={{ fill: 'url(#hero-footer-gradient)' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="hero-footer-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#0d1e7cff" />
              <stop offset="50%" stopColor="#3929b993" />
              <stop offset="100%" stopColor="#0d1e7cff" />
            </linearGradient>
          </defs>
          <path d="M0,40L60,45C120,50,240,60,360,65C480,70,600,70,720,65C840,60,960,50,1080,45C1200,40,1320,40,1380,40L1440,40L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
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
