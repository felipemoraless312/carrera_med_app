import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trophy,
  Users,
  Route,
  Award,
} from 'lucide-react';

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const eventDate = '2026-10-25T07:00:00';
  const location = 'Parque central - Tuxtla Gutiérrez, Chiapas';
  const timeLeft = useCountdown(eventDate);

  // Imágenes del carrusel (Hero)
  const images = [
    '/images/carrera/carreramed5.jpg',
    '/images/carrera/carreramed1.jpg',
    '/images/carrera/carreramed12.jpg',
    '/images/carrera/podio.jpg', 
    '/images/carrera/podio1.jpg',
    '/images/carrera/carreramed6.jpg',
    '/images/carrera/carreramed7.jpg',
    '/images/carrera/carreramed4.jpg',
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleRegistro = () => navigate('/registro');

  const schedule = [
    { time: '6:00 AM', activity: 'Llegada al punto de encuentro', icon: Calendar },
    { time: '7:00 AM', activity: 'Salida oficial de la carrera', icon: Users },
    { time: '09:00 AM', activity: 'Premiación', icon: Trophy },
  ];

  const categories = [
    {
      name: 'Varonil',
      description: 'Para profesionales de la salud y público en general',
      price: 'Inscripción gratuita',
      note: 'Lleva ropa cómoda y calienta adecuadamente',
    },
    {
      name: 'Femenil',
      description: 'Para profesionales de la salud y público en general',
      price: 'Inscripción gratuita',
      note: 'Lleva ropa cómoda y calienta adecuadamente',
    },
  ];

  const countdownItems = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ];

  return (
    <div className="pt-22 md:pt-20">
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden">
        {/* Fondo animado con gradientes médicos */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/40 to-blue-400/30" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-white">
          <div className="container mx-auto px-4 pt-14 pb-10 md:pt-20 md:pb-16">
            {/* Título */}
            <div className="text-center mb-6 animate-fade-in-up">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black leading-tight bg-gradient-to-r from-white via-blue-200 to-blue-300 bg-clip-text text-transparent">
                Carrera "Día Del Médico"
              </h1>
              <span className="block mt-2 text-xl sm:text-3xl md:text-5xl font-bold text-blue-200">
                Edición 2026
              </span>
              <p className="mt-3 text-sm sm:text-lg md:text-2xl font-light text-blue-100 max-w-2xl mx-auto">
                ¡Corre trota, camina, rueda pero ... llega!
              </p>
            </div>

            {/* Fecha y ubicación */}
            <div className="flex flex-col items-center gap-3 mb-6 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-blue-900/60 px-5 py-2.5 rounded-full backdrop-blur-md border border-blue-400/30">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                <span className="font-semibold text-blue-100">25 de Octubre, 2026</span>
              </div>
              <a
                href="https://share.google/kiqf73sfJqLAGAsp3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-900/60 px-5 py-2.5 rounded-full backdrop-blur-md border border-blue-400/30 hover:bg-blue-800/80 transition-colors"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                <span className="font-semibold text-blue-100 underline text-center">{location}</span>
              </a>
            </div>

            {/* Momentos Memorables */}
            <div className="mb-8 max-w-xl mx-auto">
              <div className="bg-blue-900/70 backdrop-blur-xl rounded-2xl p-5 border border-blue-400/20 shadow-2xl">
                <h3 className="text-base sm:text-xl font-bold mb-3 text-blue-100 text-center">
                  Momentos Memorables
                </h3>
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                  {images.map((image, index) => (
                    <img
                      key={image}
                      src={image}
                      alt={`Carrera imagen ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  <button
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Imagen siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
                        
            
            {/* Cuenta regresiva — una sola fila, incluso en móvil */}
            <div className="bg-blue-900/70 backdrop-blur-xl rounded-2xl p-3 sm:p-5 border border-blue-400/20 shadow-2xl max-w-xl mx-auto mb-6">
              <h3 className="text-sm sm:text-lg font-bold mb-3 text-blue-100 text-center uppercase tracking-wide">
                Cuenta Regresiva
              </h3>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                {countdownItems.map((item) => (
                  <div
                    key={item.label}
                    className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg sm:rounded-xl px-1 py-2 sm:p-3 border border-blue-400/30 shadow-lg text-center"
                  >
                    <div className="text-lg sm:text-3xl font-black text-white leading-none">
                      {String(item.value || 0).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] sm:text-xs text-white/90 font-bold uppercase tracking-wider mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de registro */}
            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={handleRegistro}
                className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 hover:from-blue-300 hover:via-blue-400 hover:to-blue-600 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-xl font-black transition-transform duration-300 active:scale-95 shadow-2xl"
              >
                ¡Regístrate Ahora!
              </button>
              <p className="text-xs sm:text-sm text-blue-100">
                ¡Cupos limitados! Asegura tu lugar en la carrera más esperada del año.
              </p>
            </div>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="relative z-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-12 md:h-24"
            style={{ fill: 'url(#hero-footer-gradient)' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="hero-footer-gradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#0d1e7cff" />
                <stop offset="50%" stopColor="#3929b993" />
                <stop offset="100%" stopColor="#0d1e7cff" />
              </linearGradient>
            </defs>
            <path d="M0,40L60,45C120,50,240,60,360,65C480,70,600,70,720,65C840,60,960,50,1080,45C1200,40,1320,40,1380,40L1440,40L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
          </svg>
        </div>
      </div>

      {/* ============ CONGRESOS Y REUNIONES ============ */}
      <div className="bg-blue-950 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-100">
              Congresos y Reuniones Médicas
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              Nuestra comunidad médica también se reúne para seguir creciendo y actualizándose
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 md:gap-6 max-w-2xl mx-auto">
            {[
              { src: '/images/congresos/congreso_enfermedades.jpeg', alt: 'Congreso de Enfermedades', label: 'Congreso de Enfermedades' },
              { src: '/images/congresos/reunion_regional.jpeg', alt: 'Reunión Regional', label: 'Reunión Regional' },
            ].map((item) => (
              <div
                key={item.src}
                className="group relative overflow-hidden rounded-2xl shadow-xl border border-blue-900/40 bg-blue-900"
              >
                {/* Fondo desenfocado con la misma imagen para rellenar el espacio sin recortar la foto */}
                <div className="relative aspect-[3/4] sm:aspect-[9/16] overflow-hidden">
                  <img
                    src={item.src}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-blue-950/40" />

                  {/* Imagen completa, sin recortar */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="relative z-10 w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/patrocinadores/logo-provisional.svg';
                      e.target.className = 'relative z-10 w-full h-full object-contain p-8';
                    }}
                  />

                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-blue-950/90 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                    <p className="text-gray-100 font-bold text-sm sm:text-base drop-shadow">
                      {item.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ PATROCINADORES Y COMITÉ ORGANIZADOR ============ */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <button
            type="button"
            onClick={() => navigate('/patrocinadores')}
            className="group flex items-center justify-center gap-3 sm:gap-4 mx-auto max-w-xl w-full bg-blue-900/40 hover:bg-blue-900/60 rounded-full px-5 py-3 sm:px-8 sm:py-4 border border-blue-400/30 transition-colors"
          >
            <span className="flex -space-x-2">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-500/40 flex items-center justify-center ring-2 ring-blue-800/60">
                <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-100" />
              </span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-500/40 flex items-center justify-center ring-2 ring-blue-800/60">
                <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-100" />
              </span>
            </span>
            <span className="text-xs sm:text-base font-semibold text-blue-100 text-center">
              Conoce a nuestros patrocinadores y comité organizador
            </span>
            <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default HeroSection;