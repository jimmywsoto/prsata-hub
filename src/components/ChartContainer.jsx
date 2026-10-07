{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- COMPONENTS */ }
import { useState } from "react";

import {
    ChevronUp, 
    Info,
    Fullscreen,
} from 'lucide-react';

import ChartRenderer from "./ChartRenderer";
import ChartFullscreen from "./ChartFullscreen";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const ChartContainer = ({ 
    data, 
    json, 
    date,
    chart = 'SimpleBarChart' 
}) => {

    const [openInfo, setOpenInfo] = useState(false);
    const [openFullscreen, setOpenFullscreen] = useState(false);

    return (
        <section className="flex flex-col h-full w-full overflow-hidden">

            {/* HEADER */}
            <div className="relative shrink-0 bg-green-700/80 w-full px-2 py-1 text-center font-bold text-sm md:text-lg text-white flex items-center justify-between">
                <span className=" truncate">
                    {json.title}
                </span>

                <div className="flex gap-1">

                    <button
                        title="Info"
                        className="bg-green-700/80 p-1 rounded-full hover:bg-green-800 cursor-pointer"
                        onClick={() => setOpenInfo((v) => !v)}
                    >
                        {!openInfo ? <Info size={14} /> : <ChevronUp size={14} />}
                    </button>

                    <button
                        title="Fullscreen"
                        className="bg-green-700/80 p-1 rounded-full hover:bg-green-800 cursor-pointer"
                        onClick={() => setOpenFullscreen((v) => !v)}
                    >
                        <Fullscreen size={14} />
                    </button>

                </div>

                {/* Info */}
                {openInfo && (
                    <div
                        className={"absolute top-10 right-1 z-[6000] max-w-32 bg-gray-200 shadow-2xl rounded font-normal"}
                    >
                        <span className="w-full text-xs text-gray-500 px-2 py-1 flex">
                            {json.info}
                        </span>
                    </div>
                )}

            </div>

            {/* CHART */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                <ChartRenderer
                    chart={chart}
                    data={data}
                    json={json}
                    fullscreen={false}
                />
            </div>

            {/* FOOTER */}
            <p className="shrink-0 font-light text-xs italic px-2 py-1 text-gray-400 truncate">
                Última actualización: {date}
            </p>

            {/* Fullscreen Chart */}
            {openFullscreen && (
                <ChartFullscreen
                    data={data}
                    json={json}
                    chart={chart}
                    date={date}
                    onClose={() => setOpenFullscreen(false)}
                />
            )}
        </section>
    );
};

export default ChartContainer;
