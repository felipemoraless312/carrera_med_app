import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Componentes públicos
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import InformationSection from './components/InformationSection.jsx';
import RegistrationSection from './components/RegistrationSection.jsx';
import HistorySection from './components/HistorySection.jsx';
import SponsorsSection from './components/SponsorsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import RifaView from './components/RifaView.jsx';
import RecuperarFolio from './components/RecuperarFolio.jsx';
import PantallaPatrocinadores from './components/PantallaPatrocinadores.jsx';
import PantallasComite from './components/PantallasComite.jsx';

// Rutas de pantalla completa que no llevan barra de navegación ni pie de página
const RUTAS_SIN_MARCO = ['/pantalla-patrocinadores', '/comite'];

const ConMarco = ({ children }) => {
  const location = useLocation();
  return RUTAS_SIN_MARCO.includes(location.pathname) ? null : children;
};

// Componentes de administración (crear estos archivos)
import AttendanceView from './components/AsisList.jsx';
import GeneralSearchView from './components/AsistView.jsx';

const App = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Router>
        <ScrollToTop />
        <ConMarco><Navbar /></ConMarco>
        <main className="flex-1 w-full transition-all duration-500 ease-in-out">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HeroSection />} />
            <Route path="/informacion" element={<div className="pt-20"><InformationSection /></div>} />
            <Route path="/registro" element={<div className="pt-20"><RegistrationSection /></div>} />
            <Route path="/recuperar-folio" element={<div className="pt-20"><RecuperarFolio /></div>} />
            <Route path="/trayectoria" element={<div className="pt-20"><HistorySection /></div>} />
            <Route path="/patrocinadores" element={<div className="pt-20"><SponsorsSection /></div>} />
            <Route path="/contacto" element={<div className="pt-20"><ContactSection /></div>} />
            <Route path="/pantalla-patrocinadores" element={<PantallaPatrocinadores />} />
            <Route path="/comite" element={<PantallasComite />} />
            
            {/* Rutas secretas de administración */}
            <Route 
              path="/asistencia"
              element={<AttendanceView onBack={() => window.history.back()} />} 
            />
            <Route 
              path="/consulta-participantes-admin" 
              element={<GeneralSearchView onBack={() => window.history.back()} />} 
            />
            <Route 
              path="/rifa" 
              element={<RifaView onBack={() => window.history.back()} />} 
            />
          </Routes>
        </main>
        <ConMarco><Footer /></ConMarco>
      </Router>
    </div>
  );
};

export default App;