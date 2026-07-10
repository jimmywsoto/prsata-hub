{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Save,
    Loader2,
    User,
    ShieldCheck,
    KeyRound,
    Eye,
    EyeOff,
    ShieldAlert,
    BadgeAlert,
    BadgeCheck
} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

{/* -------------------------------------------------------- CONTEXT */ }

{/* -------------------------------------------------------- COMPONENTS */ }
import { useToast } from "../components/ToastProvider";
import Loader from "../components/Loader";

{/* -------------------------------------------------------- PAGES */ }

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function ResetPassPage({ userId, currentUserRole }) {
    const { showToast } = useToast();
    {/* ------------------------------------------------------------- 2.- EFECTOS DE ESTADO */ }
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    {/* ------------------------------------------------------------- 3.- PROCESAMIENTO */ }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // ==============================
    // Obtener usuario
    // ==============================

    useEffect(() => {
        if (!userId) return;
        setLoading(false);
    }, [userId]);


    // ==============================
    // Guardar cambios
    // ==============================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const payload = {
                password: password,
            };

            console.log(payload)
            await axios.put(`${backendUrl}/api/auth/reset-password/${userId}`, payload);

            showToast("Contraseña actualizada correctamente!", "success");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Ocurrió un error al actualizar el perfil"
            );
            showToast(error, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full items-center">

            {/* -------------------------------------------------------- BACKGROUND */}
            <div className="absolute inset-0 patterns" />

            {/* -------------------------------------------------------- CARD */}
            <div className="w-full max-w-xl z-50 flex flex-col h-screen overflow-hidden m-6 p-4 rounded-lg justify-center">
                <div className="card-pattern p-6 rounded-lg overflow-y-auto scrollbar-none px-10 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 border-b border-dashed border-gray-400 pb-2">
                        <User />
                        <h1 className="text-2xl font-semibold">Restablecer contraseña</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

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

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-green-500 hover:bg-green-700 text-white py-2 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-60 cursor-pointer"
                        >
                            {saving ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <Save size={16} />
                            )}
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
