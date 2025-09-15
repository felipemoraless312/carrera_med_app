import React from 'react';
import { Award, Trophy, Medal, Users, TrendingUp, Heart } from 'lucide-react';

const HallOfFameSection = () => {
  const winners = [
    { 
      name: 'Dr. Carlos Mendoza', 
      category: '5K Masculino', 
      year: '2025', 
      time: '1:15:32',
      specialty: 'Cardiología',
      position: 1
    },
    { 
      name: 'Dra. Ana Rodríguez', 
      category: '5K Femenino', 
      year: '2025', 
      time: '1:22:18',
      specialty: 'Pediatría',
      position: 1
    },
    { 
      name: 'Dr. Luis García', 
      category: '5K Masculino', 
      year: '2025', 
      time: '35:42',
      specialty: 'Medicina General',
      position: 1
    },
    { 
      name: 'Dra. María Torres', 
      category: '5K Femenino', 
      year: '2025', 
      time: '38:15',
      specialty: 'Ginecología',
      position: 1
    }
  ];

  const achievements = [
    { 
      number: '2,000+', 
      description: 'Participantes en 2019', 
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      number: '31', 
      description: 'Ediciones realizadas', 
      icon: Trophy,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const getMedalColor = (position) => {
    switch(position) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  return (
  <div className="py-20 bg-blue-950 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Salón de la Fama
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Reconocemos a los profesionales de la salud que han destacado 
            por su dedicación tanto en el área médica como en el deporte
          </p>
        </div>
        
        {/* Año destacado */}
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-900 text-gray-100 px-8 py-3 rounded-full font-bold text-xl">
            Aqui estarán los ganadores del 2025
          </div>
          <div className="mt-4 text-gray-400">
            Próximamente anunciaremos a los ganadores de la edición 2025
          </div>
        </div>

        {/* Ganadores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {winners.map((winner, index) => (
            <div key={index} className="group">
              <div className="bg-blue-900 rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Medalla */}
                <div className="w-20 h-20 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="w-10 h-10 text-blue-400" />
                </div>
                {/* Información del ganador */}
                <h4 className="text-xl font-bold mb-2 text-gray-100">{winner.name}</h4>
                <p className="text-blue-400 font-semibold mb-1">{winner.category}</p>
                <p className="text-gray-400 text-sm mb-2">{winner.specialty}</p>
                <p className="text-gray-300 text-sm mb-4">{winner.year}</p>
                {/* Tiempo */}
                <div className="bg-blue-950 rounded-xl py-3 px-4 border border-blue-900/40">
                  <div className="text-blue-400 font-bold text-lg">{winner.time}</div>
                  <div className="text-blue-300 text-sm">Tiempo récord</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logros históricos */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              Logros Históricos
            </h3>
            <p className="text-lg text-gray-300">
              El impacto de nuestra carrera a través de los años
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-blue-900 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-900/40">
                    <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-4xl font-bold text-blue-400 mb-2">
                      {achievement.number}
                    </div>
                    <p className="text-gray-300 font-medium">{achievement.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección inspiracional */}
        <div className="bg-blue-900 rounded-2xl p-12 text-gray-100 text-center">
          <Medal className="w-16 h-16 mx-auto mb-6 opacity-80 text-blue-400" />
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Un Legado de Excelencia
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed">
            Más que una carrera, somos una celebración de la vida y la salud. Cada paso que damos juntos 
            fortalece los lazos entre médicos y comunidad, promoviendo estilos de vida saludables y 
            reconociendo la labor heroica de nuestros profesionales de la salud.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-950 bg-opacity-80 backdrop-blur-sm rounded-xl p-6">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-400" />
              <h4 className="font-bold text-lg mb-2">¿Qué esperamos de esta carrera?</h4>
              <p className="text-sm opacity-80">
                Cada año superamos nuestros récords de participación
              </p>
            </div>
            <div className="bg-blue-950 bg-opacity-80 backdrop-blur-sm rounded-xl p-6">
              <Heart className="w-8 h-8 mx-auto mb-3 text-red-400" />
              <h4 className="font-bold text-lg mb-2">Impacto Social</h4>
              <p className="text-sm opacity-80">
                Apoyamos al deporte y a causas benéficas en nuestra comunidad
                para fomentar la salud y el deporte entre los profesionales médicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallOfFameSection;