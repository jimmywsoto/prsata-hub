
import { CSVLink } from "react-csv";

import {
    Download,
    X,
    FileSpreadsheet,
} from 'lucide-react';

const TableCSV = ({
    filename,
    tableData,
    columns,
    csvData,
    onClose,
}) => {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[60vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* HEADER DEL MODAL */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-green-700/80 text-white">

                <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet size={20} />

                    <div className="min-w-0">
                        <h2
                            id="export-title"
                            className="font-semibold text-base sm:text-lg"
                        >
                            Exportar datos del gráfico
                        </h2>

                        <p className="text-xs text-green-100 truncate">
                            {filename}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    title="Cerrar"
                    aria-label="Cerrar modal"
                    className="shrink-0 p-2 rounded-full
                               hover:bg-green-800 cursor-pointer"
                    onClick={() => onClose(false)}
                >
                    <X size={20} />
                </button>
            </div>

            {/* RESUMEN */}
            <div className="shrink-0 px-4 py-3 border-b border-gray-200 flex flex-wrap gap-x-5 gap-y-1 text-sm">

                <span>
                    <strong>Registros:</strong>{" "}
                    {tableData.length}
                </span>

                <span>
                    <strong>Columnas:</strong>{" "}
                    {columns.length}
                </span>
            </div>

            {/* TABLA */}
            <div className="flex-1 min-h-0 overflow-auto">
                {tableData.length === 0 || columns.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No hay datos disponibles para exportar.
                    </div>
                ) : (
                    <table className="min-w-full text-sm border-collapse">

                        <thead className="sticky top-0 z-10 bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold border-b border-green-700/40">
                                    Categoría
                                </th>
                                <th className="px-4 py-2 text-right font-semibold border-b border-green-700/40">
                                    Recuento
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {tableData.map(([provincia, recuento], index) => (
                                <tr
                                    key={index}
                                    className={
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    }
                                >
                                    <td className="px-4 py-2 border-b border-gray-100">
                                        {provincia}
                                    </td>

                                    <td className="px-4 py-2 text-right border-b border-gray-100">
                                        {recuento}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* FOOTER */}
            <div className="shrink-0 flex flex-col-reverse
                            sm:flex-row sm:justify-between
                            sm:items-center gap-3 p-4
                            border-t border-gray-200 bg-gray-50">

                <p className="text-xs text-gray-500">
                    Vista previa de los datos utilizados
                    por el gráfico.
                </p>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg border
                                    border-gray-300 text-gray-700
                                    hover:bg-gray-100 cursor-pointer"
                        onClick={() => onClose(false)}
                    >
                        Cerrar
                    </button>

                    <CSVLink
                        data={csvData.rows}
                        headers={csvData.headers}
                        filename={`${filename || "datos-grafico"}.csv`}
                        separator=","
                        enclosingCharacter={'"'}
                        uFEFF
                        className={`px-4 py-2 rounded-lg bg-green-700/80 text-white
                                    hover:bg-green-700 flex items-center justify-center gap-2
                                    ${csvData.rows.length === 0
                                ? "opacity-50 pointer-events-none"
                                : "cursor-pointer"
                            }`}
                        onClick={(event) => {
                            if (csvData.rows.length === 0) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <Download size={16} />
                        Descargar datos en CSV
                    </CSVLink>

                </div>
            </div>
        </div>
    )
}

export default TableCSV;
