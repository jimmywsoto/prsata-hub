import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccesibleRoute({ children }) {
  const { isActive } = useAuth();

  if (!isActive) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
}