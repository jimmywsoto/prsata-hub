{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState } from "react";
import {
    ShieldAlert,
    Send,
    Clock3,
    CheckCircle2,
    XCircle,
} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }

{/* -------------------------------------------------------- CONTEXT */ }
import { useAuth } from "../context/AuthContext";

{/* -------------------------------------------------------- COMPONENTS */ }
import {
    accessRequest,
    allUserRequests,
} from "../services/api";
import { useToast } from '../components/ToastProvider';

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function UnauthorizedWelcome() {
    const { showToast } = useToast();
    const { user } = useAuth();

    {/* -------------------------------------------------------- STATES */ }
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const [requestsLoading, setRequestsLoading] = useState(true);

    const [latestRequest, setLatestRequest] = useState(null);

    {/* -------------------------------------------------------- CONFIG */ }
    const statusConfig = {
        PENDING: {
            icon: <Clock3 className="w-5 h-5 text-yellow-400" />,
            text: "Tu solicitud de acceso está pendiente de revisión.",
            bg: "bg-yellow-500/10 border-yellow-500/30",
        },

        APPROVED: {
            icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
            text: "Tu acceso ha sido aprobado.",
            bg: "bg-green-500/10 border-green-500/30",
        },

        REJECTED: {
            icon: <XCircle className="w-5 h-5 text-red-400" />,
            text: "Tu solicitud fue rechazada. Puedes enviar una nueva solicitud al Administrador.",
            bg: "bg-red-500/10 border-red-500/30",
        },
    };

    {/* -------------------------------------------------------- FETCH LAST REQUEST */ }
    const fetchLatestRequest = async () => {

        if (!user?.id) return;

        try {
            setRequestsLoading(true);

            const { data } = await allUserRequests(user.id);

            if (!Array.isArray(data)) {
                return;
            }

            if (data.length === 0) {

                setLatestRequest(null);
                return;
            }

            const latest = data.sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            )[0];

            setLatestRequest(latest);

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setRequestsLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestRequest();
    }, [user]);

    {/* -------------------------------------------------------- REQUEST ACCESS */ }
    const requestAccess = async () => {

        if (loading) return;

        try {

            setLoading(true);
            setError("");

            await accessRequest({
                user_id: user.id,
                request_message:
                    message || "Solicitud de acceso",
            });

            setMessage("");

            {/* -------------------------------------------------------- STATE REFRESH */ }
            await fetchLatestRequest();
            showToast("Solicitud enviada con éxito.", "success");

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Error al enviar solicitud."
            );
            showToast("Error al enviar solicitud", "error");
        } finally {

            setLoading(false);
        }
    };

    {/* -------------------------------------------------------- CURRENT STATUS */ }
    const currentStatus = useMemo(() => {

        if (!latestRequest?.request_status) {
            return null;
        }

        return statusConfig[
            latestRequest.request_status
        ];

    }, [latestRequest]);

    {/* -------------------------------------------------------- SHOW FORM */ }
    const shouldShowForm = useMemo(() => {

        if (!latestRequest) return true;

        return latestRequest.request_status === "REJECTED";

    }, [latestRequest]);

    return (
        <div className="h-[calc(100vh-90px)] flex items-center justify-center">

            {/* -------------------------------------------------------- BACKGROUND */}
            <div className="absolute inset-0 patterns" />

            {/* -------------------------------------------------------- CARD */}
            <div className="card-pattern w-full max-w-3xl z-50 m-6 p-8 rounded-xl shadow-xl animate-fadeIn">

                {/* -------------------------------------------------------- HEADER */}
                <div className="flex flex-col items-center text-center space-y-4">

                    <div className="w-20 h-20 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-400/20">
                        <ShieldAlert className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="w-full text-left text-2xl lg:text-4xl font-bold border-b border-dashed border-gray-400/40 pb-2">
                        Bienvenido, {user?.username}
                    </h1>

                    <p className="card-text-main text-left leading-6 text-sm lg:text-lg max-w-2xl">
                        Plataforma integral de reportería para monitorear,
                        analizar y gestionar alertas satelitales sobre
                        pérdida de cobertura forestal en Ecuador,
                        fortaleciendo la respuesta institucional y la
                        sostenibilidad de los recursos naturales.
                    </p>
                </div>

                {/* ALERT */}
                <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">

                    <h2 className="text-lg lg:text-xl font-semibold text-amber-500 mb-3">
                        Acceso restringido
                    </h2>

                    <p className="card-text-main leading-6 text-sm lg:text-lg">
                        Aún no tienes acceso a los contenidos de la plataforma.
                        Solicita autorización al administrador para habilitar
                        el acceso a los módulos y datos del sistema.
                    </p>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300">
                        {error}
                    </div>
                )}

                {/* STATUS */}
                {!requestsLoading && currentStatus && (
                    <div className={`mt-6 border rounded-xl p-5 ${currentStatus.bg}`}>
                        <div className="flex items-center gap-3">

                            {currentStatus.icon}

                            <span className="card-text-main font-medium">
                                {currentStatus.text}
                            </span>
                        </div>
                    </div>
                )}

                {/* REQUEST FORM */}
                {shouldShowForm && (
                    <div className="mt-6">

                        <label className="block card-text-main mb-3 font-medium">
                            Mensaje para el administrador (opcional)
                        </label>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Describe el motivo por el cual requieres acceso..."
                            className="
                                    card-input
                                    w-full
                                    rounded-xl
                                    p-4
                                    outline-none
                                    focus:ring-2
                                    focus:ring-green-500
                                    transition-all
                                    resize-none
                                    max-h-40
                                    overflow-y-auto
                                "
                        />

                        <button
                            onClick={requestAccess}
                            disabled={loading}
                            className="
                                    mt-6
                                    w-full
                                    bg-green-600
                                    hover:bg-green-500
                                    transition-all
                                    rounded-xl
                                    py-4
                                    font-semibold
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    gap-3
                                    shadow-lg
                                    disabled:opacity-50
                                    cursor-pointer
                                "
                        >
                            <Send className="w-5 h-5" />

                            {loading
                                ? "Enviando solicitud..."
                                : "Solicitar acceso"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}