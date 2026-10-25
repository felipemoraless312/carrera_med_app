import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Gift, ClipboardCheck, Search } from 'lucide-react';

// Menú para el comité: reúne en un solo lugar las pantallas que se usan el día del evento
const EDICION = 'XXXIII';

const PANTALLAS = [
  {
    titulo: 'Patrocinadores',
    descripcion: 'Carrusel de logos para proyectar en el evento',
    ruta: '/pantalla-patrocinadores',
    Icono: Monitor,
  },
  {
    titulo: 'Rifa',
    descripcion: 'Ruleta para sortear entre los participantes',
    ruta: '/rifa',
    Icono: Gift,
  },
  {
    titulo: 'Asistencia',
    descripcion: 'Registrar la llegada de los participantes',
    ruta: '/asistencia',
    Icono: ClipboardCheck,
  },
  {
    titulo: 'Consulta de participantes',
    descripcion: 'Buscar participantes por nombre o número',
    ruta: '/consulta-participantes-admin',
    Icono: Search,
  },
];

const PantallasComite = () => (
  <div
    className="min-h-screen bg-blue-950 px-4 py-10 text-white"
    style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(30, 64, 175, 0.55), transparent 70%)' }}
  >
    <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <img src="/images/marca/logo.png" alt="Carrera del Día del Médico" className="h-24 w-24 drop-shadow-xl" />
      <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-4xl">
        <span className="text-yellow-400">{EDICION}</span> Carrera del Día del Médico
      </h1>
      <p className="mt-2 text-lg font-medium text-blue-200">Pantallas del comité</p>
    </header>

    <main className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
      {PANTALLAS.map(({ titulo, descripcion, ruta, Icono }) => (
        <Link
          key={ruta}
          to={ruta}
          className="group flex items-start gap-4 rounded-2xl border border-blue-700 bg-blue-900/60 p-5 shadow-xl transition hover:-translate-y-1 hover:border-yellow-400 hover:bg-blue-900"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-blue-950">
            <Icono className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold group-hover:text-yellow-400">{titulo}</h2>
            <p className="mt-1 text-sm text-blue-200">{descripcion}</p>
          </div>
        </Link>
      ))}
    </main>
  </div>
);

export default PantallasComite;
