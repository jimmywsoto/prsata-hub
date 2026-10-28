{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    UPDATED AT: October, 2026
    VERSIÓN: 2.1.1
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState, useRef } from "react";

{/* -------------------------------------------------------- DATA */ }
import { FIELD_ALIASES, VISIBLE_FIELDS} from "../data/dataMeta";
import { analiticBasemapsConfig } from "../config/basemaps.config";
import { wmsLayersConfig } from "../config/wmsLayers.config";
import { panesConfig } from "../config/panes.config";
import { fichasLayersConfig } from "../config/layers.config";

{/* -------------------------------------------------------- COMPONENTS */ }
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import MobileTab from "../components/MobileTab";

import {
    multiGroupBy,
    applyFilters,
} from "../components/CommonFunctions";

import Loader from "../components/Loader";
import FeaturesList from "../components/FeaturesList";
import ContentFichas from "../components/ContentFichas";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function FichasMonitoreo({
    externalLayers = [],
    filters = { filters },
    location = {},
    onStats = () => {},
}) {
    const [rawData, setRawData] = useState(null);
    const [mobileTab, setMobileTab] = useState("map");
    const mapApiRef = useRef(null); // Desktop
    const mapApiRef2 = useRef(null); // Móvil

    const [features, setFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);

    {/* ============================================================ LOAD PRINCIPAL DATA */ }
    useEffect(() => {
        fetch("/data/DB_FICHAS_MONITOREO_P.geojson")
            .then((res) => res.json())
            .then(setRawData)
            .catch(console.error)
    }, []);

    {/* ============================================================ FILTERED DATA */ }
    const filteredData = useMemo(() => {
        if (!rawData?.features) return null;

        const filterConfig = {
            provincia: "DPA_DESPRO",
            delimitacion: "delimitaci",
            mes: "fm_mntr",
            anio: "ano",
            dateFormat: "YYYY-MM-DD"
        }

        const { features } = applyFilters(rawData, filters, filterConfig)

        return { ...rawData, features };
    }, [rawData, filters]);

    {/* ============================================================ FEATURES DATA */ }
    /*useEffect(() => {

        if(!rawData?.features) return;

        const feats =
            (rawData.features || []).map(
                (feature, index) => ({
                    ...feature,
                    __originalIndex: index + 1
                })
            );

        setFeatures(feats);

    }, [rawData])*/

    useEffect(() => {

        if(!filteredData?.features) return;

        const feats =
            (filteredData.features || []).map(
                (feature, index) => ({
                    ...feature,
                    __originalIndex: index + 1
                })
            );

        setFeatures(feats);

    }, [filteredData])

    {/* ============================================================ PRINCIPAL STATS */ }
    const stats = useMemo(() => {
        if (!filteredData?.features) return null;

        const stackedOptions = {
            campoXEsFecha: true,
            usarMes: true,
            dateFormat: "YYYY-MM-DD",
            ordenarLabels: false,
        }

        return {
            total: filteredData.features.length,
            provincia: multiGroupBy(filteredData, "DPA_DESPRO"),
            canton: multiGroupBy(filteredData, "DPA_DESCAN"),
            parroquia: multiGroupBy(filteredData, "DPA_DESPAR"),
            severidad: multiGroupBy(filteredData, "severidad"),
            delimitacion: multiGroupBy(filteredData, "delimitaci"),
            //anio: multiGroupBy(filteredData, "ano"),
            //mes: multiGroupBy(filteredData, "fm_monit"),
            //delxsev: agruparParaStackedBar(filteredData?.features, 'fm_monit', 'fm_severidad', stackedOptions),
            //anioline: agruparParaStackedBar(filteredData?.features, 'fm_monit', 'fm_anio', stackedOptions)
        };
    }, [filteredData]);

    useEffect(() => {
        onStats(stats);
    }, [stats]);

    const getActiveMapApi = () => {
        // En pantallas pequeñas, la pestaña determina el contenido visible.
        if (window.matchMedia("(max-width: 767px)").matches) {
            return mobileTab === "map"
                ? mapApiRef2.current
                : null;
        }

        return mapApiRef.current;
    };

    useEffect(() => {

        if (!location) return;

        const lng = location.lng;
        const lat = location.lat;
        const popup = location.label;

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const mapApi = getActiveMapApi();

        if (!mapApi) return;

        mapApi.setLocation({
            lat,
            lng,
            zoom: 14,
            popup,
        });
        
    }, [location]);

    useEffect(() => {
        if (!selectedFeature?.geometry?.coordinates) return;

        const [lng, lat] = selectedFeature.geometry.coordinates;

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const mapApi = getActiveMapApi();

        if (!mapApi) return;

        mapApi.setLocation({
            lat,
            lng,
            zoom: 14,
            popup: `
            <div>
                <b>ID. SATA:</b><br/>
                ${selectedFeature.properties?.fm_cod || ""}
            </div>
        `,
        });
        
    }, [selectedFeature, mobileTab]);

    {/* ============================================================ RENDER */ }
    if (!rawData) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col h-full">

            <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
            
                {/* Layout */}
                <main className="flex-1 overflow-hidden">

                    {/* Desktop View */}
                    <div className="hidden md:grid md:grid-cols-6 h-full gap-4 p-4">

                        {/* Features List */}
                        <aside className="col-span-1 w-full h-full overflow-y-auto rounded-lg  shadow-xl">
                            <div className="h-full shadow-md overflow-auto bg-[var(--color-bg-pattern)] md:bg-transparent">
                                <FeaturesList
                                    title="Fichas de Monitoreo"
                                    featuresData={features}
                                    descriptiveField="fm_cod"
                                    setSelectedFeature={setSelectedFeature}
                                />
                            </div>
                        </aside>

                        {/* Map */}
                        <section className="col-span-3 flex-1 h-full min-w-0">
                            <div className="h-full bg-white rounded-lg shadow-md overflow-hidden">
                                <GeoJSONVTMap
                                    baseMapsConfig={analiticBasemapsConfig}
                                    wmsLayersConfig={wmsLayersConfig}
                                    panesConfig={panesConfig}
                                    data={{
                                        geojson: filteredData,
                                        name: "Clúster Fichas",
                                        cluster: true,
                                        style: {
                                            fill: "rgb(249, 200, 76)",
                                            stroke: 'rgb(249, 200, 76)',
                                            width: 1,
                                            radius: 12
                                        },
                                        popup: {
                                            fields: VISIBLE_FIELDS.extended,
                                            aliases: FIELD_ALIASES,
                                        },
                                        pane: "highestPane",
                                    }}
                                    defaultLayers={fichasLayersConfig.defaultLayers}
                                    externalLayers={externalLayers}
                                    filters={filters}
                                    onMapReady={(api) => {
                                        mapApiRef.current = api;
                                    }}
                                />
                            </div>
                        </section>
                        
                        {/* Content */}
                        <aside className="col-span-2 h-full overflow-y-scroll">

                            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                                {/* Fila 2 - Doughnut */}
                                <div className="col-span-2 row-span-2 overflow-y-scroll row-span-1 bg-white rounded-lg shadow-md overflow-hidden flex items-center flex-col">
                                    <ContentFichas content={selectedFeature?.properties}/>
                                </div>

                            </div>
                        </aside>

                    </div>

                    {/* Mobile View */}
                    <div className="h-full flex flex-col">

                        <div className="flex-1 overflow-hidden">

                            {mobileTab === "map" && (
                                <GeoJSONVTMap
                                    baseMapsConfig={analiticBasemapsConfig}
                                    wmsLayersConfig={wmsLayersConfig}
                                    panesConfig={panesConfig}
                                    data={{
                                        geojson: filteredData,
                                        name: "Clúster Fichas",
                                        cluster: true,
                                        style: {
                                            fill: "rgb(249, 200, 76)",
                                            stroke: 'rgb(249, 200, 76)',
                                            width: 1,
                                            radius: 12
                                        },
                                        popup: {
                                            fields: VISIBLE_FIELDS.extended,
                                            aliases: FIELD_ALIASES,
                                        },
                                        pane: "highestPane",
                                    }}
                                    defaultLayers={fichasLayersConfig.defaultLayers}
                                    externalLayers={externalLayers}
                                    filters={filters}
                                    onMapReady={(api) => {
                                        mapApiRef2.current = api;
                                    }}
                                />
                            )}

                            {mobileTab === "cards" && (
                                <FeaturesList
                                    title="Fichas de Monitoreo"
                                    featuresData={features}
                                    descriptiveField="fm_cod"
                                    setSelectedFeature={setSelectedFeature}
                                />
                            )}

                            {mobileTab === "charts" && (
                                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                                    {/* Fila 2 - Doughnut */}
                                    <div className="col-span-2 row-span-2 overflow-y-scroll row-span-1 bg-white  shadow-md overflow-hidden flex items-center flex-col">
                                        <ContentFichas content={selectedFeature?.properties}/>
                                    </div>

                                </div>
                            )}

                        </div>

                        <MobileTab 
                            mobileTab={mobileTab} 
                            setMobileTab={setMobileTab}
                        />

                    </div>

                </main>
                
            </div>

        </div>
    );
}
