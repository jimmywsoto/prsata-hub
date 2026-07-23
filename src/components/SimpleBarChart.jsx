{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import {
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle
} from "react";

import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

{/* ============================================================ DEFAULT CONFIG */ }
import { orderChartDataByConfigPalette, generateColors } from "./CommonFunctions";
import { defaultPalette } from "../config/palette.config";

function defaultConfig() {
    return {
        backgroundColorOpacity: 0.5,
        borderColor: 'rgba(66, 141, 67, 0.137)',
        hoverBorderColor: "rgba(59,130,246,1)",
        borderWidth: 1,
        hoverBorderWidth: 3,
    };
}

{/* ============================================================ EXPECTED DATA */ }
/* Recibe:
    const data = [
        ["PICHINCHA", 120],
        ["GUAYAS", 80]
    ];
*/

{/* ============================================================ SIMPLE BAR CHART */ }
export const SimpleBarChart = forwardRef(({
    title = "Simple Bar Chart - JWS Ingeniería, 2026",
    displayTitle = true,
    data = [],
    height = 320,
    config = {},
}, ref) => {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full w-full rounded-xl animate-dataWarning">
                <p className="text-gray-400">
                    <b>Aviso:</b> Sin datos disponibles
                </p>
            </div>
        );
    }

    {/* ============================================================ INIT REF */ }
    const chartRef = useRef(null);

    useImperativeHandle(ref, () => ({

        getChart: () =>
            chartRef.current,

        exportImage: () => {
            if (!chartRef.current) {
                return null;
            }

            return chartRef.current.toBase64Image();
        },

        getLabels: () => {
            return (
                chartRef.current?.data?.labels ??
                []
            );
        },

        getValues: () => {
            return (
                chartRef.current?.data?.datasets?.[0]
                    ?.data ?? []
            );
        }

    }));


    // Order by labels
    if (config?.orderByLabels) {
        data.sort((a, b) => a[0].localeCompare(b[0]));
    };

    let labels = data.map(([label]) => label);
    let values = data.map(([, value]) => value);

    let categorizedData = {};
    let categorizedColors = [];

    if (config?.configPalette?.palette === 'categorizedPalette') {
        categorizedData = orderChartDataByConfigPalette(labels, values, config?.configPalette.categorizedPalette);
        labels = categorizedData.labels;
        values = categorizedData.values;
        categorizedColors = categorizedData.colors;
    };

    const baseConfig = defaultConfig();
    const extendedConfig = config?.chartStyle;

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data: values,
                backgroundColor: generateColors(values.length, config?.configPalette, categorizedColors),
                ...baseConfig,
                ...extendedConfig,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        },

        plugins: {
            legend: {
                display: false,
            },

            title: {
                display: displayTitle,
                text: title,
                font: {
                    size: config.titleFontSize || 16,
                    weight: config.titleWeight || 'bold',
                },
                color: config.titleColor || 'gray',
            },

            datalabels: {
                display: true,
                color: config.labelColor || '#e0dbdb',
                anchor: 'end', // Position: 'start', 'center', 'end'
                align: 'top',  // Alignment: 'top', 'bottom', 'center'
                font: { weight: 'bold', size: 11 },
                textStrokeWidth: 0,
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = (value / total * 100);
                    // Suprimir si muy pequeño (<5%)
                    return percentage < 5 ? '' : percentage.toFixed(1) + '%';
                },
            },

            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label} (Recuento): ${context.raw}`;
                    },
                },
            },
        },

        scales: {
            x: {
                ticks: {
                    display: true,
                    maxRotation: 45,
                    minRotation: 45,
                    autoSkip: false,
                    font: {
                        size: 8
                    },
                    callback: function (value, index, ticks) {
                        const label = this.getLabelForValue(value);
                        return label.length > 10 ? label.slice(0, 5) + '…' : label;
                    }
                },
                beginAtZero: true
            },
            y: {
                beginAtZero: true,
                stacked: true,
                ticks: {
                    display: true,
                    autoSkip: true,
                    font: {
                        size: 10
                    },
                    callback: function (value) {
                        return Number.isFinite(value) ? value : null;
                    }
                }
            },
        },
    };

    return (
        <div
            className="w-full"
            style={{ height }}
        >
            <Bar
                ref={chartRef}
                data={chartData}
                options={options}
                plugins={[ChartDataLabels]}
            />
        </div>
    );
});
