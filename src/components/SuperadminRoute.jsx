import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SuperadminRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return children;
}