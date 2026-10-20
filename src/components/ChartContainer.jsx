{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    VERSIÓN: 2.1.1
*/}

{/* -------------------------------------------------------- COMPONENTS */ }
import { useMemo, useState } from "react";

import {
    ChevronUp,
    Info,
    Fullscreen,
    FileSpreadsheet,
} from 'lucide-react';

import ChartRenderer from "./ChartRenderer";
import ChartFullscreen from "./ChartFullscreen";
import TableCSV from "./TableCSV";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const ChartContainer = ({
    data,
    json,
    date,
    chart = 'SimpleBarChart',
    chartRef,
}) => {

    const [openInfo, setOpenInfo] = useState(false);
    const [openFullscreen, setOpenFullscreen] = useState(false);
    const [download, setDownload] = useState(false);

    const exportData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        // Formato: [["ESMERALDAS", 726], ...]
        if (data.every(Array.isArray)) {
            return data.map((row) => [...row]);
        }

        // Formato: [{ provincia: "ESMERALDAS", recuento: 726 }, ...]
        if (
            data.every(
                (item) =>
                    item !== null &&
                    typeof item === "object" &&
                    !Array.isArray(item)
            )
        ) {
            return data.map((item) => ({ ...item }));
        }

        return [];
    }, [data]);

    const isArrayFormat = exportData.length > 0 && Array.isArray(exportData[0]);

    const columns = useMemo(() => {
        if (exportData.length === 0) return [];

        if (isArrayFormat) {
            const maxLength = Math.max(
                ...exportData.map((row) => row.length)
            );

            return Array.from(
                { length: maxLength },
                (_, index) => {
                    if (index === 0) return "Provincia";
                    if (index === 1) return "Recuento";
                    return `Campo ${index + 1}`;
                }
            );
        }

        const keys = new Set();

        exportData.forEach((item) => {
            Object.keys(item).forEach((key) => keys.add(key));
        });

        return Array.from(keys);
    }, [exportData, isArrayFormat]);

    const csvData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                headers: [],
                rows: [],
            };
        }

        // Formato: [["ESMERALDAS", 726], ...]
        if (data.every(Array.isArray)) {
            return {
                headers: [
                    { label: "Categoria", key: "provincia" },
                    { label: "Recuento", key: "recuento" },
                ],
                rows: data.map(([provincia, recuento]) => ({
                    provincia,
                    recuento,
                })),
            };
        }

        // Formato: [{ provincia: "ESMERALDAS", recuento: 726 }, ...]
        if (
            data.every(
                (item) =>
                    item !== null &&
                    typeof item === "object" &&
                    !Array.isArray(item)
            )
        ) {
            const keys = [
                ...new Set(data.flatMap((item) => Object.keys(item))),
            ];

            return {
                headers: keys.map((key) => ({
                    label: key,
                    key,
                })),
                rows: data,
            };
        }

        return {
            headers: [],
            rows: [],
        };
    }, [data]);

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
                        type="button"
                        title="Previsualizar y exportar datos"
                        aria-label="Previsualizar y exportar datos"
                        className="bg-green-700/80 p-1 rounded-full hover:bg-green-800 cursor-pointer"
                        onClick={() => setDownload(true)}
                    >
                        <FileSpreadsheet size={14} />
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
                    ref={chartRef}
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

            {download && (
                <div
                    className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-3 sm:p-5"
                    onClick={() => setDownload(false)}
                >
                    <TableCSV 
                        filename={json.title}
                        tableData={exportData}
                        columns={columns}
                        csvData={csvData}
                        onClose={setDownload}
                    />
                </div>
            )}
        </section>
    );
};

export default ChartContainer;
