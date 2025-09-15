import React, { useState } from 'react';
import { Users, Phone, User, Briefcase, Download, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const SECTORES_SALUD = [
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
];

const RegistrationForm = ({ onBack, setActiveSection }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    sexo: '',
    telefono: '',
    sector_profesional: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setRegistrationResult({
        type: 'error',
        message: 'El nombre es obligatorio'
      });
      return;
    }

    if (!formData.sexo) {
      setRegistrationResult({
        type: 'error',
        message: 'Debe seleccionar un sexo'
      });
      return;
    }

    if (!formData.telefono.trim() || formData.telefono.length < 10) {
      setRegistrationResult({
        type: 'error',
        message: 'El teléfono debe tener al menos 10 dígitos'
      });
      return;
    }

    if (!formData.sector_profesional) {
      setRegistrationResult({
        type: 'error',
        message: 'Debe seleccionar un sector profesional'
      });
      return;
    }

    setIsLoading(true);
    setRegistrationResult(null);

    try {
      // Simulación de registro exitoso para demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const numeroAsignado = Math.floor(Math.random() * 2000) + 1;
      
      setRegistrationResult({
        type: 'success',
        message: '¡Registro exitoso! Su número de participante ha sido asignado.',
        numero: numeroAsignado.toString().padStart(4, '0')
      });
      
      // Simular imagen disponible
      setImageUrl(`data:image/svg+xml;base64,${btoa(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="200" fill="#1e40af"/>
          <text x="150" y="60" text-anchor="middle" fill="white" font-size="16" font-weight="bold">XXXII Carrera del Médico</text>
          <text x="150" y="90" text-anchor="middle" fill="white" font-size="14">Participante</text>
          <text x="150" y="130" text-anchor="middle" fill="#fbbf24" font-size="36" font-weight="bold">${numeroAsignado.toString().padStart(4, '0')}</text>
          <text x="150" y="160" text-anchor="middle" fill="white" font-size="12">${formData.nombre}</text>
          <text x="150" y="180" text-anchor="middle" fill="white" font-size="10">18 de Octubre, 2025</text>
        </svg>
      `)}`);

      // Limpiar formulario
      setFormData({
        nombre: '',
        sexo: '',
        telefono: '',
        sector_profesional: ''
      });
    } catch (error) {
      setRegistrationResult({
        type: 'error',
        message: 'Error de conexión. Intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `participante_${registrationResult.numero}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (setActiveSection) {
      setActiveSection('registro');
    }
  };

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
              Complete el formulario para obtener su número de participante
            </p>
          </div>

          {/* Resultado del registro */}
          {registrationResult && (
            <div className={`mb-6 p-4 rounded-2xl border-2 ${
              registrationResult.type === 'success' 
                ? 'bg-green-900/50 border-green-400 text-green-100' 
                : 'bg-red-900/50 border-red-400 text-red-100'
            }`}>
              <div className="flex items-center">
                {registrationResult.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                )}
                <p className="font-medium">{registrationResult.message}</p>
              </div>
              
              {registrationResult.type === 'success' && imageUrl && (
                <div className="mt-4 p-4 bg-blue-950/50 rounded-xl">
                  <p className="text-sm text-gray-300 mb-3">Su número de participante:</p>
                  <div className="text-2xl font-black text-blue-400 mb-4 text-center">
                    {registrationResult.numero}
                  </div>
                  <button
                    onClick={downloadImage}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar Número de Participante
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Formulario */}
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
              >
                <option value="">Seleccionar</option>
                {SECTORES_SALUD.map((sector, index) => (
                  <option key={index} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* Información importante */}
            <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-800/30">
              <h4 className="font-bold text-gray-200 mb-2">Información importante:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Solo se permite un registro por número de teléfono</li>
                <li>• Límite máximo: 2000 participantes</li>
                <li>• Conserve su número para el día de la carrera</li>
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
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;