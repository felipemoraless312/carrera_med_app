import React from 'react';

const HistorySection = () => {
  const milestones = [
    {
      year: "1988",
      title: "Los Inicios",
      description: "Nace la idea de celebrar el Día del Médico con una carrera que una a la comunidad médica y a los ciudadanos. La primera edición contó con 300 participantes y se realizó en el parque central de Tuxtla Gutiérrez.",
      color: "blue"
    },
    {
      year: "1989-2010",
      title: "Consolidación",
      description: "La carrera se establece como una tradición anual, creciendo año tras año. Se añadieron nuevas categorías y se fortalecieron las alianzas con hospitales y clínicas de Chiapas, llegando a más de 1,000 participantes.",
      color: "green"
    },
    {
      year: "2011-2019",
      title: "La Edad de Oro",
      description: "Durante estos años dorados, la carrera alcanzó su máximo esplendor con más de 2,500 participantes anuales. Se convirtió en el evento deportivo-médico más importante del sureste mexicano.",
      color: "yellow"
    },
    {
      year: "2020-2024",
      title: "El Gran Paréntesis",
      description: "La pandemia de COVID-19 obligó a suspender el evento por 5 años consecutivos. Fue un período difícil, pero necesario para proteger la salud de nuestra comunidad médica y ciudadanos.",
      color: "red"
    },
    {
      year: "2025",
      title: "¡El Gran Regreso!",
      description: "Después de 5 años de ausencia, regresamos con más fuerza que nunca. La edición 2025 marca el renacimiento de nuestra querida tradición, celebrando 37 años de historia y esperanza renovada.",
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
            <h3 className="text-2xl font-bold mb-4 text-center text-blue-400">37 Años de Tradición</h3>
            <p className="text-blue-200 text-center leading-relaxed mb-4">
              Desde 1988, hemos sido más que una carrera: somos una celebración de la vida y la salud. 
              Cada paso que damos juntos fortalece los lazos entre médicos y comunidad, promoviendo 
              estilos de vida saludables y reconociendo la labor heroica de nuestros profesionales de la salud.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-blue-950/50 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-blue-300 mb-2">1988-2019</h4>
                <p className="text-blue-200 text-sm">
                  31 años consecutivos de tradición ininterrumpida
                </p>
              </div>
              <div className="bg-blue-950/50 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-blue-300 mb-2">2025</h4>
                <p className="text-blue-200 text-sm">
                  El año del regreso triunfal tras 5 años de pausa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;