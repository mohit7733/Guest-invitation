import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function PrivateRoute({ children }) {
  const { user } = useAuth();
  const token = localStorage.getItem("auth")
  if (!token) return <Navigate to="/login" replace />;
  return children;
}


