import React, { useState, useRef } from 'react';
import { Phone, Mail, User, Search, Download, ArrowLeft, CheckCircle, AlertCircle, Loader2, Printer, RotateCcw, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService, downloadUtils } from '../services/api';

const inputClassName = 'w-full px-4 py-3 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-blue-950/60 text-gray-100';

const TIPOS_BUSQUEDA = [
  { id: 'telefono', label: 'Teléfono', icon: Phone, type: 'tel', placeholder: 'Ejemplo: 9611234567', etiqueta: 'Teléfono con el que se registró' },
  { id: 'correo', label: 'Correo', icon: Mail, type: 'email', placeholder: 'Ejemplo: correo@ejemplo.com', etiqueta: 'Correo con el que se registró' },
  { id: 'nombre', label: 'Nombre', icon: User, type: 'text', placeholder: 'Ejemplo: Juan Pérez López', etiqueta: 'Nombre y apellido con los que se registró' }
];

// Tarjeta de un registro encontrado: muestra la imagen y permite descargar el PDF
const ResultadoFolio = ({ participante, mostrarImagen, onVerImagen }) => {
  const [imageStatus, setImageStatus] = useState('loading');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState(null);

  const downloadPdf = async () => {
    setIsGeneratingPdf(true);
    setError(null);
    try {
      await downloadUtils.downloadParticipantPdf(participante.numero_asignado, participante.nombre, {
        ciudad: participante.ciudad
      });
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      setError(err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="p-4 bg-blue-950/50 rounded-xl border border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-black text-gray-100 break-words">{participante.nombre}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {participante.ciudad || 'Sin ciudad'} · Tel. {participante.telefono_oculto}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">Número</p>
          <p className="text-2xl font-black text-blue-400">{participante.numero_asignado}</p>
        </div>
      </div>

      {mostrarImagen ? (
        <div className="relative mt-4">
          {imageStatus === 'loading' && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-300 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando su imagen...
            </div>
          )}
          {imageStatus === 'error' && (
            <p className="text-sm text-amber-200 text-center">
              No pudimos mostrar la imagen aquí. Use el botón para descargar su número en PDF.
            </p>
          )}
          <img
            src={participante.imagen_url}
            alt={`Imagen del participante ${participante.numero_asignado}`}
            onLoad={() => setImageStatus('loaded')}
            onError={() => setImageStatus('error')}
            className={`w-full h-auto rounded-xl border border-white/20 shadow-lg ${
              imageStatus === 'loaded' ? 'block' : 'hidden'
            }`}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={onVerImagen}
          className="mt-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-gray-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors duration-300"
        >
          Ver imagen
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-200">{error}</p>}

      <button
        type="button"
        onClick={downloadPdf}
        disabled={isGeneratingPdf}
        className="mt-3 w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-wait text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Download className="w-5 h-5 mr-2" />
        )}
        {isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF para imprimir'}
      </button>
    </div>
  );
};

const RecuperarFolio = () => {
  const navigate = useNavigate();
  const resultRef = useRef(null);
  const [tipo, setTipo] = useState('telefono');
  const [valor, setValor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultados, setResultados] = useState(null);
  // Números cuya imagen se está mostrando (con un solo resultado se muestra directo)
  const [imagenesVisibles, setImagenesVisibles] = useState([]);

  const tipoActual = TIPOS_BUSQUEDA.find(t => t.id === tipo);

  const cambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setValor('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResultados(null);

    try {
      const data = await apiService.recuperarFolio(tipo, valor);
      setResultados(data.resultados);
      setImagenesVisibles(data.resultados.length === 1 ? [data.resultados[0].numero_asignado] : []);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Error al recuperar folio:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const buscarOtro = () => {
    setResultados(null);
    setError(null);
    setValor('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-blue-950 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-blue-900/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-800 rounded-full mb-4">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-100 mb-2">
              Recupera tu número
            </h2>
            <p className="text-gray-300">
              {resultados
                ? 'Descargue e imprima su número: será su identificador el día de la carrera'
                : '¿Ya se registró y no pudo descargar su número, o lo perdió? Búsquelo con su teléfono, su correo o su nombre.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl border-2 bg-red-900/50 border-red-400 text-red-100 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Resultados */}
          {resultados && (
            <div ref={resultRef} className="mb-6 p-4 rounded-2xl border-2 scroll-mt-24 bg-green-900/50 border-green-400 text-green-100">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 text-green-400" />
                <p className="font-medium">
                  {resultados.length === 1
                    ? '¡Encontramos su registro!'
                    : `Encontramos ${resultados.length} registros. Ubique el suyo por su nombre y los últimos dígitos de su teléfono.`}
                </p>
              </div>

              <div className="space-y-4">
                {resultados.map(participante => (
                  <ResultadoFolio
                    key={participante.numero_asignado}
                    participante={participante}
                    mostrarImagen={imagenesVisibles.includes(participante.numero_asignado)}
                    onVerImagen={() => setImagenesVisibles(prev => [...prev, participante.numero_asignado])}
                  />
                ))}
              </div>

              <div role="note" className="mt-4 flex gap-3 rounded-xl border border-green-300/40 bg-green-400/10 p-3">
                <Printer className="w-5 h-5 flex-shrink-0 text-green-300" aria-hidden="true" />
                <p className="text-sm text-gray-300 leading-snug">
                  Imprima su PDF en hoja tamaño carta y llévelo al frente de su playera, sujeto con broches, el día de la carrera.
                </p>
              </div>

              <button
                type="button"
                onClick={buscarOtro}
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Hacer otra búsqueda
              </button>
            </div>
          )}

          {/* Formulario */}
          {!resultados && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="block text-gray-300 mb-2 font-bold">Buscar por:</p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Buscar por">
                  {TIPOS_BUSQUEDA.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={tipo === id}
                      onClick={() => cambiarTipo(id)}
                      disabled={isLoading}
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-300 ${
                        tipo === id
                          ? 'bg-blue-700 border-blue-400 text-white'
                          : 'bg-blue-950/60 border-blue-900/40 text-gray-300 hover:bg-blue-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="valor-busqueda" className="block text-gray-300 mb-2 font-bold">
                  <tipoActual.icon className="w-4 h-4 inline mr-2" />
                  {tipoActual.etiqueta}
                </label>
                <input
                  id="valor-busqueda"
                  type={tipoActual.type}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className={inputClassName}
                  placeholder={tipoActual.placeholder}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-800/30">
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Si hizo varios registros con el mismo correo, al buscar por correo le aparecerán todos.</li>
                  <li>• Por nombre, escriba al menos su nombre y un apellido.</li>
                  <li>• Si no encuentra su registro, comuníquese con el comité organizador.</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/registro')}
                  className="flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold transition-all duration-300"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Regresar
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    'Buscar mi número'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecuperarFolio;
