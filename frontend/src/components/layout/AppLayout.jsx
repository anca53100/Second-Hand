import { Outlet, useLocation } from 'react-router-dom';
import AppNavbar from './AppNavbar.jsx';
import AdminNavbar from './AdminNavbar.jsx';
import Footer from '../Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AppLayout() {
  const { isAdmin } = useAuth();
  const inAdmin = useLocation().pathname.startsWith('/admin');
  return (
    <div className="app-shell">
      {isAdmin && inAdmin ? <AdminNavbar /> : <AppNavbar />}
      <main className="app-shell__main"><Outlet /></main>
      <Footer />
    </div>
  );
}
