{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import {
    useRef,
    forwardRef,
    useImperativeHandle
} from "react";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

{/* ============================================================ DEFAULT CONFIG */ }
import { orderChartDataByConfigPalette, generateColors } from "./CommonFunctions";
import { defaultPalette } from "../config/palette.config";

function defaultConfig() {
  return {
    borderColor: "rgb(255, 255, 255)",
    borderWidth: 1,
    hoverBorderColor: "rgba(59,130,246,1)",
    hoverBorderWidth: 3,
  };
}

{/* ============================================================ EXPECTED DATA */ }
/* Recibe:
  const data = [
    ["PICHINCHA", 120],
    ["GUAYAS", 80]
  ]
*/

{/* ============================================================ DOUGHNUT CHART */ }
export const DoughnutChart = forwardRef(({
    title = "Doughtnut Chart - JWS Ingeniería, 2026",
    displayTitle = true,
    data = [],
    height = 280,
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

  if ( config?.configPalette?.palette === 'categorizedPalette' ) {
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
        position: "bottom",
        labels: {
          boxWidth: 14,
          padding: 12,
          font: {
            size: 11,
          },
        },
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
        anchor: 'center', // Position: 'start', 'center', 'end'
        align: 'center',  // Alignment: 'top', 'bottom', 'center'
        font: { weight: 'bold' },
        textStrokeWidth: 0,
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = (value / total * 100);
          // Suprimir si muy pequeño (<3%)
          return percentage < 7 ? '' : percentage.toFixed(1) + '%';
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );

            const value = context.raw;
            const percent = (
              (value / total) *
              100
            ).toFixed(1);

            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      className="w-full"
      style={{ height }}
    >
      <Doughnut
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[ChartDataLabels]}
      />
    </div>
  );
});

export default DoughnutChart;
