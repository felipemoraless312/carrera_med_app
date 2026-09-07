import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAttendance } from '../hooks/useApi';

const AttendanceView = ({ onBack }) => {
  const [filteredParticipantes, setFilteredParticipantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [globalSearching, setGlobalSearching] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
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
    const participante = participantes.find(p => p.id === id);
    if (!participante) return;

    const nuevoEstado = !participante.asistio;

    try {
      await updateAsistencia(id, nuevoEstado);
      setFilteredParticipantes(prev => prev.map(p =>
        p.id === id ? { ...p, asistio: nuevoEstado } : p
      ));
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
    }
  };

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

    // Solo hacer búsqueda global si el término de búsqueda actual coincide
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
      // ✅ USAR EL ENDPOINT DE BÚSQUEDA DE TU API con limit alto para obtener TODOS los resultados
      const searchUrl = `/api/participantes?search=${encodeURIComponent(searchValue)}&limit=10000&offset=0`;
      
      // Actualizar debug con URL completa
      setDebugInfo(prev => ({ 
        ...prev,
        apiCalls: [{
          ...prev.apiCalls[0],
          url: searchUrl,
          status: 'enviando petición...'
        }]
      }));

      const response = await fetch(searchUrl);
      
      // Debug: información de respuesta
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
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Respuesta no es JSON. Content-Type: ${contentType}`);
        }

        const data = await response.json();
        const searchResults = data.participantes || [];
        
        // Actualizar debug: búsqueda completada
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

        // ✅ Los resultados ya vienen filtrados desde la API, no necesitamos filtrar en el cliente
        if (searchValue === searchTerm) {
          setFilteredParticipantes(searchResults);
        }
        
      } else {
        // Intentar leer la respuesta como texto para debug
        let errorText = 'Error desconocido';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `No se pudo leer respuesta: ${e.message}`;
        }
        
        // Si falla la búsqueda, hacer fallback al método anterior (obtener todo y filtrar)
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
        
        // Fallback: obtener todos los datos y filtrar localmente
        await performFallbackSearch(searchValue, startTime);
      }

    } catch (error) {
      // Debug mejorado para errores
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
      
      // Fallback en caso de error
      await performFallbackSearch(searchValue, startTime);
    } finally {
      setGlobalSearching(false);
    }
  };

  // Método fallback: obtener todos los datos y filtrar localmente (como antes)
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
        // Verificar content-type también en fallback
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Fallback: Respuesta no es JSON. Content-Type: ${contentType}`);
        }

        const data = await response.json();
        let allResults = data.participantes || [];
        
        // Si necesita más páginas para obtener todos los datos
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
        
        // Filtrar localmente
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

  // Manejar cambios en el campo de búsqueda con debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsGlobalSearch(false);
      setFilteredParticipantes(participantes);
      return;
    }

    // SOLO hacer búsqueda global - eliminamos la búsqueda local que causa conflictos
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

  const stats = {
    total: filteredParticipantes.length,
    asistieron: filteredParticipantes.filter(p => p.asistio).length,
    pendientes: filteredParticipantes.filter(p => !p.asistio).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 py-4 sm:py-8 lg:py-20">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header - Responsive */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-blue-900/40 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center w-full sm:w-auto">
              <button
                onClick={onBack}
                className="mr-3 sm:mr-4 p-2 bg-blue-800 hover:bg-blue-700 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
              </button>
              <div className="flex items-center flex-1 min-w-0">
                <div className="bg-blue-800 p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl mr-2 sm:mr-3 lg:mr-4 flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-100 truncate">
                    Control de Asistencia
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 truncate">
                    Página {currentPage + 1}
                    <span className="hidden sm:inline"> - {itemsPerPage} por página</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={loadParticipantes}
                disabled={loading}
                className="flex items-center px-3 sm:px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg sm:rounded-xl transition-all duration-300 text-sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
                <span className="sm:hidden">↻</span>
              </button>
              
              <button
                onClick={async () => {
                  console.log('🔧 === DIAGNÓSTICO COMPLETO ===');
                  console.log('📍 Ubicación:', window.location.href);
                  console.log('🌐 Entorno:', {
                    DEV: import.meta.env.DEV,
                    PROD: import.meta.env.PROD,
                    MODE: import.meta.env.MODE
                  });
                  
                  // Test de conectividad básica
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
                    
                    // Pausa entre tests
                    await new Promise(resolve => setTimeout(resolve, 500));
                  }
                  
                  console.log('\n🔧 === DIAGNÓSTICO COMPLETO ===');
                  alert('Diagnóstico completado - revisa la consola del navegador (F12)');
                }}
                className="flex items-center px-2 sm:px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm"
              >
                🔧<span className="hidden sm:inline ml-1">Test</span>
              </button>
            </div>
          </div>

          {/* Estadísticas - Responsive con toggle mobile */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setShowMobileStats(!showMobileStats)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-950/50 rounded-xl border border-blue-800/30"
            >
              <span className="text-sm font-medium text-gray-300">
                Estadísticas {showMobileStats ? '▼' : '▶'}
              </span>
              <div className="flex gap-3 text-xs">
                <span className="text-white font-bold">{stats.total}</span>
                <span className="text-green-400 font-bold">{stats.asistieron}</span>
                <span className="text-yellow-400 font-bold">{stats.pendientes}</span>
              </div>
            </button>
          </div>

          <div className={`grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 ${showMobileStats ? 'block' : 'hidden'} sm:grid sm:grid-cols-3`}>
            <div className="bg-blue-950/50 rounded-xl p-4 sm:p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">Total</h3>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="bg-blue-950/50 rounded-xl p-4 sm:p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">Asistieron</h3>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-400">{stats.asistieron}</div>
            </div>

            <div className="bg-blue-950/50 rounded-xl p-4 sm:p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">Pendientes</h3>
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{stats.pendientes}</div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border-2 border-red-400 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 lg:mb-8">
            <p className="text-sm sm:text-base text-red-100 font-medium">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Búsqueda y acciones - Responsive */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 lg:p-6 border border-blue-900/40 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                globalSearching ? 'text-blue-400 animate-pulse' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder={
                  globalSearching 
                    ? "Buscando en toda la base de datos..." 
                    : isGlobalSearch 
                      ? "Resultados globales - Edite para buscar nuevamente" 
                      : "Buscar por nombre, número o teléfono en toda la base de datos..."
                }
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-16 sm:pr-20 py-2 sm:py-3 bg-blue-950/60 border rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  isGlobalSearch 
                    ? 'border-blue-500 focus:border-blue-400 focus:ring-blue-500/20' 
                    : 'border-blue-800/40 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
                disabled={globalSearching}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              {isGlobalSearch && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Global
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleMarcarTodos(true)}
                disabled={saving || filteredParticipantes.length === 0}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-colors font-medium flex items-center justify-center text-sm"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                    <span className="hidden sm:inline">Guardando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Marcar Todos</span>
                    <span className="sm:hidden">✓ Todos</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleMarcarTodos(false)}
                disabled={saving || filteredParticipantes.length === 0}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-colors font-medium flex items-center justify-center text-sm"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                    <span className="hidden sm:inline">Guardando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Desmarcar Todos</span>
                    <span className="sm:hidden">✗ Todos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de participantes - Responsive */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-900/40 overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-4 animate-spin text-blue-400" />
              <p className="text-sm sm:text-base text-gray-400">Cargando participantes...</p>
            </div>
          ) : (
            <>
              {/* Vista Desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-950/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                        Asistencia
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                        Número
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                        Sexo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                        Profesión
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                        Teléfono
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipantes.length === 0 && isGlobalSearch && !globalSearching ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Search className="w-12 h-12 text-gray-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-300 mb-2">
                              No se encontraron resultados
                            </h3>
                            <p className="text-gray-400 mb-4">
                              No hay participantes que coincidan con "{searchTerm}"
                            </p>
                            <button
                              onClick={clearSearch}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Limpiar búsqueda
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredParticipantes.map((participante, index) => (
                        <tr
                          key={participante.id}
                          className={`hover:bg-blue-950/50 transition-colors ${index % 2 === 0 ? 'bg-blue-950/20' : ''}`}
                        >
                          <td className="px-6 py-4 border-b border-blue-800/20">
                            <button
                              onClick={() => toggleAsistencia(participante.id)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                participante.asistio
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-gray-600 hover:bg-gray-700'
                              }`}
                            >
                              {participante.asistio ? (
                                <CheckCircle className="w-6 h-6 text-white" />
                              ) : (
                                <XCircle className="w-6 h-6 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 border-b border-blue-800/20">
                            <div className="font-mono text-lg font-bold text-blue-400">
                              {participante.numero_asignado}
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-blue-800/20">
                            <div className="font-semibold text-gray-100">
                              {participante.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-blue-800/20">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              participante.sexo === 'Masculino'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-pink-500/20 text-pink-300'
                            }`}>
                              {participante.sexo}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-b border-blue-800/20 text-gray-300">
                            {participante.sector_profesional}
                          </td>
                          <td className="px-6 py-4 border-b border-blue-800/20 font-mono text-gray-300">
                            {participante.telefono}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile/Tablet - Cards */}
              <div className="lg:hidden divide-y divide-blue-800/20">
                {filteredParticipantes.length === 0 && isGlobalSearch && !globalSearching ? (
                  <div className="p-8 text-center">
                    <Search className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-300 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm">
                      No hay participantes que coincidan con "{searchTerm}"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                ) : filteredParticipantes.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-300">
                      No hay participantes en esta página
                    </h3>
                  </div>
                ) : (
                  filteredParticipantes.map((participante) => (
                    <div
                      key={participante.id}
                      className="p-3 sm:p-4 bg-blue-950/20 hover:bg-blue-950/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleAsistencia(participante.id)}
                          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all ${
                            participante.asistio
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {participante.asistio ? (
                            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          ) : (
                            <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-100 text-sm sm:text-base truncate">
                              {participante.nombre}
                            </h3>
                            <span className="font-mono text-sm sm:text-base font-bold text-blue-400 flex-shrink-0">
                              #{participante.numero_asignado}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-400">Sexo:</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                participante.sexo === 'Masculino'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-pink-500/20 text-pink-300'
                              }`}>
                                {participante.sexo}
                              </span>
                            </div>
                            <div className="text-gray-300 truncate">
                              <span className="text-gray-400">Tel:</span>
                              <span className="ml-2 font-mono">{participante.telefono}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs sm:text-sm text-gray-300 truncate">
                            <span className="text-gray-400">Profesión:</span>
                            <span className="ml-2">{participante.sector_profesional}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Paginación - Responsive */}
              {!isGlobalSearch && (
                <div className="p-3 sm:p-4 lg:p-6 bg-blue-950/30 border-t border-blue-800/40">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                      <span className="hidden sm:inline">
                        Mostrando {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + participantes.length} de {totalParticipantes}
                      </span>
                      <span className="sm:hidden">
                        {currentPage * itemsPerPage + 1}-{currentPage * itemsPerPage + participantes.length} de {totalParticipantes}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-3 sm:px-4 py-2 bg-blue-800 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center text-sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>
                      <span className="px-3 sm:px-4 py-2 text-gray-300 font-medium text-sm">
                        {currentPage + 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={(currentPage + 1) * itemsPerPage >= totalParticipantes}
                        className="px-3 sm:px-4 py-2 bg-blue-800 text-gray-300 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center text-sm"
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
