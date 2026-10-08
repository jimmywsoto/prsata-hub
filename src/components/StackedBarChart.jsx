{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    UPDATED AT: October, 2026.
    VERSIÓN: 2.1.0
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
  LogarithmicScale, // Required for log scales in Chart.js v4
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
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
/* STACKED BAR CHART */
/*
Formato esperado:

data = {
  labels: ["2023", "2024", "2025"],
  datasets: [
    {
      label: "SNAP",
      data: [120, 140, 180]
    },
    {
      label: "BVP",
      data: [80, 90, 130]
    }
  ]
}
*/

{/* ============================================================ STACKED BAR CHART */ }
export const StackedBarChart = forwardRef(({
  title = "Stacked Bar Chart - JWS Ingeniería, 2026",
  displayTitle = true,
  data = null,
  height = 320,
  showLegend = true,
  config = {},
}, ref) => {
  if (
    !data ||
    !Array.isArray(data.labels) ||
    !Array.isArray(data.datasets)
  ) {
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
  
  //let labels = [data.datasets[0].label, data.datasets[1].label, data.datasets[2].label];
  //let values = [data.datasets[0].data, data.datasets[1].data, data.datasets[2].data];

  let labels = data.datasets.map(ds => ds.label);
  let values = data.datasets.map(ds => ds.data);

  let categorizedData = {};
  let categorizedColors = [];

  if ( config?.configPalette?.palette === 'categorizedPalette' ) {
    categorizedData = orderChartDataByConfigPalette(labels, values, config?.configPalette.categorizedPalette);
    labels = categorizedData.labels;
    values = categorizedData.values;
    categorizedColors = categorizedData.colors;
  };


  //const colors = generateColors(data.datasets.length, config?.configPalette, categorizedColors);
  const colors =
    categorizedColors.length > 0
      ? categorizedColors
      : defaultPalette;

  /*const datasets = data.datasets.map((ds, idx) => ({
    ...ds,
    backgroundColor: colors[idx],
  }));*/

  const datasets = labels.map((label, idx) => ({
    label,
    data: values[idx],
    backgroundColor: colors[idx],
  }));

  const chartData = {
    labels: data.labels,
    datasets,
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
        display: showLegend,
        position: "top",
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
        align: 'center',  // Alignment: 'top', 'bottom', 'center'
        font: { weight: 'bold', size: 11 },
        textStrokeWidth: 0,
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = (value / total * 100);
          // Suprimir si muy pequeño (<5%)
          return percentage < 5 ? '' : percentage.toFixed(0) + '%';
          //return percentage < 5 ? '' : value;
        },
      },

      tooltip: {
        mode: "index",
        intersect: false,
      },
    },

    scales: {
      x: {
        stacked: true,
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
        type: config.scaleType || 'linear', // Options: linear, logarithmic, category, time, timeseries, radialLinear
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
