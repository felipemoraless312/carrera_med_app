import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { apiService } from '../services/api';

// Hook para verificar el estado de la API
export const useApiStatus = () => {
  const [status, setStatus] = useState({
    isConnected: null,
    totalRegistros: 0,
    puedeRegistrar: true,
    isLoading: true,
    error: null
  });

  const checkStatus = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { ...status, refetch: checkStatus };
};

// Componente para mostrar el estado de conexión
export const ApiStatusIndicator = ({ className = "" }) => {
  const { isConnected, isLoading, error, totalRegistros, puedeRegistrar } = useApiStatus();

  if (isLoading) {
    return (
      <div className={`flex items-center text-gray-400 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
        <span className="text-sm">Verificando conexión...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center text-red-400 ${className}`}>
        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
        <span className="text-sm">Sin conexión al servidor</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center text-green-400 ${className}`}>
      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
      <span className="text-sm">
        Conectado • {totalRegistros} registros • {puedeRegistrar ? 'Aceptando' : 'Lleno'}
      </span>
    </div>
  );
};

// Context para el estado de la API
export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const apiStatus = useApiStatus();

  return (
    <ApiContext.Provider value={apiStatus}>
      {children}
    </ApiContext.Provider>
  );
};

// Hook para usar el contexto de API
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi debe usarse dentro de ApiProvider');
  }
  return context;
};
