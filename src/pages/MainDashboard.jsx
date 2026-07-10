{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState, useRef } from "react";
import { Map, Database, ChartNoAxesCombined } from 'lucide-react';
import axios from "axios";

{/* -------------------------------------------------------- DATA */ }
import { FIELD_ALIASES, VISIBLE_FIELDS, NAVBAR_TITLES } from "../data/dataMeta";
import { baseMapsConfig } from "../config/basemaps.config";
import { panesConfig } from "../config/panes.config";
import { mainLayersConfig } from "../config/layers.config";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

{/* -------------------------------------------------------- COMPONENTS */ }
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import CardsContainer from "../components/CardContainer";

import {
    codMes,
    multiGroupBy,
    applyFilters,
    parseDate,
    agruparParaStackedBar,
} from "../components/CommonFunctions";                                                                                                                                                                                                                             

import DoughnutChart from "../components/DoughnutChart";
import RadarChart from "../components/RadarChart";
import { SimpleBarChart } from "../components/SimpleBarChart";
import Loader from "../components/Loader";

import ReportGenerator from "../components/reports/ReportGenerator";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function MainDashboard({
    externalLayers = [],
    filters = { filters },
    location = {},
    onStats = () => {},
    onLoad = () => {},
}) {
    const [rawData, setRawData] = useState(null);
    const mapApiRef = useRef(null);

    

    {/* ============================================================ LOAD PRINCIPAL DATA */ }
    useEffect(() => {
        onLoad(NAVBAR_TITLES.dashboard);
        fetch("/data/DB_ALERTAS_SATA_P.geojson")
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
            mes: "fin",
            anio: "ano",
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
            severidad: multiGroupBy(filteredData, "severidad"),
            delimitacion: multiGroupBy(filteredData, "delimitaci"),
            anio: multiGroupBy(filteredData, "ano"),
            mes: multiGroupBy(filteredData, "fin"),
            delxsev: agruparParaStackedBar(filteredData?.features, 'fin', 'severidad', stackedOptions),
            anioline: agruparParaStackedBar(filteredData?.features, 'fin', 'ano', stackedOptions)
        };
    }, [filteredData]);

    useEffect(() => {
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

    const dataCards = {
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

    const [mobileTab, setMobileTab] = useState("map");

    const chartRefs = {
        provincia:
            useRef(null),

        severidad:
            useRef(null),

        periodo:
            useRef(null)
    };

    const reportGeneratorRef =
        useRef(null);

    const provinciaChartRef =
        useRef(null);

    const severidadChartRef =
        useRef(null);

    const periodoChartRef =
        useRef(null);

    const [reportData, setReportData] = useState({});

    const generateHtml = async (e, report) => {
        e.preventDefault();

        console.log('ReportData on submit:', report);

        try {
            const payload = {
                reportData: report
            };

            const response = await axios.post(
                `${backendUrl}/api/report`,
                payload
            );

            console.log(response);

        } catch (err) {
            console.log(err);
        } finally {
            console.log('Completo');
        }
    };

    const generatePdf = async (e, report) => {

        e.preventDefault();

        try {

            const response = await axios.post(
                `${backendUrl}/api/report`,
                {
                    reportData: report
                },
                {
                    responseType: 'blob'
                }
            );

            const blob = new Blob(
                [response.data],
                {
                    type: 'application/pdf'
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement('a');

            link.href = url;
            link.download = 'Reporte_SATA.pdf';

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {

            console.error(err);
        }
    };

    {/* ============================================================ RENDER */ }
    if (!rawData) {
        return <Loader/>;
    }

    return (
        <div className="flex flex-col h-full">

            <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">

                {/* Layout 1 */}
                <main className="flex-1 overflow-hidden">

                    {/* Desktop */}
                    <div className="hidden md:grid md:grid-cols-7 h-full gap-4 p-4">

                        {/* Escritorio */}
                        <aside className="hidden md:flex col-span-1 h-full overflow-y-auto">
                            <div className="h-full shadow-md">
                                <CardsContainer data={dataCards} />
                            </div>
                        </aside>

                        <section className="col-span-4 flex-1 h-full min-w-0">
                            <div className="h-full bg-white rounded-2xl shadow-md overflow-hidden">
                                <GeoJSONVTMap
                                    baseMapsConfig={baseMapsConfig}
                                    panesConfig={panesConfig}
                                    location={location}
                                    data={{
                                        geojson: filteredData,
                                        name: "Clúster SATA",
                                        cluster: true,
                                        style: {
                                            fill: "rgb(249, 200, 76)",
                                            stroke: 'rgb(249, 200, 76)',
                                            width: 1,
                                            radius: 12
                                        },
                                        popup: {
                                            fields: VISIBLE_FIELDS.basic,
                                            aliases: FIELD_ALIASES,
                                        },
                                        pane: "highestPane",
                                    }}
                                    defaultLayers={mainLayersConfig.defaultLayers}
                                    externalLayers={externalLayers}
                                    filters={filters}
                                    onMapReady={(api) => {
                                        //mapApiRef.current = api;
                                        //mapApiRef = api;
                                    }}
                                />
                            </div>
                        </section>

                        <aside className="hidden md:flex col-span-2 h-full">
                            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                                {/* Fila 1 - BarChart ocupa ambas columnas */}
                                <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                                    <SimpleBarChart
                                        ref={provinciaChartRef}
                                        title={"Alertas SATA por Provincia"}
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
                                        ref={severidadChartRef}
                                        title={"Estadísticas por Severidad"}
                                        data={stats?.severidad}
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
                                                    'ALTA': '#cd6155',
                                                    'MEDIA': '#eb984e',
                                                    'BAJA': '#f4d03f',
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
                                        ref={periodoChartRef}
                                        title={"Estadísticas por Periodo"}
                                        data={stats?.mes}
                                        config={{
                                            titleColor: '#10952b',
                                            titleFontSize: 18,
                                            titleWeight: 'bold',
                                            orderByLabels: true, // Default (false): is order by values
                                            configPalette: {
                                                palette: 'categorizedPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette', 'customPalette', 'categorizedPalette'
                                                gradientPalette: ["#ef4444", "#3b82f6"],
                                                customPalette: ["yellow", "blue", "red"],
                                                categorizedPalette: {
                                                    'ALTA': '#cd6155',
                                                    'MEDIA': '#eb984e',
                                                    'BAJA': '#f4d03f',
                                                }
                                            },
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

                                {/*<ReportGenerator
                                    ref={reportGeneratorRef}
                                    template="sata-trimestral"
                                    filters={filters}
                                    filteredData={filteredData}
                                    stats={stats}
                                    mapApiRef={mapApiRef}
                                    chartRefs={{
                                        provincia:
                                            provinciaChartRef,

                                        severidad:
                                            severidadChartRef,

                                        periodo:
                                            periodoChartRef,
                                    }}
                                    onSuccess={(report) => {
                                        console.log(
                                            "ReportData:",
                                            report
                                        );
                                    }}
                                    onError={(error) => {
                                        console.error(
                                            "Error:",
                                            error
                                        );
                                    }}
                                />

                                <button
                                    onClick={async (e) => {

                                        const report =
                                            await reportGeneratorRef
                                                .current
                                                .generate();

                                        setReportData(report);
                                        //await generateHtml(e, report);
                                        await generatePdf(e, report);
                                    }}
                                >
                                    Generar reporte
                                </button>*/}

                            </div>
                        </aside>
                    </div>

                    {/* Mobile */}
                    <div className=" h-full flex flex-col">

                        <div className="flex-1 overflow-hidden">

                            {mobileTab === "map" && (
                                <GeoJSONVTMap
                                    baseMapsConfig={baseMapsConfig}
                                    panesConfig={panesConfig}
                                    location={location}
                                    data={{
                                        geojson: filteredData,
                                        name: "Clúster SATA",
                                        cluster: true,
                                        style: {
                                            fill: "rgb(249, 200, 76)",
                                            stroke: 'rgb(249, 200, 76)',
                                            width: 1,
                                            radius: 12
                                        },
                                        popup: {
                                            fields: VISIBLE_FIELDS.basic,
                                            aliases: FIELD_ALIASES,
                                        },
                                        pane: "highestPane",
                                    }}
                                    defaultLayers={mainLayersConfig.defaultLayers}
                                    externalLayers={externalLayers}
                                    filters={filters}
                                    onMapReady={(api) => {
                                        mapApiRef.current = api;
                                    }}
                                />
                            )}

                            {mobileTab === "cards" && (
                                <CardsContainer data={dataCards} />
                            )}

                            {mobileTab === "charts" && (
                                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                                    {/* Fila 1 - BarChart ocupa ambas columnas */}
                                    <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                                        <SimpleBarChart
                                            title={"Alertas SATA por Provincia"}
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
                                            title={"Estadísticas por Severidad"}
                                            data={stats?.severidad}
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
                                                        'ALTA': '#cd6155',
                                                        'MEDIA': '#eb984e',
                                                        'BAJA': '#f4d03f',
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
                                                configPalette: {
                                                    palette: 'categorizedPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette', 'customPalette', 'categorizedPalette'
                                                    gradientPalette: ["#ef4444", "#3b82f6"],
                                                    customPalette: ["yellow", "blue", "red"],
                                                    categorizedPalette: {
                                                        'ALTA': '#cd6155',
                                                        'MEDIA': '#eb984e',
                                                        'BAJA': '#f4d03f',
                                                    }
                                                },
                                                /*chartStyle: {
                                                    backgroundColor: "rgba(37, 161, 54, 0.2)",
                                                    borderColor: "rgb(114, 114, 30)",
                                                    borderWidth: 3,
                                                    pointBackgroundColor: "rgb(246, 59, 125)",
                                                    pointBorderColor: "#fff",
                                                    pointBorderWidth: 2,
                                                    pointHoverBackgroundColor: "#fff",
                                                    pointHoverBorderColor: "rgba(59,130,246,1)",
                                                },*/
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
                            )}

                        </div>

                        <div className="h-16 bg-white flex">
                            <button
                                onClick={() => setMobileTab("map")}
                                aria-label="Mapa"
                                aria-selected={mobileTab === "map"}
                                className={`
                                        flex flex-1 mt-2 mb-2 ml-2 rounded-l-full
                                        justify-center items-center gap-2
                                        cursor-pointer transition-all duration-300

                                        ${mobileTab === "map"
                                        ? "bg-green-500 text-white shadow-md"
                                        : "bg-gray-200 hover:bg-green-300/30"
                                    }
                                    `}
                            >
                                <span
                                    className={`
                                            h-8 w-8 rounded-full flex items-center justify-center
                                            transition-colors duration-300
                                            ${mobileTab === "map"
                                            ? "bg-white text-green-600"
                                            : "bg-white"
                                        }
                                        `}
                                >
                                    <Map size={22} />
                                </span>

                                <span className=" xs:block font-medium">
                                    Mapa
                                </span>
                            </button>

                            <button
                                onClick={() => setMobileTab("cards")}
                                aria-label="Datos"
                                aria-selected={mobileTab === "cards"}
                                className={`
                                        flex flex-1 mt-2 mb-2 border-x border-white
                                        justify-center items-center gap-2
                                        cursor-pointer transition-all duration-300

                                        ${mobileTab === "cards"
                                        ? "bg-green-500 text-white shadow-md"
                                        : "bg-gray-200  hover:bg-green-300/30"
                                    }
                                    `}
                            >
                                <span
                                    className={`
                                            h-8 w-8 rounded-full flex items-center justify-center
                                            transition-colors duration-300
                                            ${mobileTab === "cards"
                                            ? "bg-white text-green-600"
                                            : "bg-white"
                                        }
                                        `}
                                >
                                    <Database size={22} />
                                </span>

                                <span className="xs:block font-medium">
                                    Datos
                                </span>
                            </button>

                            <button
                                onClick={() => setMobileTab("charts")}
                                aria-label="Gráficos"
                                aria-selected={mobileTab === "charts"}
                                className={`
                                        flex flex-1 mt-2 mb-2 mr-2 rounded-r-full
                                        justify-center items-center gap-2
                                        cursor-pointer transition-all duration-300

                                        ${mobileTab === "charts"
                                        ? "bg-green-500 text-white shadow-md"
                                        : "bg-gray-200 hover:bg-green-300/30"
                                    }
                                    `}
                            >
                                <span
                                    className={`
                                            h-8 w-8 rounded-full flex items-center justify-center
                                            transition-colors duration-300
                                            ${mobileTab === "charts"
                                            ? "bg-white text-green-600"
                                            : "bg-white"
                                        }
                                        `}
                                >
                                    <ChartNoAxesCombined size={22} />
                                </span>

                                <span className=" xs:block font-medium">
                                    Gráficos
                                </span>
                            </button>
                        </div>

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