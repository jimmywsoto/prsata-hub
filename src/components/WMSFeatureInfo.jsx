{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: September, 2026.
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { X, Info, Loader2, AlertCircle } from "lucide-react";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const WMSFeatureInfo = ({
    results = [],
    loading = false,
    error = null,
    open = false,
    onClose
}) => {
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

    // Evitar que los eventos del panel lleguen al mapa
    useEffect(() => {

        if (!open) return;

        const container = containerRef.current;
        const button = buttonRef.current;

        if (!container) return;

        console.log('Si existe el contenedor', container)

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);


        if (button) {
            L.DomEvent.disableClickPropagation(button);
        }

    }, [open]);

    const validResults = useMemo(() => {
        return results.filter(
            (result) =>
                result &&
                Array.isArray(result.features) &&
                result.features.length > 0
        );
    }, [results]);

    const featureCount = useMemo(() => {
        return validResults.reduce(
            (total, result) => total + result.features.length,
            0
        );
    }, [validResults]);

    if (!open) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="
                absolute
                top-4
                right-4
                z-[1100]
                w-[360px]
                max-w-[calc(100%-2rem)]
                max-h-[70vh]
                overflow-hidden
                rounded-lg
                bg-white
                shadow-xl
            "
        >
            {/* =====================================================
                CABECERA
            ====================================================== */}
            <div className="flex items-center justify-between border-b text-white bg-green-700/80 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                    <Info className="h-5 w-5 shrink-0 text-white" />

                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                            Información WMS
                        </h3>

                        {!loading && !error && validResults.length > 0 && (
                            <p className="text-xs text-white">
                                {featureCount} elemento
                                {featureCount !== 1 ? "s" : ""} encontrado
                                {featureCount !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    ref={buttonRef}
                    type="button"
                    onClick={onClose}
                    className="
                        ml-2
                        rounded-md
                        p-1.5
                        text-white
                        transition
                        cursor-pointer
                        hover:bg-gray-200/50
                        hover:text-red-400
                    "
                    title="Cerrar"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* =====================================================
                CONTENIDO
            ====================================================== */}
            <div className="max-h-[calc(70vh-60px)] overflow-y-auto">
                {/* -------------------------------------------------
                    CARGANDO
                -------------------------------------------------- */}
                {loading && (
                    <div className="flex flex-col items-center justify-center px-6 py-10">
                        <Loader2 className="mb-3 h-7 w-7 animate-spin text-blue-600" />

                        <p className="text-sm font-medium text-gray-700">
                            Consultando información...
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Consultando las capas WMS visibles
                        </p>
                    </div>
                )}

                {/* -------------------------------------------------
                    ERROR
                -------------------------------------------------- */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center px-6 py-10">
                        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />

                        <p className="text-sm font-semibold text-gray-700">
                            Error al consultar WMS
                        </p>

                        <p className="mt-2 text-center text-xs text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* -------------------------------------------------
                    SIN INFORMACIÓN
                -------------------------------------------------- */}
                {!loading && !error && validResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-6 py-10">
                        <Info className="mb-3 h-8 w-8 text-gray-400" />

                        <p className="text-sm font-semibold text-gray-700">
                            No hay información
                        </p>

                        <p className="mt-1 text-center text-xs text-gray-500">
                            No se encontraron elementos en las capas WMS
                            consultadas para esta ubicación.
                        </p>
                    </div>
                )}

                {/* -------------------------------------------------
                    RESULTADOS
                -------------------------------------------------- */}
                {!loading &&
                    !error &&
                    validResults.length > 0 && (
                        <div className="divide-y divide-gray-200">
                            {validResults.map((result, resultIndex) => (
                                <LayerSection
                                    key={
                                        result.layerId ||
                                        result.layerName ||
                                        resultIndex
                                    }
                                    result={result}
                                />
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
};

/* ================================================================
   SECCIÓN DE CAPA
================================================================ */

const LayerSection = ({ result }) => {
    return (
        <div className="p-4">
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-green-700/80">
                    {result.layerName || "Capa WMS"}
                </h4>

                {result.features.length > 1 && (
                    <p className="mt-0.5 text-xs text-gray-500">
                        {result.features.length} elementos
                    </p>
                )}
            </div>

            <div className="space-y-4">
                {result.features.map((feature, index) => (
                    <FeatureTable
                        key={feature.id || index}
                        feature={feature}
                        index={index}
                        total={result.features.length}
                    />
                ))}
            </div>
        </div>
    );
};

/* ================================================================
   TABLA DE ATRIBUTOS
================================================================ */

const FeatureTable = ({ feature, index, total }) => {
    const properties = feature?.properties || {};

    const entries = Object.entries(properties);

    return (
        <div
            className="
                overflow-hidden
                rounded-md
                border
                border-gray-200
            "
        >
            {total > 1 && (
                <div className="border-b bg-gray-50 px-3 py-2">
                    <span className="text-xs font-semibold text-green-700/80">
                        Elemento {index + 1}
                    </span>
                </div>
            )}

            {entries.length === 0 ? (
                <div className="px-3 py-4 text-xs text-gray-500">
                    El elemento no contiene atributos.
                </div>
            ) : (
                <table className="w-full border-collapse text-xs">
                    <tbody>
                        {entries.map(([field, value]) => (
                            <tr
                                key={field}
                                className="border-b border-gray-100 last:border-b-0"
                            >
                                <td
                                    className="
                                        w-[30%]
                                        bg-gray-50
                                        px-3
                                        py-1
                                        align-top
                                        font-semibold
                                        text-green-700/80
                                    "
                                >
                                    {formatFieldName(field)}
                                </td>

                                <td
                                    className="
                                        px-3
                                        py-1
                                        align-top
                                        break-words
                                        text-green-700/70
                                    "
                                >
                                    {formatValue(value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

/* ================================================================
   FORMATEO
================================================================ */

const formatFieldName = (field) => {
    if (!field) return "";

    return String(field)
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Sí" : "No";
    }

    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    return String(value);
};

export default WMSFeatureInfo;
