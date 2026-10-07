{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { Minimize } from "lucide-react";

{/* -------------------------------------------------------- COMPONENTS */ }
import ChartRenderer from "./ChartRenderer";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const ChartFullscreen = ({
    data,
    json,
    chart,
    date,
    onClose
}) => {

    return (
        <div
            className="
                fixed
                top-[48px]
                md:top-[64px]
                bottom-[46px]
                md:bottom-[56px]
                left-[0px]
                md:left-[16px]
                right-[0px]
                md:right-[15px]
                z-[6000]
                bg-white
                rounded-lg
                shadow-2xl
                overflow-hidden
                flex
                flex-col
                md:border
                md:border-gray-300
            "
        >

            {/* HEADER */}
            <div className="shrink-0 bg-green-700/80 px-2 py-1 text-center font-bold text-sm md:text-lg text-white flex items-center justify-between">

                <span className="truncate">
                    {json.title}
                </span>

                <button
                    title="Cerrar"
                    className="bg-green-700/80 p-1 rounded-full hover:bg-green-800 cursor-pointer"
                    onClick={onClose}
                >
                    <Minimize size={14} />
                </button>

            </div>


            {/* CHART */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden p-[10px]">

                <ChartRenderer
                    chart={chart}
                    data={data}
                    json={json}
                    fullscreen={true}
                />

            </div>

            {/* FOOTER */}
            <p className="shrink-0 font-light text-xs italic px-2 py-1 text-gray-400 truncate">
                Última actualización: {date}
            </p>

        </div>
    );
};

export default ChartFullscreen;
