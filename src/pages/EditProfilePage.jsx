{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Save,
    Loader2,
    User, Mail,
    ShieldCheck,
    LockKeyhole,
    Info,
    KeyRound,
    TriangleAlert
} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const roles = {
    superadmin: 'CEO - Superadministrador',
    admin: 'Administrador',
    user: 'Colaborador',
    moderator: 'Moderador',
}

const getRole = (role) => {
    return roles[role];
}

{/* -------------------------------------------------------- CONTEXT */ }

{/* -------------------------------------------------------- COMPONENTS */ }
import { useToast } from "../components/ToastProvider";
import Loader from "../components/Loader";

{/* -------------------------------------------------------- PAGES */ }

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function EditProfilePage({ userId, currentUserRole }) {
    const { showToast } = useToast();
    const navigate = useNavigate();
    {/* ------------------------------------------------------------- 2.- EFECTOS DE ESTADO */ }


    {/* ------------------------------------------------------------- 3.- PROCESAMIENTO */ }
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: "",
        is_active: true,
        email_verified: false,
        last_login_at: null,
        created_at: null,
        updated_at: null,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const isAdmin = ["admin", "superadmin"].includes(currentUserRole);

    // ==============================
    // Obtener usuario
    // ==============================
    const fetchUser = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/users/${userId}`);
            setFormData(data);

        } catch (err) {
            setError("Error al cargar la información del usuario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;
        fetchUser();
    }, [userId]);

    // ==============================
    // Manejar cambios
    // ==============================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ==============================
    // Guardar cambios
    // ==============================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
            };

            await axios.put(`${backendUrl}/api/users/${userId}`, payload);

            showToast("Perfil actualizado correctamente!", "success");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Ocurrió un error al actualizar el perfil"
            );
            showToast(error, "error");
        } finally {
            setSaving(false);
            fetchUser();
        }
    };

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData?.username ?? 'U')}&background=1EA85A&color=fff`;

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
            <div className="w-full max-w-2xl z-50 flex flex-col h-screen overflow-hidden m-6 p-4 justify-center">

                <div className="card-pattern p-6 rounded-lg overflow-y-auto scrollbar-none px-10 shadow-xl">
                    
                    {/* -------------------------------------------------------- HEADER */}
                    <div className="flex justify-center text-center items-center gap-2 p-2 mb-2 z-60">
                        <img
                            src={avatar}
                            alt="avatar"
                            className="h-20 w-20 rounded-full object-cover shadow"
                        />
                        <div>
                            <h2 className="font-semibold text-xl">
                                {formData.username}
                            </h2>
                            <p className="text-sm italic">{getRole(formData.role)}</p>
                            <span className="text-sm ">
                                {formData.email}
                            </span>
                        </div>
                    </div>

                    {/* -------------------------------------------------------- TITLES */}
                    <div className="flex items-center gap-3 mb-4 border-b border-dashed border-gray-400 pb-2">
                        <User />
                        <h1 className="text-2xl font-semibold">Editar Perfil</h1>
                    </div>

                    {/* -------------------------------------------------------- FORM */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* -------------------------------------------------------- USERNAME */}
                        <div>
                            <label className="block text-sm font-medium mb-1 flex gap-2 items-center">
                                <User size={16} />
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="card-input w-full hover:bg-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        {/* -------------------------------------------------------- EMAIL */}
                        <div>
                            <label className="block text-sm font-medium mb-1 flex gap-2 items-center">
                                <Mail size={16} />
                                Correo electrónico
                            </label>
                            <div className="flex items-center gap-2">

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="card-input w-full hover:bg-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* -------------------------------------------------------- RESTABLECER CONTRASEÑA */}
                        <button
                            type="button"
                            className="w-full rounded-lg flex items-center text-center justify-center gap-2 px-4 py-1 text-sm text-red-400 hover:text-red-500 bg-gray-300 hover:bg-[var(--color-error)] cursor-pointer"
                            onClick={() => navigate("/reset-pass")}
                        >
                            <TriangleAlert size={16} />
                            Ir a Restablecer Contraseña
                        </button>

                        {/* -------------------------------------------------------- INFO */}
                        <div className="bg-[var(--color-pattern-bg-input)] p-4 rounded-xl text-sm text-[var(--color-text-soft)]/80 space-y-1 mt-4">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-300 text-[var(--color-text-secondary)]">
                                <Info size={20} />
                                <h1 className="text-xl font-semibold">Información de actividad</h1>
                            </div>
                            <div>
                                <span className="font-medium">Estado:</span>{" "}
                                {formData.is_active ? "Usuario activo" : "Usuario no activo"}
                            </div>
                            <div>
                                <span className="font-medium">Email verificado:</span>{" "}
                                {formData.email_verified ? "Sí" : "No"}
                            </div>
                            <div>
                                <span className="font-medium">Último login:</span>{" "}
                                {formData.last_login_at
                                    ? new Date(formData.last_login_at).toLocaleString()
                                    : "—"}
                            </div>
                            <div>
                                <span className="font-medium">Creado:</span>{" "}
                                {new Date(formData.created_at).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium">Actualizado:</span>{" "}
                                {new Date(formData.updated_at).toLocaleString()}
                            </div>
                        </div>

                        {/* -------------------------------------------------------- SUBMIT */}
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
