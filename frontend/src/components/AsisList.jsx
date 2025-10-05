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

  // Filtrar participantes solo en la página actual (búsqueda local)
  useEffect(() => {
    if (!isGlobalSearch) {
      if (searchTerm.trim() === '') {
        setFilteredParticipantes(participantes);
      } else {
        const filtered = participantes.filter(p =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.numero_asignado.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.telefono.includes(searchTerm)
        );
        setFilteredParticipantes(filtered);
      }
    }
  }, [searchTerm, participantes, isGlobalSearch]);

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

  // Búsqueda global en toda la base de datos
  const performGlobalSearch = async (searchValue) => {
    if (!searchValue.trim()) {
      setIsGlobalSearch(false);
      return;
    }

    setGlobalSearching(true);
    setIsGlobalSearch(true);

    try {
      // Intentar búsqueda por número primero
      let searchType = 'nombre';
      if (/^P?\d+$/i.test(searchValue.trim())) {
        searchType = 'numero';
      } else if (/^\d{10}$/.test(searchValue.trim().replace(/\D/g, ''))) {
        searchType = 'telefono';
      }

      const response = await fetch(`/api/participantes/buscar?tipo=${searchType}&valor=${encodeURIComponent(searchValue.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.participante) {
          // Si encontramos un participante específico, lo mostramos
          setFilteredParticipantes([data.participante]);
        } else {
          setFilteredParticipantes([]);
        }
      } else if (response.status === 404) {
        // Si no lo encuentra por el tipo específico, buscar por nombre
        if (searchType !== 'nombre') {
          const nameResponse = await fetch(`/api/participantes/buscar?tipo=nombre&valor=${encodeURIComponent(searchValue.trim())}`);
          if (nameResponse.ok) {
            const nameData = await nameResponse.json();
            if (nameData.participante) {
              setFilteredParticipantes([nameData.participante]);
            } else {
              setFilteredParticipantes([]);
            }
          } else {
            setFilteredParticipantes([]);
          }
        } else {
          setFilteredParticipantes([]);
        }
      } else {
        throw new Error('Error en la búsqueda');
      }
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      setFilteredParticipantes([]);
    } finally {
      setGlobalSearching(false);
    }
  };

  // Manejar cambios en el campo de búsqueda con debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsGlobalSearch(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performGlobalSearch(searchTerm);
    }, 800); // Debounce de 800ms para búsqueda global

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
        {isGlobalSearch && (
          <div className="bg-blue-800/50 border-2 border-blue-600 rounded-2xl p-4 mb-8">
            <div className="flex items-center">
              <Search className="w-5 h-5 text-blue-300 mr-2" />
              <div>
                <p className="text-blue-100 font-medium">
                  {globalSearching ? 'Buscando en toda la base de datos...' : 
                   filteredParticipantes.length > 0 ? 
                   `Se encontr${filteredParticipantes.length === 1 ? 'ó' : 'aron'} ${filteredParticipantes.length} resultado${filteredParticipantes.length === 1 ? '' : 's'} para "${searchTerm}"` :
                   `No se encontraron resultados para "${searchTerm}"`}
                </p>
                <p className="text-blue-300 text-sm">
                  Búsqueda global activa - {globalSearching ? 'Cargando...' : 'Limpie la búsqueda para volver a la vista por páginas'}
                </p>
              </div>
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
                placeholder={isGlobalSearch ? "Búsqueda global activa - Escriba para buscar en toda la base de datos..." : "Buscar en esta página o escribir para buscar globalmente..."}
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