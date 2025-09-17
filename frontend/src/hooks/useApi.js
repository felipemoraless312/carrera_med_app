import { useState, useEffect } from 'react';
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
