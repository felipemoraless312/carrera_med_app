import React, { useState, useEffect, useRef } from 'react';
import { Users, Phone, User, Briefcase, Download, ArrowLeft, CheckCircle, AlertCircle, Loader2, Gift } from 'lucide-react';
import { apiService, downloadUtils } from '../services/api';

const RegistrationForm = ({ onBack, setActiveSection }) => {
  const resultRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre: '',
    sexo: '',
    telefono: '',
    sector_profesional: ''
  });
  const [sectoresSalud, setSectoresSalud] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  // Estado de carga de la imagen mostrada: 'loading' | 'loaded' | 'error'
  const [imageStatus, setImageStatus] = useState('loading');

  // Cargar sectores desde la API
  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const data = await apiService.getSectores();
        setSectoresSalud(data.sectores);
      } catch (error) {
        console.error('Error al cargar sectores:', error);
        // Fallback si no se pueden cargar desde la API
        setSectoresSalud([
          "Medicina General",
          "Enfermería", 
          "Odontología",
          "Fisioterapia",
          "Psicología",
          "Nutrición",
          "Farmacia",
          "Medicina Especializada",
          "Técnico en Salud",
          "Administración en Salud",
          "Otro sector de salud",
          "Área diferente a la salud"
        ]);
      }
    };

    fetchSectores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setRegistrationResult(null);
    setParticipantData(null);

    try {

      // El servicio API ya maneja las validaciones
      const data = await apiService.registrarParticipante(formData);

      // Registro exitoso - USAR LOS DATOS REALES DEL SERVIDOR
      setRegistrationResult({
        type: 'success',
        message: data.message,
        numero: data.numero_asignado
      });
      
      // Guardar datos del participante para mostrar la imagen y descargarla
      setImageStatus(data.imagen_url ? 'loading' : 'error');
      setParticipantData({
        numero: data.numero_asignado,
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        imagen_url: data.imagen_url
      });

      // Limpiar formulario SOLO después del registro exitoso
      setFormData({
        nombre: '',
        sexo: '',
        telefono: '',
        sector_profesional: ''
      });

      // Scroll automático hacia el resultado (inicio del bloque para que se vea la imagen)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error('Error en registro:', error);
      setRegistrationResult({
        type: 'error',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!participantData) {
      console.error('No hay datos del participante');
      return;
    }

    try {
      
      // Usar el servicio API para descargar la imagen
      await downloadUtils.downloadParticipantImage(participantData.numero, participantData.nombre);

    } catch (error) {
      console.error('Error al descargar imagen:', error);
      setRegistrationResult({
        type: 'error',
        message: error.message
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (setActiveSection) {
      setActiveSection('registro');
    }
  };

  // Registro exitoso: se oculta el formulario y solo queda el resultado + botón de regreso
  const isSuccess = registrationResult?.type === 'success' && Boolean(participantData);

  return (
    <div className="min-h-screen bg-blue-950 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-900/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-800 rounded-full mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-100 mb-2">
              Registro de Participante
            </h2>
            <p className="text-gray-300">
              {isSuccess
                ? 'Guarde su imagen y conserve sus datos'
                : 'Complete el formulario para obtener su número de participante'}
            </p>
          </div>

          {/* Resultado del registro */}
          {registrationResult && (
            <div 
              ref={resultRef}
              className={`mb-6 p-4 rounded-2xl border-2 scroll-mt-24 ${
                registrationResult.type === 'success' 
                  ? 'bg-green-900/50 border-green-400 text-green-100' 
                  : 'bg-red-900/50 border-red-400 text-red-100'
              }`}
            >
              <div className="flex items-center">
                {registrationResult.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                )}
                <p className="font-medium">{registrationResult.message}</p>
              </div>
              
              {registrationResult.type === 'success' && participantData && (
                <div className="mt-4 p-4 bg-blue-950/50 rounded-xl">
                  <p className="text-sm text-gray-300 mb-1">Su número de participante:</p>
                  <div className="text-2xl font-black text-blue-400 mb-4 text-center">
                    {participantData.numero}
                  </div>

                  {/* Imagen del participante */}
                  {participantData.imagen_url && imageStatus !== 'error' && (
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
                      No pudimos mostrar la imagen aquí. Use el botón para descargarla.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={downloadImage}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar Número de Participante
                  </button>

                  {imageStatus === 'loaded' && (
                    <p className="mt-2 text-xs text-gray-400 text-center">
                      ¿No se descargó? Mantenga presionada la imagen para guardarla o tome una captura de pantalla.
                    </p>
                  )}

                  {/* Recordatorio de la tómbola */}
                  <div
                    role="note"
                    className="mt-4 flex gap-3 rounded-xl border border-amber-300/40 bg-amber-400/10 p-3"
                  >
                    <div className="text-sm">
                      <p className="font-black text-amber-200 leading-tight">
                        Recuerde sus datos para la tómbola
                      </p>
                      <p className="mt-1 text-gray-300 leading-snug">
                        Sus datos personales se usarán para corroborar y reclamar premios. Registrado como:
                      </p>
                      <p className="mt-1 text-gray-100 font-bold break-words">
                        {participantData.nombre} · {participantData.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulario */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 font-bold">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-blue-950/60 text-gray-100"
                  placeholder="Ingrese su nombre completo"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-bold">
                  <Users className="w-4 h-4 inline mr-2" />
                  Sexo
                </label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-blue-950/60 text-gray-100"
                  disabled={isLoading}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-bold">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Número de teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-blue-950/60 text-gray-100"
                  placeholder="Ejemplo: 9611234567"
                  disabled={isLoading}
                  minLength="10"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-bold">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Sector profesional
                </label>
                <select
                  name="sector_profesional"
                  value={formData.sector_profesional}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-blue-950/60 text-gray-100"
                  disabled={isLoading}
                  required
                >
                  <option value="">Seleccionar</option>
                  {sectoresSalud.map((sector, index) => (
                    <option key={index} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Información importante */}
              <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-800/30">
                <h4 className="font-bold text-gray-200 mb-2">Información importante:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Use sus datos personales reales: su nombre y número de celular son necesarios para reclamar premios en la tómbola</li>
                  <li>• Solo se permite un registro por número de teléfono</li>
                  <li>• Conserve su número de participante y el teléfono con el que se registró para el día de la carrera</li>
                </ul>
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
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
                      Registrando...
                    </>
                  ) : (
                    'Registrarse'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Regresar al apartado de registro tras el registro exitoso */}
          {isSuccess && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al registro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;