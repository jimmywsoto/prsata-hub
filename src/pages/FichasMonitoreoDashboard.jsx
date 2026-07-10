import { useEffect, useMemo, useState, useRef } from "react";
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import LeftSidebar from "../components/LeftAside";
import RightSidebar from "../components/RightAside";
import CardsContainer from "../components/CardContainer";
import { DATA_FILTERS } from "../data/dataFilters";
import { FIELD_ALIASES, VISIBLE_FIELDS, NAVBAR_TITLES } from "../data/dataMeta";
import { baseMapsConfig } from "../config/basemaps.config";
import { panesConfig } from "../config/panes.config";
import { fichasLayersConfig } from "../config/layers.config";
import {
    codMes,
    multiGroupBy,
    applyFilters,
    parseDate,
    agruparPorDosCampos,
    agruparParaStackedBar,
    buildLineChartData
} from "../components/CommonFunctions";

import DoughnutChart from "../components/DoughnutChart";
import RadarChart from "../components/RadarChart";
import { SimpleBarChart } from "../components/SimpleBarChart";
import { StackedBarChart } from "../components/StackedBarChart";
import PolarChart from "../components/PolarChart";
import LineChart from "../components/LineChart";
import Loader from "../components/Loader";

export default function FichasMonitoreoDashboard({
    externalLayers = [],
    filters = { filters },
    location = {},
    onStats = {},
    onLoad = {},
}) {
    const [rawData, setRawData] = useState(null);
    const [statistics, setStatistics] = useState('');
    const mapApiRef = useRef(null);

    {/* ============================================================ LOAD PRINCIPAL DATA */ }
    useEffect(() => {
        onLoad(NAVBAR_TITLES.fichas);
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
            delxsev: agruparParaStackedBar(filteredData?.features, 'fm_monit', 'fm_severidad', stackedOptions),
            anioline: agruparParaStackedBar(filteredData?.features, 'fm_monit', 'fm_anio', stackedOptions)
        };
    }, [filteredData]);

    useEffect(() => {
        console.log(stats)
        onStats(stats);
    }, [stats]);

    useEffect(() => {
        if (!location || !mapApiRef.current) return;

        mapApiRef.current.setLocation({
            lat: location.lat,
            lng: location.lng,
            zoom: 14,
            popup: location.label
        });

    }, [location]);

    {/* ============================================================ RENDER */ }
    if (!rawData) {
        return <Loader />;
    }

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

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
                <main className="flex flex-1 gap-4 p-4 overflow-hidden">
                    <aside className="h-full overflow-y-auto">
                        <div className="h-full shadow-md">
                            <CardsContainer data={dataCards} />
                        </div>
                    </aside>

                    <section className="flex-1 h-full min-w-0">
                        <div className="h-full bg-white rounded-2xl shadow-md overflow-hidden">
                            <GeoJSONVTMap
                                baseMapsConfig={baseMapsConfig}
                                panesConfig={panesConfig}
                                location={location}
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

                    <aside className="w-[32%] min-w-[420px] h-full">
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                            {/* Fila 1 - BarChart ocupa ambas columnas */}
                            <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                                <SimpleBarChart
                                    title={"Fichas de Monitoreo por Provincia"}
                                    data={stats?.provincia}
                                    config={{
                                        titleColor: '#10952b',
                                        titleFontSize: 18,
                                        titleWeight: 'bold',
                                        orderByLabels: false, // Default is order by values
                                        configPalette: {
                                            palette: 'gradientPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette'
                                            gradientPalette: ["#ef4444", "#3b82f6"],
                                            categorizedPalette: {
                                                'ALTA': '#cd6155',
                                                'MEDIA': '#eb984e',
                                                'BAJA': '#f4d03f',
                                            }
                                        },
                                        chartStyle: {
                                            borderColor: 'rgba(66, 141, 67, 0.137)',
                                            borderWidth: 2,
                                            hoverBorderColor: "rgba(30, 159, 228, 0.75)",
                                            hoverBorderWidth: 3,
                                        },
                                    }}
                                />
                            </div>

                            {/* Fila 2 - Doughnut */}
                            <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                                <DoughnutChart
                                    title={"Estadísticas por Delimitación"}
                                    data={stats?.delimitacion}
                                    config={{
                                        titleColor: '#10952b',
                                        titleFontSize: 18,
                                        titleWeight: 'bold',
                                        orderByLabels: false, // Default is order by values
                                        configPalette: {
                                            palette: 'categorizedPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette', 'customPalette', 'categorizedPalette'
                                            //gradientPalette: ["#ef4444", "#3b82f6"],
                                            //customPalette: ["yellow", "blue", "red"],
                                            categorizedPalette: {
                                                'ABC-PSB': '#1E8449',
                                                'BVP': '#52BE80',
                                                'MANGLAR': '#27AE60',
                                                'PFE': '#82E0AA',
                                                'PFN': '#b3e0c7ff',
                                                'SNAP': '#145A32',
                                            }
                                        },
                                        chartStyle: {
                                            borderColor: 'rgb(255, 255, 255)',
                                            borderWidth: 2,
                                            hoverBorderColor: "rgba(30, 228, 70, 0.75)",
                                            hoverBorderWidth: 3,
                                        },
                                    }}
                                />
                            </div>

                            {/* Fila 2 - Radar */}
                            <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                                <RadarChart
                                    title={"Estadísticas por Periodo"}
                                    data={stats?.mes}
                                    config={{
                                        titleColor: '#10952b',
                                        titleFontSize: 18,
                                        titleWeight: 'bold',
                                        orderByLabels: true, // Default (false): is order by values
                                        chartStyle: {
                                            backgroundColor: "rgba(246, 151, 9, 0.41)",
                                            borderColor: "rgb(236, 105, 17)",
                                            borderWidth: 2,
                                            pointBackgroundColor: "rgb(209, 51, 51)",
                                            pointBorderColor: "#fff",
                                            pointBorderWidth: 2,
                                            pointHoverBackgroundColor: "#fff",
                                            pointHoverBorderColor: "rgba(59,130,246,1)",
                                        },
                                    }}
                                />
                            </div>

                        </div>
                    </aside>
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