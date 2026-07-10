{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';

{/* -------------------------------------------------------- DATA */ }
import { META } from '../data/dataMeta';

{/* -------------------------------------------------------- CONTEXT */ }
import { useAuth } from '../context/AuthContext';

{/* -------------------------------------------------------- COMPONENTS */ }
import { loginUser } from '../services/api';
import { useToast } from '../components/ToastProvider';

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function Login() {
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  {/* -------------------------------------------------------- STATES */ }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  {/* -------------------------------------------------------- SUBMIT */ }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const data = await loginUser({ email, password });

      if (data.error) throw new Error(data.error || 'Error al iniciar sesión');

      const success = await login(data.token);

      if (success) {
        navigate('/dashboard');
        showToast("Login success.", "success");
      } else {
        setError('No fue posible validar la sesión');
        showToast("Error al iniciar sesión", "error");
      }

    } catch (err) {
      setError(err.message);
      showToast("Error al iniciar sesión: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-90px)] flex items-center justify-center">

      {/* -------------------------------------------------------- BACKGROUND */}
      <div className="absolute inset-0 patterns" />

      {/* -------------------------------------------------------- CARD */}
      <div className="card-pattern w-full max-w-md z-10 m-6 p-8 rounded-xl shadow-xl animate-fadeIn">
        
        {/* -------------------------------------------------------- LOGO */}
        <img
          src="/Logo-MAE.png"
          alt="LogoGAC"
          className="mx-auto w-full h-20 object-contain"
        />

        {/* -------------------------------------------------------- TITLES */}
        <h2 className="text-3xl font-bold text-center">
            Inicia sesión en {META.projectAliase}
        </h2>
        <h3 className="card-text-main text-xl font-semibold mb-4 leading-6 text-center border-b border-dashed border-gray-400 pb-2">
            {META.projectDesc}
        </h3>
        
        {/* -------------------------------------------------------- FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* -------------------------------------------------------- EMAIL */}
          <div>
            <label htmlFor="email" className="block font-medium flex flex-row items-center gap-2">
              <Mail size={18}/>
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              placeholder="correo@ambienteyenergia.gob.ec"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="card-input w-full hover:bg-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* -------------------------------------------------------- PASSWORD */}
          <div>
            <label htmlFor="password" className="block font-medium flex flex-row items-center gap-2">
              <KeyRound size={18}/>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="card-input w-full hover:bg-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* -------------------------------------------------------- BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition text-white cursor-pointer
              ${loading
                ? 'bg-green-700 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'}
            `}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Iniciando sesión ...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* -------------------------------------------------------- FOOTER */}
        <div className="card-text-main mt-6 text-right text-sm italic">
          ¿No tienes una cuenta?{' '}
          <a href="/register" className="text-green-500 hover:underline">
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}