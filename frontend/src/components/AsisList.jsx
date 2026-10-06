import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, CheckCircle, XCircle, RefreshCw, ArrowLeft,
  ChevronLeft, ChevronRight, ChevronDown, Wrench, Download, Loader2,
  Phone, PhoneCall, Mail, MapPin, Briefcase, HeartPulse, Calendar, User
} from 'lucide-react';
import { useAttendance } from '../hooks/useApi';
import { downloadUtils } from '../services/api';

const EVENT_YEAR = 2026;

// ---------------------------------------------------------------------------
// Sub-componentes de visualización (sin dependencias externas)
// ---------------------------------------------------------------------------

const AttendanceDonut = ({ percentage, size = 132, strokeWidth = 14 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3DDC97"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-gray-50 tabular-nums tracking-tight">
          {clamped.toFixed(0)}%
        </span>
        <span className="text-[11px] text-gray-400">asistencia</span>
      </div>
    </div>
  );
};

const BarBreakdown = ({ title, rows, accent = '#6C8EFF' }) => {
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Sin datos suficientes.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm text-gray-200 truncate pr-2">{row.label}</span>
                <span className="text-sm text-gray-400 tabular-nums flex-shrink-0">{row.count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.count / max) * 100}%`,
                    backgroundColor: row.color || accent,
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const initials = (nombre = '') =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

const avatarPalette = (sexo) => {
  if (sexo === 'Masculino') return { bg: 'rgba(79,99,210,0.18)', text: '#8FA0FF' };
  if (sexo === 'Femenino') return { bg: 'rgba(201,75,122,0.18)', text: '#E68FC0' };
  return { bg: 'rgba(255,255,255,0.08)', text: '#B9C0D4' };
};

// Fechas de SQLite ("2026-10-06 00:22:05") o ISO
const formatFecha = (fecha) => {
  if (!fecha) return null;
  const d = new Date(String(fecha).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const tieneCondicion = (p) =>
  Boolean(p.condiciones_salud && p.condiciones_salud.trim() && p.condiciones_salud !== 'Ninguna');

const DetailItem = ({ icon: Icon, label, children, highlight = false }) => (
  <div className={`flex items-start gap-2.5 rounded-xl p-3 border ${
    highlight ? 'bg-[#C94B45]/10 border-[#C94B45]/30' : 'bg-black/20 border-white/[0.06]'
  }`}>
    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlight ? 'text-red-300' : 'text-gray-500'}`} />
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-sm break-words ${highlight ? 'text-red-200 font-medium' : 'text-gray-200'}`}>
        {children || <span className="text-gray-600">Sin dato</span>}
      </div>
    </div>
  </div>
);

// Toda la información capturada en el registro
const ParticipantDetails = ({ participante: p }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
    <DetailItem icon={Phone} label="Teléfono">
      {p.telefono && <a href={`tel:${p.telefono}`} className="font-mono hover:text-[#8FA0FF]">{p.telefono}</a>}
    </DetailItem>
    <DetailItem icon={PhoneCall} label="Tel. de emergencia">
      {p.telefono_emergencia && (
        <a href={`tel:${p.telefono_emergencia}`} className="font-mono hover:text-[#8FA0FF]">{p.telefono_emergencia}</a>
      )}
    </DetailItem>
    <DetailItem icon={Mail} label="Correo">
      {p.correo && <a href={`mailto:${p.correo}`} className="hover:text-[#8FA0FF]">{p.correo}</a>}
    </DetailItem>
    <DetailItem icon={MapPin} label="Ciudad">{p.ciudad}</DetailItem>
    <DetailItem icon={User} label="Sexo">{p.sexo}</DetailItem>
    <DetailItem icon={Briefcase} label="Profesión / sector">{p.sector_profesional}</DetailItem>
    <DetailItem icon={HeartPulse} label="Condiciones de salud" highlight={tieneCondicion(p)}>
      {p.condiciones_salud || 'Ninguna'}
    </DetailItem>
    <DetailItem icon={Calendar} label="Fecha de registro">{formatFecha(p.fecha_registro)}</DetailItem>
    <DetailItem icon={CheckCircle} label="Llegada registrada">
      {p.asistio ? (formatFecha(p.fecha_asistencia) || 'Sí') : 'Aún no llega'}
    </DetailItem>
  </div>
);

const PdfButton = ({ participante, downloadingId, onDownload, compact = false }) => {
  const isDownloading = downloadingId === participante.id;
  return (
    <button
      type="button"
      onClick={() => onDownload(participante)}
      disabled={isDownloading}
      title="Descargar PDF del número para imprimir"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors bg-[#4F63D2] hover:bg-[#5A70E8] disabled:opacity-60 disabled:cursor-wait text-white ${
        compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
      }`}
    >
      {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      {isDownloading ? 'Generando...' : 'PDF'}
    </button>
  );
};

