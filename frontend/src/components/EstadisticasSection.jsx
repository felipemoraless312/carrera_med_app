import React, { useEffect, useState } from 'react';
import { BarChart3, Users } from 'lucide-react';

const REFRESCO_MS = 60000;

// Mismo estilo de tarjeta que el hero
const CARD = 'bg-blue-900/70 backdrop-blur-xl rounded-2xl border border-blue-400/20 shadow-2xl';

const formato = (n) => Number(n || 0).toLocaleString('es-MX');
const porcentaje = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

const EstadisticasSection = () => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const res = await fetch('/api/estadisticas');
        if (!res.ok) throw new Error(res.status);
        const json = await res.json();
        if (activo) {
          setDatos(json);
          setError(false);
        }
      } catch {
        if (activo) setError(true);
      }
    };
    cargar();
    const timer = setInterval(cargar, REFRESCO_MS);
    return () => {
      activo = false;
      clearInterval(timer);
    };
  }, []);

  // Si la API falla antes de tener datos, la sección no se muestra
  if (!datos) {
    if (error) return null;
    return (
      <div className="bg-blue-950 py-8 md:py-12">
        <div className="container mx-auto px-4 text-center text-blue-200/70 text-sm">
          Cargando estadísticas…
        </div>
      </div>
    );
  }

  const { total, por_sexo: porSexo, por_sector: porSector } = datos;
  const mujeres = porSexo.Femenino || 0;
  const hombres = porSexo.Masculino || 0;
  const pctMujeres = porcentaje(mujeres, mujeres + hombres);
  const maxSector = Math.max(1, ...porSector.map((s) => s.total));

  return (
    <div className="bg-blue-950 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-100 flex items-center justify-center gap-2">
            <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-blue-300" />
            Estadísticas de Inscripción
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-200/80 max-w-2xl mx-auto">
            Así va la participación en la carrera de este año
          </p>
        </div>

        <div className="max-w-2xl lg:max-w-5xl mx-auto grid gap-4 lg:grid-cols-5">
          {/* Total + mujeres / hombres */}
          <div className="lg:col-span-2 grid gap-4">
            <div className={`${CARD} p-5 text-center`}>
              <div className="flex items-center justify-center gap-2 text-blue-200 text-sm font-semibold uppercase tracking-wide">
                <Users className="w-4 h-4" />
                Inscritos
              </div>
              <div className="mt-1 text-4xl sm:text-5xl font-black text-white tabular-nums">
                {formato(total)}
              </div>
            </div>

            <div className={`${CARD} p-5`}>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-pink-200 uppercase tracking-wide">
                    Mujeres
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {formato(mujeres)}
                  </div>
                  <div className="text-xs text-blue-200">{pctMujeres}%</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-sky-200 uppercase tracking-wide">
                    Hombres
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {formato(hombres)}
                  </div>
                  <div className="text-xs text-blue-200">{100 - pctMujeres}%</div>
                </div>
              </div>
              <div
                className="mt-4 h-3 rounded-full overflow-hidden flex bg-blue-950"
                role="img"
                aria-label={`${pctMujeres}% mujeres, ${100 - pctMujeres}% hombres`}
              >
                <div className="bg-pink-400 h-full" style={{ width: `${pctMujeres}%` }} />
                <div className="bg-sky-400 h-full flex-1" />
              </div>
            </div>
          </div>

          {/* Por rama */}
          <div className={`${CARD} p-5 lg:col-span-3`}>
            <h3 className="text-base sm:text-lg font-bold text-blue-100 mb-3">Inscritos por rama</h3>
            <ul className="space-y-2.5">
              {porSector.map((s) => (
                <li key={s.sector}>
                  <div className="flex items-baseline justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-blue-100 truncate">{s.sector}</span>
                    <span className="text-white font-bold tabular-nums shrink-0">
                      {formato(s.total)}
                      <span className="text-blue-300 font-normal ml-1">
                        ({porcentaje(s.total, total)}%)
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-blue-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300"
                      style={{ width: `${(s.total / maxSector) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasSection;
