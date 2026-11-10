{/*
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    UPDATED AT: November, 2026.
    VERSIÓN: 2.1.2
*/}

/* -------------------------------------------------------- REACT */
import { useEffect, useMemo, useRef, useState } from "react";

/* -------------------------------------------------------- REACT-LEAFLET */
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    WMSTileLayer,
    Pane,
    useMap,
    useMapEvents,
} from "react-leaflet";

/* -------------------------------------------------------- LEAFLET */
import L, { Layer } from "leaflet";
import "leaflet/dist/leaflet.css";

/* -------------------------------------------------------- ICONS */
import { Satellite, Layers, Settings2, X, DraftingCompass } from "lucide-react";

/* -------------------------------------------------------- DATA */
import { analiticBasemapsConfig } from "../config/basemaps.config";
import { wmsLayersConfig } from "../config/wmsLayers.config";

/* -------------------------------------------------------- CONTEXT */
import { useToast } from "./ToastProvider";

/* -------------------------------------------------------- COMPONENTS */
import Loader from "./Loader";
import { MapControlOverlay } from "./MapControlOverlay";
import LayerControl from "./LayerControl";
import WMSFeatureInfo from "./WMSFeatureInfo";

import FeaturesList from "./FeaturesList";

import GeometryTools from "./GeometryTools";

/* -------------------------------------------------------- API */
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/* ================================================================
   ZOOM TO FEATURE
================================================================ */
function ZoomToFeature({ feature }) {

    const map = useMap();

    useEffect(() => {

        if (!feature) return;

        const layer = L.geoJSON(feature);

        const bounds = layer.getBounds();

        if (!bounds.isValid()) return;

        map.fitBounds(bounds, {
            padding: [40, 40]
        });

    }, [feature, map]);

    return null;
}

