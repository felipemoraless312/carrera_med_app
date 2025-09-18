// Función para obtener la URL de la API de manera segura
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://52.14.168.116:8000';
  }
  
  return 'http://52.14.168.116:8000';
};

const API_CONFIG = {
  BASE_URL: getApiUrl(),
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  TIMEOUT: 30000
};

const handleApiError = async (response) => {
  if (!response.ok) {
    let errorMessage = `Error HTTP: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
    }
    
    throw new Error(errorMessage);
  }
  
  return response;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('La petición ha tardado demasiado. Verifique su conexión a internet.');
    }
    
    throw error;
  }
};
export const apiService = {
  async healthCheck() {
    try {
      const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/health`);
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error en health check:', error);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión.');
    }
  },

  async getStatus() {
    try {
      const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/status`);
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener status:', error);
      throw new Error('Error al obtener el estado de los registros.');
    }
  },

  async getSectores() {
    try {
      const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/sectores`);
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener sectores:', error);
      throw new Error('Error al cargar los sectores profesionales.');
    }
  },

  async registrarParticipante(participanteData) {
    try {
      // Validar datos antes de enviar
      if (!participanteData.nombre?.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      if (!participanteData.sexo) {
        throw new Error('Debe seleccionar un sexo');
      }
      
      if (!participanteData.telefono?.trim() || participanteData.telefono.length < 10) {
        throw new Error('El teléfono debe tener al menos 10 dígitos');
      }
      
      if (!participanteData.sector_profesional) {
        throw new Error('Debe seleccionar un sector profesional');
      }

      const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/registro`, {
        method: 'POST',
        body: JSON.stringify({
          nombre: participanteData.nombre.trim(),
          sexo: participanteData.sexo,
          telefono: participanteData.telefono.trim(),
          sector_profesional: participanteData.sector_profesional
        })
      });

      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Si es un error de validación o del servidor, mantener el mensaje original
      if (error.message.includes('obligatorio') || 
          error.message.includes('seleccionar') || 
          error.message.includes('dígitos') ||
          error.message.includes('Ya existe') ||
          error.message.includes('límite máximo')) {
        throw error;
      }
      
      // Para otros errores, dar un mensaje genérico
      throw new Error('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
    }
  },

  // Descargar imagen del participante
  async descargarImagen(numeroParticipante, nombreParticipante) {
    try {
      if (!numeroParticipante || !nombreParticipante) {
        throw new Error('Número y nombre del participante son requeridos');
      }

      const imageUrl = `${API_CONFIG.BASE_URL}/api/imagen/${numeroParticipante}?nombre=${encodeURIComponent(nombreParticipante)}`;
      
      const response = await fetchWithTimeout(imageUrl);
      await handleApiError(response);
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Imagen vacía recibida del servidor');
      }

      return blob;
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      throw new Error('Error al descargar la imagen. Intente nuevamente.');
    }
  },

  // Obtener lista de participantes (para administración)
  async getParticipantes(limit = 100, offset = 0) {
    try {
      const response = await fetchWithTimeout(
        `${API_CONFIG.BASE_URL}/api/participantes?limit=${limit}&offset=${offset}`
      );
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener participantes:', error);
      throw new Error('Error al obtener la lista de participantes.');
    }
  },

  async getTotalParticipantes() {
    try {
      const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/total_participantes`);
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener el total de participantes:', error);
      throw new Error('Error al obtener el total de participantes.');
    }
  }
};

// Utilidades para manejar la descarga de archivos
export const downloadUtils = {
  // Descargar blob como archivo
  downloadBlob(blob, filename) {
    try {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw new Error('Error al descargar el archivo');
    }
  },

  // Descargar imagen de participante
  async downloadParticipantImage(numeroParticipante, nombreParticipante) {
    try {
      const blob = await apiService.descargarImagen(numeroParticipante, nombreParticipante);
      const filename = `participante_${numeroParticipante}_${nombreParticipante.replace(/\s+/g, '_')}.png`;
      
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error al descargar imagen del participante:', error);
      throw error;
    }
  }
};

// Configuración para diferentes entornos
export const setApiUrl = (url) => {
  API_CONFIG.BASE_URL = url;
};


export default apiService;
