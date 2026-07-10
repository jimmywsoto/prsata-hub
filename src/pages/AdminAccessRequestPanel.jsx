{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock3,
    Trash2,
    ShieldCheck,
    MessageSquare,
    User,
    CalendarDays,
} from "lucide-react";
{/* -------------------------------------------------------- DATA */ }
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

{/* -------------------------------------------------------- CONTEXT */ }
import { useAuth } from "../context/AuthContext";

{/* -------------------------------------------------------- COMPONENTS */ }
import { useToast } from '../components/ToastProvider';

{/* -------------------------------------------------------- PAGES */ }

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function AdminAccessRequestsPanel() {
    const { showToast } = useToast();

    {/* -------------------------------------------------------- STATES */ }
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [processingId, setProcessingId] = useState(null);

    {/* -------------------------------------------------------- MOCK ADMIN USER: REPLACE WITH AUTHENTICATED USER*/ }
    const { user } = useAuth();
    const adminUserId =
        user?.role === "superadmin"
            ? user.id
            : null;

    {/* -------------------------------------------------------- FETCH REQUEST */ }
    const fetchRequests = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/access-requests`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setRequests(result.data || []);

        } catch (error) {

            console.error(error);
            alert(error.message);

        } finally {

            setLoading(false);
        }
    };

    {/* -------------------------------------------------------- APPROVE REQUEST */ }
    const handleApprove = async (requestId) => {

        const confirmApprove = window.confirm(
            "¿Deseas aprobar esta solicitud de acceso?"
        );

        if (!confirmApprove) return;

        try {

            setProcessingId(requestId);

            const response = await fetch(
                `${API_URL}/api/access-requests/${requestId}/approve`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reviewed_by: adminUserId,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            await fetchRequests();
            showToast("Solicitud aprobada con éxito.", "success");

        } catch (error) {

            showToast("Error al aprobar solicitud: " + error.message, "error");

        } finally {

            setProcessingId(null);
        }
    };

    {/* -------------------------------------------------------- REJECT REQUEST */ }
    const handleReject = async (requestId) => {

        const confirmReject = window.confirm(
            "¿Deseas rechazar esta solicitud de acceso?"
        );

        if (!confirmReject) return;

        try {

            setProcessingId(requestId);

            const response = await fetch(
                `${API_URL}/api/access-requests/${requestId}/reject`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reviewed_by: adminUserId,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            await fetchRequests();
            showToast("Solicitud rechazada con éxito.", "success");

        } catch (error) {

            showToast("Error al rechazar solicitud: " + error.message, "error");

        } finally {

            setProcessingId(null);
        }
    };

    {/* -------------------------------------------------------- DELETE REQUEST */ }
    const handleDelete = async (requestId) => {

        const confirmDelete = window.confirm(
            "¿Deseas eliminar esta solicitud?"
        );

        if (!confirmDelete) return;

        try {

            setProcessingId(requestId);

            const response = await fetch(
                `${API_URL}/api/access-requests/${requestId}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            await fetchRequests();
            showToast("Solicitud eliminada con éxito.", "success");

        } catch (error) {

            showToast("Error al eliminar solicitud: " + error.message, "error");

        } finally {

            setProcessingId(null);
        }
    };

    {/* -------------------------------------------------------- FILTER REQUESTS */ }
    const filteredRequests = useMemo(() => {

        return requests.filter((request) => {

            const matchesSearch =
                request.user_id
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                request.request_message
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL"
                    ? true
                    : request.request_status === statusFilter;

            return matchesSearch && matchesStatus;
        });

    }, [requests, search, statusFilter]);

    {/* -------------------------------------------------------- STATS */ }
    const stats = useMemo(() => {

        return {
            total: requests.length,
            pending: requests.filter(
                (request) => request.request_status === "PENDING"
            ).length,
            approved: requests.filter(
                (request) => request.request_status === "APPROVED"
            ).length,
            rejected: requests.filter(
                (request) => request.request_status === "REJECTED"
            ).length,
        };

    }, [requests]);

    {/* -------------------------------------------------------- INIT */ }
    useEffect(() => {
        fetchRequests();
    }, []);

    {/* -------------------------------------------------------- BADGES CONFIG */ }
    const renderStatusBadge = (status) => {

        const styles = {
            PENDING: {
                label: "Pendiente",
                icon: <Clock3 className="w-4 h-4" />,
                className:
                    "bg-yellow-500/40 text-yellow-600 border-yellow-500/20",
            },
            APPROVED: {
                label: "Aprobada",
                icon: <CheckCircle2 className="w-4 h-4" />,
                className:
                    "bg-green-500/40 text-green-600 border-green-500/20",
            },
            REJECTED: {
                label: "Rechazada",
                icon: <XCircle className="w-4 h-4" />,
                className:
                    "bg-red-500/40 text-red-600 border-red-500/20",
            },
        };

        const current = styles[status];

        return (
            <div
                className={`
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-1
                    rounded-xl
                    border
                    text-sm
                    font-medium
                    ${current.className}
                `}
            >
                {current.icon}
                {current.label}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full items-center">

            {/* -------------------------------------------------------- BACKGROUND */}
            <div className="absolute inset-0 patterns" />

            {/* -------------------------------------------------------- CARD */}
            <div className="w-full max-w-7xl z-50 flex flex-col h-screen overflow-hidden m-6 p-4 rounded-lg justify-center">

                <div className="card-pattern p-6 rounded-lg overflow-y-auto scrollbar-none px-10 shadow-xl">
                    
                    {/* -------------------------------------------------------- HEADER */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">

                        <div>
                            <h1 className="text-4xl font-bold flex items-center gap-4">
                                <ShieldCheck className="w-10 h-10 text-green-500" />
                                Gestión de Solicitudes de Acceso
                            </h1>

                            <p className="mt-3 text-lg text-slate-500">
                                Administra solicitudes de acceso de usuarios a la plataforma.
                            </p>
                        </div>

                        <button
                            onClick={fetchRequests}
                            className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            bg-green-600
                            hover:bg-green-500
                            transition-all
                            rounded-full
                            px-4
                            py-2
                            font-semibold
                            shadow-lg
                            text-white
                            cursor-pointer
                        "
                        >
                            <RefreshCw className="w-5 h-5" />
                            Actualizar
                        </button>
                    </div>

                    {/* -------------------------------------------------------- STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">

                        <StatCard
                            title="Total"
                            value={stats.total}
                            icon={<ShieldCheck className="w-6 h-6" />}
                        />

                        <StatCard
                            title="Pendientes"
                            value={stats.pending}
                            icon={<Clock3 className="w-6 h-6" />}
                        />

                        <StatCard
                            title="Aprobadas"
                            value={stats.approved}
                            icon={<CheckCircle2 className="w-6 h-6" />}
                        />

                        <StatCard
                            title="Rechazadas"
                            value={stats.rejected}
                            icon={<XCircle className="w-6 h-6" />}
                        />
                    </div>

                    {/* -------------------------------------------------------- FILTERS */}
                    <div className="bg-gray-300/30 rounded-xl p-2 mb-6">

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* SEARCH */}
                            <div className="relative col-span-2 ">

                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por usuario o mensaje..."
                                    className="
                                    w-full
                                    bg-[var(--color-bg)]/10
                                    rounded-xl
                                    pl-12
                                    pr-4
                                    py-4
                                    outline-none
                                    focus:ring-2
                                    focus:ring-green-400
                                    transition-all
                                "
                                />
                            </div>

                            {/* FILTER */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="
                                bg-[var(--color-bg)]/10
                                rounded-xl
                                px-4
                                py-4
                                outline-none
                                focus:ring-2
                                focus:ring-green-400
                                transition-all
                                text-gray-400
                            "
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="PENDING">Pendientes</option>
                                <option value="APPROVED">Aprobadas</option>
                                <option value="REJECTED">Rechazadas</option>
                            </select>
                        </div>
                    </div>

                    {/* -------------------------------------------------------- TABLE */}
                    <div className="bg-gray-300/30 border border-gray-300 rounded-xl overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-300 border-b border-gray-300">
                                    <tr>
                                        <th className="text-center px-6 py-5 text-slate-500 font-medium">
                                            Usuario
                                        </th>

                                        <th className="text-center px-6 py-5 text-slate-500 font-medium">
                                            Solicitud
                                        </th>

                                        <th className="text-center px-6 py-5 text-slate-500 font-medium">
                                            Estado
                                        </th>

                                        <th className="text-center px-6 py-5 text-slate-500 font-medium">
                                            Fecha
                                        </th>

                                        <th className="text-center px-6 py-5 text-slate-500 font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {!loading && filteredRequests.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center py-16 text-slate-500"
                                            >
                                                No existen solicitudes registradas.
                                            </td>
                                        </tr>
                                    )}

                                    {loading && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center py-16 text-slate-500"
                                            >
                                                Cargando solicitudes...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && filteredRequests.map((request) => (

                                        <tr
                                            key={request.id}
                                            className="border-b border-gray-300 hover:bg-slate-800/10 transition-all"
                                        >

                                            {/* USER */}
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex items-start gap-3">

                                                    <div className="w-10 h-10 rounded-xl bg-slate-800/20 flex items-center justify-center flex-shrink-0">
                                                        <User className="w-5 h-5 text-slate-500" />
                                                    </div>

                                                    <div>
                                                        <div className="font-medium break-all leading-4">
                                                            {request.user_id}
                                                        </div>

                                                        <div className="text-sm text-slate-500/80 mt-1">
                                                            ID Solicitud: {request.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* MESSAGE */}
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex gap-3 max-w-md">

                                                    <MessageSquare className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />

                                                    <p className="text-slate-500/80 leading-5">
                                                        {request.request_message || "Sin mensaje"}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-5 align-top">
                                                {renderStatusBadge(request.request_status)}
                                            </td>

                                            {/* DATE */}
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex items-center gap-3 text-slate-500/80">
                                                    <CalendarDays className="w-5 h-5 text-slate-400" />

                                                    {new Date(request.created_at)
                                                        .toLocaleString()}
                                                </div>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-5 align-top">

                                                <div className="flex items-center justify-center gap-3 text-white">

                                                    {request.request_status === "PENDING" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(request.id)}
                                                                disabled={processingId === request.id}
                                                                className="
                                                                    bg-green-600/80
                                                                    hover:bg-green-500
                                                                    transition-all
                                                                    rounded-full
                                                                    p-2
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    font-medium
                                                                    disabled:opacity-50
                                                                    cursor-pointer
                                                                "
                                                                title="Aprobar solicitud"
                                                            >
                                                                <CheckCircle2 className="w-6 h-6" />
                                                                
                                                            </button>

                                                            <button
                                                                onClick={() => handleReject(request.id)}
                                                                disabled={processingId === request.id}
                                                                className="
                                                                    bg-red-600/80
                                                                    hover:bg-red-500
                                                                    transition-all
                                                                    rounded-full
                                                                    p-2
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    font-medium
                                                                    disabled:opacity-50
                                                                    cursor-pointer
                                                                "
                                                                title="Rechazar"
                                                            >
                                                                <XCircle className="w-6 h-6" />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(request.id)}
                                                        disabled={processingId === request.id}
                                                        className="
                                                        bg-slate-500/20
                                                        hover:bg-slate-700/20
                                                        transition-all
                                                        rounded-full
                                                        p-2
                                                        disabled:opacity-50
                                                        cursor-pointer
                                                    "
                                                    >
                                                        <Trash2 className="w-6 h-6 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   COMPONENTE ESTADÍSTICA
========================================================= */
function StatCard({
    title,
    value,
    icon,
}) {

    return (
        <div className="bg-gray-300/30 rounded-xl p-4">

            <div className="flex items-center justify-between mb-4">

                <div className="text-slate-500 font-medium">
                    {title}
                </div>

                <div className="text-green-500">
                    {icon}
                </div>
            </div>

            <div className="text-5xl font-bold">
                {value}
            </div>
        </div>
    );
}