/* ================================================================
   WMS MAP CLICK HANDLER
================================================================ */
function WMSMapClickHandler({
    layers,
    onResults,
    onLoading,
    onError,
    onOpen,
    abortControllerRef
}) {

    const map = useMapEvents({

        click: async (event) => {

            /*
             * ========================================================
             * CAPAS WMS CONSULTABLES
             * ========================================================
             */

            const queryableLayers =
                layers.filter(
                    (layer) =>
                        layer.type === "wms" &&
                        layer.visible &&
                        layer.queryable
                );


            /*
             * ========================================================
             * NO HAY CAPAS CONSULTABLES
             * ========================================================
             */

            if (
                queryableLayers.length === 0
            ) {
                return;
            }


            /*
             * ========================================================
             * CANCELAR CONSULTA ANTERIOR
             * ========================================================
             */

            if (
                abortControllerRef.current
            ) {

                abortControllerRef.current.abort();
            }


            const controller =
                new AbortController();

            abortControllerRef.current =
                controller;


            /*
             * ========================================================
             * ESTADO UI
             * ========================================================
             */

            onLoading(true);

            onError(null);

            onResults([]);

            onOpen(true);


            try {

                /*
                 * ====================================================
                 * DATOS DEL MAPA
                 * ====================================================
                 */

                const bounds =
                    map.getBounds();

                const size =
                    map.getSize();

                const point =
                    map.latLngToContainerPoint(
                        event.latlng
                    );


                const width =
                    Math.round(size.x);

                const height =
                    Math.round(size.y);


                /*
                 * ====================================================
                 * BBOX EPSG:3857
                 * ====================================================
                 */

                const nw =
                    map.containerPointToLatLng(
                        L.point(0, 0)
                    );

                const se =
                    map.containerPointToLatLng(
                        L.point(
                            width,
                            height
                        )
                    );


                const topLeft =
                    L.CRS.EPSG3857.project(nw);

                const bottomRight =
                    L.CRS.EPSG3857.project(se);


                const bbox = [
                    topLeft.x,
                    bottomRight.y,
                    bottomRight.x,
                    topLeft.y
                ].join(",");


                /*
                 * ====================================================
                 * CONSULTAS EN PARALELO
                 * ====================================================
                 */

                const requests =
                    queryableLayers.map(
                        async (layer) => {

                            /*
                             * ==================================================
                             * PARÁMETROS GETFEATUREINFO
                             * ==================================================
                             */

                            const params =
                                new URLSearchParams({

                                    SERVICE: "WMS",

                                    VERSION:
                                        layer.version ||
                                        "1.3.0",

                                    REQUEST:
                                        "GetFeatureInfo",

                                    LAYERS:
                                        layer.layers,

                                    QUERY_LAYERS:
                                        layer.layers,

                                    INFO_FORMAT:
                                        layer.infoFormat ||
                                        "application/json",

                                    FEATURE_COUNT:
                                        String(
                                            layer.featureCount ||
                                            20
                                        ),

                                    CRS:
                                        layer.crs ||
                                        "EPSG:3857",

                                    BBOX:
                                        bbox,

                                    WIDTH:
                                        String(width),

                                    HEIGHT:
                                        String(height),

                                    I:
                                        String(
                                            Math.round(
                                                point.x
                                            )
                                        ),

                                    J:
                                        String(
                                            Math.round(
                                                point.y
                                            )
                                        )
                                });


                            /*
                             * ==================================================
                             * DETERMINAR URL
                             * ==================================================
                             */
                            /*
                                ============================================================
                                WMS PROXY
                                ============================================================

                                Las consultas WMS se realizan mediante el backend
                                para evitar problemas CORS y restricciones de acceso
                                desde el entorno de producción.

                                El parámetro "target" identifica el servidor WMS
                                real de GeoServer.
                            */

                            let url;


                            /*
                             * --------------------------------------------------
                             * CON PROXY
                             * --------------------------------------------------
                             */

                            if (
                                layer.proxy !== false
                            ) {

                                const proxyUrl =
                                    `${API_URL}/api/wms/proxy`;

                                params.set(
                                    "target",
                                    layer.url
                                );

                                url =
                                    `${proxyUrl}?${params.toString()}`;

                            }


                            /*
                             * --------------------------------------------------
                             * SIN PROXY
                             * --------------------------------------------------
                             */

                            else {

                                url =
                                    `${layer.url}?${params.toString()}`;
                            }


                            /*
                             * ==================================================
                             * DEBUG OPCIONAL
                             * ==================================================
                             */

                            console.debug(
                                "[WMS GetFeatureInfo]",
                                {
                                    layer:
                                        layer.name,

                                    proxy:
                                        layer.proxy !== false,

                                    url
                                }
                            );


                            /*
                             * ==================================================
                             * FETCH
                             * ==================================================
                             */

                            const response =
                                await fetch(
                                    url,
                                    {
                                        method: "GET",

                                        signal:
                                            controller.signal,

                                        headers: {
                                            Accept:
                                                layer.infoFormat ===
                                                "text/html"

                                                    ? "text/html,application/json"

                                                    : "application/json,text/plain,text/html"
                                        }
                                    }
                                );


                            /*
                             * ==================================================
                             * HTTP ERROR
                             * ==================================================
                             */

                            if (
                                !response.ok
                            ) {

                                throw new Error(
                                    `HTTP ${response.status} al consultar ${layer.name}`
                                );
                            }


                            /*
                             * ==================================================
                             * CONTENT TYPE
                             * ==================================================
                             */

                            const contentType =
                                response.headers.get(
                                    "content-type"
                                ) || "";


                            const text =
                                await response.text();


                            /*
                             * ==================================================
                             * PARSEAR RESPUESTA
                             * ==================================================
                             */

                            let data = null;


                            /*
                             * JSON
                             */

                            if (
                                contentType.includes(
                                    "application/json"
                                ) ||
                                contentType.includes(
                                    "geo+json"
                                ) ||
                                contentType.includes(
                                    "json"
                                )
                            ) {

                                try {

                                    data =
                                        JSON.parse(
                                            text
                                        );

                                } catch (
                                    parseError
                                ) {

                                    console.error(
                                        "Error parseando JSON WMS:",
                                        parseError
                                    );

                                    throw new Error(
                                        `La respuesta de ${layer.name} no es JSON válido.`
                                    );
                                }
                            }


                            /*
                             * ==================================================
                             * RESPUESTA NO JSON
                             * ==================================================
                             */

                            else {

                                try {

                                    data =
                                        JSON.parse(
                                            text
                                        );

                                } catch {

                                    /*
                                     * Si GeoServer devuelve HTML
                                     * lo conservamos para el componente.
                                     */

                                    return {

                                        layerId:
                                            layer.id,

                                        layerName:
                                            layer.name,

                                        type:
                                            contentType.includes(
                                                "text/html"
                                            )
                                                ? "html"
                                                : "text",

                                        html:
                                            contentType.includes(
                                                "text/html"
                                            )
                                                ? text
                                                : undefined,

                                        text:
                                            contentType.includes(
                                                "text/html"
                                            )
                                                ? undefined
                                                : text,

                                        features: []
                                    };
                                }
                            }


                            /*
                             * ==================================================
                             * GEOJSON
                             * ==================================================
                             */

                            return {

                                layerId:
                                    layer.id,

                                layerName:
                                    layer.name,

                                type:
                                    "features",

                                features:
                                    Array.isArray(
                                        data?.features
                                    )
                                        ? data.features
                                        : []
                            };
                        }
                    );


                /*
                 * ========================================================
                 * ESPERAR TODAS
                 * ========================================================
                 */

                const settled =
                    await Promise.allSettled(
                        requests
                    );


                /*
                 * ========================================================
                 * CANCELACIÓN
                 * ========================================================
                 */

                if (
                    controller.signal.aborted
                ) {
                    return;
                }


                const successfulResults =
                    [];

                const errors =
                    [];


                /*
                 * ========================================================
                 * PROCESAR RESULTADOS
                 * ========================================================
                 */

                settled.forEach(
                    (result) => {

                        if (
                            result.status ===
                            "fulfilled"
                        ) {

                            /*
                             * No mostramos resultados
                             * GeoJSON vacíos.
                             */

                            if (
                                result.value.type ===
                                    "features" &&
                                result.value.features
                                    ?.length === 0
                            ) {

                                return;
                            }


                            successfulResults.push(
                                result.value
                            );

                        } else {

                            errors.push(
                                result.reason
                            );
                        }
                    }
                );


                /*
                 * ========================================================
                 * ACTUALIZAR RESULTADOS
                 * ========================================================
                 */

                onResults(
                    successfulResults
                );


                /*
                 * ========================================================
                 * TODAS LAS CONSULTAS FALLARON
                 * ========================================================
                 */

                if (
                    successfulResults.length === 0 &&
                    errors.length > 0
                ) {

                    const message =
                        errors
                            .map(
                                (error) =>
                                    error?.message ||
                                    "Error desconocido"
                            )
                            .join(" | ");


                    onError(
                        message
                    );
                }

            } catch (error) {

                /*
                 * ========================================================
                 * ABORT
                 * ========================================================
                 */

                if (
                    error?.name ===
                    "AbortError"
                ) {
                    return;
                }


                console.error(
                    "Error GetFeatureInfo:",
                    error
                );


                onError(
                    error?.message ||
                    "Error al consultar información WMS."
                );

            } finally {

                if (
                    abortControllerRef.current ===
                    controller
                ) {

                    abortControllerRef.current =
                        null;

                    onLoading(false);
                }
            }
        }
    });


    return null;
}

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function PlanetValidationViewer() {

    const { showToast } = useToast();
    const featureInfoAbortControllerRef = useRef(null);
    
    {/* -------------------------------------------------------- STATES */ }
    const [loading, setLoading] = useState(false);
    const [mosaics, setMosaics] = useState([]);
    const [selectedMosaic, setSelectedMosaic] = useState(null);
    const [geojson, setGeojson] = useState(null);
    const [features, setFeatures] = useState([]);
    const [layerVersion, setLayerVersion] = useState(0);
    const [showPanel, setShowPanel] = useState(false);

    const [alerts, setAlerts] = useState(null);
    const [alertsVisible, setAlertsVisible] = useState(true);

    const [geometryToolsOpen, setGeometryToolsOpen] = useState(false);

    {/* -------------------------------------------------------- BASEMAP */ }
    let defaultBasemap = [];

    defaultBasemap.id = Object.entries(analiticBasemapsConfig)
        .find(
            ([, config]) =>
                config.default === true
        )?.[0] ||
        Object.keys(analiticBasemapsConfig)[0];

    defaultBasemap.name = Object.entries(analiticBasemapsConfig)
        .find(
            ([, config]) =>
                config.default === true
        )?.[1].name ||
        Object.keys(analiticBasemapsConfig)[0].name;

    const [activeBasemap, setActiveBasemap] = useState(defaultBasemap);

    {/* -------------------------------------------------------- PLANET FEATURES */ }
    const [planetVisible, setPlanetVisible] = useState(true);
    const [featureVisible, setFeatureVisible] = useState(true);

    {/* -------------------------------------------------------- LAYER CONTROL */ }
    const [collapsed, setCollapsed] = useState(true);

    {/* -------------------------------------------------------- PLANET CONTROL */ }
    const [planetControlCollapsed, setPlanetControlCollapsed] = useState(false);
    const [planetOpacity, setPlanetOpacity] = useState(1);
    const [featureOpacity, setFeatureOpacity] = useState(0.15);

    {/* -------------------------------------------------------- MOSAICS */ }
    const [mosaicMonths, setMosaicMonths] = useState([]);
    const [displayMosaic, setDisplayMosaic] = useState("Default");

    {/* -------------------------------------------------------- WMS FEATURE INFO */ }
    const [wmsResults, setWmsResults] = useState([]);
    const [wmsLoading, setWmsLoading] = useState(false);
    const [wmsError, setWmsError] = useState(null);
    const [wmsInfoOpen, setWmsInfoOpen] = useState(false);

    {/* -------------------------------------------------------- CURRENT FEATURE */ }
    //const selectedFeature = features[selectedIndex];
    const [selectedFeature, setSelectedFeature] = useState(null);

    {/* -------------------------------------------------------- BASEMAPS */ }
    const baseMaps = useMemo(() => {

        return Object.entries(
            analiticBasemapsConfig
        ).map(([id, config]) => ({
            id,
            name: config.name,
            url: config.url,
            options: config.options || {}
        }));

    }, []);

    {/* -------------------------------------------------------- WMS LAYERS */ }
    const [wmsVisibility, setWmsVisibility] = useState(() => {

        return Object.fromEntries(
            wmsLayersConfig.map(
                (layer) => [
                    layer.id,
                    layer.visible !== false
                ]
            )
        );
    });

    const wmsLayers = useMemo(() => {

        return wmsLayersConfig.map(
            (layer) => ({

                ...layer,

                type: "wms",

                visible:
                    wmsVisibility[layer.id] ??
                    false
            })
        );

    }, [wmsVisibility]);

    {/* -------------------------------------------------------- NORMALIZED DATA LAYERS */ }
    const dataAlerts = {
        id: "alerts",
        url: "/data/DB_ALERTAS_SATA_A_2026.geojson",
        name: "Alertas SATA 2026",
        type: "geojson",
        pane: 'mediumPane',
        attribution: '<a href="">SNMB</a>',
        visible: true,
        style: {
            fillColor: "transparent",
            fillOpacity: 0.5,
            color: "rgba(255, 19, 19, 0.83)",
            weight: 3,
            opacity: 0.72
        },
    }
    
    const dataLayers = useMemo(() => {
        return [
            {
                id: "planet",
                name: "Planet Mosaic",
                type: "raster",
                visible: planetVisible,
                style: {
                    fill: "transparent",
                    stroke: "#526669",
                    radius: 0
                }
            },
            {
                id: "features",
                name: "Features",
                type: "data",
                visible: featureVisible,
                style: {
                    fill: 
                        selectedFeature
                            ? "#22d3ee"
                            : "#facc15",
                    stroke:
                        selectedFeature
                            ? "#22d3ee"
                            : "#facc15",
                    radius: 0
                }
            },
            {
                id: dataAlerts.id,
                name: dataAlerts.name,
                type: "data",
                visible: alertsVisible,
                style: {
                    fill: dataAlerts.style.fillColor,
                    stroke: dataAlerts.style.color,
                    radius: 0
                }
            }
        ];

    }, [
        planetVisible,
        featureVisible,
        alertsVisible,
        selectedFeature
    ]);

    {/* -------------------------------------------------------- LAYERS FOR CONTROL */ }
    const layers = useMemo(() => {

        return [
            ...dataLayers,
            ...wmsLayers
        ];

    }, [
        dataLayers,
        wmsLayers
    ]);

    {/* -------------------------------------------------------- FETCH MOSAICS */ }
    const fetchMosaics = async () => {

        try {
            setLoading(true);
            const response =
                await fetch(
                    `${API_URL}/api/planet/monthly`
                );

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const result = await response.json();

            /* ---------------------------------------------
               MOSAIC MONTHS
            --------------------------------------------- */
            setMosaicMonths(
                result.map((bm) => ({
                    name: bm.name,
                    month: bm.month,
                    type: "raster"
                }))
            );

            setMosaics(result);

            if (result.length > 0) {
                setSelectedMosaic(
                    result[0]
                );
            }

            showToast(
                "API Planet Conected.",
                "success"
            );

        } catch (error) {

            console.error(error);

            showToast(
                "API Planet Disconected",
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    {/* -------------------------------------------------------- INIT EFFECT */ }
    useEffect(() => {
        fetchMosaics();
        return () => {
            if (
                featureInfoAbortControllerRef.current
            ) {
                featureInfoAbortControllerRef
                    .current
                    .abort();
            }
        };
    }, []);

    {/* -------------------------------------------------------- BASEMAP CHANGE */ }
    const changeBasemap = (id) => {

        const basemapSelected = Object.values(baseMaps).find(basemap => basemap.name === id)
        const basemapID = basemapSelected.id

        if (!analiticBasemapsConfig[basemapID]) {
            console.log('No existe basemap con el ID proporcionado')
            return;
        }

        //setActiveBasemap(basemapID);
        setActiveBasemap(basemapSelected);

    };

    {/* -------------------------------------------------------- TOGGLE LAYERS */ }
    const toggleLayer = (id) => {

        if (id === "planet") {
            setPlanetVisible(
                (value) => !value
            );
            return;
        }

        if (id === "features") {
            setFeatureVisible(
                (value) => !value
            );
            return;
        }

        if (id === "alerts") {
            setAlertsVisible(
                (value) => !value
            );
            return;
        }

        if (
            wmsLayersConfig.some(
                (layer) =>
                    layer.id === id
            )
        ) {

            setWmsVisibility(
                (current) => ({
                    ...current,
                    [id]:
                        !(
                            current[id] ??
                            false
                        )
                })
            );
        }
    };

    {/* -------------------------------------------------------- DISPLAY MOSAICS */ }
    useEffect(() => {

        if (mosaics.length === 0) return;

        const mosaic = mosaics.find((m) => m.name === displayMosaic);

        if (!mosaic) {
            setSelectedMosaic(mosaics[0]);
            return;
        }

        setSelectedMosaic(mosaic);

    }, [displayMosaic, mosaics]);

    {/* -------------------------------------------------------- WMS INFO HANDLERS */ }
    const handleWMSResults = ( results ) => { setWmsResults(results) };
    const handleWMSLoading = ( value ) => { setWmsLoading(value) };
    const handleWMSError = ( error ) => { setWmsError(error) };
    const handleWMSOpen = ( value ) => { setWmsInfoOpen(value) };

    const closeWMSInfo = () => {

        if ( featureInfoAbortControllerRef.current) {
            featureInfoAbortControllerRef
                .current
                .abort();

            featureInfoAbortControllerRef
                .current = null;
        }

        setWmsInfoOpen(false);
        setWmsLoading(false);
        setWmsError(null);
        setWmsResults([]);
    };

    const controlsRef = (element) => {

        if (!element) return;

        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);

    };

    const fetchAlertas = async () => {

        try {
            setLoading(true);
            const response = await fetch(dataAlerts.url)

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const result = await response.json();

            setAlerts(result);
            showToast("API Data Conected.", "success");

        } catch (error) {

            console.error(error);
            showToast("Data Disconected", "error");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlertas();
    }, [])

    useEffect(() => {

        if (!geojson?.features) return;

        //setFeatures(geojson?.features);

        const feats =
            (geojson.features || []).map(
                (feature, index) => ({
                    ...feature,
                    __originalIndex: index + 1
                })
            );

        setFeatures(feats);

    }, [geojson])

    {/* -------------------------------------------------------- RENDER */ }
    return (
        <div className="flex flex-col h-full">

            {/* -------------------------------------------------------- BACKGROUND*/ }
            <div className="absolute inset-0 patterns" />

            {/* -------------------------------------------------------- CONTENT */ }
            <div className="relative z-20 flex-1 flex overflow-hidden md:p-4">

                {/* -------------------------------------------------------- SIDEBAR */ }
                <div
                    className={`relative flex-shrink-0 transition-[width] duration-300 ease-in-out mr-4
                    ${showPanel ? "md:w-72" : "md:w-0"}`}
                >

                    {/* -------------------------------------------------------- SIDEBAR PANEL */ }
                    <div
                        className={`absolute top-0 left-0 z-[9999] w-screen h-full rounded-none overflow-hidden transform transition-transform duration-300 ease-in-out bg-gray-100
                            ${showPanel ? "translate-x-0" : "-translate-x-full" } 
                            md:w-72 md:rounded-lg 
                        `}
                    >

                        {/* -------------------------------------------------------- HEADER MOBILE */ }
                        <div className="flex items-center justify-between bg-[var(--color-bg-pattern)] px-4 py-2 border-b md:hidden">

                            <span className="font-semibold text-green-700/80">
                                Panel
                            </span>

                            <button
                                type="button"
                                onClick={() => setShowPanel(false)}
                                className="flex items-center justify-center rounded-full p-2 text-red-500 hover:bg-slate-100 transition cursor-pointer border border-green-700/20 bg-green-700/10"
                                title="Cerrar panel"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="h-full overflow-auto bg-[var(--color-bg-pattern)] md:bg-transparent">
                            {/*<FeaturesPanel
                                setGeojson={setGeojson}
                                layerVersion={layerVersion}
                                setLayerVersion={setLayerVersion}
                                selectedIndex={selectedIndex}
                                setSelectedIndex={setSelectedIndex}
                                selectedFeature={selectedFeature}
                                features={features}
                                setFeatures={setFeatures}
                            />*/}

                            <FeaturesList
                                title="Features Panel"
                                featuresData={features}
                                descriptiveField="cod"
                                setSelectedFeature={setSelectedFeature}
                                // Dropzone params
                                dropzone={true}
                                setGeojson={setGeojson}
                                setLayerVersion={setLayerVersion}
                            />

                        </div>

                    </div>

                </div>

                {/* -------------------------------------------------------- MAP */ }
                <div className="flex-1 relative min-w-0">

                    {loading && (<Loader />)}

                    <MapContainer
                        center={[-1.831239, -78.183406]}
                        zoom={7}
                        maxZoom={18}
                        className="w-full h-full rounded-lg"
                    >
                        <Pane name="lowestPane" style={{ zIndex: 200 }} />
                        <Pane name="planetPane" style={{ zIndex: 300 }} />
                        <Pane name="wmsPane" style={{ zIndex: 400 }} />
                        <Pane name="mediumPane" style={{ zIndex: 500 }} />
                        <Pane name="highestPane" style={{ zIndex: 800 }} />

                        {/* -------------------------------------------------------- BASEMAP */ }
                        {analiticBasemapsConfig[activeBasemap.id] && (
                            <TileLayer
                                url={
                                    analiticBasemapsConfig[
                                        activeBasemap.id
                                    ].url
                                }

                                {...(
                                    analiticBasemapsConfig[
                                        activeBasemap.id
                                    ].options ||
                                    {}
                                )}

                            />
                        )}

                        {/* -------------------------------------------------------- PLANET MOSAIC */ }
                        {planetVisible && selectedMosaic && (
                            <TileLayer
                                attribution="Planet"
                                url={`${API_URL}${selectedMosaic.tile_url}`}
                                opacity={planetOpacity}
                                pane="planetPane"
                                maxZoom={18}
                            />
                        )}

                        {/*provinciasVisible && alertas && (
                            <GeoJSON 
                                key={"Alertas"}
                                attribution="JWS"
                                data={alertas}
                                pane="highestPane"
                            /> 
                        )*/}

                        {/* -------------------------------------------------------- ALERTS DATA */}
                        {alertsVisible && alerts && (

                            <GeoJSON
                                key={dataAlerts.id}
                                data={alerts}
                                pane={dataAlerts.pane}
                                style={() => dataAlerts.style}

                                onEachFeature={(feature, layer) => {

                                    const properties = feature?.properties || {};

                                    const content = `
                                        <div style="
                                            min-width: 240px;
                                            font-family: Arial, sans-serif;
                                        ">

                                            <div style="
                                                font-size: 15px;
                                                font-weight: 700;
                                                color: #166534;
                                                margin-bottom: 10px;
                                            ">
                                                Info: Alerta SATA 2026
                                            </div>

                                            ${Object.entries(properties)
                                                .map(([key, value]) => `
                                                    <div style="
                                                        display: flex;
                                                        justify-content: space-between;
                                                        gap: 12px;
                                                        padding: 2px 0;
                                                        border-bottom: 1px solid #e2e8f0;
                                                        color: #159446;
                                                    ">
                                                        <strong>${key}</strong>
                                                        <span>${value ?? "N/D"}</span>
                                                    </div>
                                                `)
                                                .join("")}

                                        </div>
                                    `;

                                    layer.bindPopup(content);

                                    layer.on({

                                        mouseover: (event) => {
                                            event.target.setStyle({
                                                fillColor: "transparent",
                                                fillOpacity: 0.45,
                                                color: "#d60fc6",
                                                weight: 2.5
                                            });
                                        },

                                        mouseout: (event) => {
                                            event.target.setStyle(
                                                dataAlerts.style
                                            );
                                        }

                                    });

                                }}
                            />

                        )}

                        {/* -------------------------------------------------------- FEATURES */ }
                        {featureVisible && geojson && (
                            <GeoJSON
                                key={layerVersion}
                                data={geojson}
                                style={(feature) => {
                                    
                                    // Temporalmente uso la goemetría para comparar, ya que la info seleccionada tiene un __originalIndex que no está presente en el geojson.
                                    const active = feature?.geometry === selectedFeature?.geometry; 

                                    return {
                                        color: active ? "#22d3ee" : "#facc15",
                                        weight: active ? 4 : 2,
                                        fillColor: active ? "#22d3ee" : "#facc15",
                                        fillOpacity: active ? featureOpacity + 0.2 : featureOpacity
                                    };

                                }}
                                pane="highestPane"

                                onEachFeature={(feature, layer) => {

                                    const properties = feature?.properties || {};

                                    const content = `
                                        <div style="
                                            min-width: 240px;
                                            font-family: Arial, sans-serif;
                                        ">

                                            <div style="
                                                font-size: 15px;
                                                font-weight: 700;
                                                color: #166534;
                                                margin-bottom: 10px;
                                            ">
                                                Info: Feature Seleccionado
                                            </div>

                                            ${Object.entries(properties)
                                                .map(([key, value]) => `
                                                    <div style="
                                                        display: flex;
                                                        justify-content: space-between;
                                                        gap: 12px;
                                                        padding: 2px 0;
                                                        border-bottom: 1px solid #e2e8f0;
                                                        color: #159446;
                                                    ">
                                                        <strong>${key}</strong>
                                                        <span>${value ?? "N/D"}</span>
                                                    </div>
                                                `)
                                                .join("")}

                                        </div>
                                    `;

                                    layer.bindPopup(content);

                                }}
                            />
                        )}

                        {/* -------------------------------------------------------- WMS LAYER */ }
                        {wmsLayers.filter((layer) => layer.visible).map(
                            (layer) => {
                                
                                const useProxy =
                                    layer.proxy !== false;

                                const wmsUrl =
                                    useProxy
                                        ? `${API_URL}/api/wms/proxy`
                                        : layer.url;

                                return (

                                <WMSTileLayer
                                    key={layer.id}
                                    url={wmsUrl}
                                    layers={layer.layers}
                                    format={layer.format || "image/png"}
                                    transparent={layer.transparent !== false}
                                    version={layer.version || "1.3.0"}
                                    /*
                                    * --------------------------------------------------
                                    * PROXY TARGET
                                    * --------------------------------------------------
                                    *
                                    * Leaflet incorporará este parámetro
                                    * en las solicitudes WMS.
                                    *
                                    * Nuestro Express lo recibe como:
                                    *
                                    * req.query.target
                                    *
                                    */
                                    {...(
                                        useProxy
                                            ? {
                                                target:
                                                    layer.url
                                            }
                                            : {}
                                    )}

                                    opacity={layer.opacity ?? 1}
                                    zIndex={layer.zIndex}
                                    attribution={layer.attribution}
                                    pane="wmsPane"
                                />

                            )}
                        )}

                        {/* -------------------------------------------------------- WMS GETFEATUREINFO */ }
                        <WMSMapClickHandler
                            layers={wmsLayers}
                            onResults={handleWMSResults}
                            onLoading={handleWMSLoading}
                            onError={handleWMSError}
                            onOpen={handleWMSOpen}
                            abortControllerRef={featureInfoAbortControllerRef}
                        />

                        {/* -------------------------------------------------------- ZOOM */ }
                        {selectedFeature && (
                            <ZoomToFeature
                                feature={
                                    selectedFeature
                                }
                            />
                        )}

                        {/* -------------------------------------------------------- MAP CONTROLS */ }
                        <div 
                            ref={controlsRef}
                            className=" absolute bottom-4 left-4 z-[1000] flex flex-col items-start gap-2" 
                        >

                            {/* -------------------------------------------------------- PANELS */ }
                            <div className="flex flex-col items-start gap-2">

                                {/* -------------------------------------------------------- PLANET CONTROL */ }
                                {!planetControlCollapsed && (
                                    <div className="w-64 overflow-hidden rounded-lg bg-white shadow-lg">
                                        <MapControlOverlay
                                            opacity={planetOpacity}
                                            onChange={setPlanetOpacity}
                                            fields={mosaicMonths}
                                            value={displayMosaic}
                                            onMosaicChange={setDisplayMosaic}
                                        />
                                    </div>
                                )}

                                {/* -------------------------------------------------------- CONTROL LAYERS */ }
                                {!collapsed && (
                                    <LayerControl
                                        collapsed={collapsed}
                                        setCollapsed={setCollapsed}
                                        baseMaps={baseMaps}
                                        activeBasemap={activeBasemap.name}
                                        onBasemapChange={changeBasemap}
                                        layers={layers}
                                        onToggleLayer={toggleLayer}
                                        onRemoveLayer={null}
                                        position="static"
                                    />
                                )}

                                {/* -------------------------------------------------------- GEOMETRY TOOLS */}
                                {geometryToolsOpen && (
                                    <GeometryTools
                                        open={geometryToolsOpen}
                                        onClose={() => setGeometryToolsOpen(false)}
                                    />
                                )}

                            </div>

                            {/* -------------------------------------------------------- BUTTONS BLOCK */ }
                            <div 
                                className="flex flex-row items-center gap-2"
                            >

                                {/* -------------------------------------------------------- CONTROL BUTTON - LAYERS */ }
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCollapsed(
                                            (value) => !value
                                        )
                                    }
                                    className="flex items-center justify-center rounded-full bg-white  p-2 text-green-700/80 shadow-xl transition  hover:bg-slate-100 cursor-pointer"
                                    title={
                                        collapsed
                                            ? "Mostrar capas"
                                            : "Ocultar capas"
                                    }
                                >
                                    <Layers size={20} />
                                </button>

                                {/* -------------------------------------------------------- CONTROL BUTTON - PLANET */ }
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPlanetControlCollapsed(
                                            (value) => !value
                                        )
                                    }
                                    className="flex items-center justify-center rounded-full bg-white p-2 text-green-700/80 shadow-xl transition hover:bg-slate-100 cursor-pointer "
                                    title={
                                        planetControlCollapsed
                                            ? "Mostrar control Planet"
                                            : "Ocultar control Planet"
                                    }
                                >
                                    <Satellite size={20} />
                                </button>

                                {/* -------------------------------------------------------- CONTROL BUTTON - GEOMETRY TOOLS */ }
                                <button
                                    type="button"
                                    onClick={() =>
                                        setGeometryToolsOpen(
                                            (value) => !value
                                        )
                                    }
                                    className="relative flex items-center justify-center rounded-full bg-white p-2 text-green-700/80 shadow-xl transition hover:bg-slate-100 cursor-pointer "
                                    title={
                                        geometryToolsOpen
                                            ? "Ocultar herramientas geométricas"
                                            : "Mostrar herramientas geométricas"
                                    }
                                >
                                    <DraftingCompass size={20} />
                                    <span className="absolute bottom-7 left-4 bg-amber-300 text-amber-700 text-[9px] px-1 rounded-full">New</span>
                                </button>

                                {/* -------------------------------------------------------- CONTROL BUTTON - FEATURES PANEL */ }
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPanel(
                                            (value) => !value
                                        )
                                    }
                                    className="flex items-center justify-center rounded-full bg-white p-2 text-green-700/80 shadow-xl transition hover:bg-slate-100 cursor-pointer "
                                    title={
                                        showPanel
                                            ? "Mostrar Features Panel"
                                            : "Ocultar Features Panel"
                                    }
                                >
                                    <Settings2 size={20} />
                                </button>

                            </div>

                        </div>

                        {/* -------------------------------------------------------- WMS FEATURE INFO */ }
                        <WMSFeatureInfo
                            results={wmsResults}
                            loading={wmsLoading}
                            error={wmsError}
                            open={wmsInfoOpen}
                            onClose={closeWMSInfo}
                        />

                    </MapContainer>

                </div>

            </div>

        </div>
    );
}
