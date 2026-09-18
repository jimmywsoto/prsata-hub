{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useState } from "react";

import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Layers3,
    MapPinned,
    ArrowUpAZ,
    ArrowDownZA,
    RotateCcw,
} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }
import shp from "shpjs";

{/* -------------------------------------------------------- COMPONENTS */ }
import FieldDropdown from "./FieldDropdown";
import FileDropZone from "./FileDropZone";
import { useToast } from "./ToastProvider";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function FeaturesPanel({
    setGeojson,
    setLayerVersion,
    selectedIndex,
    setSelectedIndex,
    features,
    setFeatures
}) {
    const { showToast } = useToast();
    {/* -------------------------------------------------------- STATES */ }
    const [loading, setLoading] = useState(false);
    const [expandedFeatures, setExpandedFeatures] = useState(new Set());

    const [displayField, setDisplayField] = useState("Default");
    const [availableFields, setAvailableFields] = useState([]);

    const [originalFeatures, setOriginalFeatures] = useState([]);
    const [sortDirection, setSortDirection] = useState("default"); // default | asc | desc

    {/* -------------------------------------------------------- FILE LOAD */ }
    const handleFile = async (file) => {

        try {
            setLoading(true);

            if (!file) return;

            let parsed;

            // =====================
            // GEOJSON
            // =====================

            if (
                file.name.endsWith(".geojson") ||
                file.name.endsWith(".json")
            ) {
                const text = await file.text();
                parsed = JSON.parse(text);
            }

            // =====================
            // SHP ZIP
            // =====================

            else if (file.name.endsWith(".zip")) {
                const buffer = await file.arrayBuffer();
                parsed = await shp(buffer);
            }

            else {
                alert("Formato no soportado");
                return;
            }

            setGeojson(parsed);
            setLayerVersion(v => v + 1);

            const feats =
                (parsed.features || []).map(
                    (feature, index) => ({
                        ...feature,
                        __originalIndex: index + 1
                    })
                );

            setAvailableFields(
                buildAvailableFields(feats)
            );

            setFeatures(feats);
            setOriginalFeatures(feats);
            setSelectedIndex(0);

            showToast("Archivo cargado con éxito!.", "success");
        }

        catch (error) {
            console.error(error);
            showToast("Error cargando archivo!", "error");
        }

        finally {
            setLoading(false);
        }

    };

    {/* -------------------------------------------------------- NEXT FEATURE */ }
    const nextFeature = () => {
        if (
            selectedIndex <
            features.length - 1
        ) {
            setSelectedIndex(
                prev => prev + 1
            );
        }
    };

    {/* -------------------------------------------------------- PREVIOUS FEATURE */ }
    const previousFeature = () => {
        if (
            selectedIndex > 0
        ) {
            setSelectedIndex(
                prev => prev - 1
            );
        }
    };

    {/* -------------------------------------------------------- TOGGLE FEATURE */ }
    const toggleFeature = (index) => {
        setExpandedFeatures(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }

            return next;
        });
    };

    const buildAvailableFields = (features) => {

        if (!features.length)
            return [];

        const propertyNames =
            Object.keys(
                features[0].properties || {}
            );

        return propertyNames.map(name => {

            let detectedValue = null;

            for (const feature of features) {

                const value =
                    feature.properties?.[name];

                if (
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                ) {

                    detectedValue = value;
                    break;

                }

            }

            return {

                name,

                type: detectFieldType(detectedValue)

            };

        });

    };

    const selectedFieldInfo = availableFields.find(f => f.name === displayField);

    const compareValues = (
        a,
        b,
        type
    ) => {

        switch (type) {

            case "number":

                return (
                    Number(a ?? 0) -
                    Number(b ?? 0)
                );

            case "boolean":

                return (
                    Number(Boolean(a)) -
                    Number(Boolean(b))
                );

            case "date":

                return (
                    new Date(a).getTime() -
                    new Date(b).getTime()
                );

            default:

                return String(a ?? "")
                    .localeCompare(
                        String(b ?? ""),
                        undefined,
                        {
                            sensitivity: "base",
                            numeric: true
                        }
                    );

        }

    };

    const sortFeatures = () => {

        if (
            displayField === "Default"
        ) {

            setFeatures(originalFeatures);

            setSortDirection("default");

            return;

        }

        const nextDirection =

            sortDirection === "default"

                ? "asc"

                : sortDirection === "asc"

                    ? "desc"

                    : "default";

        if (
            nextDirection === "default"
        ) {

            setFeatures(originalFeatures);

            setSortDirection("default");

            return;

        }

        const sorted = [...features];

        sorted.sort((a, b) => {

            const result =
                compareValues(

                    a.properties?.[displayField],

                    b.properties?.[displayField],

                    selectedFieldInfo?.type

                );

            return nextDirection === "asc"

                ? result

                : -result;

        });

        setFeatures(sorted);

        setSortDirection(
            nextDirection
        );

    };

    return (
        <div className="w-full">

            <div
                className=" sticky top-0 z-20 bg-[var(--color-bg-pattern)] px-4 py-3 shadow-md"
            >
                {/* -------------------------------- LEFT */}
                <div className="flex items-center gap-4">

                    <div className="flex items-center gap-3">

                        <Layers3 className="w-6 h-6" />

                        <h1 className="text-xl font-bold">
                            Features Panel
                        </h1>

                    </div>

                </div>

                {/* -------------------------------- DROPZONE */}
                <div className="flex mt-2 mb-2">
                    <FileDropZone
                        accept=".geojson,.json,.zip"
                        helperText="GeoJSON, JSON o Shapefile (.zip)"
                        className="w-full"
                        expandedHeight="h-40"
                        collapsedHeight="h-36"
                        onFileSelected={handleFile}
                    />
                </div>

                {/* -------------------------------- FIELD DROPDOWN */}
                <div className="flex gap-2">

                    <FieldDropdown
                        fields={availableFields}
                        value={displayField}
                        onChange={setDisplayField}
                        placeholder="Buscar campo ..."
                    />

                    <button
                        onClick={sortFeatures}
                    >
                        {
                            sortDirection === "default"
                                ?
                                <ArrowUpAZ size={18} />
                                :
                                sortDirection === "asc"
                                    ?
                                    <ArrowDownZA size={18} />
                                    :
                                    <RotateCcw size={18} />
                        }
                    </button>

                </div>

                <h2 className="font-semibold mt-3">
                    Entidades (Features)
                </h2>

            </div>

            {
                features.map(
                    (
                        feature,
                        index
                    ) => {

                        const active = index === selectedIndex;

                        return (

                            <div
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`p-4 border-b border-[var(--color-pattern-border)] cursor-pointer transition-all
                                            ${active
                                        ? "bg-green-700/20"
                                        : "hover:bg-green-700/20"
                                    }
                                        `}
                            >

                                <div
                                    className="flex items-center justify-between"
                                >

                                    <div
                                        className="flex items-center gap-2"
                                    >

                                        <MapPinned className="w-4 h-4" />

                                        <span className="text-[var(--color-pattern-text)] text-sm font-medium">
                                            {
                                                displayField === "Default"
                                                    ? `Feature ${index + 1}`
                                                    : `Feature ${feature.__originalIndex}: ${feature.properties?.[displayField] ?? "-"}`
                                            }
                                        </span>

                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFeature(index);
                                        }}
                                        className="p-1 rounded hover:bg-black/10"
                                    >
                                        {
                                            expandedFeatures.has(index)
                                                ? <ChevronDown size={18} />
                                                : <ChevronRight size={18} />
                                        }
                                    </button>

                                </div>

                                {
                                    expandedFeatures.has(index) && (
                                        <pre className="mt-3 text-[11px] text-slate-500 overflow-hidden transition-all bg-green-700/60 p-2 rounded">
                                            {
                                                Object.entries(feature.properties).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex justify-between gap-4 text-xs py-1 border-b border-slate-200"
                                                    >
                                                        <span className="font-bold text-slate-700">{key}</span>
                                                        <span className="text-white break-all truncate">
                                                            {String(value)}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </pre>
                                    )
                                }

                            </div>
                        );
                    }
                )
            }

            {/* -------------------------------- SLIDE CONTROLS */}
            <div className="sticky bottom-0 flex items-center justify-center z-10 bg-[var(--color-bg-pattern)] px-4 py-3 border-b border-[var(--color-pattern-border)]">

                <button
                    onClick={previousFeature}
                    disabled={selectedIndex === 0}
                    className="p-2 rounded-full bg-green-700/80 text-white disabled:opacity-40 cursor-pointer"
                >
                    <ChevronLeft />
                </button>

                <div className="text-slate-500 text-sm min-w-[120px] text-center">
                    {
                        features.length > 0
                            ? `${selectedIndex + 1} / ${features.length}`
                            : "Sin datos"
                    }
                </div>

                <button
                    onClick={nextFeature}
                    disabled={selectedIndex >= features.length - 1}
                    className="p-2 rounded-full bg-green-700/80 text-white disabled:opacity-40 cursor-pointer"
                >
                    <ChevronRight />
                </button>

            </div>

        </div>
    );
}

function detectFieldType(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "string";
    }

    if (typeof value === "number") {
        return "number";
    }

    if (typeof value === "boolean") {
        return "boolean";
    }

    if (typeof value === "string") {

        const text = value.trim();

        if (text === "") {
            return "string";
        }

        // Fecha ISO
        if (!isNaN(Date.parse(text))) {
            return "date";
        }

        // Número almacenado como texto
        if (!isNaN(Number(text))) {
            return "number";
        }

    }

    return "string";

}
