{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

{/* -------------------------------------------------------- DATA */ }
import { 
    Menu, 
    ListChevronsDownUp, 
    ListChevronsUpDown, 
    ListIndentDecrease, 
    LogOut, 
    User, 
    EllipsisVertical, 
    ChevronUp, 
    LayoutDashboard,
    ShieldUser,
    SatelliteDish,
    CloudSync,
    FileText,
    House,
    TriangleAlert,
    MapPin,
    CalendarDays,
} from 'lucide-react';

import { NAVBAR_TITLES } from "../data/dataMeta";

{/* -------------------------------------------------------- CONTEXT */ }
import { useAuth } from "../context/AuthContext";
import { accessPanelsRoutes } from "../config/accesibleroutes.config";

{/* -------------------------------------------------------- COMPONENTS */ }

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const Navbar = ({
    user = null, // { name: "Jimmy W Soto" }
    onToggleLeft,
    onToggleRight,
}) => {
    const { logout, isActive } = useAuth();
    const navigate = useNavigate();
    const [openLeft, setOpenLeft] = useState(false);
    const [openRight, setOpenRight] = useState(false);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const ref = useRef(null);

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username ?? 'U')}&background=1EA85A&color=fff`;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const location = useLocation();
    const config =
        accessPanelsRoutes[location.pathname] ??
        {
            left: false,
            right: false
        };

    const menuItems = [
        {
            icon: House,
            label: "Página de Inicio",
            path: "/",
            show: true,
            style: "text-gray-500 hover:text-white bg-gray-300 hover:bg-[var(--color-hover)] rounded-t",
        },
        
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/dashboard",
            show: true,
            style: "text-gray-500 hover:text-white bg-gray-200 hover:bg-[var(--color-hover)]",
        },
        
        {
            icon: TriangleAlert,
            label: "Registro de Alertas",
            path: "/registro",
            show: true,
            style: "text-gray-500 hover:text-white bg-gray-300 hover:bg-[var(--color-hover)]",
        },
        {
            icon: CalendarDays,
            label: "Fichas de Monitoreo",
            path: "/fichas",
            show: true,
            style: "text-gray-500 hover:text-white bg-gray-200 hover:bg-[var(--color-hover)]",
        },
        {
            icon: User,
            label: "Editar perfil",
            path: "/profile",
            show: true,
            style: "text-gray-500 hover:text-white bg-gray-300 hover:bg-[var(--color-hover)]",
        },
        {
            icon: FileText,
            label: "Generar Reporte",
            path: "/report",
            show: true,
            style: "text-gray-500 hover:text-white bg-gray-200 hover:bg-[var(--color-hover)]",
        },
        {
            icon: ShieldUser,
            label: "Access Panel",
            path: "/access-panel",
            show: user?.role === "superadmin",
            style: "text-gray-500 hover:text-white bg-gray-300 hover:bg-[var(--color-hover)]",
        },
        {
            icon: CloudSync,
            label: "Update Cache",
            path: "/cache-panel",
            show: user?.role === "superadmin",
            style: "text-gray-500 hover:text-white bg-gray-200 hover:bg-[var(--color-hover)]",
        },
        {
            icon: SatelliteDish,
            label: "Val-SAT",
            path: "/planet-validation-viewer",
            show: ["superadmin", "admin"].includes(user?.role),
            style: "text-gray-500 hover:text-white bg-gray-300 hover:bg-[var(--color-hover)]",
        },
        {
            icon: MapPin,
            label: "Atención a Alertas",
            path: "/seguimiento",
            show: user?.role === "superadmin",
            style: "text-gray-500 hover:text-white bg-gray-200 hover:bg-[var(--color-hover)]",
        },
    ];
    
    return (
        <header className="h-12 flex items-center justify-between px-4 py-2 bg-green-700 text-white shadow-md">

            {/* IZQUIERDA */}
            <div className="flex items-center gap-2">
                {/* Toggle panel izquierdo */}
                {config.left && (<button
                    onClick={() => { onToggleLeft(); setOpenLeft(!openLeft) }}
                    className="px-2 py-2 bg-green-900 rounded hover:bg-green-800 transition-all cursor-pointer text-gray-200"
                >
                    {!openLeft ? <Menu size={'16px'} /> : <ListIndentDecrease size={'16px'} />}
                </button>)}

                {/* Logo + título */}
                <Link to="/" className="flex gap-2 items-center">
                    <img
                        src="/logo-new-ecuador.png"
                        alt="Logo"
                        className="h-8 w-32"
                    />
                    <h1 className="hidden md:flex text-2xl font-semibold leading-tight truncate w-[200px] md:w-full">
                        {NAVBAR_TITLES[location.pathname]?.extended || 'PR-SATA'}
                    </h1>

                    <h1 className="md:hidden text-xl font-semibold leading-tight truncate w-[200px]">
                        {NAVBAR_TITLES[location.pathname]?.compacted || 'PR-SATA'}
                    </h1>
                </Link>
            </div>

            {/* DERECHA */}
            <div className="flex items-center gap-2">

                {/* Usuario / Login */}
                {!user ? (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-1 py-1 bg-green-900 hover:text-green-700 rounded-full hover:bg-gray-100 transition text-sm font-medium flex gap-1 items-center cursor-pointer"
                    >
                        <img className='w-6 h-6' src="https://img.icons8.com/color/48/test-account.png" alt="test-account" />
                        <span className="font-medium truncate max-w-[120px] hidden md:block">
                            Iniciar sesión
                        </span>
                    </button>
                ) : (
                    <>
                        <div className="flex items-center gap-1 px-1 py-1 bg-green-900 rounded-full text-sm cursor-default">
                            <img
                                src={avatar}
                                alt="avatar"
                                className="h-6 w-6 rounded-full object-cover shadow"
                            />
                            <span className="font-medium truncate max-w-[120px] hidden md:block">
                                {user.username}
                            </span>
                        </div>
                    </>
                )}

                {user &&
                    <div
                        ref={ref}
                        className="relative"
                    >
                        <button
                            title="Opciones"
                            onClick={() => {
                                setUserMenuOpen((v) => !v);
                            }}
                            className="px-2 py-2 bg-green-900 rounded-full hover:bg-green-800 transition-all text-sm flex gap-1 items-center cursor-pointer"
                        >
                            {!userMenuOpen? <EllipsisVertical size={16} /> : <ChevronUp size={16} />}
                        </button>

                        {/* Menú flotante */}
                        {userMenuOpen && (
                            <div
                                className={"absolute top-12 right-0 z-[6000] w-48 rounded-lg bg-gray-200  shadow-2xl border border-[var(--color-border)]"}
                            >
                    
                                {menuItems
                                    .filter(item => item.show)
                                    .map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.path}
                                                className={`w-full flex items-center gap-2 px-4 py-1 text-sm cursor-pointer ${item.style}`}
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    navigate(item.path);
                                                }}
                                            >
                                                <Icon size={16} />
                                                {item.label}
                                            </button>
                                        );
                                    })
                                }

                                <button
                                    className="w-full rounded-b flex items-center gap-2 px-4 py-1 text-sm text-red-400  hover:font-semibold bg-gray-200 hover:bg-[var(--color-hover)] cursor-pointer"
                                    onClick={() => {
                                        setUserMenuOpen(false);
                                        logout();
                                    }}
                                >
                                    <LogOut size={16} />
                                    Cerrar sesión
                                </button>

                            </div>
                        )}
                        
                    </div>
                }

                {/* Toggle panel derecho */}
                {config.right ? (
                    <button
                        onClick={() => { onToggleRight(); setOpenRight(!openRight) }}
                        className="px-2 py-2 bg-green-900 rounded hover:bg-green-800 transition-all cursor-pointer text-gray-200"
                    >
                        {!openRight ? <ListChevronsUpDown size={16} /> : <ListChevronsDownUp size={16} />}
                    </button>
                ) : null}

            </div>
        </header>
    );
};

export default Navbar;
