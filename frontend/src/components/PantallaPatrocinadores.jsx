import React, { useEffect, useState } from 'react';
import { SPONSORS } from '../data/sponsors.js';

// Pantalla para proyectar el día del evento: solo patrocinadores, sin barra ni pie de página
const EDICION = 'XXXIII';
const POR_PAGINA = 12;
const SEGUNDOS_POR_PAGINA = 8;

const paginas = [];
for (let i = 0; i < SPONSORS.length; i += POR_PAGINA) {
  paginas.push(SPONSORS.slice(i, i + POR_PAGINA));
}

const PantallaPatrocinadores = () => {
  const [pagina, setPagina] = useState(0);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPagina((p) => (p + 1) % paginas.length);
    }, SEGUNDOS_POR_PAGINA * 1000);
    return () => clearInterval(id);
  }, []);

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
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white select-none ${
        pantallaCompleta ? 'cursor-none' : 'cursor-pointer'
      }`}
    >
      {/* Encabezado */}
      <header className="flex items-center justify-center gap-[3vw] pt-[3vh] pb-[2vh]">
        <img src="/images/logo.png" alt="Carrera del Día del Médico" className="h-[15vh] w-[15vh] drop-shadow-xl" />
        <div className="text-center">
          <h1 className="font-extrabold leading-none tracking-tight text-[6vh]">
            <span className="text-yellow-400">{EDICION}</span> Carrera del Día del Médico
          </h1>
          <p className="mt-[1.2vh] text-[3vh] font-medium text-blue-200">
            Gracias a nuestros patrocinadores
          </p>
        </div>
        <img src="/images/logo.png" alt="" className="h-[15vh] w-[15vh] drop-shadow-xl" />
      </header>

      {/* Logos: se muestran por páginas que rotan solas */}
      <main className="relative flex-1">
        {paginas.map((grupo, i) => (
          <div
            key={i}
            className={`absolute inset-0 flex flex-wrap content-center justify-center gap-x-[2vw] gap-y-[3vh] px-[4vw] transition-opacity duration-1000 ${
              i === pagina ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {grupo.map((sponsor) => (
              <div key={sponsor.name} className="flex w-[min(13vw,27vh)] flex-col items-center">
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
            ))}
          </div>
        ))}
      </main>

      {/* Indicador de página */}
      <footer className="flex justify-center gap-3 pb-[3vh]">
        {paginas.map((_, i) => (
          <span
            key={i}
            className={`h-[1.2vh] rounded-full transition-all duration-500 ${
              i === pagina ? 'w-[4vh] bg-yellow-400' : 'w-[1.2vh] bg-white/40'
            }`}
          />
        ))}
      </footer>

      {!pantallaCompleta && (
        <p className="absolute bottom-[1vh] right-[1.5vw] text-xs text-blue-300/70">
          Clic en cualquier parte para pantalla completa
        </p>
      )}
    </div>
  );
};

export default PantallaPatrocinadores;
