import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Hook personalizado para verificar conectividad
export const useApiHealth = () => {
  const [isHealthy, setIsHealthy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiService.healthCheck();
        setIsHealthy(true);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { isHealthy, isLoading };
};

// Hook para verificar el estado de la API
export const useApiStatus = () => {
  const [status, setStatus] = useState({
    isConnected: null,
    totalRegistros: 0,
    puedeRegistrar: true,
    isLoading: true,
    error: null
  });

  const checkStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [healthData, statusData] = await Promise.all([
        apiService.healthCheck(),
        apiService.getStatus()
      ]);

      setStatus({
        isConnected: true,
        totalRegistros: statusData.total_registros,
        puedeRegistrar: statusData.puede_registrar,
        isLoading: false,
        error: null,
        healthData
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        totalRegistros: 0,
        puedeRegistrar: false,
        isLoading: false,
        error: error.message
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return { ...status, refetch: checkStatus };
};

// Hook personalizado para registro
export const useRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const submitRegistration = async (formData) => {
    setIsSubmitting(true);
    setResult(null);
    
    try {
      const response = await apiService.registrarParticipante(formData);
      
      setResult({
        success: true,
        data: response,
        message: response.message
      });
      
      return response;
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    result,
    submitRegistration,
    clearResult: () => setResult(null)
  };
};

// Hook para control de asistencia
export const useAttendance = () => {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalParticipantes, setTotalParticipantes] = useState(0);

  const fetchParticipantes = useCallback(async (limit = 300, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getParticipantes(limit, offset);
      setParticipantes(data.participantes || []);
      setTotalParticipantes(data.total || 0);
      return data;
    } catch (error) {
      setError(error.message);
      setParticipantes([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsistencia = useCallback(async (id, asistio) => {
    try {
      const result = await apiService.actualizarAsistencia(id, asistio);
      
      // Actualizar el estado local
      setParticipantes(prev => 
        prev.map(p => p.id === id ? { ...p, asistio } : p)
      );
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const updateAsistenciaMasiva = useCallback(async (ids, asistio) => {
    try {
      const result = await apiService.actualizarAsistenciaMasiva(ids, asistio);
      
      // Actualizar el estado local
      setParticipantes(prev => 
        prev.map(p => ids.includes(p.id) ? { ...p, asistio } : p)
      );
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  return {
    participantes,
    loading,
    error,
    totalParticipantes,
    fetchParticipantes,
    updateAsistencia,
    updateAsistenciaMasiva,
    clearError: () => setError(null)
  };
};

// Hook para búsqueda de participantes
export const useParticipantSearch = () => {
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const searchParticipant = useCallback(async (tipo, valor) => {
    if (!valor?.trim()) {
      setError('Por favor ingrese un término de búsqueda');
      return;
    }

    setSearching(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.buscarParticipante(tipo, valor);
      
      if (data.error) {
        setError(data.error);
      } else if (data.participante) {
        setResult(data.participante);
      } else {
        setError('No se encontró información del participante.');
      }
    } catch (error) {
      setError(error.message || 'Error al buscar participante. Por favor intente nuevamente.');
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    searching,
    result,
    error,
    searchParticipant,
    clearSearch
  };
};
