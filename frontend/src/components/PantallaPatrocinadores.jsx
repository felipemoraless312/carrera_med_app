import React, { useEffect, useState } from 'react';
import { SPONSORS } from '../data/sponsors.js';

// Pantalla para proyectar el día del evento: solo patrocinadores, sin barra ni pie de página
const EDICION = 'XXXIII';
// Segundos que tarda cada fila en dar una vuelta completa
const DURACION_S = 110;

// Dos filas que se mueven en sentidos opuestos, cada una con la mitad de los patrocinadores
const mitad = Math.ceil(SPONSORS.length / 2);
const FILAS = [
  { sponsors: SPONSORS.slice(0, mitad), sentido: 'izquierda' },
  { sponsors: SPONSORS.slice(mitad), sentido: 'derecha' },
];

const LogoPatrocinador = ({ sponsor }) => (
  <div className="flex w-[min(14vw,26vh)] flex-shrink-0 flex-col items-center">
    <div className="aspect-square w-full overflow-hidden rounded-full border-4 border-white/80 bg-white shadow-2xl">
      <img
        src={sponsor.image}
        alt={sponsor.name}
        className={`h-full w-full ${sponsor.circular ? 'object-cover' : 'object-contain p-[8%]'}`}
      />
    </div>
    <p className="mt-[1.2vh] line-clamp-2 text-center text-[1.9vh] font-semibold leading-tight text-gray-100">
      {sponsor.name}
    </p>
  </div>
);

const PantallaPatrocinadores = () => {
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  useEffect(() => {
    const onChange = () => setPantallaCompleta(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
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
      <header className="flex items-center justify-center gap-[3vw] pt-[3vh] pb-[1vh]">
        <img src="/images/marca/logo.png" alt="Carrera del Día del Médico" className="h-[15vh] w-[15vh] drop-shadow-xl" />
        <div className="text-center">
          <h1 className="font-extrabold leading-none tracking-tight text-[6vh]">
            <span className="text-yellow-400">{EDICION}</span> Carrera del Día del Médico
          </h1>
          <p className="mt-[1.2vh] text-[3vh] font-medium text-blue-200">
            Gracias a nuestros patrocinadores
          </p>
        </div>
        <img src="/images/marca/logo.png" alt="" className="h-[15vh] w-[15vh] drop-shadow-xl" />
      </header>

      {/* Carrusel: cada fila se duplica para que el desplazamiento sea continuo */}
      <main className="relative flex flex-1 flex-col justify-evenly">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[8vw] bg-gradient-to-r from-blue-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[8vw] bg-gradient-to-l from-blue-950 to-transparent" />

        {FILAS.map((fila, i) => (
          <div key={i} className="overflow-hidden">
            <div className={`pantalla-track pantalla-track-${fila.sentido} flex w-max`}>
              {[...fila.sponsors, ...fila.sponsors].map((sponsor, j) => (
                <div key={`${sponsor.name}-${j}`} className="px-[1.2vw]">
                  <LogoPatrocinador sponsor={sponsor} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {!pantallaCompleta && (
        <p className="absolute bottom-[1vh] right-[1.5vw] text-xs text-blue-300/70">
          Clic en cualquier parte para pantalla completa
        </p>
      )}

      <style>{`
        @keyframes pantalla-izquierda {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes pantalla-derecha {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .pantalla-track { will-change: transform; }
        .pantalla-track-izquierda { animation: pantalla-izquierda ${DURACION_S}s linear infinite; }
        .pantalla-track-derecha { animation: pantalla-derecha ${DURACION_S}s linear infinite; }
      `}</style>
    </div>
  );
};

export default PantallaPatrocinadores;
