import React, { useState, useEffect } from 'react';
import { Users, Eye, RefreshCw, Search, Calendar, Phone, Briefcase, Hash, ArrowLeft } from 'lucide-react';

const AdminDashboard = ({ onBack, setActiveSection }) => {
  const [participantes, setParticipantes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    limite_maximo: 2000,
    puede_registrar: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch estadísticas
      const statusResponse = await fetch('/api/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setEstadisticas(statusData);
      }

      // Fetch participantes
      const participantesResponse = await fetch(`/api/participantes?limit=${itemsPerPage}&offset=${currentPage * itemsPerPage}`);
      if (participantesResponse.ok) {
        const participantesData = await participantesResponse.json();
        setParticipantes(participantesData.participantes || []);
      } else {
        throw new Error('No se pudieron cargar los participantes');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (setActiveSection) {
      setActiveSection('inicio');
    }
  };

  const filteredParticipantes = participantes.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sector_profesional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.numero_asignado.includes(searchTerm)
  );

  const totalPages = Math.ceil(estadisticas.total / itemsPerPage);

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPercentage = () => {
    return ((estadisticas.total / estadisticas.limite_maximo) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-blue-950 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-900/40 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 bg-blue-800 hover:bg-blue-700 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-blue-300" />
              </button>
              <div className="flex items-center">
                <div className="bg-blue-800 p-4 rounded-2xl mr-4">
                  <Eye className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-100">Vista de Administración</h1>
                  <p className="text-gray-300">Participantes registrados en la Carrera del Médico 2025</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-950/50 rounded-xl p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Registrados</h3>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{estadisticas.total}</div>
              <div className="text-sm text-gray-400">de {estadisticas.limite_maximo} máximo</div>
            </div>

            <div className="bg-blue-950/50 rounded-xl p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Porcentaje</h3>
                <Hash className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{getPercentage()}%</div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${getPercentage()}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-blue-950/50 rounded-xl p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Cupos Restantes</h3>
                <Users className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">{estadisticas.limite_maximo - estadisticas.total}</div>
              <div className="text-sm text-gray-400">cupos disponibles</div>
            </div>

            <div className="bg-blue-950/50 rounded-xl p-6 border border-blue-800/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Estado</h3>
                <div className={`w-3 h-3 rounded-full ${estadisticas.puede_registrar ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </div>
              <div className={`text-lg font-bold ${estadisticas.puede_registrar ? 'text-green-400' : 'text-red-400'}`}>
                {estadisticas.puede_registrar ? 'Abierto' : 'Cerrado'}
              </div>
              <div className="text-sm text-gray-400">
                {estadisticas.puede_registrar ? 'Aceptando registros' : 'Límite alcanzado'}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-blue-900/40 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, profesión o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-950/60 border border-blue-800/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-900/50 border border-red-400 text-red-100 p-4 rounded-xl mb-8">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Lista de participantes */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-900/40 overflow-hidden">
          <div className="p-6 border-b border-blue-800/40">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Lista de Participantes ({filteredParticipantes.length})
            </h2>
            <p className="text-gray-400">
              Página {currentPage + 1} de {Math.max(1, totalPages)}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-400" />
              <p className="text-gray-400">Cargando participantes...</p>
            </div>
          ) : filteredParticipantes.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">No se encontraron participantes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-950/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 mr-2" />
                        Número
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Nombre
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                      Sexo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Profesión
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Teléfono
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-blue-800/40">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Fecha Registro
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipantes.map((participante, index) => (
                    <tr 
                      key={participante.id} 
                      className={`hover:bg-blue-950/50 transition-colors ${index % 2 === 0 ? 'bg-blue-950/20' : ''}`}
                    >
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
                      <td className="px-6 py-4 border-b border-blue-800/20 text-gray-400 text-sm">
                        {formatFecha(participante.fecha_registro)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="p-6 bg-blue-950/30 border-t border-blue-800/40">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Mostrando {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, estadisticas.total)} de {estadisticas.total}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-2 bg-blue-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-2 text-gray-300">
                    {currentPage + 1} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 bg-blue-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;