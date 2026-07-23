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

import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

{/* ============================================================ DEFAULT CONFIG */ }
function defaultConfig() {
  return {
    backgroundColor: "rgba(59,130,246,0.2)",
    borderColor: "rgb(246, 59, 153)",
    pointBackgroundColor: "rgba(59,130,246,1)",
    pointBorderColor: "#fff",
    pointBorderWidth: 2,
    pointHoverBackgroundColor: "#fff",
    pointHoverBorderColor: "rgba(59,130,246,1)",
  };
}

{/* ============================================================ EXPECTED DATA */ }
/* Recibe:
  const data = [
    ["PICHINCHA", 120],
    ["GUAYAS", 80]
  ]
*/

{/* ============================================================ RADAR CHART */ }
export const RadarChart = forwardRef(({
  title = "Radar Chart - JWS Ingeniería, 2026",
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

  const labels = data.map(([label]) => label);
  const values = data.map(([, value]) => value);

  const baseConfig = defaultConfig();
  const extendedConfig = config?.chartStyle;

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
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

    scales: {
      r: {
        display:true,
        beginAtZero: true,
        ticks: {
          backdropColor: "transparent",
          font: {
            size: 8,
          },
        },
        pointLabels: {
          font: {
            size: 8,
          },
          callback: function (value, index) {
            const label = value;
            return label.length > 10 ? label.slice(0, 5) + '…' : label;
          }
        },
      },
    },

    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          padding: 12,
          font: {
            size: 12,
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

      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`;
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
      <Radar
        ref={chartRef}
        data={chartData}
        options={options}
      />
    </div>
  );
});

export default RadarChart;
