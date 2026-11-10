{/*
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: November, 2026.
    VERSIÓN: 2.1.1
*/}

/* -------------------------------------------------------- REACT */
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
    Ruler,
    SquareDashed,
    Pentagon,
    Download,
    RotateCcw,
    MapPin,
    X,
    Undo2,
    DraftingCompass
} from "lucide-react";
import * as shpwrite from "@mapbox/shp-write";

/* -------------------------------------------------------- MAIN FUNCTION */
const GeometryTools = ({ open, onClose }) => {

    const map = useMap();

    {/* -------------------------------------------------------- STATES */ }
    const [coordinates, setCoordinates] = useState({
        lat: null,
        lng: null
    });
    const [mode, setMode] = useState(null);
    const [vertices, setVertices] = useState([]);
    const [distance, setDistance] = useState(0);
    const [area, setArea] = useState(0);
    const [dynamicDistance, setDynamicDistance] = useState(0);
    const [dynamicArea, setDynamicArea] = useState(0);
    const [polygon, setPolygon] = useState(null);

    {/* -------------------------------------------------------- REFS */ }
    const layerGroupRef = useRef(null);
    const verticesRef = useRef([]);
    const modeRef = useRef(null);
    const clickTimeoutRef = useRef(null);
    const dynamicLayerRef = useRef(null);
    const dynamicTooltipRef = useRef(null);
    const geometryTypeRef = useRef(null);

    {/* -------------------------------------------------------- INIT LAYER GROUP */ }
    useEffect(() => {

        if (!map) return;

        if (!layerGroupRef.current) {

            layerGroupRef.current = L.layerGroup();

            layerGroupRef.current.addTo(map);
        }

        return () => {

            if (layerGroupRef.current) {

                layerGroupRef.current.clearLayers();
                map.removeLayer(layerGroupRef.current);
                layerGroupRef.current = null;
            }
        };

    }, [map]);

    {/* -------------------------------------------------------- FORMATTERS */ }
    const formatNumber = (value, decimals = 2) => {

        if (!Number.isFinite(value)) return "0";

        return new Intl.NumberFormat("es-EC", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    };

    const formatDistance = (meters) => {

        if (meters < 1000) {

            return `${formatNumber(meters, 2)} m`;
        }

        return `${formatNumber(meters / 1000, 3)} km`;
    };

    {/* -------------------------------------------------------- DISTANCE */ }
    const calculateDistance = (points) => {

        if (!points || points.length < 2) return 0;

        let total = 0;

        for (let i = 1; i < points.length; i++) {

            total += points[i - 1].distanceTo(points[i]);
        }

        return total;
    };

    {/* -------------------------------------------------------- AREA */ }
    const calculateGeodesicArea = (points) => {

        if (!points || points.length < 3) return 0;

        const earthRadius = 6378137;

        let areaValue = 0;

        for (let i = 0; i < points.length; i++) {

            const p1 = points[i];

            const p2 = points[(i + 1) % points.length];

            const lat1 =
                p1.lat * Math.PI / 180;

            const lat2 =
                p2.lat * Math.PI / 180;

            const lon1 =
                p1.lng * Math.PI / 180;

            const lon2 =
                p2.lng * Math.PI / 180;

            areaValue +=
                (lon2 - lon1) *
                (2 +
                    Math.sin(lat1) +
                    Math.sin(lat2));
        }

        return Math.abs(
            areaValue *
            earthRadius *
            earthRadius /
            2
        );
    };

    {/* -------------------------------------------------------- DRAW VERTEX */ }
    const drawVertex = (latlng) => {

        if (!layerGroupRef.current) return;

        L.circleMarker(latlng, {
            radius: 5,
            color: "#16a34a",
            weight: 2,
            fillColor: "#ffffff",
            fillOpacity: 1
        }).addTo(layerGroupRef.current);
    };

    {/* -------------------------------------------------------- DRAW FIXED LINE */ }
    const drawFixedLine = (points) => {

        if (!layerGroupRef.current) return;

        if (points.length < 2) return;

        L.polyline(points, {
            color: "#16a34a",
            weight: 3,
            dashArray: "8 6"
        }).addTo(layerGroupRef.current);
    };

    {/* -------------------------------------------------------- DRAW FIXED POLYGON */ }
    const drawFixedPolygon = (points) => {

        if (!layerGroupRef.current) return;

        if (points.length < 3) return;

        L.polygon(points, {

            color: "#16a34a",
            weight: 2,

            fillColor: "#22c55e",
            fillOpacity: 0.15,

            dashArray: "7 5"
        }).addTo(layerGroupRef.current);
    };

    {/* -------------------------------------------------------- REDRAW GEOMETRY */ }
    const redrawGeometry = (
        points = verticesRef.current,
        geometryType = modeRef.current
    ) => {

        if (!layerGroupRef.current) return;

        layerGroupRef.current.clearLayers();

        // Dibujar vértices
        points.forEach(drawVertex);

        // Distancia: conservar la línea
        if (
            geometryType === "distance" &&
            points.length >= 2
        ) {

            drawFixedLine(points);
        }

        // Área / polígono
        if (
            (
                geometryType === "area" ||
                geometryType === "polygon"
            ) &&
            points.length >= 3
        ) {

            drawFixedPolygon(points);
        }
    };

    {/* -------------------------------------------------------- DYNAMIC GEOMETRY */ }
    const clearDynamicLayer = () => {

        if (
            dynamicLayerRef.current &&
            layerGroupRef.current
        ) {

            layerGroupRef.current.removeLayer(
                dynamicLayerRef.current
            );

            dynamicLayerRef.current = null;
        }
    };

    {/* -------------------------------------------------------- DYNAMIC TOOLTIP */ }
    const createDynamicTooltip = (latlng) => {

        if (!map || !latlng) return null;

        if (!dynamicTooltipRef.current) {

            dynamicTooltipRef.current = L.tooltip({
                permanent: true,
                direction: "top",
                offset: [0, -12],
                className: "geometry-dynamic-tooltip",
                opacity: 1
            });
        }

        // Primero asignamos la posición
        dynamicTooltipRef.current.setLatLng(latlng);

        // Después lo agregamos al mapa
        if (!map.hasLayer(dynamicTooltipRef.current)) {

            dynamicTooltipRef.current.addTo(map);
        }

        return dynamicTooltipRef.current;
    };

    const updateDynamicTooltip = (latlng, content) => {

        if (!map || !latlng || !content) return;

        const tooltip = createDynamicTooltip(latlng);

        if (!tooltip) return;

        tooltip.setContent(content);
    };

    const removeDynamicTooltip = () => {

        if (
            dynamicTooltipRef.current &&
            map
        ) {

            map.removeLayer(
                dynamicTooltipRef.current
            );

            dynamicTooltipRef.current = null;
        }
    };

    const drawDynamicGeometry = (cursorLatLng) => {

        if (!cursorLatLng) return;

        const points = verticesRef.current;

        if (!points.length) {

            removeDynamicTooltip();

            return;
        }

        clearDynamicLayer();


        // =====================================================
        // DISTANCE
        // =====================================================

        if (modeRef.current === "distance") {

            const lastPoint =
                points[points.length - 1];

            const segmentDistance =
                lastPoint.distanceTo(
                    cursorLatLng
                );

            const accumulatedDistance =
                calculateDistance(points);

            const totalDistance =
                accumulatedDistance +
                segmentDistance;

            setDynamicDistance(
                totalDistance
            );


            // Línea dinámica
            dynamicLayerRef.current =
                L.polyline(
                    [
                        lastPoint,
                        cursorLatLng
                    ],
                    {
                        color: "#16a34a",
                        weight: 2,
                        dashArray: "6 6",
                        opacity: 0.9
                    }
                ).addTo(
                    layerGroupRef.current
                );


            // Tooltip
            updateDynamicTooltip(
                cursorLatLng,
                `
                <div class="geometry-tooltip-content">

                    <div class="geometry-tooltip-title">
                        Distancia
                    </div>

                    <div class="geometry-tooltip-main">
                        ${formatDistance(
                    totalDistance
                )}
                    </div>

                    <div class="geometry-tooltip-secondary">
                        Segmento:
                        ${formatDistance(
                    segmentDistance
                )}
                    </div>

                </div>
            `
            );

            return;
        }


        // =====================================================
        // AREA / POLYGON
        // =====================================================

        if (
            modeRef.current === "area" ||
            modeRef.current === "polygon"
        ) {

            if (points.length < 2) {

                removeDynamicTooltip();

                return;
            }


            const dynamicPoints = [
                ...points,
                cursorLatLng
            ];


            const currentArea =
                calculateGeodesicArea(
                    dynamicPoints
                );


            setDynamicArea(
                currentArea
            );


            // Polígono dinámico
            dynamicLayerRef.current =
                L.polygon(
                    dynamicPoints,
                    {
                        color: "#16a34a",
                        weight: 2,
                        dashArray: "6 6",

                        fillColor: "#22c55e",
                        fillOpacity: 0.08
                    }
                ).addTo(
                    layerGroupRef.current
                );


            // Tooltip
            updateDynamicTooltip(
                cursorLatLng,
                `
                <div class="geometry-tooltip-content">

                    <div class="geometry-tooltip-title">
                        Superficie
                    </div>

                    <div class="geometry-tooltip-main">
                        ${formatNumber(
                    currentArea,
                    2
                )} m²
                    </div>

                    <div class="geometry-tooltip-secondary">
                        ${formatNumber(
                    currentArea / 10000,
                    4
                )} ha
                    </div>

                </div>
            `
            );
        }
    };

    {/* -------------------------------------------------------- MOUSE MOVE */ }
    useEffect(() => {

        if (!map || !open) return;

        /*const handleMouseMoveDep = (event) => {

            const { lat, lng } = event.latlng;

            setCoordinates({
                lat,
                lng
            });

            setCursorPosition(event.containerPoint);

            if (modeRef.current) {

                drawDynamicGeometry(event.latlng);
            }
        };*/

        const handleMouseMove = (event) => {

            const { lat, lng } = event.latlng;

            setCoordinates({
                lat,
                lng
            });

            if (modeRef.current) {

                drawDynamicGeometry(
                    event.latlng
                );

            } else {

                removeDynamicTooltip();
            }
        };

        map.on("mousemove", handleMouseMove);

        return () => {

            map.off("mousemove", handleMouseMove);
        };

    }, [map, open]);

    {/* -------------------------------------------------------- CURSOR STYLE */ }
    useEffect(() => {

        if (!map) return;

        const container = map.getContainer();

        if (mode) {

            container.style.cursor = "crosshair";

        } else {

            container.style.cursor = "";
        }

        return () => {

            container.style.cursor = "";
        };

    }, [map, mode]);

    {/* -------------------------------------------------------- DOUBLE CLICK ZOOM */ }
    useEffect(() => {

        if (!map) return;

        if (mode) {

            map.doubleClickZoom.disable();

        } else {

            map.doubleClickZoom.enable();
        }

        return () => {

            map.doubleClickZoom.enable();
        };

    }, [map, mode]);

    {/* -------------------------------------------------------- ADD VERTEX */ }
    const addVertex = (latlng) => {

        const currentMode = modeRef.current;

        if (!currentMode) return;

        const previousVertices =
            verticesRef.current;

        const updatedVertices = [
            ...previousVertices,
            latlng
        ];

        verticesRef.current =
            updatedVertices;

        setVertices(updatedVertices);

        redrawGeometry(updatedVertices);

        // -----------------------------------------------------
        // DISTANCE
        // -----------------------------------------------------

        if (currentMode === "distance") {

            const totalDistance =
                calculateDistance(updatedVertices);

            setDistance(totalDistance);
            setDynamicDistance(totalDistance);
        }


        // -----------------------------------------------------
        // AREA
        // -----------------------------------------------------

        if (
            currentMode === "area" ||
            currentMode === "polygon"
        ) {

            if (updatedVertices.length >= 3) {

                const calculatedArea =
                    calculateGeodesicArea(
                        updatedVertices
                    );

                setArea(calculatedArea);
                setDynamicArea(calculatedArea);
            }
        }
    };

    {/* -------------------------------------------------------- MAP CLICK */ }
    useEffect(() => {

        if (!map || !open) return;

        const handleClick = (event) => {

            if (!modeRef.current) return;

            /*
             * Leaflet ejecuta click antes de dblclick.
             *
             * Esperamos unos milisegundos para determinar
             * si el usuario realmente hizo doble clic.
             */

            if (clickTimeoutRef.current) {

                clearTimeout(
                    clickTimeoutRef.current
                );
            }

            clickTimeoutRef.current =
                setTimeout(() => {

                    addVertex(event.latlng);

                    clickTimeoutRef.current = null;

                }, 220);
        };


        map.on("click", handleClick);

        return () => {

            map.off("click", handleClick);

            if (clickTimeoutRef.current) {

                clearTimeout(
                    clickTimeoutRef.current
                );
            }
        };

    }, [map, open]);

    {/* -------------------------------------------------------- FINISH GEOMETRY */ }
    useEffect(() => {

        if (!map || !open) return;

        const handleDoubleClick = (event) => {

            // Cancelar el click pendiente
            if (clickTimeoutRef.current) {

                clearTimeout(clickTimeoutRef.current);

                clickTimeoutRef.current = null;
            }

            const currentMode = modeRef.current;

            if (!currentMode) return;

            const currentPoints = verticesRef.current;

            /*
             * El doble clic genera dos eventos click y un dblclick.
             * El último click puede haber sido cancelado por nuestro
             * temporizador. Incorporamos event.latlng directamente.
             */

            const lastPoint = currentPoints[
                currentPoints.length - 1
            ];

            const clickedPoint = event.latlng;

            // Evitar duplicar el último vértice
            const isDuplicate =
                lastPoint &&
                lastPoint.distanceTo(clickedPoint) < 0.5;

            const finalPoints = isDuplicate
                ? [...currentPoints]
                : [...currentPoints, clickedPoint];


            // Actualizar referencias y estado
            verticesRef.current = finalPoints;

            setVertices(finalPoints);

            clearDynamicLayer();

            removeDynamicTooltip();


            // =====================================================
            // DISTANCE
            // =====================================================

            if (currentMode === "distance") {

                if (finalPoints.length < 2) return;

                const totalDistance =
                    calculateDistance(finalPoints);

                setDistance(totalDistance);

                setDynamicDistance(totalDistance);

                // Dibujar la línea definitiva
                redrawGeometry(
                    finalPoints,
                    "distance"
                );

                // Finalizar modo
                setMode(null);

                modeRef.current = null;

                geometryTypeRef.current = "distance";

                return;
            }


            // =====================================================
            // AREA / POLYGON
            // =====================================================

            if (
                currentMode === "area" ||
                currentMode === "polygon"
            ) {

                if (finalPoints.length < 3) return;

                const calculatedArea =
                    calculateGeodesicArea(finalPoints);

                const closedPoints = [
                    ...finalPoints,
                    finalPoints[0]
                ];

                const feature = {

                    type: "Feature",

                    properties: {

                        area_m2: Number(
                            calculatedArea.toFixed(2)
                        ),

                        area_ha: Number(
                            (
                                calculatedArea / 10000
                            ).toFixed(4)
                        )
                    },

                    geometry: {

                        type: "Polygon",

                        coordinates: [
                            closedPoints.map(point => [
                                point.lng,
                                point.lat
                            ])
                        ]
                    }
                };

                setPolygon(feature);

                setArea(calculatedArea);

                setDynamicArea(calculatedArea);

                // Dibujar polígono definitivo
                redrawGeometry(
                    finalPoints,
                    currentMode
                );

                setMode(null);

                modeRef.current = null;

                geometryTypeRef.current = "distance";
            }
        };

        map.on(
            "dblclick",
            handleDoubleClick
        );

        return () => {

            map.off(
                "dblclick",
                handleDoubleClick
            );
        };

    }, [map, open]);

    {/* -------------------------------------------------------- START DISTANCE */ }
    const startDistance = () => {

        reset();

        setMode("distance");
        modeRef.current = "distance";
    };

    {/* -------------------------------------------------------- START AREA */ }
    const startArea = () => {

        reset();

        setMode("area");
        modeRef.current = "area";
    };

    {/* -------------------------------------------------------- START POLYGON */ }
    const startPolygon = () => {

        reset();

        setMode("polygon");
        modeRef.current = "polygon";
    };

    {/* -------------------------------------------------------- DELETE LAST VERTEX */ }
    const removeLastVertex = () => {

        const currentVertices =
            verticesRef.current;

        if (!currentVertices.length) return;

        const updatedVertices =
            currentVertices.slice(
                0,
                -1
            );

        verticesRef.current =
            updatedVertices;

        setVertices(updatedVertices);

        clearDynamicLayer();

        //redrawGeometry(updatedVertices);

        const geometryType =
            modeRef.current || geometryTypeRef.current;

        redrawGeometry(
            updatedVertices,
            geometryType
        );


        // -----------------------------------------------------
        // DISTANCE
        // -----------------------------------------------------

        if (
            modeRef.current === "distance"
        ) {

            const total =
                calculateDistance(
                    updatedVertices
                );

            setDistance(total);
            setDynamicDistance(total);
        }


        // -----------------------------------------------------
        // AREA
        // -----------------------------------------------------

        if (
            modeRef.current === "area" ||
            modeRef.current === "polygon"
        ) {

            const calculatedArea =
                updatedVertices.length >= 3
                    ? calculateGeodesicArea(
                        updatedVertices
                    )
                    : 0;

            setArea(calculatedArea);
            setDynamicArea(calculatedArea);

            /*
             * Si se elimina un vértice después de haber
             * generado un polígono, invalidamos el Feature.
             */

            setPolygon(null);
        }
    };

    {/* -------------------------------------------------------- RESET */ }
    const reset = () => {

        if (clickTimeoutRef.current) {

            clearTimeout(
                clickTimeoutRef.current
            );

            clickTimeoutRef.current = null;
        }

        clearDynamicLayer();

        removeDynamicTooltip();

        verticesRef.current = [];

        setVertices([]);

        setDistance(0);

        setDynamicDistance(0);

        setArea(0);

        setDynamicArea(0);

        setPolygon(null);

        setMode(null);

        modeRef.current = null;

        geometryTypeRef.current = null;

        if (layerGroupRef.current) {

            layerGroupRef.current.clearLayers();
        }
    };

    {/* -------------------------------------------------------- DOWNLOAD */ }
    const downloadBlob = (
        blob,
        filename
    ) => {

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    {/* -------------------------------------------------------- GEOJSON */ }
    const exportGeoJSON = () => {

        if (!polygon) return;

        const geojson = {

            type: "FeatureCollection",

            features: [polygon]
        };

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        geojson,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/geo+json"
                }
            );

        downloadBlob(
            blob,
            "geometry.geojson"
        );
    };

    {/* -------------------------------------------------------- SHAPEFILE */ }
    const exportShapefile = async () => {

        if (!polygon) return;

        try {

            const geojson = {

                type: "FeatureCollection",

                features: [polygon]
            };

            const options = {

                folder: "geometry",

                filename: "geometry",

                outputType: "blob",

                types: {
                    polygon: "geometry"
                },

                prj:
                    'GEOGCS["WGS 84",' +
                    'DATUM["WGS_1984",' +
                    'SPHEROID["WGS 84",' +
                    '6378137,298.257223563]],' +
                    'PRIMEM["Greenwich",0],' +
                    'UNIT["degree",' +
                    '0.0174532925199433]]'
            };

            const zipBlob =
                await shpwrite.zip(
                    geojson,
                    options
                );

            downloadBlob(
                zipBlob,
                "geometry.zip"
            );

        } catch (error) {

            console.error(
                "Error exportando Shapefile:",
                error
            );
        }
    };

    {/* -------------------------------------------------------- DYNAMIO RESULT */ }
    const currentDistance =
        mode === "distance"
            ? dynamicDistance
            : distance;

    const currentArea =
        (
            mode === "area" ||
            mode === "polygon"
        )
            ? dynamicArea
            : area;


    {/* -------------------------------------------------------- RENDER */ }
    if (!open) return null;

    return (
        <>
            {/* -------------------------------------------------------- GEOMETRY TOOLS */ }
            <div className="w-64 bg-white rounded-lg shadow-xl overflow-hidden" >

                {/* -------------------------------------------------------- HEADER */ }
                <div className="flex items-center justify-between px-2 py-1 bg-green-700/80 text-white">

                    <div className="flex items-center gap-2 font-semibold">
                        <DraftingCompass size={18} /> Herramientas Geométricas
                    </div>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded hover:bg-white/20"
                        >
                            <X size={17} />
                        </button>
                    )}

                </div>

                {/* -------------------------------------------------------- BODY */ }
                <div className="p-3 space-y-3">

                    {/* -------------------------------------------------------- COORDINATES */ }
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">

                        <div className="flex items-center gap-2 text-xs font-semibold text-green-700/80 mb-1">
                            <MapPin size={14} /> Coordenadas (EPSG:4326)
                        </div>

                        {coordinates.lat !== null ? (

                            <div className="text-xs font-mono text-gray-700">

                                {coordinates.lat.toFixed(6)}
                                {" , "}
                                {coordinates.lng.toFixed(6)}

                            </div>

                        ) : (

                            <div className="text-xs text-gray-400">

                                Mueva el cursor sobre el mapa

                            </div>
                        )}

                    </div>

                    {/* -------------------------------------------------------- TOOLS */ }
                    <div className="grid grid-cols-3 gap-2">

                        <button
                            type="button"
                            onClick={startDistance}
                            className={`
                                flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-xs transition
                                ${mode === "distance"
                                    ? "bg-green-100 border-green-500 text-green-700"
                                    : "border-gray-200 hover:bg-gray-50"
                                }
                            `}
                        >
                            <Ruler size={18} /> Distancia
                        </button>

                        <button
                            type="button"
                            onClick={startArea}
                            className={`
                                flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-xs transition
                                ${mode === "area"
                                    ? "bg-green-100 border-green-500 text-green-700"
                                    : "border-gray-200 hover:bg-gray-50"
                                }
                            `}
                        >
                            <SquareDashed size={18} /> Área
                        </button>

                        <button
                            type="button"
                            onClick={startPolygon}
                            className={`
                                flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-xs transition
                                ${mode === "polygon"
                                    ? "bg-green-100 border-green-500 text-green-700"
                                    : "border-gray-200 hover:bg-gray-50"
                                }
                            `}
                        >
                            <Pentagon size={18} /> Polígono
                        </button>

                    </div>

                    {/* -------------------------------------------------------- RESULTS */ }
                    {(mode === "distance" || distance > 0) && (

                        <div className="rounded-lg bg-green-50 border border-green-200 p-3 ">

                            <div className="text-xs text-green-700 font-semibold ">
                                Distancia
                            </div>

                            <div className="text-lg font-bold text-green-900">

                                {formatDistance(
                                    currentDistance
                                )}

                            </div>

                        </div>
                    )}

                    {(mode === "area" || mode === "polygon" || area > 0) && (

                        <div className="rounded-lg bg-green-50 border border-green-200 p-3">

                            <div className="text-xs text-green-700 font-semibold ">
                                Superficie
                            </div>

                            <div className="text-lg font-bold text-green-900" >

                                {formatNumber(
                                    currentArea,
                                    2
                                )}{" "}
                                m²

                            </div>

                            <div className="text-sm font-medium text-green-700">

                                {formatNumber(
                                    currentArea /
                                    10000,
                                    4
                                )}{" "}
                                ha

                            </div>

                        </div>
                    )}

                    {/* -------------------------------------------------------- VERTICES */ }
                    {vertices.length > 0 && (

                        <div
                            className="flex items-center justify-between text-xs text-gray-600 ">

                            <span>
                                Vértices:{" "}
                                <strong>
                                    {vertices.length}
                                </strong>
                            </span>


                            {/*<button
                                type="button"
                                onClick={
                                    removeLastVertex
                                }
                                className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600">

                                <Undo2 size={14} /> Eliminar último

                            </button>*/}

                        </div>
                    )}

                    {/* -------------------------------------------------------- EXPORT */ }
                    {polygon && (

                        <div
                            className="grid grid-cols-2 gap-2">

                            <button
                                type="button"
                                onClick={exportGeoJSON}
                                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium"
                            >
                                <Download size={14} /> GeoJSON
                            </button>

                            <button
                                type="button"
                                onClick={
                                    exportShapefile
                                }
                                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium "
                            >
                                <Download size={14} /> Shapefile
                            </button>

                        </div>
                    )}

                    {/* -------------------------------------------------------- RESET */ }
                    <button
                        type="button"
                        onClick={reset}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium"
                    >
                        <RotateCcw size={15} /> Limpiar geometría
                    </button>

                    {/* -------------------------------------------------------- HELP */ }
                    {mode && (

                        <div className="text-[11px] leading-relaxed text-gray-500 bg-gray-50 rounded-lg p-2">

                            Haga clic para agregar
                            vértices. Mueva el cursor
                            para visualizar la medición
                            dinámica. Haga doble clic para
                            finalizar.

                        </div>
                    )}

                </div>

            </div>
        </>
    );
};

export default GeometryTools;
