{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState, useRef } from "react";

{/* -------------------------------------------------------- DATA */ }
import { DATA_FILTERS } from "../data/dataFilters";
import { FIELD_ALIASES, VISIBLE_FIELDS, NAVBAR_TITLES } from "../data/dataMeta";
import { baseMapsConfig } from "../config/basemaps.config";
import { panesConfig } from "../config/panes.config";
import { seguimientoLayersConfig } from "../config/layers.config";

{/* -------------------------------------------------------- CONTEXT */ }

{/* -------------------------------------------------------- COMPONENTS */ }
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import LeftSidebar from "../components/LeftAside";
import RightSidebar from "../components/RightAside";
import CardsContainer from "../components/CardContainer";

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

{/* -------------------------------------------------------- PAGES */ }

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function SeguimientoDashboard({
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
        onLoad(NAVBAR_TITLES.seguimiento);
        fetch("/data/DB_SEGUIMIENTO_SATA_P.geojson")
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
            campoXEsFecha: false,
            usarMes: false,
            dateFormat: "YYYY-MM-DD",
            ordenarLabels: true,
        }

        return {
            total: filteredData.features.length,
            provincia: multiGroupBy(filteredData, "PROVINCIA"),
            canton: multiGroupBy(filteredData, "CANTÓN"),
            parroquia: multiGroupBy(filteredData, "PARROQUIA"),
            severidad: multiGroupBy(filteredData, "SEVERIDAD"),
            delimitacion: multiGroupBy(filteredData, "DELIMITACI"),
            estado: multiGroupBy(filteredData, "ESTADO_PRO"),
            anio: multiGroupBy(filteredData, "ano"),
            mes: multiGroupBy(filteredData, "FECHA_FIN"),
            provxsev: agruparParaStackedBar(filteredData?.features, 'PROVINCIA', 'SEVERIDAD', stackedOptions),
            anioline: agruparParaStackedBar(filteredData?.features, 'FECHA_FIN', 'fm_anio', stackedOptions)
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
        title : 'Atención a Alertas SATA',
        subtitle: 'Programa de Control (PGCPFNUVS)',
        icon: 'https://img.icons8.com/?size=100&id=l0wBom3z2I3J&format=png&color=000000',

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
                                    name: "Clúster Atención",
                                    cluster: true,
                                    style: {
                                        fill: "rgba(255, 179, 0, 0.92)",
                                        stroke: 'rgba(200, 3, 3, 0.20',
                                        width: 1,
                                        radius: 3
                                    },
                                    popup: {
                                        fields: VISIBLE_FIELDS.alternative,
                                        aliases: FIELD_ALIASES,
                                    },
                                    pane: "highestPane",
                                }}
                                defaultLayers={seguimientoLayersConfig.defaultLayers}
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
                                <StackedBarChart
                                    title={"Estadísticas de atención por Severidad y Provincia"}
                                    data={stats?.provxsev}
                                    config={{
                                        titleColor: '#10952b',
                                        titleFontSize: 18,
                                        titleWeight: 'bold',
                                        orderByLabels: false, // Default is order by values
                                        configPalette: {
                                            palette: 'categorizedPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette'
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
                                <PolarChart
                                    title={"Estado de Seguimiento (Total)"}
                                    data={stats?.estado}
                                    config={{
                                        titleColor: '#10952b',
                                        titleFontSize: 18,
                                        titleWeight: 'bold',
                                        orderByLabels: true, // Default (false): is order by values
                                        configPalette: {
                                            palette: 'defaultPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette', 'customPalette', 'categorizedPalette'
                                            gradientPalette: ["#ef4444", "#3b82f6"],
                                            //customPalette: ["yellow", "blue", "red"],
                                            categorizedPalette: {
                                                'Cierre Final': '#1E8449',
                                                'Cierre Técnico': '#52BE80',
                                                'Control y Verificación': '#27AE60',
                                                'Inicio': '#82E0AA',
                                            }
                                        },
                                        chartStyle: {
                                            //backgroundColor: "rgba(246, 151, 9, 0.41)",
                                            //borderColor: "rgb(236, 105, 17)",
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