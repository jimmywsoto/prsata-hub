{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState, useRef } from "react";
import {
    Map,
    Database,
    ChartNoAxesCombined,
    LoaderCircle,
    FileDown,
    FileText,
    BarChart3,
    Table2,
    PieChart,
    ShieldCheck,
    Satellite,
    ArrowRight,
    Trees
} from 'lucide-react';
import axios from "axios";

{/* -------------------------------------------------------- DATA */ }
import { FIELD_ALIASES, VISIBLE_FIELDS } from "../data/dataMeta";
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
import LineChart from "../components/LineChart";
import PolarChart from "../components/PolarChart";
import Loader from "../components/Loader";

import ReportGenerator from "../components/reports/ReportGenerator";
import { useToast } from '../components/ToastProvider';

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function ReportGeneratorHTML({
    externalLayers = [],
    filters = { filters },
    location = {},
    onStats = () => { },
}) {
    const { showToast } = useToast();
    const [rawData, setRawData] = useState(null);
    const mapApiRef = useRef(null);

    const [generating, setGenerating] = useState(false);

    {/* ============================================================ LOAD PRINCIPAL DATA */ }
    useEffect(() => {
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

    const chartRefs = {
        provincia:
            useRef(null),

        severidad:
            useRef(null),

        periodo:
            useRef(null)
    };

    const reportGeneratorRef = useRef(null);

    const provinciaChartRef = useRef(null);

    const severidadChartRef = useRef(null);

    const periodoChartRef = useRef(null);

    const delimitacionChartRef = useRef(null);

    const evolucionChartRef = useRef(null);

    const anioChartRef = useRef(null);



    const [reportData, setReportData] = useState({});

    /*const generateHtml = async (e, report) => {
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
    };*/

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

            showToast("Reporte generado con éxito!.", "success");

        } catch (err) {
            console.error(err);
            showToast("No se pudo generar el reporte!", "error");
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateReport = async (e) => {

        if (generating) return;

        try {
            setGenerating(true);
            const report = await reportGeneratorRef.current.generate();
            setReportData(report);
            await generatePdf(e, report);
        }
        finally {
            setGenerating(false);
        }

    };

    {/* ============================================================ RENDER */ }
    if (!rawData) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen overflow-x-hidden">

            {/* HERO */}

            <section className="relative overflow-hidden">

                {/* Background */}

                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-100"></div>

                <div className="absolute inset-0 patterns opacity-15"></div>

                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-green-300/20 blur-[140px]"></div>

                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-300/15 blur-[170px]"></div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-20 py-20">

                    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 items-center">

                        {/* INFORMACIÓN */}

                        <div>

                            <div className="inline-flex items-center gap-3 rounded-full bg-green-100 text-green-700 px-5 py-2 font-semibold">

                                <ShieldCheck size={18} />

                                Sistema Nacional de Monitoreo de Bosques

                            </div>

                            <h1 className="mt-8 text-5xl lg:text-6xl font-black leading-tight text-slate-800">

                                Reporte de

                                <span className="block bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">

                                    Alertas Tempranas
                                    por Deforestación

                                </span>

                            </h1>

                            <p className="mt-8 text-lg leading-8 text-slate-600 max-w-3xl">

                                Este módulo permite generar un informe técnico consolidado
                                sobre las alertas tempranas detectadas en el Patrimonio
                                Forestal Nacional. El documento integra información
                                cartográfica, estadísticas, indicadores ambientales y
                                gráficos analíticos obtenidos a partir de los filtros
                                seleccionados.

                            </p>

                            {/* Características */}

                            <div className="grid sm:grid-cols-2 gap-5 mt-10">

                                <div className="flex items-center gap-4">

                                    <Satellite className="text-green-600" />

                                    <div>

                                        <h4 className="font-semibold">

                                            Información Satelital

                                        </h4>

                                        <p className="text-sm text-slate-500">

                                            Datos actualizados del monitoreo forestal.

                                        </p>

                                    </div>

                                </div>

                                <div className="flex items-center gap-4">

                                    <Trees className="text-green-600" />

                                    <div>

                                        <h4 className="font-semibold">

                                            Cobertura Forestal

                                        </h4>

                                        <p className="text-sm text-slate-500">

                                            Identificación de cambios y perturbaciones.

                                        </p>

                                    </div>

                                </div>

                                <div className="flex items-center gap-4">

                                    <FileText className="text-green-600" />

                                    <div>

                                        <h4 className="font-semibold">

                                            Informe Institucional

                                        </h4>

                                        <p className="text-sm text-slate-500">

                                            Documento PDF listo para revisión.

                                        </p>

                                    </div>

                                </div>

                                <div className="flex items-center gap-4">

                                    <ShieldCheck className="text-green-600" />

                                    <div>

                                        <h4 className="font-semibold">

                                            Información Oficial

                                        </h4>

                                        <p className="text-sm text-slate-500">

                                            Generado bajo estándares del SNMB.

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* IMAGEN */}

                        <div className="relative">

                            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-green-400 to-emerald-300 blur-3xl opacity-20 scale-110"></div>

                            <div className="relative overflow-hidden rounded-[32px] border border-white/50 bg-white shadow-2xl">

                                <img
                                    src="/img-deforestacion-01.png"
                                    alt="Deforestación"
                                    className="w-full h-[420px] object-cover"
                                />

                                {/* Tarjeta flotante */}

                                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl border border-white/50 p-5">

                                    <div className="flex justify-between items-center">

                                        <div>

                                            <p className="text-sm text-slate-500">

                                                Tipo de documento

                                            </p>

                                            <h4 className="text-xl font-bold text-slate-800">

                                                Reporte Técnico PDF

                                            </h4>

                                        </div>

                                        <div className="bg-green-100 rounded-full p-3">

                                            <ArrowRight className="text-green-600" />

                                        </div>

                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-5 text-center">

                                        <div>

                                            <p className="text-2xl font-bold text-green-600">

                                                🛰️

                                            </p>

                                            <p className="text-xs text-slate-500">

                                                Mapas

                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-2xl font-bold text-blue-600">

                                                📊

                                            </p>

                                            <p className="text-xs text-slate-500">

                                                Estadísticas

                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-2xl font-bold text-orange-500">

                                                📄

                                            </p>

                                            <p className="text-xs text-slate-500">

                                                PDF

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="flex gap-14 items-center">

                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-green-400">
                            Alertas Tempranas por Deforestación SATA
                        </h3>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            Reporte de identificación de cambios y/o perturbaciones en la cobertura vegetal
                            del Patrimonio Forestal Nacional.
                        </p>
                    </div>

                </div>

            </section>

            <section className="py-10 px-6 lg:px-20 max-w-7xl mx-auto flex-1 h-[600px] min-w-0">
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
                            mapApiRef.current = api;
                            //mapApiRef = api;
                        }}
                    />
                </div>
            </section>


            {/*<section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="flex gap-14 items-center">

                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-green-400">
                            Estadísticas de Monitoreo en Ecuador Continental
                        </h3>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            En la siguiente tabla encontrará recuento a nivel provincial de alertas identificadas y categorizadas en función del grado de severidad y delimitación ambiental.
                        </p>
                    </div>

                </div>

            </section>*/}

            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="flex gap-14 items-center">

                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-green-400">
                            Gráficos Estadísticos
                        </h3>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            Resumen Estadístico de Indicadores de Deforestación según Alertas Tempranas
                        </p>
                    </div>

                </div>

            </section>

            {/* GRAFICOS 1 */}
            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[1200px]">

                    {/* Fila 1 - PROVINCIA */}
                    <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                        <SimpleBarChart
                            ref={provinciaChartRef}
                            title={"Alertas SATA por Provincia"}
                            data={stats?.provincia}
                            height={500}
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

                    {/* Fila 2 - SEVERIDAD*/}
                    <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                        <DoughnutChart
                            ref={severidadChartRef}
                            title={"Estadísticas por Severidad"}
                            data={stats?.severidad}
                            height={400}
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

                    {/* Fila 2 - PERIODO */}
                    <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                        <RadarChart
                            ref={periodoChartRef}
                            title={"Estadísticas por Periodo"}
                            data={stats?.mes}
                            height={400}
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

                </div>

            </section>

            {/* GRAFICOS 2 */}
            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[1200px]">

                    {/* Fila 1 - EVOLUCION MENSUAL POR AÑO */}
                    <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                        <LineChart
                            ref={evolucionChartRef}
                            title={"Evolución mensual por año"}
                            data={stats?.anioline}
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

                    {/* Fila 2 - DELIMITACIÓN */}
                    <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                        <DoughnutChart
                            ref={delimitacionChartRef}
                            title={"Estadísticas por Delimitación"}
                            data={stats?.delimitacion}
                            height={400}
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

                    {/* Fila 2 - AÑO */}
                    <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                        <PolarChart
                            ref={anioChartRef}
                            title={"Estadísticas por Año"}
                            data={stats?.anio}
                            height={400}
                            config={{
                                titleColor: '#10952b',
                                titleFontSize: 18,
                                titleWeight: 'bold',
                                orderByLabels: true, // Default (false): is order by values
                                configPalette: {
                                    palette: 'defaultPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette', 'customPalette', 'categorizedPalette'
                                    gradientPalette: ["#ef4444", "#3b82f6"],
                                    customPalette: ["yellow", "blue", "red"],
                                    categorizedPalette: {
                                        'ALTA': '#cd6155',
                                        'MEDIA': '#eb984e',
                                        'BAJA': '#f4d03f',
                                    }
                                },
                                chartStyle: {
                                    //backgroundColor: "rgba(246, 151, 9, 0.41)",
                                    //borderColor: "rgb(247, 243, 241)",
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

            </section>

            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="flex gap-14 items-center">
                    <ReportGenerator
                        ref={reportGeneratorRef}
                        template="sata-trimestral"
                        filters={filters}
                        filteredData={filteredData}
                        stats={stats}
                        mapApiRef={mapApiRef}
                        chartRefs={{
                            provincia: provinciaChartRef,
                            severidad: severidadChartRef,
                            periodo: periodoChartRef,
                            delimitacion: delimitacionChartRef,
                            evolucion: evolucionChartRef,
                            anios: anioChartRef
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

                    <section className="py-16 px-6 lg:px-20 max-w-7xl mx-auto">

                        <div className="relative overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-white via-green-50 to-emerald-100 shadow-2xl">

                            {/* Decoración */}

                            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-green-300/30 blur-3xl"></div>

                            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl"></div>

                            <div className="relative z-10 p-10 lg:p-14">

                                <div className="grid lg:grid-cols-[2fr_1fr] gap-12 items-center">

                                    {/* Información */}

                                    <div>

                                        <div className="inline-flex items-center gap-3 rounded-full bg-green-100 text-green-700 px-5 py-2 font-semibold">

                                            <ShieldCheck size={18} />

                                            Generador Inteligente de Reportes

                                        </div>

                                        <h2 className="mt-6 text-4xl lg:text-5xl font-extrabold text-slate-800">

                                            Genere un informe técnico completo en un solo clic

                                        </h2>

                                        <p className="mt-6 text-lg leading-8 text-slate-600 max-w-3xl">

                                            El sistema consolida automáticamente toda la información
                                            espacial y estadística correspondiente a los filtros
                                            seleccionados, generando un documento institucional en
                                            formato PDF listo para impresión, revisión técnica o
                                            distribución oficial.

                                        </p>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">

                                            <div className="bg-white rounded-2xl shadow p-5 flex gap-4 items-start">

                                                <Map className="text-green-600 mt-1" />

                                                <div>

                                                    <h4 className="font-semibold">
                                                        Mapa Temático
                                                    </h4>

                                                    <p className="text-sm text-slate-500">
                                                        Vista cartográfica con las alertas filtradas.
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="bg-white rounded-2xl shadow p-5 flex gap-4 items-start">

                                                <BarChart3 className="text-blue-600 mt-1" />

                                                <div>

                                                    <h4 className="font-semibold">
                                                        Estadísticas
                                                    </h4>

                                                    <p className="text-sm text-slate-500">
                                                        Indicadores nacionales y provinciales.
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="bg-white rounded-2xl shadow p-5 flex gap-4 items-start">

                                                <PieChart className="text-orange-500 mt-1" />

                                                <div>

                                                    <h4 className="font-semibold">
                                                        Gráficos
                                                    </h4>

                                                    <p className="text-sm text-slate-500">
                                                        Visualizaciones automáticas del periodo.
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="bg-white rounded-2xl shadow p-5 flex gap-4 items-start">

                                                <Table2 className="text-purple-600 mt-1" />

                                                <div>

                                                    <h4 className="font-semibold">
                                                        Tablas
                                                    </h4>

                                                    <p className="text-sm text-slate-500">
                                                        Información consolidada por provincia y categoría.
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="bg-white rounded-2xl shadow p-5 flex gap-4 items-start">

                                                <FileText className="text-red-500 mt-1" />

                                                <div>

                                                    <h4 className="font-semibold">
                                                        Documento PDF
                                                    </h4>

                                                    <p className="text-sm text-slate-500">
                                                        Informe listo para impresión y distribución.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Panel lateral */}

                                    <div className="rounded-3xl bg-white shadow-xl border border-green-100 p-8">

                                        <h3 className="text-xl font-bold text-slate-700">

                                            Contenido del Informe

                                        </h3>

                                        <ul className="mt-6 space-y-4">

                                            <li className="flex items-center gap-3">

                                                ✅ Resumen Ejecutivo

                                            </li>

                                            <li className="flex items-center gap-3">

                                                ✅ Mapa de Alertas

                                            </li>

                                            <li className="flex items-center gap-3">

                                                ✅ Estadísticas Nacionales

                                            </li>

                                            <li className="flex items-center gap-3">

                                                ✅ Indicadores Provinciales

                                            </li>

                                            <li className="flex items-center gap-3">

                                                ✅ Gráficos Comparativos

                                            </li>

                                            <li className="flex items-center gap-3">

                                                ✅ Tablas Consolidadas

                                            </li>

                                        </ul>

                                        <div className="mt-8 border-t pt-6">

                                            <button
                                                disabled={generating}
                                                onClick={handleGenerateReport}
                                                className={`w-full rounded-2xl py-4 font-semibold text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-3
                                ${generating
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-green-600 hover:bg-green-500 hover:-translate-y-1"
                                                    }`}
                                            >

                                                {generating ? (
                                                    <>

                                                        <LoaderCircle
                                                            size={22}
                                                            className="animate-spin"
                                                        />

                                                        Generando Reporte...

                                                    </>
                                                ) : (
                                                    <>

                                                        <FileDown size={22} />

                                                        Generar Reporte PDF

                                                    </>
                                                )}

                                            </button>

                                            <p className="text-xs text-center text-slate-500 mt-4">

                                                El proceso puede tardar algunos segundos dependiendo
                                                de la cantidad de información procesada.

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                </div>

            </section>

        </div>
    );
}
