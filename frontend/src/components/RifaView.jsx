import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, Maximize2, Lock, Search, RefreshCw, Trophy } from 'lucide-react';

// ---------------------------------------------------------------------------
// Configuración de la ruleta
// ---------------------------------------------------------------------------
const SIZE = 400;
const C = SIZE / 2;
const R = 190;
const COLORS = ['#1E3A8A', '#1D4ED8', '#0F766E', '#4338CA'];
const IDLE_SPEED = 5;     // °/s cuando está en reposo (giro lento)
const FAST_SPEED = 720;   // °/s al iniciar el sorteo
const ACCEL = 900;        // °/s²
const DECEL_MS = 6000;    // duración de la frenada

const polar = (deg, r) => {
  const rad = (deg * Math.PI) / 180;
  return [C + r * Math.sin(rad), C - r * Math.cos(rad)];
};

// Ángulos medidos en sentido horario desde las 12 en punto
const slicePath = (a1, a2) => {
  const [x1, y1] = polar(a1, R);
  const [x2, y2] = polar(a2, R);
  return `M${C},${C} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`;
};

const truncate = (s, n = 14) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const ESTADO_STYLE = {
  pendiente: 'bg-[#F5B942]/15 text-[#F5B942] border-[#F5B942]/30',
  entregado: 'bg-[#3DDC97]/15 text-[#3DDC97] border-[#3DDC97]/30',
  anulado: 'bg-white/[0.04] text-gray-500 border-white/10 line-through',
};

