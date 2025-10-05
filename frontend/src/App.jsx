import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes públicos
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import InformationSection from './components/InformationSection.jsx';
import RegistrationSection from './components/RegistrationSection.jsx';
import HallOfFameSection from './components/HallOfFameSection.jsx';
import HistorySection from './components/HistorySection.jsx';
import SponsorsSection from './components/SponsorsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Componentes de administración (crear estos archivos)
import AttendanceView from './components/admin/AttendanceView.jsx';
import GeneralSearchView from './components/admin/GeneralSearchView.jsx';

const App = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Router>
        <ScrollToTop />
        <Navbar />
        <main className="flex-1 w-full transition-all duration-500 ease-in-out">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HeroSection />} />
            <Route path="/informacion" element={<div className="pt-20"><InformationSection /></div>} />
            <Route path="/registro" element={<div className="pt-20"><RegistrationSection /></div>} />
            <Route path="/salon-fama" element={<div className="pt-20"><HallOfFameSection /></div>} />
            <Route path="/trayectoria" element={<div className="pt-20"><HistorySection /></div>} />
            <Route path="/patrocinadores" element={<div className="pt-20"><SponsorsSection /></div>} />
            <Route path="/contacto" element={<div className="pt-20"><ContactSection /></div>} />
            
            {/* Rutas secretas de administración */}
            <Route 
              path="/control-asistencia-2025" 
              element={<AttendanceView onBack={() => window.history.back()} />} 
            />
            <Route 
              path="/consulta-participantes-admin" 
              element={<GeneralSearchView onBack={() => window.history.back()} />} 
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
};

export default App;