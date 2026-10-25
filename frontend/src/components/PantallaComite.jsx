import React, { useEffect, useState } from 'react';
import { COMITE, DESARROLLADORES, FOTOS_COMITE } from '../data/comite.js';

// Pantalla para proyectar el día del evento: fotos del comité organizador, sin barra ni pie de página
const EDICION = 'XXXIII';
// Segundos que se muestra cada foto grupal
const SEGUNDOS_POR_FOTO = 8;
// Segundos que tarda la franja de integrantes en dar una vuelta completa
const DURACION_S = 90;

// En la pantalla solo se muestran los nombres; los desarrolladores también forman parte del comité
const INTEGRANTES = [...COMITE, ...DESARROLLADORES];

const Integrante = ({ integrante }) => (
  <div className="flex items-center gap-[1.2vw] whitespace-nowrap">
    <span className="h-[1.2vh] w-[1.2vh] rounded-full bg-yellow-400" />
    <p className="text-[3.2vh] font-semibold text-gray-100">{integrante.name}</p>
  </div>
);

const PantallaComite = () => {
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [fotoActual, setFotoActual] = useState(0);

  useEffect(() => {
    const onChange = () => setPantallaCompleta(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setFotoActual((i) => (i + 1) % FOTOS_COMITE.length),
      SEGUNDOS_POR_FOTO * 1000
    );
    return () => clearInterval(id);
  }, []);

  const alternarPantallaCompleta = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      onClick={alternarPantallaCompleta}
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-blue-950 text-white select-none ${
        pantallaCompleta ? 'cursor-none' : 'cursor-pointer'
      }`}
      style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(30, 64, 175, 0.55), transparent 70%)' }}
    >
      {/* Encabezado */}
      <header className="flex items-center justify-center gap-[3vw] pt-[2.5vh] pb-[1.5vh]">
        <img src="/images/marca/logo.png" alt="Carrera del Día del Médico" className="h-[11vh] w-[11vh] drop-shadow-xl" />
        <div className="text-center">
          <h1 className="font-extrabold leading-none tracking-tight text-[5vh]">
            <span className="text-yellow-400">{EDICION}</span> Carrera del Día del Médico
          </h1>
          <p className="mt-[1vh] text-[2.8vh] font-medium text-blue-200">Comité Organizador</p>
        </div>
        <img src="/images/marca/logo.png" alt="" className="h-[11vh] w-[11vh] drop-shadow-xl" />
      </header>

      {/* Fotos grupales: se van turnando con una transición suave */}
      <main className="relative mx-[4vw] flex-1 overflow-hidden rounded-3xl border-4 border-white/80 bg-blue-900 shadow-2xl">
        {FOTOS_COMITE.map((foto, i) => (
          <div
            key={foto}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ${
              i === fotoActual ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Fondo desenfocado para que las fotos de otra proporción no dejen franjas vacías */}
            <img src={`/images/comite/${foto}`} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-60" />
            <img
              src={`/images/comite/${foto}`}
              alt="Comité organizador"
              className="relative h-full w-full object-contain"
            />
          </div>
        ))}
      </main>

      {/* Integrantes: la franja se duplica para que el desplazamiento sea continuo */}
      <section className="relative py-[3.5vh]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[8vw] bg-gradient-to-r from-blue-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[8vw] bg-gradient-to-l from-blue-950 to-transparent" />
        <div className="overflow-hidden">
          <div className="pantalla-comite-track flex w-max">
            {[...INTEGRANTES, ...INTEGRANTES].map((integrante, j) => (
              <div key={`${integrante.name}-${j}`} className="px-[1.5vw]">
                <Integrante integrante={integrante} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {!pantallaCompleta && (
        <p className="absolute bottom-[1vh] right-[1.5vw] text-xs text-blue-300/70">
          Clic en cualquier parte para pantalla completa
        </p>
      )}

      <style>{`
        @keyframes pantalla-comite {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .pantalla-comite-track { will-change: transform; animation: pantalla-comite ${DURACION_S}s linear infinite; }
      `}</style>
    </div>
  );
};

export default PantallaComite;
