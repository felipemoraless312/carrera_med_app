import React, { useState, useRef } from 'react';
import { Phone, Mail, Search, Download, ArrowLeft, CheckCircle, AlertCircle, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService, downloadUtils } from '../services/api';

const inputClassName = 'w-full px-4 py-3 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-blue-950/60 text-gray-100';

const RecuperarFolio = () => {
  const navigate = useNavigate();
  const resultRef = useRef(null);
  const [formData, setFormData] = useState({ telefono: '', correo: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  // Estado de carga de la imagen mostrada: 'loading' | 'loaded' | 'error'
  const [imageStatus, setImageStatus] = useState('loading');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setParticipantData(null);

    try {
      const data = await apiService.recuperarFolio(formData.telefono, formData.correo);
      setImageStatus('loading');
      setParticipantData({ ...data, numero: data.numero_asignado });

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

  const downloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadUtils.downloadParticipantPdf(participantData.numero, participantData.nombre, participantData);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      setError(err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Permite buscar otro registro (personas que se registraron varias veces con distintos teléfonos)
  const buscarOtro = () => {
    setParticipantData(null);
    setError(null);
    setFormData({ telefono: '', correo: '' });
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
              {participantData
                ? 'Descargue e imprima su número: será su identificador el día de la carrera'
                : '¿Ya se registró y no pudo descargar su número, o lo perdió? Ingrese el teléfono y el correo con los que se registró.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl border-2 bg-red-900/50 border-red-400 text-red-100 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Resultado */}
          {participantData && (
            <div ref={resultRef} className="mb-6 p-4 rounded-2xl border-2 scroll-mt-24 bg-green-900/50 border-green-400 text-green-100">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                <p className="font-medium">¡Encontramos su registro, {participantData.nombre}!</p>
              </div>

              <div className="mt-4 p-4 bg-blue-950/50 rounded-xl">
                <p className="text-sm text-gray-300 mb-1">Su número de participante:</p>
                <div className="text-2xl font-black text-blue-400 mb-4 text-center">
                  {participantData.numero}
                </div>

                {imageStatus !== 'error' && (
                  <div className="relative mb-4">
                    {imageStatus === 'loading' && (
                      <div className="flex items-center justify-center gap-2 py-16 text-gray-300 text-sm">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Cargando su imagen...
                      </div>
                    )}
                    <img
                      src={participantData.imagen_url}
                      alt={`Imagen del participante ${participantData.numero}`}
                      onLoad={() => setImageStatus('loaded')}
                      onError={() => setImageStatus('error')}
                      className={`w-full h-auto rounded-xl border border-white/20 shadow-lg ${
                        imageStatus === 'loaded' ? 'block' : 'hidden'
                      }`}
                    />
                  </div>
                )}

                {imageStatus === 'error' && (
                  <p className="mb-4 text-sm text-amber-200 text-center">
                    No pudimos mostrar la imagen aquí. Use el botón para descargar su número en PDF.
                  </p>
                )}

                <button
                  type="button"
                  onClick={downloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-wait text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 mr-2" />
                  )}
                  {isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF para imprimir'}
                </button>

                <div role="note" className="mt-4 flex gap-3 rounded-xl border border-green-300/40 bg-green-400/10 p-3">
                  <Printer className="w-5 h-5 flex-shrink-0 text-green-300" aria-hidden="true" />
                  <p className="text-sm text-gray-300 leading-snug">
                    Imprima su PDF en hoja tamaño carta y llévelo al frente de su playera, sujeto con broches, el día de la carrera.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={buscarOtro}
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Buscar otro registro
              </button>
            </div>
          )}

          {/* Formulario */}
          {!participantData && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 font-bold">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono con el que se registró
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ejemplo: 9611234567"
                  disabled={isLoading}
                  minLength="10"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-bold">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Correo electrónico con el que se registró
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ejemplo: correo@ejemplo.com"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-800/30">
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Si hizo varios registros, busque cada uno con su teléfono: cada registro tiene su propio número.</li>
                  <li>• Si no recuerda con qué datos se registró, comuníquese con el comité organizador.</li>
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
