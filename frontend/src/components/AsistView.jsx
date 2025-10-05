import React, { useState } from 'react';
import { Search, User, Phone, Briefcase, Calendar, Hash, ArrowLeft, Loader2, UserCheck, UserX } from 'lucide-react';
import { useParticipantSearch } from '../hooks/useApi';

const GeneralSearchView = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('numero'); // numero, nombre, telefono

  const {
    searching,
    result,
    error,
    searchParticipant,
    clearSearch
  } = useParticipantSearch();

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchParticipant(searchType, searchTerm);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    clearSearch();
  };

  return (
    <div className="min-h-screen bg-blue-950 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-900/40 mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="mr-4 p-2 bg-blue-800 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-blue-300" />
            </button>
            <div className="flex items-center">
              <div className="bg-blue-800 p-4 rounded-2xl mr-4">
                <Search className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-100">Consulta General</h1>
                <p className="text-gray-300">Buscar participante en toda la base de datos</p>
              </div>
            </div>
          </div>

          {/* Formulario de búsqueda */}
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Tipo de búsqueda */}
            <div>
              <label className="block text-gray-300 mb-2 font-bold text-sm">
                Buscar por:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSearchType('numero')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    searchType === 'numero'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-950/50 text-gray-300 hover:bg-blue-800'
                  }`}
                >
                  <Hash className="w-4 h-4 inline mr-2" />
                  Número
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('nombre')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    searchType === 'nombre'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-950/50 text-gray-300 hover:bg-blue-800'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('telefono')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    searchType === 'telefono'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-950/50 text-gray-300 hover:bg-blue-800'
                  }`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono
                </button>
              </div>
            </div>

            {/* Campo de búsqueda */}
            <div>
              <label className="block text-gray-300 mb-2 font-bold">
                {searchType === 'numero' && 'Número de participante'}
                {searchType === 'nombre' && 'Nombre del participante'}
                {searchType === 'telefono' && 'Número de teléfono'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    searchType === 'numero' ? 'Ej: P0123' :
                    searchType === 'nombre' ? 'Ej: Juan Pérez' :
                    'Ej: 9611234567'
                  }
                  className="w-full pl-10 pr-4 py-3 bg-blue-950/60 border border-blue-800/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  disabled={searching}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={searching || !searchTerm.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border-2 border-red-400 rounded-2xl p-4 mb-8">
            <p className="text-red-100 font-medium">{error}</p>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-900/40 overflow-hidden animate-fade-in">
            {/* Estado de asistencia */}
            <div className={`p-6 border-b border-blue-800/40 ${
              result.asistio ? 'bg-green-900/30' : 'bg-yellow-900/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {result.asistio ? (
                    <UserCheck className="w-6 h-6 text-green-400 mr-3" />
                  ) : (
                    <UserX className="w-6 h-6 text-yellow-400 mr-3" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {result.asistio ? 'Participante Asistió' : 'Asistencia Pendiente'}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {result.asistio ? 'Este participante fue marcado como presente' : 'Este participante aún no ha sido registrado'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${
                  result.asistio ? 'bg-green-500 text-white' : 'bg-yellow-500 text-gray-900'
                }`}>
                  {result.asistio ? 'PRESENTE' : 'AUSENTE'}
                </div>
              </div>
            </div>

            {/* Información del participante */}
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-100 mb-6">
                Información del Participante
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Número */}
                <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-800/30">
                  <div className="flex items-center mb-2">
                    <Hash className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-400 font-medium">Número de Participante</span>
                  </div>
                  <p className="text-2xl font-black text-blue-400 font-mono">{result.numero_asignado}</p>
                </div>

                {/* Nombre */}
                <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-800/30">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-400 font-medium">Nombre Completo</span>
                  </div>
                  <p className="text-xl font-bold text-gray-100">{result.nombre}</p>
                </div>

                {/* Sexo */}
                <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-800/30">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-400 font-medium">Sexo</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    result.sexo === 'Masculino'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-pink-500/20 text-pink-300'
                  }`}>
                    {result.sexo}
                  </span>
                </div>

                {/* Teléfono */}
                <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-800/30">
                  <div className="flex items-center mb-2">
                    <Phone className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-400 font-medium">Teléfono</span>
                  </div>
                  <p className="text-lg font-bold text-gray-100 font-mono">{result.telefono}</p>
                </div>

                {/* Profesión */}
                <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-800/30 md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Briefcase className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-400 font-medium">Sector Profesional</span>
                  </div>
                  <p className="text-lg font-bold text-gray-100">{result.sector_profesional}</p>
                </div>

                {/* Fecha de registro */}
                <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-800/30 md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-400 font-medium">Fecha de Registro</span>
                  </div>
                  <p className="text-lg font-bold text-gray-100">{formatFecha(result.fecha_registro)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultado */}
        {!result && !error && !searching && (
          <div className="bg-blue-900/50 backdrop-blur-xl rounded-3xl p-12 text-center border border-blue-800/30">
            <Search className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              Realizar una búsqueda
            </h3>
            <p className="text-gray-400">
              Seleccione el tipo de búsqueda e ingrese los datos del participante
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GeneralSearchView;