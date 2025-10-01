import React, { useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Send, MessageCircle, CheckCircle } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Por favor complete todos los campos'
      });
      return;
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Por favor ingrese un email válido'
      });
      return;
    }

    // Simular envío
    setSubmitStatus({ type: 'loading', message: 'Enviando mensaje...' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus({
        type: 'success',
        message: 'Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.'
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Error al enviar el mensaje. Intente nuevamente.'
      });
    }
  };

  const contactInfo = [
    { 
      icon: Phone, 
      title: 'Teléfono',
      details: ['961 613 66 66'],
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: Mail, 
      title: 'Correos',
      details: ['infocarreradelmedico@gmail.com'],
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: MapPin, 
      title: 'Dirección',
      details: ['Parque Central', 'Tuxtla Gutiérrez, Chiapas'],
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'from-blue-600 to-blue-700', hoverColor: 'hover:shadow-blue-500/50' },
  ];

  return (
    <div className="py-20 bg-blue-950 min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black text-gray-100 mb-4">
            Contacto
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario */}
          <div className="animate-slide-in-left">
            <div className="bg-blue-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 border border-blue-900/40">
              <h3 className="text-2xl font-black text-gray-100 mb-6 flex items-center">
                Envíanos un mensaje
              </h3>
              
              {/* Estado de envío */}
              {submitStatus && (
                <div className={`mb-6 p-4 rounded-2xl ${
                  submitStatus.type === 'success' ? 'bg-green-900/50 border border-green-400 text-green-100' :
                  submitStatus.type === 'loading' ? 'bg-blue-900/50 border border-blue-400 text-blue-100' :
                  'bg-red-900/50 border border-red-400 text-red-100'
                }`}>
                  <div className="flex items-center">
                    {submitStatus.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                    {submitStatus.type === 'loading' && <div className="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                    <p className="font-medium">{submitStatus.message}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-gray-300 mb-2 font-bold group-hover:text-blue-400 transition-colors duration-300">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 hover:border-blue-800 bg-blue-950/60 backdrop-blur-sm text-gray-100"
                    placeholder="Tu nombre completo"
                    disabled={submitStatus?.type === 'loading'}
                  />
                </div>
                <div className="group">
                  <label className="block text-gray-300 mb-2 font-bold group-hover:text-blue-400 transition-colors duration-300">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 hover:border-blue-800 bg-blue-950/60 backdrop-blur-sm text-gray-100"
                    placeholder="tu@email.com"
                    disabled={submitStatus?.type === 'loading'}
                  />
                </div>
                <div className="group">
                  <label className="block text-gray-300 mb-2 font-bold group-hover:text-blue-400 transition-colors duration-300">
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-6 py-4 border-2 border-blue-900/40 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 hover:border-blue-800 bg-blue-950/60 backdrop-blur-sm text-gray-100 resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                    disabled={submitStatus?.type === 'loading'}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitStatus?.type === 'loading'}
                  className="group w-full bg-blue-700 hover:bg-blue-800 text-gray-100 px-8 py-4 rounded-2xl text-lg font-black transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-900/40 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitStatus?.type === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Información de contacto */}
          <div className="animate-slide-in-right space-y-8">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <div 
                  key={index}
                  className="bg-blue-900 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-900/40 group"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-start">
                    <div className="bg-blue-800 p-4 rounded-2xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-gray-100 text-lg mb-3 group-hover:text-blue-400 transition-all duration-300">
                        {contact.title}
                      </h4>
                      <div className="space-y-1">
                        {contact.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-gray-300 font-medium group-hover:text-gray-100 transition-colors duration-300">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Redes sociales */}
            <div className="bg-blue-900 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 animate-zoom-in delay-1000">
              <h4 className="text-xl font-black text-gray-100 mb-6 text-center flex items-center justify-center">
                Síguenos en redes sociales
              </h4>
              <div className="flex justify-center space-x-6">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="group bg-blue-800 p-4 rounded-2xl text-blue-400 transition-all duration-300 transform hover:scale-125 shadow-xl hover:shadow-2xl"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <IconComponent className="w-6 h-6 group-hover:animate-pulse" />
                    </a>
                  );
                })}
              </div>
              <p className="text-center text-gray-300 mt-6 font-medium">
                Mantente al día con todas las novedades del evento
              </p>
            </div>
          </div>
        </div>
        
        {/* Mapa o información adicional */}
        <div className="mt-16 animate-fade-in delay-1500">
          <div className="bg-blue-900 rounded-3xl p-12 text-gray-100 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-6">
                ¡Nos vemos en la carrera!
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed">
                El parque central será el punto de encuentro para esta gran celebración. 
                ¡Esperamos verte el 18 de octubre de 2025!
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-950 bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 hover:bg-blue-900 transition-all duration-300 transform hover:scale-105">
                  <Phone className="w-8 h-8 mx-auto mb-3 text-blue-400 animate-pulse" />
                  <h4 className="font-bold text-lg mb-2 text-gray-100">Llámanos</h4>
                  <p className="text-sm opacity-80">Atención de 8:00 AM a 4:00 PM</p>
                </div>
                <div className="bg-blue-950 bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 hover:bg-blue-900 transition-all duration-300 transform hover:scale-105">
                  <Mail className="w-8 h-8 mx-auto mb-3 text-blue-400 animate-pulse" />
                  <h4 className="font-bold text-lg mb-2 text-gray-100">Escríbenos</h4>
                  <p className="text-sm opacity-80">Respuesta en 24 horas</p>
                </div>
                <div className="bg-blue-950 bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 hover:bg-blue-900 transition-all duration-300 transform hover:scale-105">
                  <MessageCircle className="w-8 h-8 mx-auto mb-3 text-blue-400 animate-pulse" />
                  <h4 className="font-bold text-lg mb-2 text-gray-100">Síguenos en redes</h4>
                  <p className="text-sm opacity-80">Últimas noticias y actualizaciones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out;
        }
        .animate-zoom-in {
          animation: zoom-in 0.8s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-1500 {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
};

export default ContactSection;
