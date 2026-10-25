import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Maximize2, Minimize2, Lock, Search, RefreshCw, Trophy, Volume2, VolumeX, RotateCcw, FlaskConical,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Configuración de la ruleta
// ---------------------------------------------------------------------------
const EDICION = 'XXXIII';
const SIZE = 460;
const C = SIZE / 2;
const R = 192;            // radio de las casillas
const RIM_R = 212;        // radio del aro dorado
const FOCOS = 24;         // focos alrededor del aro
// Tonos claros para la tómbola; el texto va en oscuro para que se lea bien
const COLORS = ['#93C5FD', '#FDE68A', '#86EFAC', '#F9A8D4', '#C4B5FD', '#67E8F9'];
const SLICE_TEXT = '#0F172A';

// Evita que el último segmento quede junto al primero con el mismo color
const sliceColor = (i, total) => {
  const idx = i % COLORS.length;
  if (i === total - 1 && total > 1 && idx === 0) return COLORS[2];
  return COLORS[idx];
};
const IDLE_SPEED = 5;     // °/s cuando está en reposo (giro lento)
// Velocidad máxima: por debajo de media casilla por cuadro para que no parpadee ni parezca girar al revés
const FAST_SPEED = 400;   // °/s
const IMPULSO_MS = 380;   // retroceso breve antes de arrancar, como cuando se jala la ruleta
const IMPULSO_GRADOS = 14;
const ACELERACION_MS = 1100;
const FRENADA_MS = 6500;  // duración aproximada de la frenada
const FRENADA_POT = 2.2;  // curva de frenado: la ruleta pierde velocidad de forma pareja, sin arrastrarse al final
const REBOTE_CASILLAS = 0.07; // se pasa un poco y regresa al detenerse
const REBOTE_MS = 650;
const PAUSA_GANADOR_MS = 1300; // se resalta la casilla antes de mostrar al ganador
// Flecha: los clavos de cada casilla la empujan y regresa como resorte
const FLECHA_MAX = 26;    // grados de desvío máximo
const FLECHA_CONTACTO = 0.16; // fracción de la casilla en la que el clavo toca la flecha
const RESORTE_K = 900;
const RESORTE_AMORT = 20;

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

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// "luis felipe MORALES gutierrez" -> "Luis Felipe Morales Gutierrez"
const formatoNombre = (s) =>
  s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/(^|\s)(\p{L})/gu, (m, sp, l) => sp + l.toUpperCase());

// En la ruleta solo cabe nombre + primer apellido
const nombreCorto = (s) => {
  const w = formatoNombre(s).split(' ');
  const corto = w.length >= 4 ? `${w[0]} ${w[2]}` : w.slice(0, 2).join(' ');
  return truncate(corto, 16);
};

const ESTADO_STYLE = {
  pendiente: 'bg-[#F5B942]/15 text-[#F5B942] border-[#F5B942]/30',
  entregado: 'bg-[#3DDC97]/15 text-[#3DDC97] border-[#3DDC97]/30',
  anulado: 'bg-white/[0.04] text-gray-500 border-white/10 line-through',
};

// ---------------------------------------------------------------------------
// Sonidos (Web Audio, sin archivos)
// ---------------------------------------------------------------------------
const crearSonidos = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();

  const nota = (freq, inicio, dur, tipo = 'triangle', vol = 0.18) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime + inicio);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + inicio);
    osc.stop(ctx.currentTime + inicio + dur + 0.02);
  };

  // A alta velocidad los clics se espacian para que no se vuelvan un zumbido
  let ultimoTick = 0;

  return {
    reanudar: () => ctx.state === 'suspended' && ctx.resume(),
    tick: () => {
      if (ctx.currentTime - ultimoTick < 0.045) return;
      ultimoTick = ctx.currentTime;
      nota(1500, 0, 0.03, 'square', 0.05);
    },
    impulso: () => nota(180, 0, 0.25, 'sine', 0.2),
    fanfarria: () => {
      [523.25, 659.25, 783.99].forEach((f, i) => nota(f, i * 0.13, 0.22));
      nota(1046.5, 0.39, 0.7, 'triangle', 0.22);
    },
  };
};