// ---------------------------------------------------------------------------
// Vista principal
// ---------------------------------------------------------------------------
const RifaView = ({ onBack }) => {
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [soloAsistentes, setSoloAsistentes] = useState(true);
  const [premio, setPremio] = useState('');
  const [slots, setSlots] = useState([]);
  const [elegibles, setElegibles] = useState(0);
  const [ganadores, setGanadores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');

  const stageRef = useRef(null);
  const wheelRef = useRef(null);
  const angleRef = useRef(0);
  const speedRef = useRef(IDLE_SPEED);
  const phaseRef = useRef('idle'); // idle | accel | decel
  const decelRef = useRef(null);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  // -- API ------------------------------------------------------------------
  const call = useCallback(async (path, options = {}) => {
    const res = await fetch(`/api/rifa${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Rifa-Pin': pin, ...options.headers },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.detail || `Error ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }, [pin]);

  const loadElegibles = useCallback(async () => {
    try {
      const d = await call(`/elegibles?solo_asistentes=${soloAsistentes}`);
      setElegibles(d.total);
      setSlots(d.muestra.map((m) => m.nombre));
    } catch (e) {
      setError(e.message);
    }
  }, [call, soloAsistentes]);

  const loadGanadores = useCallback(async () => {
    try {
      const d = await call('/ganadores');
      setGanadores(d.ganadores);
    } catch (e) {
      setError(e.message);
    }
  }, [call]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await call('/ganadores');
      setAuthed(true);
    } catch (err) {
      setAuthError(err.status === 401 ? 'PIN incorrecto' : err.message);
    }
  };

  useEffect(() => {
    if (!authed) return;
    loadElegibles();
    loadGanadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, soloAsistentes]);

  // -- Animación (requestAnimationFrame, sin re-render por frame) -----------
  useEffect(() => {
    if (!authed) return undefined;
    let raf;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const phase = phaseRef.current;

      if (phase === 'idle') {
        if (!reducedMotion.current) angleRef.current += IDLE_SPEED * dt;
      } else if (phase === 'accel') {
        speedRef.current = Math.min(FAST_SPEED, speedRef.current + ACCEL * dt);
        angleRef.current += speedRef.current * dt;
      } else if (phase === 'decel') {
        const d = decelRef.current;
        const t = Math.min((now - d.start) / d.duration, 1);
        angleRef.current = d.from + d.delta * (1 - Math.pow(1 - t, 3)); // ease-out cúbico
        if (t >= 1) {
          phaseRef.current = 'idle';
          speedRef.current = IDLE_SPEED;
          d.onEnd();
        }
      }

      wheelRef.current?.setAttribute('transform', `rotate(${angleRef.current % 360} ${C} ${C})`);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [authed]);

  // -- Sorteo ---------------------------------------------------------------
  const handleSpin = async () => {
    if (spinning || elegibles < 1 || slots.length < 1) return;
    setSpinning(true);
    setError('');
    speedRef.current = IDLE_SPEED;
    phaseRef.current = reducedMotion.current ? 'idle' : 'accel';

    try {
      // El ganador lo decide el servidor; la ruleta gira mientras tanto (mín. 0.8 s)
      const [g] = await Promise.all([
        call('/girar', {
          method: 'POST',
          body: JSON.stringify({ solo_asistentes: soloAsistentes, premio: premio.trim() || null }),
        }),
        new Promise((r) => setTimeout(r, reducedMotion.current ? 0 : 800)),
      ]);

      // Se coloca el nombre ganador en una casilla al azar y se frena sobre ella
      const n = slots.length;
      const seg = 360 / n;
      const k = Math.floor(Math.random() * n);
      setSlots((prev) => prev.map((s, i) => (i === k ? g.nombre : s)));

      const jitter = (Math.random() - 0.5) * seg * 0.6;
      const target = ((-((k + 0.5) * seg + jitter) % 360) + 360) % 360;
      const from = angleRef.current;
      const adjust = (target - (from % 360) + 360) % 360;

      decelRef.current = {
        from,
        delta: 1440 + adjust, // 4 vueltas + ajuste hasta la casilla
        start: performance.now(),
        duration: reducedMotion.current ? 1500 : DECEL_MS,
        onEnd: () => {
          setWinner(g);
          setSpinning(false);
          loadGanadores();
        },
      };
      phaseRef.current = 'decel';
    } catch (err) {
      phaseRef.current = 'idle';
      speedRef.current = IDLE_SPEED;
      setError(err.message);
      setSpinning(false);
    }
  };

  const updateGanador = async (id, body) => {
    try {
      await call(`/ganadores/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      await loadGanadores();
    } catch (e) {
      setError(e.message);
    }
  };

  const closeModal = () => {
    setWinner(null);
    loadElegibles();
  };

  const handleAusente = async () => {
    await updateGanador(winner.id, { estado: 'anulado' });
    closeModal();
  };

  const goFullscreen = () => stageRef.current?.requestFullscreen?.();

  const ganadoresFiltrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return ganadores;
    return ganadores.filter((g) =>
      g.nombre.toLowerCase().includes(q) ||
      g.numero_asignado.includes(q) ||
      g.telefono.includes(q) ||
      `#${g.numero_ganador}` === q
    );
  }, [ganadores, filtro]);

  // -- PIN ------------------------------------------------------------------
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] pt-28 px-4">
        <form
          onSubmit={handleLogin}
          className="max-w-sm mx-auto bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-gray-100 font-bold text-lg">
            <Lock className="w-5 h-5 text-[#6C8EFF]" />
            Acceso a la rifa
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN de administrador"
            autoFocus
            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500"
          />
          {authError && <p className="text-sm text-red-300">{authError}</p>}
          <button
            type="submit"
            disabled={!pin}
            className="w-full py-2.5 bg-[#4F63D2] hover:bg-[#5A70E8] disabled:opacity-40 text-white rounded-xl font-medium"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  // -- Ruleta ---------------------------------------------------------------
  const n = Math.max(slots.length, 1);
  const seg = 360 / n;
  const fontSize = Math.max(9, Math.min(14, ((2 * Math.PI * 110) / n) * 0.45));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] via-[#0D1326] to-[#080B14] pt-24 pb-10">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center min-w-0">
            <button
              onClick={onBack}
              aria-label="Regresar"
              className="mr-3 p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-50">Rifa</h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {elegibles} participantes elegibles · {ganadores.filter((g) => g.estado !== 'anulado').length} ganadores
              </p>
            </div>
          </div>
          <button
            onClick={goFullscreen}
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 rounded-xl text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Pantalla completa</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-[#C94B45]/10 border border-[#C94B45]/40 rounded-xl p-3 text-sm text-red-100 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline">Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-5">
          {/* Escenario: ruleta + controles (esta zona se proyecta en pantalla completa) */}
          <div
            ref={stageRef}
            className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center"
          >
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="w-full max-w-[min(90vw,70vh,560px)]"
              role="img"
              aria-label="Ruleta de participantes"
            >
              <g ref={wheelRef} style={{ transition: 'none' }}>
                {slots.length < 2 ? (
                  <circle cx={C} cy={C} r={R} fill={COLORS[0]} />
                ) : (
                  slots.map((name, i) => (
                    <g key={i}>
                      <path
                        d={slicePath(i * seg, (i + 1) * seg)}
                        fill={COLORS[i % COLORS.length]}
                        stroke="#0A0E1A"
                        strokeWidth="1.5"
                      />
                      <text
                        transform={`rotate(${(i + 0.5) * seg - 90} ${C} ${C})`}
                        x={C + R - 14}
                        y={C}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={fontSize}
                        fill="#F1F5F9"
                      >
                        {truncate(name)}
                      </text>
                    </g>
                  ))
                )}
              </g>
              {elegibles < 1 && (
                <text x={C} y={C + 60} textAnchor="middle" fontSize="16" fill="#F1F5F9">
                  Sin participantes elegibles
                </text>
              )}
              <circle cx={C} cy={C} r="22" fill="#0A0E1A" stroke="#6C8EFF" strokeWidth="3" />
              <path d={`M${C - 14},6 L${C + 14},6 L${C},38 Z`} fill="#F5B942" stroke="#0A0E1A" strokeWidth="2" />
            </svg>

            <div className="w-full max-w-md mt-4 space-y-3">
              <input
                type="text"
                value={premio}
                onChange={(e) => setPremio(e.target.value)}
                placeholder="Premio de este giro (opcional)"
                disabled={spinning}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm text-gray-100 placeholder-gray-500"
              />
              <button
                onClick={handleSpin}
                disabled={spinning || elegibles < 1}
                className="w-full py-3.5 bg-[#1F9D73] hover:bg-[#24B382] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg"
              >
                {spinning ? 'Girando…' : elegibles < 1 ? 'Sin participantes elegibles' : 'Elegir ganador'}
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloAsistentes}
                  onChange={(e) => setSoloAsistentes(e.target.checked)}
                  disabled={spinning}
                />
                Solo participantes con asistencia marcada
              </label>
            </div>
          </div>

          {/* Registro de ganadores */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar por nombre, número, teléfono o #ganador"
                  className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-gray-100 placeholder-gray-500"
                />
              </div>
              <button
                onClick={loadGanadores}
                aria-label="Actualizar lista"
                className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-gray-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-white/[0.06] overflow-y-auto max-h-[70vh]">
              {ganadoresFiltrados.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-500">
                  {ganadores.length === 0 ? 'Aún no hay ganadores. Gira la ruleta para empezar.' : 'Sin coincidencias.'}
                </p>
              ) : (
                ganadoresFiltrados.map((g) => (
                  <div key={g.id} className="p-3 sm:p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5B942]/15 text-[#F5B942] flex items-center justify-center font-bold text-sm flex-shrink-0">
                      #{g.numero_ganador}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-100 truncate">{g.nombre}</p>
                      <p className="text-xs text-gray-500">
                        N.º {g.numero_asignado} · {g.telefono}
                        {g.premio ? ` · ${g.premio}` : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs border ${ESTADO_STYLE[g.estado]}`}>
                          {g.estado}
                        </span>
                        {g.estado === 'pendiente' && (
                          <button
                            onClick={() => updateGanador(g.id, { estado: 'entregado' })}
                            className="px-3 py-0.5 text-xs bg-[#1F9D73] hover:bg-[#24B382] text-white rounded-full"
                          >
                            Marcar entregado
                          </button>
                        )}
                        {g.estado === 'entregado' && (
                          <button
                            onClick={() => updateGanador(g.id, { estado: 'pendiente' })}
                            className="px-3 py-0.5 text-xs bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 rounded-full"
                          >
                            Deshacer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ganador */}
      {winner && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ganador"
          className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-[#0D1326] border border-[#F5B942]/40 rounded-2xl p-6 sm:p-8 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-[#F5B942]" />
            <p className="text-[#F5B942] font-bold text-lg">Ganador #{winner.numero_ganador}</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-gray-50 break-words">{winner.nombre}</h2>
            <p className="mt-2 text-gray-400">Número de participante {winner.numero_asignado}</p>
            {winner.premio && <p className="mt-1 text-gray-300">Premio: {winner.premio}</p>}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAusente}
                className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 rounded-xl font-medium"
              >
                No está presente
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 bg-[#1F9D73] hover:bg-[#24B382] text-white rounded-xl font-bold"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RifaView;