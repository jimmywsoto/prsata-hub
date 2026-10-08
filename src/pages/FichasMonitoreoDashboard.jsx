{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    UPDATED AT: October, 2026
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState, useRef } from "react";

{/* -------------------------------------------------------- DATA */ }
import { FIELD_ALIASES, VISIBLE_FIELDS} from "../data/dataMeta";
import { baseMapsConfig } from "../config/basemaps.config";
import { wmsLayersConfig } from "../config/wmsLayers.config";
import { panesConfig } from "../config/panes.config";
import { fichasLayersConfig } from "../config/layers.config";
import { latestAlerts } from "../config/latestAlerts.config";
import { jsonChartFD1, jsonChartFD2, jsonChartFD3 } from "../config/fichasDashboard.config";

{/* -------------------------------------------------------- COMPONENTS */ }
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import CardsContainer from "../components/CardContainer";
import ChartContainer from "../components/ChartContainer";
import MobileTab from "../components/MobileTab";

import {
    codMes,
    multiGroupBy,
    applyFilters,
    parseDate,
} from "../components/CommonFunctions";

import Loader from "../components/Loader";
//import { agruparParaStackedBar } from "../components/CommonFunctions";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function FichasMonitoreoDashboard({
    externalLayers = [],
    filters = { filters },
    location = {},
    onStats = () => {},
}) {
    const [rawData, setRawData] = useState(null);
    const [mobileTab, setMobileTab] = useState("map");
    const mapApiRef = useRef(null);
    const mapApiRef2 = useRef(null);

    {/* ============================================================ LOAD PRINCIPAL DATA */ }
    useEffect(() => {
        fetch("/data/DB_FICHAS_MONITOREO_P.geojson")
            .then((res) => res.json())
            .then(setRawData)
            .catch(console.error);
    }, []);

    {/* ============================================================ FILTERED DATA */ }
    const filteredData = useMemo(() => {
        if (!rawData?.features) return null;

        const filterConfig = {
            provincia: "DPA_DESPRO",
            delimitacion: "delimitaci",
            mes: "fm_monit",
            anio: "fm_anio",
            dateFormat: "YYYY-MM-DD"
        }

        const { features } = applyFilters(rawData, filters, filterConfig)

        return { ...rawData, features };
    }, [rawData, filters]);

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
            severidad: multiGroupBy(filteredData, "fm_severid"),
            delimitacion: multiGroupBy(filteredData, "delimitaci"),
            anio: multiGroupBy(filteredData, "fm_anio"),
            mes: multiGroupBy(filteredData, "fm_monit"),
            //delxsev: agruparParaStackedBar(filteredData?.features, 'fm_monit', 'fm_severidad', stackedOptions),
            //anioline: agruparParaStackedBar(filteredData?.features, 'fm_monit', 'fm_anio', stackedOptions)
        };
    }, [filteredData]);

    useEffect(() => {
        onStats(stats);
    }, [stats]);

    useEffect(() => {
        if (!location || !mapApiRef.current || !mapApiRef2.current) return;

        console.log(location.lat, location.lng)

        mapApiRef.current.setLocation({
            lat: location.lat,
            lng: location.lng,
            zoom: 14,
            popup: location.label
        });

        mapApiRef2.current.setLocation({
            lat: location.lat,
            lng: location.lng,
            zoom: 14,
            popup: location.label
        });
        
    }, [location]);

    const dataCards = {
        title : 'Fichas de Monitoreo Satelital',
        subtitle: 'Sistema Nacional de Monitoreo de Bosques (SNMB)',
        icon: 'https://img.icons8.com/?size=100&id=eFgNLKw3s7EQ&format=png&color=000000',

        alertas: stats?.total || 0,

        anio: filtrarEstadistica(
            stats?.anio || [],
            filters.anio,
            "anio"
        ),

        mes: filtrarEstadistica(
            stats?.mes || [],
            filters.mes,
            "mes"
        ),

        provincia: filtrarEstadistica(
            stats?.provincia || [],
            filters.provincia,
            "provincia"
        ),

        delimitacion: filtrarEstadistica(
            stats?.delimitacion || [],
            filters.delimitacion,
            "delimitacion"
        ),
    };

    const latestDate = latestAlerts.date;

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

                        <aside className="col-span-1 w-full h-full overflow-y-auto">
                            <div className="h-full shadow-md">
                                <CardsContainer data={dataCards} />
                            </div>
                        </aside>

                        <section className="col-span-3 flex-1 h-full min-w-0">
                            <div className="h-full bg-white rounded-lg shadow-md overflow-hidden">
                                <GeoJSONVTMap
                                    baseMapsConfig={baseMapsConfig}
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

                        <aside className="col-span-2 h-full">

                            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                                {/* Fila 1 - BarChart ocupa ambas columnas */}
                                <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md overflow-hidden flex items-center flex-col">
                                    
                                    <ChartContainer
                                        data={ stats?.provincia }
                                        json={ jsonChartFD1 }
                                        date={ latestDate }
                                        chart="SimpleBarChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                                    />

                                </div>

                                {/* Fila 2 - Doughnut */}
                                <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center flex-col">

                                    <ChartContainer
                                        data={ stats?.delimitacion }
                                        json={ jsonChartFD2 }
                                        date={ latestDate }
                                        chart="DoughnutChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                                    />

                                </div>

                                {/* Fila 2 - Radar */}
                                <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center flex-col">
                                    
                                    <ChartContainer
                                        data={ stats?.mes }
                                        json={ jsonChartFD3 }
                                        date={ latestDate }
                                        chart="RadarChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                                    />

                                </div>

                            </div>
                        </aside>

                    </div>

                    {/* Mobile View */}
                    <div className="h-full flex flex-col">

                        <div className="flex-1 overflow-hidden">

                            {mobileTab === "map" && (
                                <GeoJSONVTMap
                                    baseMapsConfig={baseMapsConfig}
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
                                <CardsContainer data={dataCards} />
                            )}

                            {mobileTab === "charts" && (
                                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                                    {/* Fila 1 - BarChart */}
                                    <div className="col-span-2 row-span-1 bg-white rounded-b-lg shadow-md overflow-hidden flex items-center flex-col">
                                        <ChartContainer
                                            data={ stats?.provincia }
                                            json={ jsonChartFD1 }
                                            date={ latestDate }
                                            chart="SimpleBarChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                                        />
                                    </div>

                                    {/* Fila 2 - Doughnut */}
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center flex-col">

                                        <ChartContainer
                                            data={ stats?.delimitacion }
                                            json={ jsonChartFD2 }
                                            date={ latestDate }
                                            chart="DoughnutChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                                        />

                                    </div>

                                    {/* Fila 2 - Radar */}
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center flex-col">

                                        <ChartContainer
                                            data={ stats?.mes }
                                            json={ jsonChartFD3 }
                                            date={ latestDate }
                                            chart="RadarChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                                        />

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

{/* ============================================================ AUXILIAR FUNCTION: FILTER STATISTICS BY SELECTOR */ }
function filtrarEstadistica(statsArray, selectedValues, tipo = null) {
    if (!Array.isArray(statsArray)) return statsArray;

    // Sin filtros activos
    if (
        !selectedValues ||
        selectedValues === "Todos" ||
        (Array.isArray(selectedValues) && selectedValues.length === 0)
    ) {
        return statsArray;
    }

    const valores = Array.isArray(selectedValues)
        ? selectedValues.map(v => String(v).toUpperCase())
        : [String(selectedValues).toUpperCase()];

    return statsArray.filter(([label]) => {
        let comparable = String(label).toUpperCase();

        /* ======================= */
        /* CONVERSIÓN ESPECIAL MES */
        /* ======================= */
        if (tipo === "mes") {
            const fecha = parseDate(label);

            if (!fecha || isNaN(fecha)) return false;

            comparable = codMes(fecha.getMonth() + 1).toUpperCase();
        }

        return valores.includes(comparable);
    });
}