// ---------------------------------------------------------------------------
// Confeti sobre un canvas (sin librerías)
// ---------------------------------------------------------------------------
const CONFETI_COLORES = ['#F5B942', '#FDE68A', '#93C5FD', '#86EFAC', '#F9A8D4', '#FFFFFF'];

const lanzarConfeti = (canvas) => {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const piezas = Array.from({ length: 160 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * width * 0.3,
    y: height * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 15 - 5,
    giro: Math.random() * Math.PI,
    vgiro: (Math.random() - 0.5) * 0.4,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    color: CONFETI_COLORES[Math.floor(Math.random() * CONFETI_COLORES.length)],
  }));

  let raf;
  const inicio = performance.now();
  const frame = (now) => {
    const t = now - inicio;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = t > 3000 ? Math.max(0, 1 - (t - 3000) / 1000) : 1;
    piezas.forEach((p) => {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.giro += p.vgiro;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.giro)));
      ctx.restore();
    });
    if (t < 4000) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, width, height);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, width, height);
  };
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
  const [excluidosPrueba, setExcluidosPrueba] = useState(0);
  const [listaExcluidos, setListaExcluidos] = useState(null);
  const [ganadores, setGanadores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');
  const [sonido, setSonido] = useState(true);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [reinicio, setReinicio] = useState(null); // null | { texto, enviando }
  const [casillaGanadora, setCasillaGanadora] = useState(null);

  const stageRef = useRef(null);
  const wheelRef = useRef(null);
  const pointerRef = useRef(null);
  const confetiRef = useRef(null);
  const angleRef = useRef(0);
  const speedRef = useRef(IDLE_SPEED);
  const phaseRef = useRef('idle'); // idle | windup | accel | decel | settle
  const phaseStartRef = useRef(0);
  const decelRef = useRef(null);
  const flechaRef = useRef({ angulo: 0, vel: 0 }); // resorte de la flecha
  const sliceRef = useRef(-1);
  const pausaRef = useRef(null);
  const segRef = useRef(360);
  const sonidosRef = useRef(null);
  const sonidoRef = useRef(true);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => { sonidoRef.current = sonido; }, [sonido]);
  useEffect(() => { segRef.current = 360 / Math.max(slots.length, 1); }, [slots.length]);

  useEffect(() => {
    const onChange = () => setPantallaCompleta(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

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
      const d = await call(`/elegibles?solo_asistentes=${soloAsistentes}&muestra=24`);
      setElegibles(d.total);
      setExcluidosPrueba(d.excluidos_prueba ?? 0);
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

  const toggleExcluidos = async () => {
    if (listaExcluidos) {
      setListaExcluidos(null);
      return;
    }
    try {
      const d = await call('/excluidos');
      setListaExcluidos(d.excluidos);
    } catch (e) {
      setError(e.message);
    }
  };

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
      const transcurrido = now - phaseStartRef.current;

      if (phase === 'idle') {
        if (!reducedMotion.current) angleRef.current += IDLE_SPEED * dt;
      } else if (phase === 'windup') {
        // Retrocede un poco y se suelta
        const t = Math.min(transcurrido / IMPULSO_MS, 1);
        angleRef.current = decelRef.current.from - IMPULSO_GRADOS * Math.sin((t * Math.PI) / 2);
        if (t >= 1) {
          phaseRef.current = 'accel';
          phaseStartRef.current = now;
          speedRef.current = 0;
        }
      } else if (phase === 'accel') {
        const t = Math.min(transcurrido / ACELERACION_MS, 1);
        speedRef.current = FAST_SPEED * (1 - (1 - t) * (1 - t));
        angleRef.current += speedRef.current * dt;
      } else if (phase === 'decel') {
        // Arranca con la misma velocidad que traía, así no hay saltos
        const d = decelRef.current;
        const t = Math.min(transcurrido / d.duration, 1);
        angleRef.current = d.from + d.delta * (1 - Math.pow(1 - t, FRENADA_POT));
        if (t >= 1) {
          phaseRef.current = d.rebote > 0 ? 'settle' : 'idle';
          phaseStartRef.current = now;
          d.finFrenada = angleRef.current;
          if (d.rebote <= 0) d.onEnd();
        }
      } else if (phase === 'settle') {
        // Se pasó un poquito: regresa suave al centro de la casilla
        const d = decelRef.current;
        const t = Math.min(transcurrido / REBOTE_MS, 1);
        const suave = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        angleRef.current = d.finFrenada - d.rebote * suave;
        if (t >= 1) {
          phaseRef.current = 'idle';
          d.onEnd();
        }
      }

      // Posición de la flecha dentro de la casilla (0 → 1 en el sentido del giro)
      const rot = ((angleRef.current % 360) + 360) % 360;
      const u = ((360 - rot) % 360) / segRef.current;
      const casilla = Math.floor(u);
      const avance = 1 - (u - casilla);
      const flecha = flechaRef.current;
      const retrocede = phase === 'windup' || phase === 'settle';

      // Al pasar un clavo la flecha queda empujada al máximo y suena un clic
      if (casilla !== sliceRef.current) {
        const adelante = sliceRef.current !== -1 && !retrocede;
        sliceRef.current = casilla;
        if (adelante) {
          flecha.angulo = Math.min(flecha.angulo, -FLECHA_MAX);
          flecha.vel = 0;
          if (phase !== 'idle' && sonidoRef.current) sonidosRef.current?.tick();
        }
      }

      // El clavo que se acerca empuja la flecha; al soltarla regresa como resorte
      const empuje = !retrocede && avance > 1 - FLECHA_CONTACTO
        ? -FLECHA_MAX * ((avance - (1 - FLECHA_CONTACTO)) / FLECHA_CONTACTO)
        : 0;
      const pasos = Math.ceil(dt / 0.004);
      const h = dt / pasos;
      for (let i = 0; i < pasos; i += 1) {
        flecha.vel += (-RESORTE_K * flecha.angulo - RESORTE_AMORT * flecha.vel) * h;
        flecha.angulo += flecha.vel * h;
        if (empuje < flecha.angulo) {
          flecha.angulo = empuje;
          flecha.vel = 0;
        }
      }

      wheelRef.current?.setAttribute('transform', `rotate(${rot} ${C} ${C})`);
      pointerRef.current?.setAttribute('transform', `rotate(${flecha.angulo} ${C} 14)`);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [authed]);

  // Confeti cada vez que aparece un ganador
  useEffect(() => {
    if (!winner || reducedMotion.current) return undefined;
    return lanzarConfeti(confetiRef.current);
  }, [winner]);

  // -- Sorteo ---------------------------------------------------------------
  const handleSpin = async () => {
    if (spinning || winner || elegibles < 1 || slots.length < 1) return;
    if (!sonidosRef.current) sonidosRef.current = crearSonidos();
    sonidosRef.current?.reanudar();
    setSpinning(true);
    setError('');
    setCasillaGanadora(null);
    if (!reducedMotion.current) {
      decelRef.current = { from: angleRef.current };
      phaseStartRef.current = performance.now();
      phaseRef.current = 'windup';
      if (sonidoRef.current) sonidosRef.current?.impulso();
    }

    try {
      // El ganador lo decide el servidor; la ruleta gira mientras tanto (mín. 1.2 s)
      const [g] = await Promise.all([
        call('/girar', {
          method: 'POST',
          body: JSON.stringify({ solo_asistentes: soloAsistentes, premio: premio.trim() || null }),
        }),
        new Promise((r) => setTimeout(r, reducedMotion.current ? 0 : 1200)),
      ]);

      // Se coloca el nombre ganador en una casilla al azar y se frena sobre ella
      const n = slots.length;
      const seg = 360 / n;
      const k = Math.floor(Math.random() * n);
      setSlots((prev) => prev.map((s, i) => (i === k ? g.nombre : s)));

      // Lejos de los bordes para que no quede duda de en qué casilla cayó
      const jitter = (Math.random() - 0.5) * seg * 0.5;
      const target = ((-((k + 0.5) * seg + jitter) % 360) + 360) % 360;
      const from = angleRef.current;
      const adjust = (((target - from) % 360) + 360) % 360;
      const rebote = reducedMotion.current ? 0 : REBOTE_CASILLAS * seg;

      // Vueltas y duración calculadas para que la frenada empiece a la velocidad que lleva
      const v0 = Math.max(speedRef.current, 150);
      const ideal = (v0 * FRENADA_MS) / 1000 / FRENADA_POT;
      const vueltas = Math.max(1, Math.round((ideal - adjust - rebote) / 360));
      const delta = 360 * vueltas + adjust + rebote;

      decelRef.current = {
        from,
        delta,
        rebote,
        duration: reducedMotion.current ? 1500 : (FRENADA_POT * delta * 1000) / v0,
        onEnd: () => {
          speedRef.current = IDLE_SPEED;
          setCasillaGanadora(k);
          pausaRef.current = setTimeout(() => {
            setWinner(g);
            setSpinning(false);
            if (sonidoRef.current) sonidosRef.current?.fanfarria();
            loadGanadores();
          }, reducedMotion.current ? 0 : PAUSA_GANADOR_MS);
        },
      };
      phaseStartRef.current = performance.now();
      phaseRef.current = 'decel';
    } catch (err) {
      phaseRef.current = 'idle';
      speedRef.current = IDLE_SPEED;
      setError(err.message);
      setSpinning(false);
    }
  };

  // Barra espaciadora para girar (útil al proyectar en pantalla completa)
  const spinRef = useRef(handleSpin);
  spinRef.current = handleSpin;
  useEffect(() => {
    if (!authed) return undefined;
    const onKey = (e) => {
      if (e.code !== 'Space' || ['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;
      e.preventDefault();
      spinRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authed]);

  const updateGanador = async (id, body) => {
    try {
      await call(`/ganadores/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      await loadGanadores();
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => () => clearTimeout(pausaRef.current), []);

  const closeModal = () => {
    setWinner(null);
    setCasillaGanadora(null);
    loadElegibles();
  };

  const handleAusente = async () => {
    await updateGanador(winner.id, { estado: 'anulado' });
    closeModal();
  };

  const handleReiniciar = async (e) => {
    e.preventDefault();
    setReinicio((r) => ({ ...r, enviando: true }));
    try {
      await call('/reiniciar', { method: 'POST', body: JSON.stringify({ confirmacion: reinicio.texto }) });
      setReinicio(null);
      setFiltro('');
      await Promise.all([loadGanadores(), loadElegibles()]);
    } catch (err) {
      setError(err.message);
      setReinicio((r) => ({ ...r, enviando: false }));
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

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

  const ultimosGanadores = useMemo(
    () => ganadores.filter((g) => g.estado !== 'anulado').slice(0, 5),
    [ganadores]
  );

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
  const fontSize = Math.max(9, Math.min(15, ((2 * Math.PI * 120) / n) * 0.45));
  const ganadoresVigentes = ganadores.filter((g) => g.estado !== 'anulado').length;

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
                {elegibles} participantes elegibles · {ganadoresVigentes} ganadores
              </p>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 rounded-xl text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Proyectar ruleta</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-[#C94B45]/10 border border-[#C94B45]/40 rounded-xl p-3 text-sm text-red-100 flex justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline">Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-5">
          {/* Escenario: ruleta + controles (esta zona se proyecta en pantalla completa) */}
          <div
            ref={stageRef}
            className={`relative overflow-hidden flex flex-col items-center justify-center ${
              pantallaCompleta
                ? 'h-screen w-screen p-[2vh] bg-[#0A0E1A]'
                : 'bg-[#0A0E1A] border border-white/10 rounded-2xl p-4 sm:p-6'
            }`}
            style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(79, 99, 210, 0.28), transparent 65%)' }}
          >
            {/* Encabezado del escenario */}
            <div className="flex items-center gap-3 mb-2 text-center">
              <img src="/images/marca/logo.png" alt="" className={pantallaCompleta ? 'h-[9vh] w-[9vh]' : 'h-12 w-12'} />
              <div>
                <p className={`font-black tracking-tight text-gray-50 ${pantallaCompleta ? 'text-[4.5vh]' : 'text-xl sm:text-2xl'}`}>
                  Gran <span className="text-[#F5B942]">Rifa</span>
                </p>
                <p className={`text-blue-200 ${pantallaCompleta ? 'text-[2.2vh]' : 'text-xs sm:text-sm'}`}>
                  {EDICION} Carrera del Día del Médico
                </p>
              </div>
            </div>
            {premio.trim() && (
              <p className={`mb-2 px-4 py-1 rounded-full bg-[#F5B942]/15 border border-[#F5B942]/40 text-[#F5B942] font-semibold ${
                pantallaCompleta ? 'text-[2.6vh]' : 'text-sm'
              }`}>
                Premio: {premio.trim()}
              </p>
            )}

            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className={`w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)] ${
                pantallaCompleta ? 'max-w-[min(90vw,62vh)]' : 'max-w-[min(90vw,64vh,560px)]'
              } ${spinning ? 'rifa-girando' : ''}`}
              role="img"
              aria-label="Ruleta de participantes"
            >
              <defs>
                <linearGradient id="rifa-aro" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="45%" stopColor="#F5B942" />
                  <stop offset="100%" stopColor="#B7791F" />
                </linearGradient>
                <radialGradient id="rifa-brillo" cx="50%" cy="50%" r="50%">
                  <stop offset="55%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
                </radialGradient>
                <radialGradient id="rifa-centro" cx="40%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#DBEAFE" />
                </radialGradient>
              </defs>

              {/* Aro dorado con focos */}
              <circle cx={C} cy={C} r={RIM_R} fill="url(#rifa-aro)" />
              <circle cx={C} cy={C} r={RIM_R - 14} fill="#0F172A" />
              {Array.from({ length: FOCOS }, (_, i) => {
                const [x, y] = polar((i * 360) / FOCOS, RIM_R - 7);
                return <circle key={i} cx={x} cy={y} r="4.2" className={`rifa-foco ${i % 2 ? 'rifa-foco-b' : ''}`} />;
              })}

              <g ref={wheelRef}>
                {slots.length < 2 ? (
                  <circle cx={C} cy={C} r={R} fill={COLORS[0]} />
                ) : (
                  slots.map((name, i) => (
                    <g
                      key={i}
                      className="rifa-casilla"
                      opacity={casillaGanadora !== null && casillaGanadora !== i ? 0.35 : 1}
                    >
                      <path
                        d={slicePath(i * seg, (i + 1) * seg)}
                        fill={sliceColor(i, slots.length)}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <text
                        transform={`rotate(${(i + 0.5) * seg - 90} ${C} ${C})`}
                        x={C + R - 14}
                        y={C}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={fontSize}
                        fontWeight="700"
                        fill={SLICE_TEXT}
                      >
                        {nombreCorto(name)}
                      </text>
                    </g>
                  ))
                )}
                {/* Casilla ganadora resaltada mientras se anuncia */}
                {casillaGanadora !== null && slots.length >= 2 && (
                  <path
                    d={slicePath(casillaGanadora * seg, (casillaGanadora + 1) * seg)}
                    fill="none"
                    stroke="#F5B942"
                    strokeWidth="6"
                    strokeLinejoin="round"
                    className="rifa-casilla-ganadora"
                  />
                )}
              </g>
              <circle cx={C} cy={C} r={R} fill="url(#rifa-brillo)" pointerEvents="none" />

              {elegibles < 1 && (
                <text x={C} y={C + 70} textAnchor="middle" fontSize="16" fontWeight="700" fill={SLICE_TEXT}>
                  Sin participantes elegibles
                </text>
              )}

              {/* Centro con el logo */}
              <circle cx={C} cy={C} r="40" fill="url(#rifa-centro)" stroke="url(#rifa-aro)" strokeWidth="6" />
              <image href="/images/marca/logo.png" x={C - 31} y={C - 31} width="62" height="62" />

              {/* Flecha: rebota al pasar cada casilla */}
              <g ref={pointerRef}>
                <path
                  d={`M${C - 17},4 L${C + 17},4 L${C},46 Z`}
                  fill="#F5B942"
                  stroke="#0A0E1A"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <circle cx={C} cy="14" r="5" fill="#0A0E1A" />
              </g>
            </svg>

            {/* Controles */}
            <div className={`w-full mt-4 space-y-3 ${pantallaCompleta ? 'max-w-[60vh]' : 'max-w-md'}`}>
              {!pantallaCompleta && (
                <input
                  type="text"
                  value={premio}
                  onChange={(e) => setPremio(e.target.value)}
                  placeholder="Premio de este giro (opcional)"
                  disabled={spinning}
                  className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm text-gray-100 placeholder-gray-500"
                />
              )}
              <button
                onClick={handleSpin}
                disabled={spinning || elegibles < 1}
                className={`w-full bg-gradient-to-b from-[#F5B942] to-[#D9962A] hover:from-[#FFC857] hover:to-[#E5A23A] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0E1A] rounded-xl font-black shadow-lg shadow-[#F5B942]/20 transition ${
                  pantallaCompleta ? 'py-[1.6vh] text-[3vh]' : 'py-3.5 text-lg'
                }`}
              >
                {spinning ? 'Girando…' : elegibles < 1 ? 'Sin participantes elegibles' : '¡Girar ruleta!'}
              </button>

              <div className="flex items-center justify-between gap-3 text-sm text-gray-400">
                {!pantallaCompleta ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soloAsistentes}
                      onChange={(e) => setSoloAsistentes(e.target.checked)}
                      disabled={spinning}
                    />
                    Solo participantes con asistencia marcada
                  </label>
                ) : (
                  <span className="text-[1.8vh]">{elegibles} participantes en la ruleta · barra espaciadora para girar</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSonido((s) => !s)}
                    aria-label={sonido ? 'Silenciar' : 'Activar sonido'}
                    title={sonido ? 'Silenciar' : 'Activar sonido'}
                    className="p-2 rounded-lg hover:bg-white/[0.08] text-gray-300"
                  >
                    {sonido ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  {pantallaCompleta && (
                    <button
                      onClick={toggleFullscreen}
                      aria-label="Salir de pantalla completa"
                      className="p-2 rounded-lg hover:bg-white/[0.08] text-gray-300"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Últimos ganadores */}
            {ultimosGanadores.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 max-w-full">
                {ultimosGanadores.map((g) => (
                  <span
                    key={g.id}
                    className={`px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-gray-200 ${
                      pantallaCompleta ? 'text-[1.8vh]' : 'text-xs'
                    }`}
                  >
                    <span className="text-[#F5B942] font-bold">#{g.numero_ganador}</span> {nombreCorto(g.nombre)}
                  </span>
                ))}
              </div>
            )}

            {/* Ganador (dentro del escenario para que también se vea en pantalla completa) */}
            {winner && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Ganador"
                className="absolute inset-0 z-20 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <div className="rifa-ganador w-full max-w-lg bg-gradient-to-b from-[#16204a] to-[#0D1326] border-2 border-[#F5B942]/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-[#F5B942]/20">
                  <Trophy className={`mx-auto mb-3 text-[#F5B942] ${pantallaCompleta ? 'w-[9vh] h-[9vh]' : 'w-12 h-12'}`} />
                  <p className={`text-[#F5B942] font-bold uppercase tracking-widest ${pantallaCompleta ? 'text-[2.6vh]' : 'text-base'}`}>
                    Ganador #{winner.numero_ganador}
                  </p>
                  <h2 className={`mt-2 font-black text-gray-50 break-words leading-tight ${pantallaCompleta ? 'text-[6vh]' : 'text-3xl sm:text-4xl'}`}>
                    {formatoNombre(winner.nombre)}
                  </h2>
                  <p className={`mt-3 text-gray-300 ${pantallaCompleta ? 'text-[2.6vh]' : ''}`}>
                    Número de participante <span className="font-bold text-gray-50">{winner.numero_asignado}</span>
                  </p>
                  {winner.premio && (
                    <p className={`mt-2 inline-block px-4 py-1 rounded-full bg-[#F5B942]/15 text-[#F5B942] font-semibold ${pantallaCompleta ? 'text-[2.4vh]' : ''}`}>
                      {winner.premio}
                    </p>
                  )}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAusente}
                      className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 rounded-xl font-medium"
                    >
                      No está presente
                    </button>
                    <button
                      onClick={closeModal}
                      autoFocus
                      className="flex-1 py-2.5 bg-[#1F9D73] hover:bg-[#24B382] text-white rounded-xl font-bold"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}
            <canvas ref={confetiRef} className="pointer-events-none absolute inset-0 z-30 h-full w-full" />
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

            <div className="flex-1 divide-y divide-white/[0.06] overflow-y-auto max-h-[60vh]">
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
                      <p className="font-medium text-gray-100 truncate">{formatoNombre(g.nombre)}</p>
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

            {/* Registros de prueba y reinicio */}
            <div className="border-t border-white/10 p-4 space-y-3 text-sm">
              <button
                onClick={toggleExcluidos}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-200"
              >
                <FlaskConical className="w-4 h-4" />
                {excluidosPrueba} registros de prueba excluidos de la rifa
                <span className="underline">{listaExcluidos ? 'ocultar' : 'ver'}</span>
              </button>
              {listaExcluidos && (
                <ul className="max-h-40 overflow-y-auto rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-400 space-y-1">
                  {listaExcluidos.length === 0 && <li>Ninguno</li>}
                  {listaExcluidos.map((x, i) => (
                    <li key={i}>
                      <span className="text-gray-500">{x.numero_asignado}</span> · {x.nombre}
                    </li>
                  ))}
                </ul>
              )}

              {reinicio ? (
                <form onSubmit={handleReiniciar} className="rounded-xl border border-[#C94B45]/40 bg-[#C94B45]/10 p-3 space-y-2">
                  <p className="text-red-100">
                    Se borrarán los {ganadores.length} ganadores registrados y todos volverán a participar.
                    La asistencia no se modifica. Escribe <b>REINICIAR</b> para confirmar.
                  </p>
                  <input
                    type="text"
                    value={reinicio.texto}
                    onChange={(e) => setReinicio((r) => ({ ...r, texto: e.target.value }))}
                    autoFocus
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-gray-100"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReinicio(null)}
                      className="flex-1 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={reinicio.texto.trim().toUpperCase() !== 'REINICIAR' || reinicio.enviando}
                      className="flex-1 py-2 bg-[#C94B45] hover:bg-[#D85A54] disabled:opacity-40 text-white rounded-lg font-semibold"
                    >
                      {reinicio.enviando ? 'Reiniciando…' : 'Reiniciar rifa'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setReinicio({ texto: '', enviando: false })}
                  disabled={spinning}
                  className="flex items-center gap-2 text-red-300/80 hover:text-red-200 disabled:opacity-40"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar rifa (nadie ha ganado)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rifa-foco { fill: #FFF7D6; opacity: 0.95; animation: rifa-foco 1.2s ease-in-out infinite; }
        .rifa-foco-b { animation-delay: -0.6s; }
        .rifa-girando .rifa-foco { animation-duration: 0.25s; }
        @keyframes rifa-foco {
          0%, 100% { opacity: 1; fill: #FFF7D6; }
          50% { opacity: 0.35; fill: #F5B942; }
        }
        .rifa-casilla { transition: opacity 0.5s ease; }
        .rifa-casilla-ganadora { animation: rifa-casilla 0.6s ease-in-out infinite alternate; }
        @keyframes rifa-casilla {
          from { stroke: #F5B942; stroke-opacity: 1; }
          to { stroke: #FFFFFF; stroke-opacity: 0.6; }
        }
        .rifa-ganador { animation: rifa-ganador 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes rifa-ganador {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rifa-foco, .rifa-ganador, .rifa-casilla-ganadora { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default RifaView;
