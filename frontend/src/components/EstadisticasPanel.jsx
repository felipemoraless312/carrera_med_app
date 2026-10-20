import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Users, CheckCircle, BarChart3, PieChart, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Estadísticas generales de TODA la base de datos (no solo la página cargada)
// ---------------------------------------------------------------------------

const REFRESCO_MS = 30000;
const COLOR_MUJERES = '#E68FC0';
const COLOR_HOMBRES = '#6C8EFF';
const COLOR_ASISTENCIA = '#3DDC97';
// Paleta categórica para fondo oscuro, en orden fijo; lo que no cabe va a "Otras ramas"
const COLORES_RAMA = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9'];
const COLOR_OTRAS = '#5b6275';
const RAMAS_EN_PASTEL = COLORES_RAMA.length;

const formato = (n) => Number(n || 0).toLocaleString('es-MX');
const pct = (parte, total) => (total ? (parte / total) * 100 : 0);
const pctTexto = (parte, total) => {
  const p = pct(parte, total);
  if (p > 0 && p < 0.1) return '<0.1%';
  return `${p > 0 && p < 1 ? p.toFixed(1) : Math.round(p)}%`;
};

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Número que "cuenta" hasta su valor
const useCountUp = (valor, duracion = 1100) => {
  const [mostrado, setMostrado] = useState(0);
  const desde = useRef(0);
  useEffect(() => {
    if (reduceMotion()) {
      setMostrado(valor);
      desde.current = valor;
      return undefined;
    }
    const inicio = performance.now();
    const origen = desde.current;
    let frame;
    const paso = (t) => {
      const avance = Math.min(1, (t - inicio) / duracion);
      const suave = 1 - Math.pow(1 - avance, 3);
      setMostrado(Math.round(origen + (valor - origen) * suave));
      if (avance < 1) frame = requestAnimationFrame(paso);
      else desde.current = valor;
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [valor, duracion]);
  return mostrado;
};

const Contador = ({ valor, className }) => (
  <span className={`tabular-nums ${className || ''}`}>{formato(useCountUp(valor))}</span>
);

// ---------------------------------------------------------------------------
// Gráfica de pastel (dona) por rama
// ---------------------------------------------------------------------------

const PastelRamas = ({ rebanadas, total, activa, setActiva }) => {
  const size = 260;
  const grosor = 38;
  const r = (size - grosor) / 2 - 8;
  const C = 2 * Math.PI * r;
  const GAP = 2.5;
  const [dibujado, setDibujado] = useState(reduceMotion());

  useEffect(() => {
    const id = requestAnimationFrame(() => setDibujado(true));
    return () => cancelAnimationFrame(id);
  }, []);

  let acumulado = 0;
  const arcos = rebanadas.map((s) => {
    const largo = (s.total / total) * C;
    const arco = { ...s, inicio: acumulado, largo: Math.max(0, largo - (largo > GAP * 2 ? GAP : 0)) };
    acumulado += largo;
    return arco;
  });

  const enFoco = arcos.find((a) => a.sector === activa);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size, maxWidth: '100%' }}>
      <div
        className="absolute inset-6 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ background: `conic-gradient(${arcos.map((a) => `${a.color} ${(a.inicio / C) * 360}deg ${((a.inicio + a.largo) / C) * 360}deg`).join(',')})` }}
      />
      <svg viewBox={`0 0 ${size} ${size}`} className="relative w-full h-full -rotate-90" role="img"
        aria-label="Gráfica de pastel de inscritos por rama">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={grosor} />
        {arcos.map((a) => {
          const atenuada = activa && activa !== a.sector;
          return (
            <circle
              key={a.sector}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={activa === a.sector ? grosor + 10 : grosor}
              strokeDasharray={dibujado ? `${a.largo} ${C - a.largo}` : `0 ${C}`}
              strokeDashoffset={-a.inicio}
              onMouseEnter={() => setActiva(a.sector)}
              onMouseLeave={() => setActiva(null)}
              onClick={() => setActiva(activa === a.sector ? null : a.sector)}
              className="cursor-pointer"
              style={{
                opacity: atenuada ? 0.3 : 1,
                transition: 'stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1), stroke-width .2s, opacity .2s'
              }}
            >
              <title>{`${a.sector}: ${formato(a.total)} (${pctTexto(a.total, total)})`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-12">
        {enFoco ? (
          <>
            <span className="text-3xl sm:text-4xl font-black text-gray-50 tabular-nums leading-none">
              {pctTexto(enFoco.total, total)}
            </span>
            <span className="mt-1 text-sm font-semibold text-gray-200 tabular-nums">{formato(enFoco.total)}</span>
            <span className="mt-0.5 text-[11px] text-gray-400 leading-tight line-clamp-2">{enFoco.sector}</span>
          </>
        ) : (
          <>
            <Contador valor={total} className="text-3xl sm:text-4xl font-black text-gray-50 leading-none" />
            <span className="mt-1 text-xs text-gray-400">inscritos</span>
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tarjetas
// ---------------------------------------------------------------------------

const Kpi = ({ titulo, valor, detalle, icono: Icono, color, className = '', children }) => (
  <div className={`${className} relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5`}>
    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none"
      style={{ backgroundColor: color }} />
    <div className="relative flex items-center justify-between mb-2">
      <span className="text-xs sm:text-sm text-gray-400">{titulo}</span>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}22` }}>
        <Icono className="w-4 h-4" style={{ color }} />
      </span>
    </div>
    <Contador valor={valor} className="relative block text-3xl sm:text-4xl font-black text-gray-50 tracking-tight" />
    {detalle && <div className="relative mt-1 text-xs text-gray-400">{detalle}</div>}
    {children}
  </div>
);

const Medidor = ({ valor, total, color }) => (
  <div className="relative mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
    <div className="h-full rounded-full" style={{ width: `${pct(valor, total)}%`, backgroundColor: color, transition: 'width 1s ease' }} />
  </div>
);

const IconoMujer = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 18h6" />
  </svg>
);
const IconoHombre = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <circle cx="10" cy="14" r="5" /><path d="M14 10l6-6M15 4h5v5" />
  </svg>
);

// Barra apilada mujeres / hombres
const BarraSexo = ({ mujeres, hombres, alto = 'h-2' }) => {
  const total = mujeres + hombres;
  return (
    <div className={`flex ${alto} gap-[2px] rounded-full overflow-hidden bg-white/[0.06]`}
      title={`Mujeres ${formato(mujeres)} · Hombres ${formato(hombres)}`}>
      {mujeres > 0 && <div style={{ width: `${pct(mujeres, total)}%`, backgroundColor: COLOR_MUJERES, transition: 'width 1s ease' }} />}
      {hombres > 0 && <div style={{ width: `${pct(hombres, total)}%`, backgroundColor: COLOR_HOMBRES, transition: 'width 1s ease' }} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

const EstadisticasPanel = ({ refreshKey = 0 }) => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [activa, setActiva] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/estadisticas');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDatos(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(timer);
  }, [refreshKey]);

  const { rebanadas, colorDe } = useMemo(() => {
    const sectores = datos?.por_sector || [];
    const principales = sectores.slice(0, RAMAS_EN_PASTEL).map((s, i) => ({ ...s, color: COLORES_RAMA[i] }));
    const resto = sectores.slice(RAMAS_EN_PASTEL);
    const lista = [...principales];
    if (resto.length) {
      lista.push({
        sector: `Otras ramas (${resto.length})`,
        total: resto.reduce((acc, s) => acc + s.total, 0),
        color: COLOR_OTRAS
      });
    }
    const mapa = Object.fromEntries(principales.map((s) => [s.sector, s.color]));
    return { rebanadas: lista, colorDe: (sector) => mapa[sector] || COLOR_OTRAS };
  }, [datos]);

  if (!datos) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-4 sm:mb-6 text-center text-sm text-gray-400">
        {error ? `No se pudieron cargar las estadísticas (${error}).` : 'Cargando estadísticas generales…'}
      </div>
    );
  }

  const { total, asistieron, por_sexo: porSexo, por_sector: porSector } = datos;
  const mujeres = porSexo.Femenino?.total || 0;
  const hombres = porSexo.Masculino?.total || 0;
  const maxSector = Math.max(1, ...porSector.map((s) => s.total));
  const actualizado = datos.actualizado
    ? new Date(datos.actualizado).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <section className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
      {/* Encabezado del panel */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#8FA0FF]" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-50 tracking-tight">Estadísticas generales</h2>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#3DDC97]/10 border border-[#3DDC97]/30 text-[#3DDC97] text-[11px] font-semibold">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#3DDC97] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#3DDC97]" />
            </span>
            En vivo
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Toda la base de datos{actualizado ? ` · ${actualizado}` : ''}</span>
          <button onClick={cargar} title="Actualizar estadísticas"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-400">
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="col-span-2 lg:col-span-1 relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-[#6C8EFF]/30 bg-gradient-to-br from-[#4F63D2]/40 via-[#2a3a8f]/30 to-transparent">
          <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-[#6C8EFF] blur-3xl opacity-30 pointer-events-none" />
          <div className="relative flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-blue-100/80 font-medium">Total de inscritos</span>
            <Users className="w-5 h-5 text-blue-100" />
          </div>
          <Contador valor={total} className="relative block text-4xl sm:text-5xl font-black text-white tracking-tight" />
          <div className="relative mt-1 text-xs text-blue-100/70">{porSector.length} ramas / profesiones registradas</div>
        </div>

        <Kpi titulo="Mujeres" valor={mujeres} detalle={`${pctTexto(mujeres, total)} del total`} icono={IconoMujer} color={COLOR_MUJERES}>
          <Medidor valor={mujeres} total={total} color={COLOR_MUJERES} />
        </Kpi>
        <Kpi titulo="Hombres" valor={hombres} detalle={`${pctTexto(hombres, total)} del total`} icono={IconoHombre} color={COLOR_HOMBRES}>
          <Medidor valor={hombres} total={total} color={COLOR_HOMBRES} />
        </Kpi>
        <Kpi titulo="Asistieron" valor={asistieron}
          detalle={`${pctTexto(asistieron, total)} · faltan ${formato(total - asistieron)}`}
          icono={CheckCircle} color={COLOR_ASISTENCIA} className="col-span-2 lg:col-span-1">
          <Medidor valor={asistieron} total={total} color={COLOR_ASISTENCIA} />
        </Kpi>
      </div>

      {/* Pastel por rama + mujeres vs hombres */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 sm:gap-4">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-4">
            <PieChart className="w-4 h-4 text-gray-400" />
            Inscritos por rama
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)] gap-6 items-center">
            <PastelRamas rebanadas={rebanadas} total={total} activa={activa} setActiva={setActiva} />
            <ul className="space-y-1">
              {rebanadas.map((s) => (
                <li key={s.sector}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiva(s.sector)}
                    onMouseLeave={() => setActiva(null)}
                    onFocus={() => setActiva(s.sector)}
                    onBlur={() => setActiva(null)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      activa === s.sector ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                    } ${activa && activa !== s.sector ? 'opacity-50' : ''}`}
                  >
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 min-w-0 text-sm text-gray-200 truncate">{s.sector}</span>
                    <span className="text-sm font-semibold text-gray-50 tabular-nums">{formato(s.total)}</span>
                    <span className="w-12 text-right text-xs text-gray-400 tabular-nums">{pctTexto(s.total, total)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-200 mb-5">Mujeres vs hombres</h3>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: COLOR_MUJERES }}>
                {pctTexto(mujeres, total)}
              </div>
              <div className="text-xs text-gray-400">{formato(mujeres)} mujeres</div>
            </div>
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: COLOR_HOMBRES }}>
                {pctTexto(hombres, total)}
              </div>
              <div className="text-xs text-gray-400">{formato(hombres)} hombres</div>
            </div>
          </div>
          <BarraSexo mujeres={mujeres} hombres={hombres} alto="h-4" />

          <div className="mt-6 space-y-4">
            <h4 className="text-xs uppercase tracking-wide text-gray-500">Asistencia por sexo</h4>
            {[['Mujeres', porSexo.Femenino, COLOR_MUJERES], ['Hombres', porSexo.Masculino, COLOR_HOMBRES]].map(([label, d, color]) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-gray-400 tabular-nums">
                    <span className="text-gray-100 font-semibold">{formato(d?.asistieron)}</span> / {formato(d?.total)}
                    <span className="ml-1.5 text-xs">({pctTexto(d?.asistieron || 0, d?.total || 0)})</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct(d?.asistieron || 0, d?.total || 0)}%`, backgroundColor: color, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Todas las ramas */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Todas las ramas / profesiones <span className="text-gray-500 font-normal">({porSector.length})</span>
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLOR_MUJERES }} />Mujeres</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLOR_HOMBRES }} />Hombres</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-white/10">
                <th className="text-left font-medium py-2 pl-4 sm:pl-0 pr-3">Rama</th>
                <th className="text-left font-medium py-2 px-3 w-[34%]">Total</th>
                <th className="text-right font-medium py-2 px-2">Mujeres</th>
                <th className="text-right font-medium py-2 px-2">Hombres</th>
                <th className="text-right font-medium py-2 px-2">%</th>
                <th className="text-right font-medium py-2 pl-2 pr-4 sm:pr-0">Asistieron</th>
              </tr>
            </thead>
            <tbody>
              {porSector.map((s) => (
                <tr key={s.sector} className="border-b border-white/[0.05] hover:bg-white/[0.03]">
                  <td className="py-2.5 pl-4 sm:pl-0 pr-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: colorDe(s.sector) }} />
                      <span className="text-gray-200">{s.sector}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div style={{ width: `${Math.max(4, (s.total / maxSector) * 100)}%` }}>
                        <BarraSexo mujeres={s.Femenino} hombres={s.Masculino} />
                      </div>
                      <span className="text-gray-50 font-semibold tabular-nums">{formato(s.total)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-300 tabular-nums">{formato(s.Femenino)}</td>
                  <td className="py-2.5 px-2 text-right text-gray-300 tabular-nums">{formato(s.Masculino)}</td>
                  <td className="py-2.5 px-2 text-right text-gray-400 tabular-nums">{pctTexto(s.total, total)}</td>
                  <td className="py-2.5 pl-2 pr-4 sm:pr-0 text-right tabular-nums">
                    <span className={s.asistieron ? 'text-[#3DDC97] font-semibold' : 'text-gray-500'}>{formato(s.asistieron)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-gray-50 font-bold">
                <td className="pt-3 pl-4 sm:pl-0 pr-3">Total</td>
                <td className="pt-3 px-3 tabular-nums">{formato(total)}</td>
                <td className="pt-3 px-2 text-right tabular-nums">{formato(mujeres)}</td>
                <td className="pt-3 px-2 text-right tabular-nums">{formato(hombres)}</td>
                <td className="pt-3 px-2 text-right tabular-nums">100%</td>
                <td className="pt-3 pl-2 pr-4 sm:pr-0 text-right tabular-nums text-[#3DDC97]">{formato(asistieron)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

export default EstadisticasPanel;
