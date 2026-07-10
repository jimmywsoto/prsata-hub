{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useRef, useState } from "react";

import {
    MapContainer,
    TileLayer,
    GeoJSON,
    LayersControl,
    useMap,
} from "react-leaflet";

const { BaseLayer, Overlay } = LayersControl;

import {
    Upload,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Layers3,
    MapPinned,
    CalendarDays,
    Loader2,
    ArrowUpAZ,
    ArrowDownZA,
    RotateCcw,
    Layers,
    X,
    Earth,
    Database
} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import shp from "shpjs";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

{/* -------------------------------------------------------- CONTEXT */ }

{/* -------------------------------------------------------- COMPONENTS */ }
import Loader from "./Loader";
import FieldDropdown from "./FieldDropdown";
import FileDropZone from "./FileDropZone";
import { MapControlOverlay } from "./MapControlOverlay";
import { useToast } from "./ToastProvider";

{/* -------------------------------------------------------- ZOOM TO FEATURE */ }
function ZoomToFeature({
    feature
}) {

    const map = useMap();

    useEffect(() => {

        if (!feature) return;

        const layer =
            L.geoJSON(feature);

        const bounds =
            layer.getBounds();

        map.fitBounds(bounds, {
            padding: [40, 40]
        });

    }, [feature]);

    return null;
}


