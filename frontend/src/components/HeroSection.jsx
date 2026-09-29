import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Route,
  Award,
  X,
  ZoomIn,
  FileText,
  Download,
  ExternalLink,
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
const TRIPTICO_PDF = '/images/triptico.pdf';
const COMITE_IMAGE = '/images/comite/comite4.jpg';

// Fecha del evento: el contador y el texto en pantalla usan la misma fecha
const EVENT_DATE = '2026-10-24T07:00:00';
const EVENT_DATE_LABEL = '24 de Octubre, 2026';

const CONGRESOS = [
  {
    src: '/images/congresos/congreso_enfermedades.jpeg',
    alt: 'Congreso de Enfermedades',
    label: 'Congreso de Enfermedades',
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSfSkCzLlzVhyhX6XnK3GySTD1Cnc6HjmASY084w8CcJNS-SUA/viewform?usp=dialog',
    buttonText: 'Inscríbete al Congreso',
  },
  {
    src: '/images/congresos/reunion_regional.jpeg',
    alt: 'Reunión Regional',
    label: 'Reunión Regional',
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSd9GLTrAKIqEvYhEkUtmMneY8y3ovl46pQH9nDuYnexSnWnUQ/viewform?usp=dialog',
    buttonText: 'Inscríbete a la Reunión',
  },
];

// Estilo base compartido por las tarjetas del hero
const CARD = 'bg-blue-900/70 backdrop-blur-xl rounded-2xl border border-blue-400/20 shadow-2xl';

const HeroSection = () => {
  const navigate = useNavigate();
  const location = 'Parque central - Tuxtla Gutiérrez, Chiapas';
  const timeLeft = useCountdown(EVENT_DATE);

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

  // Foto del comité (si no carga, la tarjeta se queda con el fondo azul)
  const [comiteImageOk, setComiteImageOk] = useState(true);

  // Tríptico (PDF)
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Cerrar cualquier visor con Esc y bloquear el scroll del fondo mientras está abierto
  const modalOpen = routeZoomed || showPdf;
  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setRouteZoomed(false);
        setShowPdf(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleRegistro = () => navigate('/registro');

  // En móvil los navegadores casi nunca renderizan PDFs dentro de un iframe,
  // así que ahí se abre directo en una pestaña nueva.
  const handleOpenTriptico = () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      window.open(TRIPTICO_PDF, '_blank', 'noopener,noreferrer');
    } else {
      setShowPdf(true);
    }
  };

  const countdownItems = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ];

  return (
    <div className="pt-22 md:pt-20 bg-blue-950">
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
                <span className="font-semibold text-blue-100">{EVENT_DATE_LABEL}</span>
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
              <div className={`${CARD} p-3 sm:p-4`}>
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
                <div className={`${CARD} p-3 sm:p-4`}>
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
            <div className={`${CARD} p-3 max-w-xl mx-auto mb-6`}>
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
                className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 sm:px-10 sm:py-4 rounded-full text-base sm:text-xl font-black transition-transform duration-300 active:scale-95 shadow-2xl"
              >
                ¡Regístrate Ahora!
              </button>
              <p className="text-xs sm:text-sm text-blue-100">
                ¡Cupos limitados! Asegura tu lugar en la carrera más esperada del año.
              </p>
            </div>

            {/* Patrocinadores y comité organizador (con foto del comité) */}
            <button
              type="button"
              onClick={() => navigate('/patrocinadores')}
              className="group relative block w-full max-w-xl mx-auto mt-8 h-40 sm:h-48 rounded-2xl overflow-hidden border border-blue-400/30 shadow-2xl bg-blue-900 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/50"
            >
              {comiteImageOk && (
                <img
                  src={COMITE_IMAGE}
                  alt="Comité organizador de la carrera"
                  loading="lazy"
                  onError={() => setComiteImageOk(false)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/50 to-blue-900/10" />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-center gap-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 border border-blue-300/40 flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm sm:text-lg font-bold text-white leading-tight">
                    Conoce a nuestros patrocinadores
                  </span>
                  <span className="block text-xs sm:text-sm text-blue-200">y a nuestro comité organizador</span>
                </span>
                <ChevronRight className="w-5 h-5 text-blue-100 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Decoración inferior: mismo color que la sección siguiente para que fluya */}
        <div className="relative z-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-8 md:h-16 block"
            style={{ fill: '#172554' }}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
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
            <p className="mt-2 text-sm sm:text-base text-blue-200/80 max-w-2xl mx-auto">
              Nuestra comunidad médica también se reúne para seguir creciendo y actualizándose
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 md:gap-6 max-w-2xl mx-auto">
            {CONGRESOS.map((item) => (
              <div
                key={item.src}
                className="group relative overflow-hidden rounded-2xl shadow-xl border border-blue-400/20 bg-blue-900 flex flex-col justify-between"
              >
                {/* Contenedor de la imagen */}
                <div className="relative aspect-[3/4] sm:aspect-[9/16] overflow-hidden">
                  <img
                    src={item.src}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
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
                    <p className="text-gray-100 font-bold text-sm sm:text-base drop-shadow mb-3">
                      {item.label}
                    </p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg transition-colors"
                    >
                      <span>{item.buttonText}</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ MÉDICA SUR: TRÍPTICO DE LA CLÍNICA (al final) ============ */}
      <div className="bg-blue-950 pb-10 md:pb-14">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto border-t border-blue-400/20 pt-8 md:pt-10">
            <div className={`${CARD} p-3 sm:p-4`}>
              <button
                type="button"
                onClick={handleOpenTriptico}
                className="w-full flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/50 rounded-xl"
              >
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 border border-blue-400/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-base sm:text-lg font-bold text-blue-100">
                    Conoce Médica Sur
                  </span>
                  <span className="block text-xs sm:text-sm text-blue-200">
                    Consulta el tríptico de la clínica
                  </span>
                </span>
                <span className="flex-shrink-0 text-xs sm:text-sm font-semibold text-white bg-blue-600 group-hover:bg-blue-500 px-3 py-1.5 rounded-full transition-colors">
                  Ver
                </span>
              </button>
            </div>
          </div>
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

      {/* Visor del tríptico (PDF) */}
      {showPdf && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tríptico de Médica Sur"
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setShowPdf(false)}
        >
          <div
            className="w-full max-w-5xl h-full max-h-[92vh] bg-blue-950 border border-blue-400/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-blue-400/20">
              <h3 className="text-base sm:text-lg font-bold text-blue-100 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Médica Sur
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={TRIPTICO_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-100 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir en pestaña nueva
                </a>
                <a
                  href={TRIPTICO_PDF}
                  download="triptico-medica-sur.pdf"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </a>
                <button
                  type="button"
                  onClick={() => setShowPdf(false)}
                  aria-label="Cerrar"
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <iframe
              src={`${TRIPTICO_PDF}#view=FitH`}
              title="Tríptico de la clínica Médica Sur"
              className="flex-1 w-full bg-white"
            />
          </div>
        </div>
      )}

      <style>{`
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

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;