// Función para obtener la URL de la API de manera segura
const getApiUrl = () => {
  console.log('🔍 getApiUrl Debug:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_URL_defined: import.meta.env.VITE_API_URL !== undefined,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  });
  
  // Si VITE_API_URL está definida (incluso si está vacía)
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl !== undefined) {
    console.log('📍 Using VITE_API_URL:', apiUrl === '' ? 'EMPTY (proxy mode)' : apiUrl);
    return apiUrl; // Si está vacía (''), usar proxy
  }
  
  // Fallback: siempre usar proxy (rutas relativas)
  console.log('📍 Using fallback: proxy mode');
  return '';
};

const API_CONFIG = {
  BASE_URL: getApiUrl(),
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000
};

// Función para construir URLs de API correctamente
const buildApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL;
  let finalUrl;
  
  // Si BASE_URL está vacío (modo proxy), asegurar que empiece con /api/
  if (!baseUrl || baseUrl === '') {
    finalUrl = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint}`;
  } else {
    // Si BASE_URL tiene valor, concatenar normalmente
    finalUrl = `${baseUrl}${endpoint}`;
  }
  
  // Debug logging para URLs
  if (import.meta.env.VITE_DEBUG_API === 'true') {
    console.log('🔗 buildApiUrl:', {
      input_endpoint: endpoint,
      base_url: baseUrl,
      final_url: finalUrl,
      is_proxy_mode: !baseUrl || baseUrl === ''
    });
  }
  
  return finalUrl;
};

// Debug logging
if (import.meta.env.VITE_DEBUG_API === 'true') {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    BASE_URL_type: typeof API_CONFIG.BASE_URL,
    BASE_URL_length: API_CONFIG.BASE_URL.length,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_URL_type: typeof import.meta.env.VITE_API_URL,
    window_location: typeof window !== 'undefined' ? window.location.href : 'N/A'
  });
}

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
  
  // Debug logging detallado
  if (import.meta.env.VITE_DEBUG_API === 'true') {
    console.log('🌐 Fetching:', {
      url,
      BASE_URL_used: API_CONFIG.BASE_URL,
      final_url: url,
      method: options.method || 'GET',
      headers: { ...API_CONFIG.DEFAULT_HEADERS, ...options.headers },
      timeout: API_CONFIG.TIMEOUT,
      is_relative: !url.startsWith('http'),
      url_analysis: {
        starts_with_http: url.startsWith('http'),
        starts_with_https: url.startsWith('https'),
        starts_with_slash: url.startsWith('/'),
        contains_52: url.includes('52.14.168.116')
      }
    });
  }
  
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
    
    // Debug logging de respuesta
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      console.log('📥 Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Debug logging de errores
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      console.error('💥 Fetch Error:', {
        url,
        error: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    if (error.name === 'AbortError') {
      throw new Error('La petición ha tardado demasiado. Verifique su conexión a internet.');
    }
    
    throw error;
  }
};
export const apiService = {
  async healthCheck() {
    try {
      const response = await fetchWithTimeout(buildApiUrl('/api/health'));
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error en health check:', error);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión.');
    }
  },

  async getStatus() {
    try {
      const response = await fetchWithTimeout(buildApiUrl('/api/status'));
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener status:', error);
      throw new Error('Error al obtener el estado de los registros.');
    }
  },

  async getSectores() {
    try {
      const response = await fetchWithTimeout(buildApiUrl('/api/sectores'));
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

      const response = await fetchWithTimeout(buildApiUrl('/api/registro'), {
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

      const imageUrl = buildApiUrl(`/api/imagen/${numeroParticipante}?nombre=${encodeURIComponent(nombreParticipante)}`);
      
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
  async getParticipantes(limit = 100, offset = 0, search = null) {
    try {
      let endpoint = `/api/participantes?limit=${limit}&offset=${offset}`;
      if (search && search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await fetchWithTimeout(buildApiUrl(endpoint));
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener participantes:', error);
      throw new Error('Error al obtener la lista de participantes.');
    }
  },

  async getTotalParticipantes() {
    try {
      const response = await fetchWithTimeout(buildApiUrl('/api/total_participantes'));
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener el total de participantes:', error);
      throw new Error('Error al obtener el total de participantes.');
    }
  },

  // Buscar participante por diferentes criterios
  async buscarParticipante(tipo, valor) {
    try {
      if (!tipo || !valor?.trim()) {
        throw new Error('Tipo de búsqueda y valor son requeridos');
      }

      const response = await fetchWithTimeout(
        buildApiUrl(`/api/participantes/buscar?tipo=${tipo}&valor=${encodeURIComponent(valor.trim())}`)
      );

      if (response.status === 404) {
        return { error: 'Participante no encontrado' };
      }

      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al buscar participante:', error);
      throw new Error('Error al buscar participante.');
    }
  },

  // Actualizar asistencia individual
  async actualizarAsistencia(id, asistio) {
    try {
      const response = await fetchWithTimeout(
        buildApiUrl(`/api/participantes/${id}/asistencia`),
        {
          method: 'PATCH',
          body: JSON.stringify({ asistio })
        }
      );

      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      throw new Error('Error al actualizar asistencia.');
    }
  },

  // Actualización masiva de asistencia
  async actualizarAsistenciaMasiva(ids, asistio) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Lista de IDs no válida');
      }

      const response = await fetchWithTimeout(
        buildApiUrl('/api/participantes/asistencia/bulk'),
        {
          method: 'PATCH',
          body: JSON.stringify({ ids, asistio })
        }
      );

      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Error en actualización masiva:', error);
      throw new Error('Error en actualización masiva de asistencia.');
    }
  },

  // Búsqueda global en todas las páginas
  async busquedaGlobal(searchTerm) {
    try {
      if (!searchTerm?.trim()) {
        throw new Error('Término de búsqueda requerido');
      }

      // Buscar con límite alto para obtener todos los resultados
      const response = await fetchWithTimeout(
        buildApiUrl(`/api/participantes?limit=5000&search=${encodeURIComponent(searchTerm.trim())}`)
      );

      await handleApiError(response);
      const data = await response.json();
      
      return {
        participantes: data.participantes || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      throw new Error('Error en búsqueda global.');
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