{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function PlanetValidationViewer() {

    const { showToast } = useToast();

    {/* -------------------------------------------------------- STATES */ }
    const [loading, setLoading] = useState(false);
    const [mosaics, setMosaics] = useState([]);
    const [selectedMosaic, setSelectedMosaic] = useState(null);
    const [geojson, setGeojson] = useState(null);
    const [features, setFeatures] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [expandedFeatures, setExpandedFeatures] = useState(new Set());
    const [layerVersion, setLayerVersion] = useState(0);

    const [displayField, setDisplayField] = useState("Default");
    const [availableFields, setAvailableFields] = useState([]);

    const [originalFeatures, setOriginalFeatures] = useState([]);
    const [sortDirection, setSortDirection] = useState("default");
    // default | asc | desc



    const [activeBasemap, setActiveBasemap] = useState("esri");

    const [planetVisible, setPlanetVisible] = useState(true);

    const [featureVisible, setFeatureVisible] = useState(true);

    const [collapsed, setCollapsed] = useState(true);

    const [planetOpacity, setPlanetOpacity] = useState(1);

    const [featureOpacity, setFeatureOpacity] = useState(.15);

    const [layers, setLayers] = useState([]);

    /* TESTING */
    const [mosaicMonths, setMosaicMonths] = useState([]);
    const [displayMosaic, setDisplayMosaic] = useState("Default");

    const [isDragging, setIsDragging] = useState(false);


    {/* -------------------------------------------------------- CURRENT FEATURE */ }
    const selectedFeature = features[selectedIndex];

    {/* -------------------------------------------------------- FETCH MOSAICS */ }
    const fetchMosaics = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/planet/monthly`
            );

            const result = await response.json();

            /*TESTING */
            setMosaicMonths(result.map(bm => {
                return {
                    name: bm.name,
                    month: bm.month,
                    type: "raster"
                };
            }))

            /*TESTING */

            setMosaics(result);

            if (result.length > 0) {
                setSelectedMosaic(
                    result[0]
                );
            }

            showToast("API Planet Conected.", "success");

        } catch (error) {
            console.error(error);
            showToast("API Planet Disconected", "error");
        }
    };

    {/* -------------------------------------------------------- EFFECT */ }
    useEffect(() => {
        fetchMosaics();
    }, []);

    {/* -------------------------------------------------------- FILE LOAD */ }
    const handleFileOIG = async (event) => {
        try {
            setLoading(true);

            const file = event.target.files[0];

            if (!file) return;

            let parsed;

            // =====================
            // GEOJSON
            // =====================

            if (file.name.endsWith(".geojson") || file.name.endsWith(".json")) {
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

            /** */

            setSelectedIndex(0);

        } catch (error) {

            console.error(error);

            alert(
                "Error cargando archivo"
            );

        } finally {

            setLoading(false);
        }
    };

    const handleFile = async (file) => {

        try {

            setLoading(true);

            if (!file)
                return;

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

    const selectedFieldInfo =
        availableFields.find(
            f => f.name === displayField
        );

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

    const basemaps = {

        carto: {

            name: "Carto Light",

            attribution: "© CARTO",

            url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",

            maxZoom: 20

        },

        osm: {

            name: "OpenStreetMap",

            attribution: "© OpenStreetMap",

            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

            maxZoom: 19

        },

        esri: {

            name: "Esri World Imagery",

            attribution: "© Esri",

            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

            maxZoom: 19

        },

        topo: {

            name: "OpenTopoMap",

            attribution: "© OpenTopoMap",

            url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",

            maxZoom: 17

        }

    };

    const overlay = {
        planet: {

            name: "Planet Mosaic",

            attribution: "© Planet Scope",

            status: planetVisible,
        },
        features: {

            name: "Features",

            attribution: "© JWS",

            status: featureVisible,
        },

    }

    const changeBasemap = (id) => {
        setActiveBasemap(id);
    };

    const toggleLayer = (id) => {

        if (id === "planet") return setPlanetVisible((v) => !v);
        if (id === "features") return setFeatureVisible((v) => !v);

    };


    useEffect(() => {
        const mosaic = mosaics.find(m =>
            m.name ===
            displayMosaic
        );

        if (mosaic === undefined) return setSelectedMosaic(mosaics[0]);

        setSelectedMosaic(
            mosaic
        );
    }, [displayMosaic])

    return (

        <div className="flex flex-col h-full ">
            {/* -------------------------------------------------------- BACKGROUND */}
            <div className="absolute inset-0 patterns" />

            {/* ------------------------------------------------ CONTENT */}
            <div className="z-20 flex-1 flex overflow-hidden">

                {/* ------------------------------------------------ SIDEBAR */}
                <div className="w-[350px] overflow-auto">

                    <div
                        className="
                            sticky
                            top-0
                            z-20
                            bg-[var(--color-bg-pattern)]
                            px-4
                            py-3
                            border-b
                            border-[var(--color-pattern-border)]
                        "
                    >
                        {/* -------------------------------- LEFT */}
                        <div className="flex items-center gap-4">

                            <div className="flex items-center gap-3">

                                <Layers3 className="w-6 h-6" />

                                <h1 className="text-xl font-bold">
                                    Planet Validation Viewer
                                </h1>

                            </div>

                        </div>



                        <div className="flex mt-2 mb-2">

                            {/* -------------------------------- FILE */}
                            {/*<label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 w-full">

                                <Upload className="w-4 h-4" />

                                Importar archivo

                                <input
                                    type="file"
                                    accept="
                                        .geojson,
                                        .json,
                                        .zip
                                    "
                                    className="hidden"
                                    onChange={
                                        handleFile
                                    }
                                />

                            </label>

                            <label
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => {
                                    setIsDragging(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    handleFile(e);
                                }}
                                className={`
                                flex flex-col items-center justify-center
                                h-36 border-2 border-dashed rounded-lg
                                cursor-pointer transition-all duration-200

                                ${isDragging
                                        ? "border-green-500 bg-green-50 scale-105 shadow-lg"
                                        : "border-[var(--color-border)] hover:bg-gray-100"
                                    }
                                `}
                            >
                                <svg className="w-10 h-10 mb-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" height="24px"
                                    viewBox="0 -960 960 960" width="24px" fill="#B7B7B7">
                                    <path
                                        d="M480-400 40-640l440-240 440 240-440 240Zm0 160L63-467l84-46 333 182 333-182 84 46-417 227Zm0 160L63-307l84-46 333 182 333-182 84 46L480-80Zm0-411 273-149-273-149-273 149 273 149Zm0-149Z" />
                                </svg>
                                <span className="text-gray-400 text-xs text-center">
                                    Haz clic o arrastra un archivo aquí
                                </span>
                                <p className="text-xs italic text-gray-300 text-center">Shapefile comprimido (.zip)</p>
                                <p className="text-xs text-center truncate max-w-48">{'Aqui el nombre del archivo'}</p>
                                <input
                                    type="file"
                                    accept=".geojson,.json,.zip,application/zip"
                                    className="hidden"
                                    onChange={(e) => handleFile(e)}
                                />
                            </label>*/}

                            <FileDropZone
                                accept=".geojson,.json,.zip"
                                helperText="GeoJSON, JSON o Shapefile (.zip)"
                                className="w-full"
                                expandedHeight="h-40"
                                collapsedHeight="h-36"
                                onFileSelected={handleFile}
                            />

                        </div>

                        <h2 className="font-semibold mb-3">
                            Features
                        </h2>

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

                    </div>

                    {
                        features.map(
                            (
                                feature,
                                index
                            ) => {

                                const active =
                                    index ===
                                    selectedIndex;

                                return (

                                    <div

                                        key={index}

                                        onClick={() =>
                                            setSelectedIndex(index)
                                        }

                                        className={`
                                            p-4
                                            border-b
                                            border-[var(--color-pattern-border)]
                                            cursor-pointer
                                            transition-all
                                            ${active
                                                ? "bg-green-300/20"
                                                : "hover:bg-green-600/40"
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

                                                            : `Feature ${feature.__originalIndex}: ${feature.properties?.[displayField] ?? "-"
                                                            }`
                                                    }

                                                </span>

                                            </div>

                                            <button

                                                onClick={(e) => {

                                                    e.stopPropagation();

                                                    toggleFeature(index);

                                                }}

                                                className="
                                                    p-1
                                                    rounded
                                                    hover:bg-black/10
                                                "

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

                                                <pre
                                                    className="
                                                        mt-3
                                                        text-[11px]
                                                        text-slate-500
                                                        overflow-hidden
                                                        transition-all
                                                    "
                                                >

                                                    {
                                                        Object.entries(feature.properties).map(([key, value]) => (
                                                            <div
                                                                key={key}
                                                                className="flex justify-between gap-4 text-xs py-1 border-b border-slate-200"
                                                            >
                                                                <span className="font-medium text-slate-700">{key}</span>
                                                                <span className="text-slate-500 break-all">
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

                    {/* -------------------------------- RIGHT */}
                    <div className="
                            sticky
                            bottom-0
                            flex
                            items-center
                            justify-center
                            z-10
                            bg-[var(--color-bg-pattern)]
                            px-4
                            py-3
                            border-b
                            border-[var(--color-pattern-border)]
                        ">

                        <button

                            onClick={
                                previousFeature
                            }

                            disabled={
                                selectedIndex === 0
                            }

                            className="p-2 rounded-full bg-green-600 text-white disabled:opacity-40 cursor-pointer"
                        >

                            <ChevronLeft />

                        </button>


                        <div
                            className="text-slate-500 text-sm min-w-[120px] text-center">

                            {
                                features.length > 0
                                    ? `${selectedIndex + 1} / ${features.length}`
                                    : "Sin datos"
                            }

                        </div>

                        <button
                            onClick={nextFeature}
                            disabled={selectedIndex >= features.length - 1}
                            className="p-2 rounded-full bg-green-600 text-white disabled:opacity-40 cursor-pointer"
                        >

                            <ChevronRight />

                        </button>

                    </div>
                </div>

                {/* ------------------------------------------------ MAP */}
                <div className="flex-1 relative">
                    {
                        loading && (
                            <Loader />
                        )
                    }

                    <MapContainer
                        center={[-1.831239, -78.183406]}
                        zoom={7}
                        maxZoom={18}
                        className="w-full h-full"
                    >

                        {/* ========================================= */}
                        {/* BASEMAP */}
                        {/* ========================================= */}

                        <TileLayer
                            attribution={basemaps[activeBasemap].attribution}
                            url={basemaps[activeBasemap].url}
                            maxZoom={basemaps[activeBasemap].maxZoom}
                        />

                        {/* ========================================= */}
                        {/* PLANET */}
                        {/* ========================================= */}

                        {
                            planetVisible &&
                            selectedMosaic && (

                                <TileLayer
                                    attribution="Planet"
                                    url={`${API_URL}${selectedMosaic.tile_url}`}
                                    opacity={planetOpacity}
                                    maxZoom={18}
                                />

                            )
                        }

                        {/* ========================================= */}
                        {/* FEATURES */}
                        {/* ========================================= */}

                        {
                            featureVisible &&
                            geojson && (

                                <GeoJSON
                                    key={layerVersion}
                                    data={geojson}
                                    style={(feature) => {

                                        const active =
                                            feature === selectedFeature;

                                        return {

                                            color:
                                                active
                                                    ? "#22d3ee"
                                                    : "#facc15",

                                            weight:
                                                active
                                                    ? 4
                                                    : 2,

                                            fillColor:
                                                active
                                                    ? "#22d3ee"
                                                    : "#facc15",

                                            fillOpacity:
                                                active
                                                    ? featureOpacity + .2
                                                    : featureOpacity

                                        };

                                    }}

                                />

                            )
                        }

                        {/* ========================================= */}
                        {/* ZOOM */}
                        {/* ========================================= */}

                        {
                            selectedFeature && (

                                <ZoomToFeature
                                    feature={selectedFeature}
                                />

                            )
                        }

                        {/* ========================================= */}
                        {/* CONTROL LAYERS */}
                        {/* ========================================= */}

                        <button
                            onClick={() => setCollapsed((v) => !v)}
                            className="absolute bottom-4 left-4 z-[1000] bg-white rounded-full shadow-xl p-2 hover:bg-slate-100 cursor:pointer">
                            <Layers />
                        </button>

                        <div
                            className={`
                                absolute
                                bottom-18
                                left-4
                                z-[1000]
                                bg-white
                                rounded-lg
                                shadow-lg
                                overflow-hidden
                                transition-all
                                duration-300
                                ${collapsed
                                    ? "w-0 opacity-0"
                                    : "w-64 opacity-100"
                                }
                            `}
                        >

                            <div className="p-2 border-b bg-green-200/20">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Layers size={16} /> Control de capas
                                </h3>
                            </div>

                            {/* BASEMAPS */}
                            <div className="p-3 border-b">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Earth size={16} /> Mapas base
                                </h4>

                                <div className="space-y-1">
                                    {Object.entries(basemaps).map((bm, idx) => (

                                        <button
                                            key={idx}
                                            onClick={() => { changeBasemap(bm[0]) }
                                            }
                                            className={`
                                                w-full
                                                text-left
                                                px-3
                                                py-1
                                                rounded
                                                transition
                                                ${activeBasemap === bm[0]
                                                    ? "bg-green-600 text-white"
                                                    : "hover:bg-slate-100"
                                                }
                                            `}
                                        >
                                            {bm[1].name}
                                        </button>

                                    ))}
                                </div>
                            </div>

                            {/* DATA LAYERS */}
                            <div className="p-3">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Database size={16} /> Layers
                                </h4>
                                <div className="space-y-1">
                                    {Object.entries(overlay).map((bm, idx) => (

                                        <div
                                            key={idx}
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                p-1
                                                border-b
                                                border-dashed
                                                border-gray-300
                                                hover:bg-slate-50
                                            ">
                                            <span className="truncate">
                                                {bm[1].name}
                                            </span>

                                            <div className="flex gap-2 items-center">

                                                <label className="relative inline-flex cursor-pointer">

                                                    <input
                                                        type="checkbox"
                                                        className="peer sr-only"
                                                        checked={bm[1].status}
                                                        onChange={() =>
                                                            toggleLayer(bm[0])
                                                        }
                                                    />

                                                    <div
                                                        className="
                                                            relative
                                                            w-8
                                                            h-4
                                                            rounded-full
                                                            bg-slate-300
                                                            transition-colors
                                                            duration-300
                                                            peer-checked:bg-blue-600

                                                            after:content-['']
                                                            after:absolute
                                                            after:left-[2px]
                                                            after:top-[2px]
                                                            after:h-3
                                                            after:w-3
                                                            after:rounded-full
                                                            after:bg-white
                                                            after:transition-transform
                                                            after:duration-300
                                                            peer-checked:after:translate-x-4
                                                        "
                                                    />

                                                </label>

                                            </div>
                                        </div>

                                    ))}
                                </div>


                            </div>

                        </div>

                        {/* ========================================= */}
                        {/* PLANET CONTROLS */}
                        {/* ========================================= */}

                        <div
                            className={`
                                absolute
                                top-4
                                right-4
                                z-[1000]
                                bg-white
                                rounded-lg
                                shadow-lg
                                overflow-hidden
                                transition-all
                                duration-300
                                ${collapsed
                                    ? "w-0 opacity-0"
                                    : "w-64 opacity-100"
                                }
                            `}
                        >

                            <MapControlOverlay
                                opacity={planetOpacity}
                                onChange={setPlanetOpacity}
                                fields={mosaicMonths}
                                value={displayMosaic}
                                onMosaicChange={setDisplayMosaic}
                            />

                        </div>

                    </MapContainer>

                </div>
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