// src/data/raceData.js
export const raceData = {
  // Información del evento
  eventDate: '2025-03-17T08:00:00', // 17 de marzo, 8:00 AM
  location: 'Hospital Central - Plaza de la Salud',
  city: 'Tuxtla Gutiérrez, Chiapas',
  
  // Categorías de la carrera
  categories: [
    { 
      name: '5K Recreativa', 
      description: 'Para toda la familia', 
      price: '$25',
      details: 'Carrera no competitiva ideal para principiantes y familias'
    },
    { 
      name: '10K Competitiva', 
      description: 'Categorías por edad', 
      price: '$35',
      details: 'Carrera competitiva con categorías masculinas y femeninas por grupos de edad'
    },
    { 
      name: '21K Semi Maratón', 
      description: 'Para corredores experimentados', 
      price: '$45',
      details: 'Semi maratón para corredores con experiencia previa'
    }
  ],

  // Horarios del evento
  schedule: [
    { time: '6:00 AM', activity: 'Apertura de registro' },
    { time: '7:00 AM', activity: 'Calentamiento grupal' },
    { time: '8:00 AM', activity: 'Salida oficial' },
    { time: '11:00 AM', activity: 'Premiación' }
  ],

  // Ganadores de ediciones anteriores
  winners: [
    { 
      name: 'Dr. Carlos Mendoza', 
      category: '21K Masculino', 
      year: '2024', 
      time: '1:15:32',
      specialty: 'Cardiología'
    },
    { 
      name: 'Dra. Ana Rodríguez', 
      category: '21K Femenino', 
      year: '2024', 
      time: '1:22:18',
      specialty: 'Pediatría'
    },
    { 
      name: 'Dr. Luis García', 
      category: '10K Masculino', 
      year: '2024', 
      time: '35:42',
      specialty: 'Medicina General'
    },
    { 
      name: 'Dra. María Torres', 
      category: '10K Femenino', 
      year: '2024', 
      time: '38:15',
      specialty: 'Ginecología'
    }
  ],

  // Patrocinadores
  sponsors: [
    { name: 'Hospital San Juan', type: 'Platino' },
    { name: 'Farmacia Central', type: 'Oro' },
    { name: 'Clínica La Esperanza', type: 'Oro' },
    { name: 'Laboratorios Unidos', type: 'Plata' },
    { name: 'Seguros Médicos Plus', type: 'Plata' },
    { name: 'Equipos Médicos SA', type: 'Bronce' }
  ],

  // Estadísticas históricas
  statistics: {
    totalParticipants2024: 2500,
    totalEditions: 8,
    charityFundsRaised: 50000,
    hospitalsParticipating: 15,
    volunteersInvolved: 200
  },

  // Historia de la carrera
  milestones: [
    {
      year: "2017",
      title: "Los Inicios",
      description: "Nace la idea de celebrar el Día del Médico con una carrera que una a la comunidad médica y a los ciudadanos. La primera edición contó con 300 participantes y se realizó en el parque central.",
      participants: 300,
      color: "blue"
    },
    {
      year: "2018-2020",
      title: "Crecimiento",
      description: "La carrera creció exponencialmente, llegando a 1,500 participantes. Se añadieron nuevas categorías y se establecieron alianzas con hospitales y clínicas de la región.",
      participants: 1500,
      color: "green"
    },
    {
      year: "2021-2023",
      title: "Adaptación",
      description: "Durante la pandemia, adaptamos el evento con medidas sanitarias estrictas y formato virtual. Demostramos que ni las adversidades pueden detener nuestro espíritu de celebración.",
      participants: 1200,
      color: "yellow"
    },
    {
      year: "2024",
      title: "Récord Histórico",
      description: "La edición 2024 marcó un hito con más de 2,500 participantes, convirtiéndose en la carrera médica más grande de la región y estableciendo nuevos récords de participación.",
      participants: 2500,
      color: "purple"
    }
  ],

  // Beneficios de la inscripción
  registrationBenefits: [
    'Playera oficial del evento',
    'Medalla de participación',
    'Hidratación en ruta',
    'Desayuno post-carrera',
    'Seguro de participante',
    'Kit de bienvenida',
    'Acceso a área VIP de recuperación'
  ],

  // Información de contacto
  contact: {
    phones: ['+52 961 123 4567', '+52 961 987 6543'],
    emails: ['info@carreradelmedico.com', 'registro@carreradelmedico.com'],
    address: 'Hospital Central - Plaza de la Salud',
    city: 'Tuxtla Gutiérrez, Chiapas',
    socialMedia: {
      facebook: '#',
      instagram: '#',
      twitter: '#'
    }
  },

  // Recorrido de la carrera
  route: {
    startPoint: 'Hospital Central',
    keyPoints: [
      'Plaza de la Salud',
      'Centro Médico Regional',
      'Clínica Santa María',
      'Hospital Universitario'
    ],
    endPoint: 'Hospital Central',
    description: 'Recorrido por las principales avenidas médicas de la ciudad, pasando por centros de salud emblemáticos.'
  }
};

export default raceData;