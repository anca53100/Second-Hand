import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleRoute({ role }) {
  const { user } = useAuth();
  return (user?.role ?? 'user') === role ? <Outlet /> : <Navigate to="/explorar" replace />;
}
