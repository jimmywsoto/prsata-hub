{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import {
    useEffect,
    useState,
} from "react";

import {
    RefreshCw,
    Database,
    CalendarDays,
    Layers3,
    ShieldCheck,
    Clock3,
    CheckCircle2,
} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

{/* -------------------------------------------------------- CONTEXT */ }
import { useAuth } from "../context/AuthContext";

{/* -------------------------------------------------------- COMPONENTS */ }
import { useToast } from "../components/ToastProvider";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function
    AdminPlanetCachePanel() {

    const { showToast } =
        useToast();

    const { user } =
        useAuth();

    {/* -------------------------------------------------------- STATES */ }
    const [loading, setLoading] =
        useState(false);

    const [refreshing, setRefreshing] =
        useState(false);

    const [status, setStatus] =
        useState(null);

    const [latest, setLatest] =
        useState(null);

    const [total, setTotal] =
        useState(0);


    {/* -------------------------------------------------------- FETCH STATUS */ }
    const fetchStatus =
        async () => {

            try {

                setLoading(true);

                const token = localStorage.getItem('token');


                const response =
                    await fetch(

                        `${API_URL}/api/admin/planet-cache-status`,

                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error
                    );
                }

                setStatus(result.cache);
                setLatest(result.latest);
                setTotal(
                    result.total_mosaics
                );

            } catch (error) {

                console.error(error);

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                setLoading(false);
            }
        };


    {/* -------------------------------------------------------- REFRESH CACHE */ }
    const refreshCache =
        async () => {

            try {

                setRefreshing(true);

                const token = localStorage.getItem('token');

                showToast(
                    "Actualizando mosaicos Planet...",
                    "info"
                );

                const response =
                    await fetch(

                        `${API_URL}/api/admin/refresh-planet-cache`,

                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.error
                    );
                }

                showToast(
                    "Cache Planet actualizada correctamente",
                    "success"
                );

                await fetchStatus();

            } catch (error) {

                console.error(error);

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                setRefreshing(false);
            }
        };


    {/* -------------------------------------------------------- EFFECT */ }
    useEffect(() => {

        if (
            user?.role === "admin" ||
            user?.role === "superadmin"
        ) {

            fetchStatus();
        }

    }, []);


    {/* -------------------------------------------------------- ACCESS CONTROL */ }
    if (
        user?.role !== "admin" &&
        user?.role !== "superadmin"
    ) {

        return (

            <div
                className="
                    bg-red-500/10
                    border
                    border-red-500/30
                    rounded-2xl
                    p-6
                    text-red-300
                "
            >

                No autorizado

            </div>
        );
    }


    return (

        <div className="flex flex-col h-full items-center">
            {/* -------------------------------------------------------- BACKGROUND */}
            <div className="absolute inset-0 patterns" />

            {/* -------------------------------------------------------- CARD */}
            <div className="w-full max-w-3xl z-50 flex flex-col h-screen overflow-hidden m-6 p-4 justify-center">

                <div className="card-pattern p-6 rounded-lg overflow-y-auto scrollbar-none px-10 shadow-xl">
                    {/* ------------------------------------------------ HEADER */}
                    <div className=" flex items-center justify-between mb-6 ">

                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Database className="w-7 h-7 text-cyan-400"/>
                                Planet Cache Manager
                            </h2>

                            <p className="text-slate-500 mt-1">
                                Gestión y sincronización
                                de mosaicos Planet
                            </p>
                        </div>

                        <button
                            onClick={refreshCache}
                            disabled={ refreshing }
                            className="flex items-center gap-2 bg-green-400 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold px-5 py-3 rounded-2xl transition-all cursor-pointer text-white">

                            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : "" }`} />

                            { refreshing ? "Actualizando..." : "Refrescar Cache" }
                        </button>
                    </div>

                    {/* ------------------------------------------------ GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* TOTAL */}

                        <div className="card-input rounded-2xl p-5">

                            <div className="flex items-center gap-3  mb-3">
                                <Layers3 className="w-6 h-6"/>

                                <span className="text-slate-500 font-medium">
                                    Total mosaicos
                                </span>
                            </div>

                            <h3 className="text-4xl font-bold">
                                {total}
                            </h3>
                        </div>

                        {/* LAST UPDATE */}
                        <div className="card-input rounded-2xl p-5">

                            <div className="flex items-center gap-3 mb-3">

                                <Clock3 className="w-6 h-6 text-amber-400 "/>
                                <span
                                    className="text-slate-500 font-medium"
                                >
                                    Última actualización
                                </span>

                            </div>

                            <p
                                className="font-semibold">

                                {
                                    status?.last_updated
                                        ? new Date(
                                            status.last_updated
                                        ).toLocaleString()
                                        : "Sin datos"
                                }

                            </p>

                        </div>

                        {/* STATUS */}
                        <div className="card-input rounded-2xl p-5">

                            <div className="flex items-center gap-3 mb-3">

                                <ShieldCheck className="w-6 h-6 text-emerald-400"/>

                                <span className="text-slate-500 font-medium">
                                    Estado
                                </span>

                            </div>

                            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-5 h-5"/>

                                {
                                    status?.status || "OK"
                                }

                            </div>

                        </div>
                    </div>

                    {/* ------------------------------------------------ LATEST */}
                    <div className="card-input mt-6 rounded-2xl p-5">

                        <div className="flex items-center gap-3 mb-4">

                            <CalendarDays className="w-6 h-6 text-cyan-400"/>

                            <h3 className="text-lg font-semibold text-slate-500">
                                Último mosaico detectado
                            </h3>

                        </div>

                        {
                            latest ? (

                                <div className="space-y-2">

                                    <p className="text-slate-400 font-mono break-all">
                                        {latest.name}
                                    </p>

                                    <p className="text-slate-400">
                                        {latest.month}
                                    </p>

                                    <p className="text-slate-500 text-sm">
                                        {
                                            latest.first_acquired
                                        }
                                    </p>
                                    
                                </div>

                            ) : (
                                <p className="text-slate-500">
                                    No existe mosaico latest
                                </p>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}