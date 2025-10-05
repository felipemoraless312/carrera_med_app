import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAttendance } from '../hooks/useApi';

const AttendanceView = ({ onBack }) => {
  const [filteredParticipantes, setFilteredParticipantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [globalSearching, setGlobalSearching] = useState(false);
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

  // Cargar datos de participantes
  useEffect(() => {
    loadParticipantes();
  }, [currentPage, fetchParticipantes]);

  const loadParticipantes = async () => {
    try {
      const data = await fetchParticipantes(itemsPerPage, currentPage * itemsPerPage);
      setFilteredParticipantes(data.participantes || []);
    } catch (error) {
      console.error('Error al cargar participantes:', error);
      setFilteredParticipantes([]);
    }
  };

  // Filtrar participantes solo en la página actual cuando NO hay búsqueda
  useEffect(() => {
    if (!searchTerm.trim() && !isGlobalSearch) {
      console.log('🔄 Cargando participantes de página actual:', participantes.length);
      setFilteredParticipantes(participantes);
    }
  }, [participantes, isGlobalSearch, searchTerm]);

  const toggleAsistencia = async (id) => {
    const participante = participantes.find(p => p.id === id);
    if (!participante) return;

    const nuevoEstado = !participante.asistio;

    try {
      await updateAsistencia(id, nuevoEstado);
      
      // Actualizar lista filtrada
      setFilteredParticipantes(prev => prev.map(p =>
        p.id === id ? { ...p, asistio: nuevoEstado } : p
      ));
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
    }
  };

  const handleMarcarTodos = async (estado) => {
    const idsParticipantes = filteredParticipantes.map(p => p.id);
    
    if (idsParticipantes.length === 0) {
      return;
    }

    setSaving(true);

    try {
      await updateAsistenciaMasiva(idsParticipantes, estado);
      
      // Actualizar lista filtrada
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
      const response = await fetch(`/api/participantes?search=${encodeURIComponent(searchValue)}&limit=10000&offset=0`);

      if (response.ok) {
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
        // Si falla la búsqueda, hacer fallback al método anterior (obtener todo y filtrar)
        setDebugInfo(prev => ({ 
          ...prev,
          apiCalls: [{
            ...prev.apiCalls[0],
            status: 'error en búsqueda API, usando fallback',
            error: `HTTP ${response.status}`,
            fallback: true
          }]
        }));
        
        // Fallback: obtener todos los datos y filtrar localmente
        await performFallbackSearch(searchValue, startTime);
      }

    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev,
        apiCalls: [{
          ...prev.apiCalls[0],
          status: 'error en búsqueda API, usando fallback',
          error: error.message,
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

      const response = await fetch(`/api/participantes?limit=${Math.max(10000, totalParticipantes || 5000)}&offset=0`);

      if (response.ok) {
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
  };

  const stats = {
    total: filteredParticipantes.length,
    asistieron: filteredParticipantes.filter(p => p.asistio).length,
    pendientes: filteredParticipantes.filter(p => !p.asistio).length
  };

  return (
    <div className="min-h-screen bg-blue-950 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-900/40 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 bg-blue-800 hover:bg-blue-700 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-blue-300" />
              </button>
              <div className="flex items-center">
                <div className="bg-blue-800 p-4 rounded-2xl mr-4">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-100">Control de Asistencia</h1>
                  <p className="text-gray-300">Página {currentPage + 1} - {itemsPerPage} participantes por página</p>
                </div>
              </div>
            </div>
            <button
              onClick={loadParticipantes}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-950/50 rounded-xl p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total en Página</h3>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="bg-blue-950/50 rounded-xl p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Asistieron</h3>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">{stats.asistieron}</div>
            </div>

            <div className="bg-blue-950/50 rounded-xl p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Pendientes</h3>
                <XCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400">{stats.pendientes}</div>
            </div>
          </div>
        </div>

        {/* Información de búsqueda */}
        {(isGlobalSearch || globalSearching) && (
          <div className="bg-blue-800/50 border-2 border-blue-600 rounded-2xl p-4 mb-8">
            <div className="flex items-center">
              <Search className="w-5 h-5 text-blue-300 mr-2" />
              <div>
                <p className="text-blue-100 font-medium">
                  {globalSearching ? 'Buscando en toda la base de datos...' : 
                   filteredParticipantes.length > 0 ? 
                   `✅ Se encontraron ${filteredParticipantes.length} participante${filteredParticipantes.length === 1 ? '' : 's'} para "${searchTerm}"` :
                   `❌ No se encontraron participantes para "${searchTerm}"`}
                </p>
                <p className="text-blue-300 text-sm">
                  {globalSearching ? 
                    'Buscando en todas las páginas disponibles...' :
                    `Búsqueda global completada - Total en BD: ${totalParticipantes}`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Panel completo sin necesidad de consola */}
        {searchTerm && (
          <div className="bg-gray-800/90 border-2 border-yellow-500 rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
              <h3 className="text-yellow-400 font-bold text-sm">🔍 DEBUG - Búsqueda Global en Tiempo Real</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <h4 className="text-blue-300 font-semibold mb-2">📊 Estado Actual</h4>
                <p className="text-gray-300">• Término: <span className="text-white font-mono">"{searchTerm}"</span></p>
                <p className="text-gray-300">• Estado: {globalSearching ? <span className="text-yellow-300">🔄 Buscando...</span> : isGlobalSearch ? <span className="text-green-300">✅ Completada</span> : <span className="text-orange-300">⏳ Pendiente</span>}</p>
                <p className="text-gray-300">• Resultados mostrados: <span className="text-green-400 font-bold text-lg">{filteredParticipantes.length}</span></p>
                <p className="text-gray-300">• Total en BD: <span className="text-blue-400 font-bold">{totalParticipantes}</span></p>
                {debugInfo.lastSearchTime && (
                  <p className="text-gray-300">• Última búsqueda: <span className="text-purple-400">{debugInfo.lastSearchTime}</span></p>
                )}
                {debugInfo.searchDuration && (
                  <p className="text-gray-300">• Duración: <span className="text-yellow-400">{debugInfo.searchDuration}ms</span></p>
                )}
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-3">
                <h4 className="text-green-300 font-semibold mb-2">✅ Progreso de la Búsqueda</h4>
                {globalSearching ? (
                  <div className="space-y-1">
                    <p className="text-yellow-300">� Obteniendo todos los participantes...</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-gray-400 text-xs">Esto puede tomar unos segundos...</p>
                  </div>
                ) : isGlobalSearch ? (
                  <div className="space-y-1">
                    <p className="text-green-300">✅ Búsqueda completada exitosamente</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                    {filteredParticipantes.length > 0 ? (
                      <p className="text-green-400">🎯 {filteredParticipantes.length} coincidencia{filteredParticipantes.length !== 1 ? 's' : ''} encontrada{filteredParticipantes.length !== 1 ? 's' : ''}</p>
                    ) : (
                      <p className="text-red-400">❌ Sin coincidencias para "{searchTerm}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-orange-300">⏳ Escribiendo término de búsqueda...</p>
                )}
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-3">
                <h4 className="text-purple-300 font-semibold mb-2">📡 Proceso de Búsqueda</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {debugInfo.apiCalls && debugInfo.apiCalls.length > 0 ? debugInfo.apiCalls.map((call, idx) => (
                    <div key={idx} className="text-xs border-l-2 border-gray-600 pl-2 mb-2">
                      <div className="text-gray-400 font-medium">
                        {call.method === 'API_SEARCH_ENDPOINT' && '🔍 Búsqueda Directa API'}
                        {call.method === 'FALLBACK_GET_ALL' && '📥 Fallback: Obtener Todos'}
                        {call.method === 'FALLBACK_LOCAL_FILTER' && '🔄 Fallback: Filtro Local'}
                        {call.method === 'FALLBACK_ERROR' && '❌ Error en Fallback'}
                      </div>
                      
                      {call.status?.includes('iniciando') && <span className="text-yellow-400">🔄 {call.status}</span>}
                      {call.status?.includes('exitoso') && (
                        <div className="text-green-400">
                          ✅ {call.status}
                          {call.received && <span className="ml-1">({call.received} resultados)</span>}
                          {call.searchInDatabase && <div className="text-green-300 text-xs mt-1">🎯 Búsqueda procesada por la base de datos</div>}
                        </div>
                      )}
                      {call.status?.includes('error') && (
                        <div className="text-red-400">
                          ❌ {call.status}
                          {call.error && <div className="text-red-300 text-xs">{call.error}</div>}
                        </div>
                      )}
                      
                      {call.searchTerm && (
                        <div className="text-blue-300 text-xs mt-1">Término: "{call.searchTerm}"</div>
                      )}
                    </div>
                  )) : (
                    <p className="text-gray-500">Escribe algo para iniciar búsqueda...</p>
                  )}
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Método:</span>
                    <span className="text-blue-400 font-medium">
                      {debugInfo.apiCalls?.[0]?.searchInDatabase ? 'Búsqueda en BD' : 
                       debugInfo.apiCalls?.[0]?.method === 'FALLBACK_LOCAL_FILTER' ? 'Filtro Local' : 
                       globalSearching ? 'Procesando...' : 'Esperando...'}
                    </span>
                  </div>
                  
                  {debugInfo.isComplete && (
                    <div className="mt-2 p-2 bg-green-900/30 rounded border border-green-600/50">
                      <div className="text-green-300 text-xs font-medium">
                        🎯 Búsqueda Completada
                      </div>
                      <div className="text-green-400 text-xs">
                        {debugInfo.filteredResults} coincidencias de {debugInfo.totalFetched || totalParticipantes} registros
                      </div>
                      {debugInfo.searchDuration && (
                        <div className="text-green-300 text-xs">
                          ⏱️ Tiempo: {debugInfo.searchDuration}ms
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isGlobalSearch && filteredParticipantes.length > 0 && (
              <div className="mt-4 bg-blue-900/30 rounded-lg p-3">
                <h4 className="text-blue-300 font-semibold mb-2">🎯 Primeros Resultados Encontrados:</h4>
                <div className="space-y-1">
                  {filteredParticipantes.slice(0, 5).map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300">{idx + 1}. <span className="text-white font-medium">{p.nombre}</span></span>
                      <span className="text-blue-400 font-mono">#{p.numero_asignado}</span>
                    </div>
                  ))}
                  {filteredParticipantes.length > 5 && (
                    <p className="text-gray-400 text-xs mt-2">... y {filteredParticipantes.length - 5} más</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-gray-600">
              <p className="text-gray-400 text-xs">
                💡 <strong>Cómo funciona:</strong> La búsqueda obtiene TODOS los {totalParticipantes} participantes de la base de datos 
                (puede requerir múltiples peticiones API) y luego filtra localmente por nombre, número o teléfono.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border-2 border-red-400 rounded-2xl p-4 mb-8">
            <p className="text-red-100 font-medium">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-sm"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Búsqueda y acciones */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-blue-900/40 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
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
                className={`w-full pl-10 pr-20 py-3 bg-blue-950/60 border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 ${
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
                  <XCircle className="w-5 h-5" />
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
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium flex items-center"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Marcar Todos'
                )}
              </button>
              <button
                onClick={() => handleMarcarTodos(false)}
                disabled={saving || filteredParticipantes.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium flex items-center"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Desmarcar Todos'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de participantes */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-900/40 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-400" />
              <p className="text-gray-400">Cargando participantes...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-950/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40 w-24">
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

              {/* Paginación - Solo mostrar si no está en búsqueda global */}
              {!isGlobalSearch && (
                <div className="p-6 bg-blue-950/30 border-t border-blue-800/40">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Mostrando {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + participantes.length} de {totalParticipantes} total
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-4 py-2 bg-blue-800 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </button>
                      <span className="px-4 py-2 text-gray-300 font-medium">
                        Página {currentPage + 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={(currentPage + 1) * itemsPerPage >= totalParticipantes}
                        className="px-4 py-2 bg-blue-800 text-gray-300 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        Siguiente
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