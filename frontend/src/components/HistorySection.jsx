import React from 'react';

const HistorySection = () => {
  const milestones = [
    {
      year: "2017",
      title: "Los Inicios",
      description: "Nace la idea de celebrar el Día del Médico con una carrera que una a la comunidad médica y a los ciudadanos. La primera edición contó con 300 participantes y se realizó en el parque central.",
      color: "blue"
    },
    {
      year: "2018-2020",
      title: "Crecimiento",
      description: "La carrera creció exponencialmente, llegando a 1,500 participantes. Se añadieron nuevas categorías y se establecieron alianzas con hospitales y clínicas de la región.",
      color: "green"
    },
    {
      year: "2021-2023",
      title: "Adaptación",
      description: "Durante la pandemia, adaptamos el evento con medidas sanitarias estrictas y formato virtual. Demostramos que ni las adversidades pueden detener nuestro espíritu de celebración.",
      color: "yellow"
    },
    {
      year: "2024",
      title: "Récord Histórico",
      description: "La edición 2024 marcó un hito con más de 2,500 participantes, convirtiéndose en la carrera médica más grande de la región y estableciendo nuevos récords de participación.",
      color: "purple"
    }
  ];

  return (
  <div className="py-16 bg-blue-950">
      <div className="container mx-auto px-4">
  <h2 className="text-4xl font-bold text-center mb-12 text-gray-100">
          Nuestra Historia
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-gray-100 font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-100">
                    {milestone.year} - {milestone.title}
                  </h3>
                  <p className="text-gray-300">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-900 rounded-lg p-8 mt-12">
            <h3 className="text-2xl font-bold mb-4 text-center text-blue-400">Nuestro Impacto</h3>
            <p className="text-blue-200 text-center leading-relaxed">
              Más que una carrera, somos una celebración de la vida y la salud. Cada paso que damos juntos 
              fortalece los lazos entre médicos y comunidad, promoviendo estilos de vida saludables y 
              reconociendo la labor heroica de nuestros profesionales de la salud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;