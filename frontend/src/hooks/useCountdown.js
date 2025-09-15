// src/hooks/useCountdown.js
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar un contador regresivo
 * @param {string} targetDate - Fecha objetivo en formato ISO (ej: '2025-03-17T08:00:00')
 * @returns {Object} Objeto con días, horas, minutos y segundos restantes
 */
export const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return {
          days,
          hours,
          minutes,
          seconds,
          isExpired: false
        };
      } else {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        };
      }
    };

    // Calcular inmediatamente
    setTimeLeft(calculateTimeLeft());

    // Configurar intervalo para actualizar cada segundo
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

export default useCountdown;