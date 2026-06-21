import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Si no está logueado, lo mandamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, lo dejamos pasar al componente hijo
  return children;
}

export default ProtectedRoute;