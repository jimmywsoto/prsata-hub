import { Bar } from "react-chartjs-2";



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
export const StackedBarChart = ({
  title = "Stacked Bar Chart - JWS Ingeniería, 2026",
  data = null,
  height = 360,
  config = {},
}) => {
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

    plugins: {
      legend: {
        position: "bottom",
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

    scales: {
      x: {
        stacked: true,
        ticks: {
          display: true,
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
          font: {
            size: 10
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
        data={chartData}
        options={options}
      />
    </div>
  );
};