{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    VERSIÓN: 2.1.1
*/}

{/* -------------------------------------------------------- REACT */ }
import { useState, useEffect } from "react";

import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MapPinned,
    ArrowUpAZ,
    ArrowDownZA,
    RotateCcw,
    FileText
} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }
import shp from "shpjs";

{/* -------------------------------------------------------- COMPONENTS */ }
import FieldDropdown from "./FieldDropdown";
import FileDropZone from "./FileDropZone";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function FeaturesList({
    title = "Panel de Features",
    featuresData,
    descriptiveField = "Default",
    setSelectedFeature,
    // Dropzone params
    dropzone = false,
    setGeojson,
    setLayerVersion,
}) {

    {/* -------------------------------------------------------- STATES */ }
    const [loading, setLoading] = useState(false);
    const [expandedFeatures, setExpandedFeatures] = useState(new Set());
    const [features, setFeatures] = useState([]);

    const [displayField, setDisplayField] = useState("Default");
    const [availableFields, setAvailableFields] = useState([]);

    const [originalFeatures, setOriginalFeatures] = useState([]);
    const [sortDirection, setSortDirection] = useState("default"); // default | asc | desc

    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedFeature = features[selectedIndex];

    {/* -------------------------------------------------------- LOAD FILE */ }
    const handleFile = async (file) => {

        try {
            setLoading(true);

            if (!file) return;

            let parsed;

            // GeoJSON
            if (
                file.name.endsWith(".geojson") ||
                file.name.endsWith(".json")
            ) {
                const text = await file.text();
                parsed = JSON.parse(text);
            }

            // SHP ZIP
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
        }

        catch (error) {
            console.error(error);
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

    useEffect(() => {
        setDisplayField(descriptiveField);
    }, [])

    useEffect(() => {

        setAvailableFields(
            buildAvailableFields(featuresData)
        );

        setFeatures(featuresData);
        setOriginalFeatures(featuresData);
        setSelectedIndex(0);

    }, [featuresData])

    useEffect(() => {
        setSelectedFeature(selectedFeature);
    }, [selectedFeature])

    return (
        <div className="w-full flex-1 flex flex-col justify-between h-full">

            {/* -------------------------------- HEADER */}
            <div className="shadow-md">

                {/* -------------------------------- LEFT */}
                <div className="flex px-4 py-3 items-center gap-4 bg-green-700/80 text-white ">

                    <div className="flex items-center gap-3">

                        <FileText className="w-6 h-6" />

                        <h1 className="text-xl font-bold ">
                            {title}
                        </h1>

                    </div>

                </div>

                {/* -------------------------------- DROPZONE */}
                {dropzone && <div className="flex bg-green-700/10">
                    <FileDropZone
                        accept=".geojson,.json,.zip"
                        helperText="GeoJSON, JSON o Shapefile (.zip)"
                        className="w-full mt-2 mr-2 ml-2 text-gray-700/40"
                        expandedHeight="h-36"
                        collapsedHeight="h-24"
                        onFileSelected={handleFile}
                    />
                </div>}

                {/* -------------------------------- FIELD DROPDOWN */}
                <div className="flex px-4 py-2 gap-2 bg-green-700/10">

                    <FieldDropdown
                        fields={availableFields}
                        value={displayField}
                        onChange={setDisplayField}
                        placeholder="Buscar campo ..."
                    />

                    <button
                        onClick={sortFeatures}
                        className="p-2 rounded-full border border-green-700/30 cursor-pointer hover:bg-green-700/10 hover:text-green-700/60"
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

            </div>

            {/* -------------------------------- FEATURES LIST */}
            <div
                className="h-full overflow-y-scroll"
            >
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
                                    className={`p-2 border-b border-green-700/10 cursor-pointer transition-all
                                                ${active
                                            ? "bg-green-700/10"
                                            : "hover:bg-green-700/10"
                                        }
                                            `}
                                >

                                    <div
                                        className="flex items-center justify-between"
                                    >

                                        <div
                                            className="flex items-center gap-2"
                                        >

                                            <MapPinned className="w-6 h-6 text-green-700/50" />

                                            <span className="textS-[var(--color-pattern-text)] text-green-700/70 text-sm font-medium">
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
                                            className="p-1 rounded-full border border-green-700/30 hover:bg-white/50 cursor-pointer"
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
                                            <pre className="mt-3 text-[11px] bg-white/20 overflow-hidden transition-all border border-green-700/10 p-2 rounded">
                                                {
                                                    Object.entries(feature.properties).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="flex justify-between gap-4 text-xs py-1 border-b border-green-700/10"
                                                        >
                                                            <span className="font-bold">{key}</span>
                                                            <span className=" break-all truncate">
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

            </div>

            {/* -------------------------------- SLIDE CONTROLS */}
            <div className="flex items-center justify-center z-10 bg-green-700/10 px-4 py-3">

                <button
                    onClick={previousFeature}
                    disabled={selectedIndex === 0}
                    className="p-2 rounded-full bg-green-700/80 text-white disabled:opacity-40 cursor-pointer hover:bg-green-700/70"
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
                    className="p-2 rounded-full bg-green-700/80 text-white disabled:opacity-40 cursor-pointer hover:bg-green-700/70"
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
