import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Route,
  X,
  ZoomIn,
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

const ROUTE_IMAGE = '/images/carrera/recorrido.jpeg';

const HeroSection = () => {
  const navigate = useNavigate();
  const eventDate = '2026-10-24T07:00:00';
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

  // Recorrido (imagen fija con zoom)
  const [showRouteImage, setShowRouteImage] = useState(true);
  const [routeZoomed, setRouteZoomed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Cerrar el zoom con Esc y bloquear el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!routeZoomed) return undefined;
    const onKey = (e) => e.key === 'Escape' && setRouteZoomed(false);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [routeZoomed]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleRegistro = () => navigate('/registro');

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
        {/* Fondo con gradientes médicos */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/40 to-blue-400/30" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-white">
          <div className="container mx-auto px-4 pt-8 pb-6 md:pt-12 md:pb-10">
            {/* Título */}
            <div className="text-center mb-4 animate-fade-in-up">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black leading-tight bg-gradient-to-r from-white via-blue-200 to-blue-300 bg-clip-text text-transparent">
                XXXIII Carrera Anual "Día Del Médico"
              </h1>
              <span className="block mt-1 text-lg sm:text-2xl md:text-4xl font-bold text-blue-200">
                Edición 2026
              </span>
              <p className="mt-2 text-sm sm:text-base md:text-xl font-light text-blue-100 max-w-2xl mx-auto">
                La constancia y perseverancia en el ejercicio dan más vida a tus años, y años a tu vida.
              </p>
            </div>

            {/* Fecha y ubicación: en una sola fila desde sm */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2 mb-5 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-blue-900/60 px-4 py-2 rounded-full backdrop-blur-md border border-blue-400/30">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                <span className="font-semibold text-blue-100">24 de Octubre, 2026</span>
              </div>
              <a
                href="https://share.google/kiqf73sfJqLAGAsp3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-900/60 px-4 py-2 rounded-full backdrop-blur-md border border-blue-400/30 hover:bg-blue-800/80 transition-colors"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                <span className="font-semibold text-blue-100 underline text-center">{location}</span>
              </a>
            </div>

            {/* Momentos Memorables + Recorrido: lado a lado en escritorio */}
            <div
              className={`grid gap-4 mb-5 mx-auto items-start ${
                showRouteImage ? 'max-w-xl lg:max-w-5xl lg:grid-cols-2' : 'max-w-xl'
              }`}
            >
              {/* Momentos Memorables */}
              <div className="bg-blue-900/70 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-blue-400/20 shadow-2xl">
                <h3 className="text-base sm:text-lg font-bold mb-2 text-blue-100 text-center">
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

              {/* Recorrido */}
              {showRouteImage && (
                <div className="bg-blue-900/70 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-blue-400/20 shadow-2xl">
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-blue-100 text-center flex items-center justify-center gap-2">
                    <Route className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                    Recorrido
                  </h3>

                  <button
                    type="button"
                    onClick={() => setRouteZoomed(true)}
                    aria-label="Ampliar imagen del recorrido"
                    className="group relative block w-full rounded-xl overflow-hidden shadow-xl bg-blue-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/50"
                  >
                    {/* Fondo difuminado para rellenar espacios */}
                    <img
                      src={ROUTE_IMAGE}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
                    />
                    {/* Imagen completa, sin recortar */}
                    <img
                      src={ROUTE_IMAGE}
                      alt="Mapa del recorrido de la carrera"
                      loading="lazy"
                      onError={() => setShowRouteImage(false)}
                      className="relative z-10 w-full h-auto max-h-[50vh] lg:max-h-[60vh] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <span className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-black/60 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Ampliar
                    </span>
                  </button>

                  <p className="mt-2 text-xs sm:text-sm text-blue-100 text-center">
                    Salida: Parque Central · Meta: Parque Caña Hueca · Aprox. 5 km
                  </p>
                </div>
              )}
            </div>

            {/* Cuenta regresiva — una sola fila, incluso en móvil */}
            <div className="bg-blue-900/70 backdrop-blur-xl rounded-2xl p-3 border border-blue-400/20 shadow-2xl max-w-xl mx-auto mb-5">
              <h3 className="text-xs sm:text-base font-bold mb-2 text-blue-100 text-center uppercase tracking-wide">
                Cuenta Regresiva
              </h3>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                {countdownItems.map((item) => (
                  <div
                    key={item.label}
                    className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg sm:rounded-xl px-1 py-2 sm:py-2.5 border border-blue-400/30 shadow-lg text-center"
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
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleRegistro}
                className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 hover:from-blue-300 hover:via-blue-400 hover:to-blue-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-full text-base sm:text-xl font-black transition-transform duration-300 active:scale-95 shadow-2xl"
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
            className="w-full h-8 md:h-16"
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

      {/* Zoom del recorrido (pantalla completa) */}
      {routeZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recorrido ampliado"
          onClick={() => setRouteZoomed(false)}
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-3 sm:p-6 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setRouteZoomed(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={ROUTE_IMAGE}
            alt="Mapa del recorrido de la carrera"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

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