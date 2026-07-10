{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    KeyRound,
    UserRound,
    Mail,
    Eye,
    EyeOff,
    ShieldCheck,
    ShieldAlert,
    BadgeCheck,
    BadgeAlert
} from 'lucide-react';

{/* -------------------------------------------------------- DATA */ }
import { META } from '../data/dataMeta';

{/* -------------------------------------------------------- COMPONENTS */ }
import { registerUser } from '../services/api';
import { useToast } from '../components/ToastProvider';

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function Register() {
    const { showToast } = useToast();
    const navigate = useNavigate();

    {/* -------------------------------------------------------- STATES */ }
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    {/* -------------------------------------------------------- PASSWORD VALIDATION */ }
    const passwordValidation = useMemo(() => {

        const validations = {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const passedValidations =
            Object.values(validations).filter(Boolean).length;

        let strength = 'Débil';

        if (passedValidations >= 5) {
            strength = 'Fuerte';
        } else if (passedValidations >= 3) {
            strength = 'Media';
        }

        return {
            validations,
            passedValidations,
            strength,
            isValid: passedValidations === 5
        };

    }, [password]);

    {/* -------------------------------------------------------- PASSWORD MATCH */ }
    const passwordsMatch =
        password &&
        confirmPassword &&
        password === confirmPassword;

    {/* -------------------------------------------------------- FORM VALID */ }
    const isFormValid =
        username.trim() &&
        email.trim() &&
        password.trim() &&
        confirmPassword.trim() &&
        passwordsMatch &&
        passwordValidation.isValid;

    {/* -------------------------------------------------------- SUBMIT */ }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || !isFormValid) return;

        setError('');
        setLoading(true);

        try {
            const response = await registerUser({ username, email, password });

            if (response.error) throw new Error(response.error || 'Error al registrar usuario');

            if (response.token) {
                showToast("Registro exitoso. Puedes iniciar sesión.", "success");
                navigate('/login');
            } else {
                showToast("Error al registrar usuario", "error");
            }

        } catch (err) {
            setError(err.message);
            showToast("Error al registrar usuario: " + err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="h-[calc(100vh-90px)] flex items-center justify-center"
        >
            {/* -------------------------------------------------------- BACKGROUND */}
            <div className="absolute inset-0 patterns" />

            {/* -------------------------------------------------------- CARD */}
            <div className="card-pattern w-full max-w-2xl z-10 m-6 p-8 rounded-xl shadow-xl animate-fadeIn">

                {/* -------------------------------------------------------- LOGO */}
                <img
                    src="/Logo-MAE.png"
                    alt="LogoGAC"
                    className="mx-auto w-full h-20 object-contain"
                />

                {/* -------------------------------------------------------- TITLES */}
                <h2 className="text-3xl font-bold text-center">
                    Registrate en {META.projectAliase}
                </h2>
                <h3 className="card-text-main text-xl font-semibold mb-4 leading-6 text-center border-b border-dashed border-gray-400 pb-2">
                    {META.projectDesc}
                </h3>

                {/* -------------------------------------------------------- FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* -------------------------------------------------------- USERNAME */}
                    <div className="relative">
                        <label htmlFor="username" className="block font-medium flex flex-row items-center gap-2">
                            <UserRound size={'18px'} />
                            Nombre de usuario
                        </label>
                        <input
                            id="username"
                            name="username"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="card-input w-full mt-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* -------------------------------------------------------- EMAIL */}
                    <div>
                        <label htmlFor="email" className="block font-medium flex flex-row items-center gap-2">
                            <Mail size={18} />
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="correo@ambienteyenergia.gob.ec"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="card-input w-full mt-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* -------------------------------------------------------- PASSWORD */}
                    <div className='transition-all'>

                        <label
                            htmlFor="password"
                            className="block font-medium flex items-center gap-2"
                        >
                            <KeyRound size={18} />
                            Contraseña
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="card-input w-full mt-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 cursor-pointer"
                            >
                                {
                                    showPassword
                                        ? <EyeOff size={20} />
                                        : <Eye size={20} />
                                }
                            </button>
                        </div>

                        {/* -------------------------------------------------------- PASSWORD STRENGTH */}
                        {
                            password && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        {
                                            passwordValidation.isValid
                                                ? (
                                                    <ShieldCheck
                                                        size={18}
                                                        className="text-green-400"
                                                    />
                                                )
                                                : (
                                                    <ShieldAlert
                                                        size={18}
                                                        className="text-yellow-400"
                                                    />
                                                )
                                        }
                                        <span className="card-text-main text-sm">
                                            Fortaleza:
                                            <span className="font-semibold ml-1">
                                                {passwordValidation.strength}
                                            </span>
                                        </span>
                                    </div>

                                    <div className='grid grid-cols-2'>
                                        <ul className="card-text-main text-xs space-y-1">
                                            <li className='flex gap-2'>
                                                {passwordValidation.validations.minLength ? <BadgeCheck size={18} className='text-green-400' /> : <BadgeAlert size={18} className='text-red-400' />}
                                                {' '}
                                                Mínimo 8 caracteres
                                            </li>

                                            <li className='flex gap-2'>
                                                {passwordValidation.validations.uppercase ? <BadgeCheck size={18} className='text-green-400' /> : <BadgeAlert size={18} className='text-red-400' />}
                                                {' '}
                                                Una letra mayúscula
                                            </li>

                                            <li className='flex gap-2'>
                                                {passwordValidation.validations.lowercase ? <BadgeCheck size={18} className='text-green-400' /> : <BadgeAlert size={18} className='text-red-400' />}
                                                {' '}
                                                Una letra minúscula
                                            </li>

                                        </ul>
                                        <ul className="card-text-main text-xs space-y-1">

                                            <li className='flex gap-2'>
                                                {passwordValidation.validations.number ? <BadgeCheck size={18} className='text-green-400' /> : <BadgeAlert size={18} className='text-red-400' />}
                                                {' '}
                                                Un número
                                            </li>

                                            <li className='flex gap-2'>
                                                {passwordValidation.validations.specialChar ? <BadgeCheck size={18} className='text-green-400' /> : <BadgeAlert size={18} className='text-red-400' />}
                                                {' '}
                                                Un carácter especial
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            )
                        }
                    </div>

                    {/* -------------------------------------------------------- CONFIRM PASSWORD */}
                    <div>
                        <label
                            htmlFor="password2"
                            className="block font-medium flex items-center gap-2"
                        >
                            <KeyRound size={18} />
                            Repite la contraseña
                        </label>

                        <div className="relative">
                            <input
                                type={
                                    showConfirmPassword
                                        ? 'text'
                                        : 'password'
                                }
                                id="password2"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                                className={`card-input w-full mt-1 p-2 pr-12 rounded-lg focus:outline-none focus:ring-2

                                    ${confirmPassword && !passwordsMatch
                                        ? 'focus:ring-red-500 border border-red-500'
                                        : 'focus:ring-green-500'
                                    }
                                `}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 cursor-pointer"
                            >
                                {
                                    showConfirmPassword
                                        ? <EyeOff size={20} />
                                        : <Eye size={20} />
                                }
                            </button>
                        </div>

                        {/* -------------------------------------------------------- MATCH VALIDATION */}
                        {
                            confirmPassword && (
                                <p
                                    className={`text-sm mt-2
                                        ${passwordsMatch
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                        }
                                    `}
                                >
                                    {
                                        passwordsMatch
                                            ? 'Las contraseñas coinciden'
                                            : 'Las contraseñas no coinciden'
                                    }
                                </p>
                            )
                        }
                    </div>

                    {/* -------------------------------------------------------- BUTTON */}
                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition text-white
                            ${!isFormValid || loading
                                ? 'bg-gray-600 cursor-not-allowed opacity-70'
                                : 'bg-green-500 hover:bg-green-600 cursor-pointer'
                            }
                        `}
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Procesando...
                            </>
                        ) : (
                            'Registrarse'
                        )}
                    </button>
                </form>

                {/* Pie de página */}
                <div className="card-text-main mt-6 text-right text-sm italic">
                    ¿Ya tienes una cuenta?{' '}
                    <a href="/login" className="text-green-500 hover:underline">
                        Inicia sesión
                    </a>
                </div>
            </div>
        </div>
    );
}