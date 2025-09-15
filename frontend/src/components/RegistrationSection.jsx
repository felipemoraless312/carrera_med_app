import React, { useState } from 'react';
import { CheckCircle, Star, Shield, Coffee, Trophy, Heart, Zap, Sparkles } from 'lucide-react';
import RegistrationForm from './RegistrationForm';

const RegistrationSection = ({ setActiveSection }) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const benefits = [
    { 
      icon: Star, 
      text: 'Playera oficial del evento', 
      color: 'text-yellow-500',
      gradient: 'from-yellow-400 to-orange-500'
    },
    { 
      icon: Trophy, 
      text: 'Medalla de participación', 
      color: 'text-amber-500',
      gradient: 'from-amber-400 to-yellow-500'
    },
    { 
      icon: Coffee, 
      text: 'Hidratación en ruta', 
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500'
    },
    { 
      icon: Shield, 
      text: 'Seguro de participante', 
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-violet-500'
    }
  ];

  const registrationSteps = [
    {
      step: '1',
      title: 'Selecciona tu categoría',
      description: 'Varonil o Femenil',
      gradient: 'from-purple-800 to-violet-800'
    },
    {
      step: '2', 
      title: 'Completa el formulario',
      description: 'De tus datos personales y de contacto',
      gradient: 'from-purple-800 to-violet-800'
    },
    {
      step: '3',
      title: 'Dale clik para finalizar',
      description: 'Obtén tu número de participante',
      gradient: 'from-purple-800 to-violet-800'
    },
    {
      step: '4',
      title: '¡Listo para correr!',
      description: '¡Prepárate para el evento!',
      gradient: 'from-purple-800 to-violet-800'
    }
  ];

  // Si se muestra el formulario de registro
  if (showRegistrationForm) {
    return <RegistrationForm onBack={() => setShowRegistrationForm(false)} setActiveSection={setActiveSection} />;
  }

  return (
    <section id="registro" className="relative py-20 bg-blue-950 min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header con efectos espectaculares */}
        <div className="text-center mb-16 animate-zoom-in">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="relative w-24 h-24 bg-blue-800 rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
              <Heart className="w-12 h-12 text-red-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-100 mb-4">
            ¡Inscríbete Ahora!
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Sé parte de esta gran celebración del Día del Médico. Corre por la salud, 
            corre por la vida, corre por nuestra comunidad médica.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Beneficios con efectos */}
          <div className="animate-slide-in-left">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/15 hover:scale-105">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-8 text-center flex items-center justify-center">
                <Star className="w-6 h-6 mr-3 text-yellow-300 spin-slow" />
                Tu inscripción incluye: 
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className="group flex items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/40"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className={`bg-gradient-to-r ${benefit.gradient} p-3 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white group-hover:animate-pulse" />
                      </div>
                      <span className="text-white text-lg font-bold group-hover:text-yellow-200 transition-colors duration-300">
                        {benefit.text}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50">
                <div className="flex items-center justify-center mb-2">
                  <p className="text-white font-black text-xl">
                    ¡Cupos limitados!
                  </p>
                </div>
                <p className="text-white/90 font-bold">
                  Solo 2,000 participantes
                </p>
              </div>
            </div>
          </div>
          
          {/* Proceso de registro con efectos */}
          <div className="animate-slide-in-right">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/15 hover:scale-105">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-8 text-center">
                Proceso de Registro
              </h3>
              <div className="space-y-6">
                {registrationSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start transform hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mr-4 shadow-xl group-hover:scale-110 transition-transform duration-300 border-4 border-white`}>
                      <span className="text-white font-black text-lg group-hover:animate-pulse">{step.step}</span>
                    </div>
                    <div className="flex-1 pt-3">
                      <h4 className="text-lg font-black text-gray-200 mb-1 group-hover:text-blue-300 transition-all duration-300">
                        {step.title}
                      </h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 space-y-4">
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="group w-full bg-blue-700 hover:bg-blue-800 text-gray-100 py-5 px-6 rounded-2xl text-xl font-black transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-900/40 relative overflow-hidden"
                >
                  Registrarse Ahora
                </button>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    ¡Inscripción gratuita para todos los participantes!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información adicional con efectos */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 animate-fade-in delay-1000">
          {[
            { number: '2,000', description: 'Participantes esperados', gradient: 'from-blue-500 to-cyan-500' },
            { number: 'XXXII', description: 'Edición del evento', gradient: 'from-purple-500 to-pink-500' },
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 text-center transform hover:scale-110 transition-all duration-300 hover:bg-white/20 group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:animate-pulse`}>
                {stat.number}
              </div>
              <div className="text-white/80 font-bold group-hover:text-white transition-colors duration-300">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .spin-slow {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-zoom-in {
          animation: zoom-in 1s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default RegistrationSection;