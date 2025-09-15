import React, { useState } from 'react';
import './App.css';

// Importar todos los componentes
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import InformationSection from './components/InformationSection.jsx';
import RegistrationSection from './components/RegistrationSection.jsx';
import HallOfFameSection from './components/HallOfFameSection.jsx';
import HistorySection from './components/HistorySection.jsx';
import SponsorsSection from './components/SponsorsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
  const [activeSection, setActiveSection] = useState('inicio');

  const renderSection = () => {
    switch (activeSection) {
      case 'inicio':
        return <HeroSection setActiveSection={setActiveSection} />;
      case 'informacion':
        return (
          <div className="pt-20">
            <InformationSection />
          </div>
        );
      case 'registro':
        return (
          <div className="pt-20">
            <RegistrationSection />
          </div>
        );
      case 'salon-fama':
        return (
          <div className="pt-20">
            <HallOfFameSection />
          </div>
        );
      case 'trayectoria':
        return (
          <div className="pt-20">
            <HistorySection />
          </div>
        );
      case 'patrocinadores':
        return (
          <div className="pt-20">
            <SponsorsSection />
          </div>
        );
      case 'contacto':
        return (
          <div className="pt-20">
            <ContactSection />
          </div>
        );
      default:
  return <HeroSection setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 w-full transition-all duration-500 ease-in-out">
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
};

export default App;