// ---------------------------------------------------------------------------
// Vista principal
// ---------------------------------------------------------------------------

const AttendanceView = ({ onBack }) => {
  const [filteredParticipantes, setFilteredParticipantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [globalSearching, setGlobalSearching] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    totalFetched: 0,
    pagesRequested: 0,
    apiCalls: [],
    lastSearchTime: null
  });
  const itemsPerPage = 300;

  const {
    participantes,
    loading,
    error,
    totalParticipantes,
    fetchParticipantes,
    updateAsistencia,
    updateAsistenciaMasiva,
    clearError
  } = useAttendance();

  useEffect(() => {
    loadParticipantes();
  }, [currentPage]);

  const loadParticipantes = async () => {
    try {
      const data = await fetchParticipantes(itemsPerPage, currentPage * itemsPerPage);
      setFilteredParticipantes(data.participantes || []);
    } catch (error) {
      console.error('Error al cargar participantes:', error);
      setFilteredParticipantes([]);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim() && !isGlobalSearch) {
      setFilteredParticipantes(participantes);
    }
  }, [participantes, isGlobalSearch, searchTerm]);

  const toggleAsistencia = async (id) => {
    // Buscar también en los resultados de búsqueda global (pueden no estar en la página actual)
    const participante = filteredParticipantes.find(p => p.id === id) || participantes.find(p => p.id === id);
    if (!participante) return;

    const nuevoEstado = !participante.asistio;

    try {
      await updateAsistencia(id, nuevoEstado);
      const fecha = nuevoEstado ? new Date().toISOString() : null;
      setFilteredParticipantes(prev => prev.map(p =>
        p.id === id ? { ...p, asistio: nuevoEstado, fecha_asistencia: fecha } : p
      ));
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
    }
  };

  // Mismo PDF que recibe el corredor al registrarse (hoja carta, número en la mitad superior)
  const handleDownloadPdf = async (participante) => {
    setPdfError(null);
    setDownloadingId(participante.id);
    try {
      await downloadUtils.downloadParticipantPdf(participante.numero_asignado, participante.nombre);
    } catch {
      setPdfError(`No se pudo generar el PDF de ${participante.nombre}. Intente nuevamente.`);
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleExpanded = (id) => setExpandedId(prev => (prev === id ? null : id));

  const handleMarcarTodos = async (estado) => {
    const idsParticipantes = filteredParticipantes.map(p => p.id);

    if (idsParticipantes.length === 0) return;

    setSaving(true);
    try {
      await updateAsistenciaMasiva(idsParticipantes, estado);
      setFilteredParticipantes(prev => prev.map(p =>
        idsParticipantes.includes(p.id) ? { ...p, asistio: estado } : p
      ));
    } catch (error) {
      console.error('Error al marcar todos:', error);
    } finally {
      setSaving(false);
    }
  };

  // Búsqueda global usando el endpoint de búsqueda de la API
  const performGlobalSearch = async (searchValue) => {
    if (!searchValue.trim()) {
      setIsGlobalSearch(false);
      setFilteredParticipantes(participantes);
      setDebugInfo({ totalFetched: 0, pagesRequested: 0, apiCalls: [], lastSearchTime: null });
      return;
    }

    if (searchValue !== searchTerm) {
      return;
    }

    const startTime = Date.now();
    setGlobalSearching(true);
    setIsGlobalSearch(true);
    setDebugInfo(prev => ({
      ...prev,
      totalFetched: 0,
      pagesRequested: 1,
      apiCalls: [{
        page: 1,
        status: 'iniciando búsqueda con parámetro search',
        searchTerm: searchValue,
        method: 'API_SEARCH_ENDPOINT'
      }],
      lastSearchTime: new Date().toLocaleTimeString()
    }));

    try {
      const searchUrl = `/api/participantes?search=${encodeURIComponent(searchValue)}&limit=10000&offset=0`;

      setDebugInfo(prev => ({
        ...prev,
        apiCalls: [{
          ...prev.apiCalls[0],
          url: searchUrl,
          status: 'enviando petición...'
        }]
      }));

      const response = await fetch(searchUrl);

      setDebugInfo(prev => ({
        ...prev,
        apiCalls: [{
          ...prev.apiCalls[0],
          httpStatus: response.status,
          responseOk: response.ok,
          contentType: response.headers.get('content-type'),
          status: response.ok ? 'respuesta recibida' : `HTTP Error ${response.status}`
        }]
      }));

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Respuesta no es JSON. Content-Type: ${contentType}`);
        }

        const data = await response.json();
        const searchResults = data.participantes || [];

        const endTime = Date.now();
        setDebugInfo(prev => ({
          ...prev,
          totalFetched: searchResults.length,
          filteredResults: searchResults.length,
          searchDuration: endTime - startTime,
          isComplete: true,
          apiCalls: [{
            ...prev.apiCalls[0],
            status: 'exitoso - búsqueda directa en API',
            received: searchResults.length,
            searchInDatabase: true,
            totalInDatabase: data.total,
            method: 'API_SEARCH_ENDPOINT'
          }]
        }));

        if (searchValue === searchTerm) {
          setFilteredParticipantes(searchResults);
        }

      } else {
        let errorText = 'Error desconocido';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `No se pudo leer respuesta: ${e.message}`;
        }

        setDebugInfo(prev => ({
          ...prev,
          apiCalls: [{
            ...prev.apiCalls[0],
            status: 'error en búsqueda API, usando fallback',
            error: `HTTP ${response.status}`,
            errorDetails: errorText.substring(0, 200) + (errorText.length > 200 ? '...' : ''),
            fallback: true
          }]
        }));

        await performFallbackSearch(searchValue, startTime);
      }

    } catch (error) {
      let errorDetails = error.message;
      if (error.message.includes('Unexpected token')) {
        errorDetails = 'Respuesta HTML en lugar de JSON - probablemente error 404 o servidor mal configurado';
      }

      setDebugInfo(prev => ({
        ...prev,
        apiCalls: [{
          ...prev.apiCalls[0],
          status: 'error en búsqueda API, usando fallback',
          error: error.message,
          errorType: error.name,
          errorDetails: errorDetails,
          fallback: true
        }]
      }));

      await performFallbackSearch(searchValue, startTime);
    } finally {
      setGlobalSearching(false);
    }
  };

  const performFallbackSearch = async (searchValue, startTime) => {
    try {
      setDebugInfo(prev => ({
        ...prev,
        apiCalls: [...prev.apiCalls, {
          page: 'fallback',
          status: 'iniciando fallback - obteniendo todos los datos',
          limit: totalParticipantes,
          method: 'FALLBACK_GET_ALL'
        }]
      }));

      const fallbackUrl = `/api/participantes?limit=${Math.max(10000, totalParticipantes || 5000)}&offset=0`;

      setDebugInfo(prev => ({
        ...prev,
        apiCalls: [...prev.apiCalls, {
          page: 'fallback',
          status: 'enviando petición fallback',
          url: fallbackUrl,
          method: 'FALLBACK_GET_ALL'
        }]
      }));

      const response = await fetch(fallbackUrl);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Fallback: Respuesta no es JSON. Content-Type: ${contentType}`);
        }

        const data = await response.json();
        let allResults = data.participantes || [];

        if (allResults.length < totalParticipantes && allResults.length > 0) {
          const totalPages = Math.ceil(totalParticipantes / allResults.length);

          for (let page = 1; page < Math.min(totalPages, 10); page++) {
            const pageResponse = await fetch(`/api/participantes?limit=300&offset=${page * 300}`);
            if (pageResponse.ok) {
              const pageData = await pageResponse.json();
              const pageParticipantes = pageData.participantes || [];
              allResults.push(...pageParticipantes);

              if (pageParticipantes.length === 0) break;
            }
          }
        }

        const filteredResults = allResults.filter(p => {
          const searchLower = searchValue.toLowerCase();
          return p.nombre.toLowerCase().includes(searchLower) ||
                 p.numero_asignado.toLowerCase().includes(searchLower) ||
                 p.telefono.includes(searchValue);
        });

        const endTime = Date.now();
        setDebugInfo(prev => ({
          ...prev,
          totalFetched: allResults.length,
          filteredResults: filteredResults.length,
          searchDuration: endTime - startTime,
          isComplete: true,
          apiCalls: [...prev.apiCalls, {
            page: 'fallback-complete',
            status: 'fallback completado - filtrado local',
            received: allResults.length,
            filtered: filteredResults.length,
            method: 'FALLBACK_LOCAL_FILTER'
          }]
        }));

        if (searchValue === searchTerm) {
          setFilteredParticipantes(filteredResults);
        }
      }
    } catch (fallbackError) {
      setDebugInfo(prev => ({
        ...prev,
        apiCalls: [...prev.apiCalls, {
          page: 'fallback-error',
          status: 'error en fallback',
          error: fallbackError.message,
          method: 'FALLBACK_ERROR'
        }]
      }));

      if (searchValue === searchTerm) {
        setFilteredParticipantes([]);
      }
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsGlobalSearch(false);
      setFilteredParticipantes(participantes);
      return;
    }

    const timeoutId = setTimeout(() => {
      performGlobalSearch(searchTerm);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsGlobalSearch(false);
    setFilteredParticipantes(participantes);
    setDebugInfo({ totalFetched: 0, pagesRequested: 0, apiCalls: [], lastSearchTime: null });
  };

  const runDiagnostics = async () => {
    console.log('🔧 === DIAGNÓSTICO COMPLETO ===');
    console.log('📍 Ubicación:', window.location.href);
    console.log('🌐 Entorno:', {
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      MODE: import.meta.env.MODE
    });

    const tests = [
      { name: '🏠 Health Check', url: '/api/health' },
      { name: '📊 Status', url: '/api/status' },
      { name: '👥 Participantes (1)', url: '/api/participantes?limit=1' },
      { name: '🔢 Total', url: '/api/total_participantes' },
      { name: '🔍 Búsqueda Test', url: '/api/participantes?search=test&limit=1' }
    ];

    for (const test of tests) {
      try {
        console.log(`\n🧪 ${test.name}`);
        console.log(`   URL: ${test.url}`);

        const start = Date.now();
        const response = await fetch(test.url);
        const duration = Date.now() - start;

        console.log(`   ⏱️  ${duration}ms`);
        console.log(`   📡 ${response.status} ${response.statusText}`);
        console.log(`   📄 Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`   ✅ JSON OK - Keys:`, Object.keys(data));
            if (data.participantes) {
              console.log(`   👥 ${data.participantes.length} participantes`);
            }
          } catch (e) {
            console.log(`   ❌ JSON Parse Error:`, e.message);
            const text = await response.text();
            console.log(`   📝 Raw response:`, text.substring(0, 200));
          }
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Error:`, errorText.substring(0, 200));
        }
      } catch (error) {
        console.log(`   💥 Network Error:`, error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🔧 === DIAGNÓSTICO COMPLETO ===');
    alert('Diagnóstico completado - revisa la consola del navegador (F12)');
  };

  const stats = useMemo(() => {
    const total = filteredParticipantes.length;
    const asistieron = filteredParticipantes.filter(p => p.asistio).length;
    const pendientes = total - asistieron;
    const porcentaje = total > 0 ? (asistieron / total) * 100 : 0;
    return { total, asistieron, pendientes, porcentaje };
  }, [filteredParticipantes]);

  const bySexo = useMemo(() => {
    const counts = {};
    filteredParticipantes.forEach(p => {
      const key = p.sexo || 'Sin especificar';
      counts[key] = (counts[key] || 0) + 1;
    });
    const colorFor = (label) =>
      label === 'Masculino' ? '#6C8EFF' : label === 'Femenino' ? '#E68FC0' : '#8B93A7';
    return Object.entries(counts).map(([label, count]) => ({ label, count, color: colorFor(label) }));
  }, [filteredParticipantes]);

  const byProfesion = useMemo(() => {
    const counts = {};
    filteredParticipantes.forEach(p => {
      const key = p.sector_profesional || 'Sin especificar';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredParticipantes]);

  const scopeLabel = isGlobalSearch
    ? `resultados de búsqueda para "${searchTerm}"`
    : `página ${currentPage + 1}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] via-[#0D1326] to-[#080B14] pt-24 pb-4 sm:pt-28 sm:pb-8 lg:pb-14">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 max-w-7xl">

        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center min-w-0">
            <button
              onClick={onBack}
              className="mr-3 sm:mr-4 p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-[#3DDC97]/15 border border-[#3DDC97]/30 text-[#3DDC97] text-[11px] sm:text-xs font-semibold tracking-wide">
                Carrera del Día del Médico {EVENT_YEAR}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-50 truncate tracking-tight">
                Control de asistencia {EVENT_YEAR}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                Datos de {scopeLabel}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={loadParticipantes}
              disabled={loading}
              title="Actualizar"
              className="flex items-center px-3 sm:px-4 py-2 bg-[#4F63D2] hover:bg-[#5A70E8] text-white rounded-xl transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={runDiagnostics}
              title="Ejecutar diagnóstico de conexión"
              className="flex items-center px-2.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-400 rounded-xl transition-colors"
            >
              <Wrench className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#C94B45]/10 border border-[#C94B45]/40 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-red-100 font-medium">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 px-3 py-1 bg-[#C94B45]/30 hover:bg-[#C94B45]/40 text-white rounded-lg text-xs sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        )}

        {pdfError && (
          <div className="bg-[#C94B45]/10 border border-[#C94B45]/40 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-red-100">{pdfError}</p>
            <button
              onClick={() => setPdfError(null)}
              className="px-3 py-1 bg-[#C94B45]/30 hover:bg-[#C94B45]/40 text-white rounded-lg text-xs flex-shrink-0"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Panel principal de progreso + KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))] gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
            <AttendanceDonut percentage={stats.porcentaje} />
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-gray-300 mb-1">Progreso de asistencia</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                {stats.asistieron} de {stats.total} inscritos ya confirmaron su llegada.
              </p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Total inscritos</span>
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-3xl font-bold text-gray-50 tabular-nums">{stats.total}</div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Asistieron</span>
              <CheckCircle className="w-4 h-4 text-[#3DDC97]" />
            </div>
            <div className="text-3xl font-bold text-[#3DDC97] tabular-nums">{stats.asistieron}</div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Pendientes</span>
              <XCircle className="w-4 h-4 text-[#F5B942]" />
            </div>
            <div className="text-3xl font-bold text-[#F5B942] tabular-nums">{stats.pendientes}</div>
          </div>
        </div>

        {/* Desgloses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <BarBreakdown title="Por sexo" rows={bySexo} />
          <BarBreakdown title="Top profesiones" rows={byProfesion} accent="#6C8EFF" />
        </div>

        {/* Búsqueda y acciones masivas */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                globalSearching ? 'text-[#6C8EFF] animate-pulse' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder={
                  globalSearching
                    ? "Buscando en toda la base de datos..."
                    : isGlobalSearch
                      ? "Resultados globales - edita para buscar de nuevo"
                      : "Buscar por nombre, número, teléfono, ciudad o correo..."
                }
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`w-full pl-9 pr-16 py-2.5 bg-black/20 border rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6C8EFF]/40 ${
                  isGlobalSearch ? 'border-[#6C8EFF]/50' : 'border-white/10'
                }`}
                disabled={globalSearching}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {isGlobalSearch && !searchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#6C8EFF]/20 text-[#8FA0FF] text-xs rounded-full">
                  Global
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleMarcarTodos(true)}
                disabled={saving || filteredParticipantes.length === 0}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-[#1F9D73] hover:bg-[#24B382] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium text-sm"
              >
                {saving ? <RefreshCw className="w-4 h-4 mx-auto animate-spin" /> : 'Marcar todos'}
              </button>
              <button
                onClick={() => handleMarcarTodos(false)}
                disabled={saving || filteredParticipantes.length === 0}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-[#C94B45] hover:bg-[#D65850] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium text-sm"
              >
                {saving ? <RefreshCw className="w-4 h-4 mx-auto animate-spin" /> : 'Desmarcar todos'}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de participantes */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-4 animate-spin text-[#6C8EFF]" />
              <p className="text-sm sm:text-base text-gray-400">Cargando participantes...</p>
            </div>
          ) : (
            <>
              {/* Vista Desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 border-b border-white/10">Estado</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 border-b border-white/10">Participante</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 border-b border-white/10">Número</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 border-b border-white/10">Profesión</th>
                      <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 border-b border-white/10">Contacto</th>
                      <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 border-b border-white/10">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipantes.length === 0 && isGlobalSearch && !globalSearching ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Search className="w-10 h-10 text-gray-600 mb-4" />
                            <h3 className="text-base font-medium text-gray-300 mb-1">Sin resultados</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Nadie coincide con "{searchTerm}"
                            </p>
                            <button
                              onClick={clearSearch}
                              className="px-4 py-2 bg-[#4F63D2] hover:bg-[#5A70E8] text-white rounded-lg text-sm transition-colors"
                            >
                              Limpiar búsqueda
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredParticipantes.map((participante) => {
                        const palette = avatarPalette(participante.sexo);
                        const isExpanded = expandedId === participante.id;
                        return (
                          <React.Fragment key={participante.id}>
                          <tr className={`transition-colors ${isExpanded ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                            <td className="px-6 py-3.5 border-b border-white/[0.06]">
                              <button
                                onClick={() => toggleAsistencia(participante.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                  participante.asistio
                                    ? 'bg-[#3DDC97]/15 text-[#3DDC97] border-[#3DDC97]/30 hover:bg-[#3DDC97]/25'
                                    : 'bg-white/[0.04] text-gray-400 border-white/10 hover:bg-white/[0.08]'
                                }`}
                              >
                                {participante.asistio ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {participante.asistio ? 'Asistió' : 'Pendiente'}
                              </button>
                            </td>
                            <td className="px-6 py-3.5 border-b border-white/[0.06]">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                  style={{ backgroundColor: palette.bg, color: palette.text }}
                                >
                                  {initials(participante.nombre)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-100 truncate">{participante.nombre}</div>
                                  <div className="text-xs text-gray-500">
                                    {participante.sexo}{participante.ciudad ? ` · ${participante.ciudad}` : ''}
                                  </div>
                                  {tieneCondicion(participante) && (
                                    <div
                                      className="text-xs text-red-300 truncate max-w-[260px]"
                                      title={participante.condiciones_salud}
                                    >
                                      Salud: {participante.condiciones_salud}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 border-b border-white/[0.06]">
                              <span className="font-mono text-sm font-medium text-[#8FA0FF]">
                                {participante.numero_asignado}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 border-b border-white/[0.06] text-gray-300 text-sm">
                              {participante.sector_profesional}
                            </td>
                            <td className="px-6 py-3.5 border-b border-white/[0.06] text-sm">
                              <div className="font-mono text-gray-300">{participante.telefono}</div>
                              {participante.telefono_emergencia && (
                                <div className="text-xs text-gray-500">
                                  Emerg.: <span className="font-mono">{participante.telefono_emergencia}</span>
                                </div>
                              )}
                              {participante.correo && (
                                <div className="text-xs text-gray-500 truncate max-w-[220px]" title={participante.correo}>
                                  {participante.correo}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3.5 border-b border-white/[0.06]">
                              <div className="flex items-center justify-end gap-2">
                                <PdfButton
                                  participante={participante}
                                  downloadingId={downloadingId}
                                  onDownload={handleDownloadPdf}
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleExpanded(participante.id)}
                                  aria-expanded={isExpanded}
                                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
                                >
                                  {isExpanded ? 'Ocultar' : 'Ver todo'}
                                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-white/[0.03]">
                              <td colSpan="6" className="px-6 pb-5 pt-1 border-b border-white/[0.06]">
                                <ParticipantDetails participante={participante} />
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile/Tablet - Cards */}
              <div className="lg:hidden divide-y divide-white/[0.06]">
                {filteredParticipantes.length === 0 && isGlobalSearch && !globalSearching ? (
                  <div className="p-8 text-center">
                    <Search className="w-9 h-9 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-300 mb-1">Sin resultados</h3>
                    <p className="text-sm text-gray-500 mb-4">Nadie coincide con "{searchTerm}"</p>
                    <button
                      onClick={clearSearch}
                      className="px-4 py-2 bg-[#4F63D2] hover:bg-[#5A70E8] text-white rounded-lg text-sm"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                ) : filteredParticipantes.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-9 h-9 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-300">No hay participantes en esta página</h3>
                  </div>
                ) : (
                  filteredParticipantes.map((participante) => {
                    const palette = avatarPalette(participante.sexo);
                    const isExpanded = expandedId === participante.id;
                    return (
                      <div key={participante.id} className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: palette.bg, color: palette.text }}
                          >
                            {initials(participante.nombre)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h3 className="font-medium text-gray-100 text-sm truncate">{participante.nombre}</h3>
                              <span className="font-mono text-xs font-medium text-[#8FA0FF] flex-shrink-0">
                                #{participante.numero_asignado}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 truncate mb-2">
                              {participante.sector_profesional} · {participante.telefono}
                              {participante.ciudad ? ` · ${participante.ciudad}` : ''}
                            </p>
                            {tieneCondicion(participante) && (
                              <p className="text-xs text-red-300 truncate mb-2" title={participante.condiciones_salud}>
                                Salud: {participante.condiciones_salud}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => toggleAsistencia(participante.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                  participante.asistio
                                    ? 'bg-[#3DDC97]/15 text-[#3DDC97] border-[#3DDC97]/30'
                                    : 'bg-white/[0.04] text-gray-400 border-white/10'
                                }`}
                              >
                                {participante.asistio ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {participante.asistio ? 'Asistió' : 'Pendiente'}
                              </button>
                              <PdfButton
                                participante={participante}
                                downloadingId={downloadingId}
                                onDownload={handleDownloadPdf}
                                compact
                              />
                              <button
                                type="button"
                                onClick={() => toggleExpanded(participante.id)}
                                aria-expanded={isExpanded}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
                              >
                                {isExpanded ? 'Ocultar' : 'Ver todo'}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-3">
                            <ParticipantDetails participante={participante} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Paginación */}
              {!isGlobalSearch && (
                <div className="p-3 sm:p-4 lg:p-5 bg-white/[0.02] border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                      {currentPage * itemsPerPage + 1}-{currentPage * itemsPerPage + participantes.length} de {totalParticipantes}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-3 sm:px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 rounded-lg disabled:opacity-40 transition-colors flex items-center text-sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>
                      <span className="px-3 sm:px-4 py-2 text-gray-300 font-medium text-sm tabular-nums">
                        {currentPage + 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={(currentPage + 1) * itemsPerPage >= totalParticipantes}
                        className="px-3 sm:px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 rounded-lg disabled:opacity-40 transition-colors flex items-center text-sm"
                      >
                        <span className="hidden sm:inline">Siguiente</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;