import { useEffect, useMemo, useState, useRef } from "react";
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import LeftSidebar from "../components/LeftAside";
import RightSidebar from "../components/RightAside";
import CardsContainer from "../components/CardContainer";
import { DATA_FILTERS } from "../data/dataFilters";
import { FIELD_ALIASES, VISIBLE_FIELDS, NAVBAR_TITLES } from "../data/dataMeta";
import { baseMapsConfig } from "../config/basemaps.config";
import { panesConfig } from "../config/panes.config";
import { registryLayersConfig } from "../config/layers.config";
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

import AttributesTable from "../components/AttributesTable";

export default function RegistroDashboard({
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
        onLoad(NAVBAR_TITLES.registro);
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
            ordenarLabels: true,
        }

        return {
            total: filteredData.features.length,
            provincia: multiGroupBy(filteredData, "DPA_DESPRO"),
            canton: multiGroupBy(filteredData, "DPA_DESCAN"),
            parroquia: multiGroupBy(filteredData, "DPA_DESPAR"),
            delimitacion: multiGroupBy(filteredData, "delimitaci"),
            severidad: multiGroupBy(filteredData, "severidad"),
            anio: multiGroupBy(filteredData, "ano"),
            mes: multiGroupBy(filteredData, "fin"),
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

    {/* ============================================================ RENDER */ }
    if (!rawData) {
        return <Loader />;
    }

    const dataCards = {
        title : 'Alertas SATA',
        subtitle: 'Sistema de Alertas Tempranas Ambientales (SATA)',
        icon: '/bg-alert.png',

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
                            <AttributesTable
                                features={filteredData?.features || []}
                                mapApiRef={mapApiRef}
                            />
                        </div>
                    </section>

                    <aside className="w-[32%] min-w-[420px] h-full">
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

                            {/* Fila 1 - BarChart ocupa ambas columnas */}
                            <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                                <LineChart
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

                            {/* Fila 2 - Radar */}
                            <div className="col-span-2 row-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex items-center">
                                <GeoJSONVTMap
                                    baseMapsConfig={baseMapsConfig}
                                    panesConfig={panesConfig}
                                    location={location}
                                    data={{
                                        geojson: filteredData,
                                        name: "Clúster Alertas",
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
                                    defaultLayers={registryLayersConfig.defaultLayers}
                                    externalLayers={externalLayers}
                                    filters={filters}
                                    onMapReady={(api) => {
                                        mapApiRef.current = api;
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