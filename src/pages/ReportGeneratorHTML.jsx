{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState, useRef } from "react";
import {
    Map,
    LoaderCircle,
    FileDown,
    FileText,
    BarChart3,
    PieChart,
    ShieldCheck,
    Satellite,
    Trees,
    CheckCheck
} from 'lucide-react';
import axios from "axios";

{/* -------------------------------------------------------- DATA */ }
import { FIELD_ALIASES, VISIBLE_FIELDS } from "../data/dataMeta";
import { baseMapsConfig } from "../config/basemaps.config";
import { panesConfig } from "../config/panes.config";
import { mainLayersConfig } from "../config/layers.config";
import { wmsLayersConfig } from "../config/wmsLayers.config";
import { latestAlerts } from "../config/latestAlerts.config";
import { jsonChart1, jsonChart2, jsonChart3 } from "../config/mainDashboard.config";
import { jsonChartRD1 } from "../config/registerDashboard.config";
import { jsonChartFD2, jsonChartFD4 } from "../config/fichasDashboard.config";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
//const backendUrl = 'http://localhost:3000';

{/* -------------------------------------------------------- COMPONENTS */ }
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import ChartContainer from "../components/ChartContainer";

import {
    codMes,
    multiGroupBy,
    applyFilters,
    agruparParaStackedBar,
} from "../components/CommonFunctions";

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

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

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

    const latestDate = latestAlerts.date;

    {/* ============================================================ RENDER */ }
    if (!rawData) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen overflow-x-hidden">

            {/* ============================================================ HERO */ }
            <section className="relative overflow-hidden">

                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-100"></div>
                <div className="absolute inset-0 patterns opacity-15"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-green-300/20 blur-[140px]"></div>
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-300/15 blur-[170px]"></div>
                
                <div className="relative max-w-7xl mx-auto px-6 lg:px-20 pt-8 pb-20">

                    <div className="flex items-center ">

                        {/* INFORMACIÓN */}
                        <div>

                            <h1 className="text-5xl lg:text-6xl font-black leading-tight text-slate-800">
                                Reporte de
                                <span className="block bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                                    Alertas Tempranas por Deforestación
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

                    </div>

                </div>

            </section>

            {/* ============================================================ SECTION 1: DESCRIPTION */ }
            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="flex flex-col md:flex-row gap-14 items-center justify-center">

                    <div className="space-y-2 text-justify">
                        <h3 className="text-3xl font-bold text-green-400">
                            Deforestación en el Ecuador
                        </h3>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            La <span className="font-semibold">deforestación</span> representa uno de los principales desafíos ambientales del
                            Ecuador,
                            al afectar directamente la biodiversidad, los recursos hídricos y la estabilidad climática.
                        </p>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            Entre las causas más relevantes se encuentran la <span className="font-semibold">expansión agrícola y
                                ganadera</span>,
                            el <span className="font-semibold">cambio de uso del suelo</span>, la <span className="font-semibold">tala
                                ilegal</span>,
                            la extracción no planificada de recursos forestales y el desarrollo de infraestructuras sin una adecuada
                            planificación territorial.
                        </p>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            Frente a esta situación, el <span className="font-semibold">monitoreo satelital de la cobertura forestal </span>
                            constituye
                            una herramienta clave para <span className="italic">detectar, analizar y comprender los patrones de pérdida de
                                bosque</span>,
                            fortaleciendo la gestión sostenible y la toma de decisiones basadas en evidencia.
                        </p>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            Esta plataforma ha sido desarrollada con el objetivo de <span className="font-semibold">agilitar la presentación de
                                estadísticas y métricas</span>
                            que permitan identificar oportunamente la <span className="font-semibold">generación y atención de alertas
                                satelitales</span>,
                            facilitando la respuesta institucional frente a los procesos de deforestación.
                        </p>

                        <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                            De esta manera, contribuye al fortalecimiento del <span className="font-semibold">Sistema Nacional de Monitoreo de
                                Bosques </span>
                                y al cumplimiento de los compromisos nacionales e internacionales en materia de <span
                                className="italic">conservación, cambio climático
                                y manejo sostenible de los recursos forestales</span>.
                        </p>

                    </div>

                    <div className="hidden md:flex w-full items-center justify-start">
                        
                        <div className=" max-w-64 items-center flex ">
                            <img src="/img-deforestacion-merged-cut.webp" alt="Imagen 4" className=" h-full rounded-lg object-cover" />
                        </div>

                    </div>

                </div>

            </section>

            {/*<iframe width="960" height="540" src="https://www.planet.com/compare/?id=2026-mae-db-snmb-001-E4tPMq9vg" />*/}

            {/* ============================================================ SECTION 2: DISTRIBUTION */ }
            {sectionHeader(
                "Distribución de Alertas Tempranas en el Ecuador Continental",
                "Mapa de la distribución de Alertas Tempranas por Deforestación en el Ecuador Continental",
            )}

            <section className="py-10 px-6 lg:px-20 max-w-7xl mx-auto flex-1 h-[600px] min-w-0 border-b border-green-200/80">
                <div className="h-full bg-white rounded-2xl shadow-md overflow-hidden">
                    <GeoJSONVTMap
                        baseMapsConfig={baseMapsConfig}
                        wmsLayersConfig={wmsLayersConfig}
                        panesConfig={panesConfig}
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

            {/* ============================================================ SECTION 3: CHARTS */ }
            {sectionHeader(
                "Gráficos Estadísticos",
                "Resumen Estadístico de Indicadores de Deforestación según Alertas Tempranas",
            )}

            {/* GRAFICOS 1 */}
            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[1200px]">

                    {/* Fila 1 - PROVINCIA */}
                    
                    <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md overflow-hidden flex items-center">
                        <ChartContainer
                            data={stats?.provincia}
                            json={jsonChart1}
                            date={latestDate}
                            chart="SimpleBarChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                            chartRef={provinciaChartRef}
                        />

                        {/*<SimpleBarChart
                            ref={provinciaChartRef}
                            title={"Recuento de Alertas SATA (Por Provincia)"}
                            displayTitle={false}
                            data={stats?.provincia}
                            height={500}
                            config={{
                                titleColor: '#10952b',
                                titleFontSize: 18,
                                titleWeight: 'bold',
                                labelColor: '#676767',
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
                        />*/}
                    </div>

                    {/* Fila 2 - SEVERIDAD*/}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center">
                        <ChartContainer
                            data={stats?.severidad}
                            json={jsonChart2}
                            date={latestDate}
                            chart="DoughnutChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                            chartRef={severidadChartRef}
                        />
                        
                        {/*<DoughnutChart
                            ref={severidadChartRef}
                            title={"Estadísticas por Severidad"}
                            displayTitle={true}
                            data={stats?.severidad}
                            height={400}
                            config={{
                                titleColor: '#10952b',
                                titleFontSize: 18,
                                titleWeight: 'bold',
                                labelColor: '#f7f6f6',
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
                        />*/}
                    </div>

                    {/* Fila 2 - PERIODO */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center">
                        <ChartContainer
                            data={stats?.mes}
                            json={jsonChart3}
                            date={latestDate}
                            chart="RadarChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                            chartRef={periodoChartRef}
                        />

                        {/*<RadarChart
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
                        />*/}
                    </div>

                </div>

            </section>
            
            {/* ============================================================ SECTION 4: CHARTS 2 */ }
            {sectionHeader(
                "Evaluación mensual por año",
                "Evolución mensual acorde al registro de Alertas Tempranas por Deforestación",
            )}

            {/* GRAFICOS 2 */}
            <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[1200px]">

                    {/* Fila 1 - EVOLUCION MENSUAL POR AÑO */}
                    <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md overflow-hidden flex items-center">
                        <ChartContainer
                            data={stats?.anioline}
                            json={jsonChartRD1}
                            date={latestDate}
                            chart="LineChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                            chartRef={evolucionChartRef}
                        />
                        
                        {/*<LineChart
                            ref={evolucionChartRef}
                            title={"Evolución mensual por año"}
                            data={stats?.anioline}
                            config={{
                                titleColor: '#10952b',
                                titleFontSize: 18,
                                titleWeight: 'bold',
                                labelColor: '#676767',
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
                        />*/}
                    </div>

                    {/* Fila 2 - DELIMITACIÓN */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center">
                        <ChartContainer
                            data={stats?.delimitacion}
                            json={jsonChartFD2}
                            date={latestDate}
                            chart="DoughnutChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                            chartRef={delimitacionChartRef}
                        />

                        {/*<DoughnutChart
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
                        />*/}
                    </div>

                    {/* Fila 2 - AÑO */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center">
                        <ChartContainer
                            data={stats?.anio}
                            json={jsonChartFD4}
                            date={latestDate}
                            chart="PolarChart" // Options: SimpleBarChart, StackedBarChart, DoughnutChart, LineChart, RadarChart, PolarChart
                            chartRef={anioChartRef}
                        />

                        {/*<PolarChart
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
                        />*/}
                    </div>

                </div>

            </section>

            {/* ============================================================ SECTION 5: REPORT GENERATOR */ }
            {sectionHeader(
                "Generador de Reportes",
                "Herramienta para la generación de reportes de Alertas Tempranas por Deforestación",
            )}

            <section className="max-w-7xl mx-auto">

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
                                            Generador de Reportes
                                        </h2>

                                        <p className="mt-6 text-lg leading-8 text-slate-600 max-w-3xl">
                                            El sistema consolida automáticamente toda la información
                                            espacial y estadística correspondiente a los filtros
                                            seleccionados, generando un documento en formato PDF listo 
                                            para impresión o revisión técnica con información preliminar.
                                        </p>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">

                                            <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-4 items-start">
    
                                                <div className="flex w-full gap-2">

                                                    <span className="bg-green-200/80 rounded-full p-1"><Map size={16} /></span>

                                                    <h4 className="font-semibold">
                                                        Mapa Temático
                                                    </h4>

                                                </div>

                                                <p className="text-xs text-slate-500">
                                                    Vista cartográfica con alertas filtradas.
                                                </p>
                                                
                                            </div>

                                            <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-4 items-start">
    
                                                <div className="flex w-full gap-2">

                                                    <span className="bg-green-200/80 rounded-full p-1"><BarChart3 size={16} /></span>

                                                    <h4 className="font-semibold">
                                                        Estadísticas
                                                    </h4>

                                                </div>

                                                <p className="text-xs text-slate-500">
                                                    Indicadores nacionales y provinciales.
                                                </p>
                                                
                                            </div>

                                            <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-4 items-start">
    
                                                <div className="flex w-full gap-2">

                                                    <span className="bg-green-200/80 rounded-full p-1"><PieChart size={16} /></span>

                                                    <h4 className="font-semibold">
                                                        Gráficos
                                                    </h4>

                                                </div>

                                                <p className="text-xs text-slate-500">
                                                    Visualizaciones automáticas del periodo.
                                                </p>

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
                                                <span className="bg-green-200/80 rounded-full p-1"><CheckCheck size={16}/></span> 
                                                Resumen Ejecutivo
                                            </li>

                                            <li className="flex items-center gap-3">
                                                <span className="bg-green-200/80 rounded-full p-1"><CheckCheck size={16}/></span> 
                                                Mapa de Alertas
                                            </li>

                                            <li className="flex items-center gap-3">
                                                <span className="bg-green-200/80 rounded-full p-1"><CheckCheck size={16}/></span> 
                                                Estadísticas Nacionales
                                            </li>

                                            <li className="flex items-center gap-3">
                                                <span className="bg-green-200/80 rounded-full p-1"><CheckCheck size={16}/></span> 
                                                Indicadores Provinciales
                                            </li>

                                            <li className="flex items-center gap-3">
                                                <span className="bg-green-200/80 rounded-full p-1"><CheckCheck size={16}/></span> 
                                                Gráficos Comparativos
                                            </li>

                                            <li className="flex items-center gap-3">
                                                <span className="bg-green-200/80 rounded-full p-1"><CheckCheck size={16}/></span> 
                                                Tablas Consolidadas
                                            </li>

                                        </ul>

                                        <div className="mt-8 border-t border-green-500/60 pt-6">

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

{/* ============================================================ AUX FUNCTIONS */ }
function sectionHeader(
    title = "Section Title",
    subtitle = "Section Subtitle",
) {
    return (
        <section className="py-5 px-6 lg:px-20 max-w-7xl mx-auto border-b border-green-200/80">

            <div className="flex gap-14 items-center">

                <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-green-400">
                        {title}
                    </h3>

                    <p className="text-[var(--color-pattern-text)] leading-relaxed text-lg">
                        {subtitle}
                    </p>
                </div>

            </div>

        </section>
    )
}
