{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { Navigate } from 'react-router-dom';

{/* -------------------------------------------------------- CONTEXT */ }
import { useAuth } from '../context/AuthContext';

{/* -------------------------------------------------------- COMPONENTS */ }
import Loader from './Loader';

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function ProtectedRoute({ children }) {
  const { authStatus } = useAuth();

  if (authStatus === 'checking') {
    return <Loader/>;
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return children;
}