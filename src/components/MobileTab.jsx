{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    UPDATED AT: October, 2026
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { Map, Database, ChartNoAxesCombined } from 'lucide-react';

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const MobileTab = ({ 
    mobileTab, 
    setMobileTab 
}) => {
    return (
        <div className="flex px-2 py-1 bg-gray-100">
            <button
                onClick={() => setMobileTab("map")}
                aria-label="Mapa"
                aria-selected={mobileTab === "map"}
                className={`
                    flex flex-1 p-1 rounded-l-full
                    justify-start items-center gap-2
                    cursor-pointer transition-all duration-300 border border-white shadow-xl
                
                    ${mobileTab === "map"
                        ? "bg-green-700/80 text-white shadow-md"
                        : "bg-gray-200 hover:bg-green-300/30 "
                    }
                `}
            >
                <span
                    className={`
                        h-8 w-8 rounded-full flex items-center justify-center
                        transition-colors duration-300
                        ${mobileTab === "map"
                            ? "bg-white text-green-600"
                            : "bg-white"
                        }
                    `}
                >
                    <Map size={22} />
                </span>

                <span className=" xs:block font-medium">
                    Mapa
                </span>
            </button>

            <button
                onClick={() => setMobileTab("cards")}
                aria-label="Datos"
                aria-selected={mobileTab === "cards"}
                className={`
                    flex flex-1  border-x border-white
                    justify-center items-center gap-2
                    cursor-pointer transition-all duration-300 border border-white shadow-xl

                    ${mobileTab === "cards"
                        ? "bg-green-700/80 text-white shadow-md"
                        : "bg-gray-200  hover:bg-green-300/30"
                    }
                `}
            >
                <span
                    className={`
                        h-8 w-8 rounded-full flex items-center justify-center
                        transition-colors duration-300
                        ${mobileTab === "cards"
                            ? "bg-white text-green-600"
                            : "bg-white"
                        }
                    `}
                >
                    <Database size={22} />
                </span>

                <span className="xs:block font-medium">
                    Datos
                </span>
            </button>

            <button
                onClick={() => setMobileTab("charts")}
                aria-label="Gráficos"
                aria-selected={mobileTab === "charts"}
                className={`
                    flex flex-1 p-1 rounded-r-full
                    justify-end items-center gap-2
                    cursor-pointer transition-all duration-300 border border-white shadow-xl

                    ${mobileTab === "charts"
                        ? "bg-green-700/80 text-white shadow-md"
                        : "bg-gray-200 hover:bg-green-300/30"
                    }
                `}
            >
                <span className=" xs:block font-medium">
                    Gráficos
                </span>
                
                <span
                    className={`
                        h-8 w-8 rounded-full flex items-center justify-center
                        transition-colors duration-300
                        ${mobileTab === "charts"
                            ? "bg-white text-green-600"
                            : "bg-white"
                        }
                    `}
                >
                    <ChartNoAxesCombined size={22} />
                </span>

            </button>
        </div>
    )
}

export default MobileTab;
