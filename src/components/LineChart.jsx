{/* -------------------------------------------------------- REACT */ }
import {
    useRef,
    forwardRef,
    useImperativeHandle
} from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

{/* ============================================================ DEFAULT CONFIG */ }
import { generateColors } from "./CommonFunctions";

function defaultConfig() {
    return {
        backgroundColorOpacity: 0.5,
        borderColor: 'rgb(0, 211, 4)',
        hoverBorderColor: "rgba(59,130,246,1)",
        borderWidth: 2,
        hoverBorderWidth: 3,
    };
}

{/* ============================================================ LINE CHART */ }
export const LineChart = forwardRef(({
    title = "Line Chart - JWS Ingeniería, 2026",
    data = [],
    height = 320,
    showLegend = true,
    fill = true,
    config = {},
}, ref) => {
    if (!Array.isArray(data.datasets) || data.datasets.length === 0) {
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


    const baseConfig = defaultConfig();
    const extendedConfig = config?.chartStyle;
    const datasetss = []

    Object.values(data.datasets).forEach((val, idx) => {
        datasetss[idx] = {
            label: val.label,
            data: val.data,
            ...baseConfig,
            ...extendedConfig,
            //backgroundColor: generateColors(12, config?.configPalette),
            borderColor: generateColors(4, config?.configPalette),
            pointBorderColor: generateColors(12, config?.configPalette),
        }
    });

    const chartData = {
        labels: data.labels,
        datasets: datasetss
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: showLegend,
                position: "top",
            },

            title: {
                display: true,
                text: title,
                font: {
                    size: config.titleFontSize || 16,
                    weight: config.titleWeight || 'bold',
                },
                color: config.titleColor || 'gray',
            },

            tooltip: {
                mode: "index",
                intersect: false,
            },
        },

        interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
        },

        scales: {
            x: {
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: 10,
                    }
                },
                grid: {
                    display: false,
                },
            },

            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false,
                },
                title: {
                    display: true,
                    text: 'Recuento (Nro. alertas)'
                },
                ticks: {
                    font: {
                        size: 10,
                    }
                },
            },
        },

        elements: {
            line: {
                tension: 0.3,
                fill,
            },

            point: {
                radius: 4,
                hoverRadius: 6,
            },
        },
    };

    return (
        <div
            className="w-full"
            style={{ height }}
        >
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    );
})

export default LineChart;