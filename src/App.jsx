import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

// Vista temporal para rutas aún no construidas.
function Placeholder({ title }) {
  return <main className="container py-5"><h1>{title}</h1><p>Próximamente.</p></main>;
}

// Rutas de la app. Las demás vistas (dashboard, publicaciones...) se agregan aquí.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Placeholder title="Página no encontrada" />} />
    </Routes>
  );
}
