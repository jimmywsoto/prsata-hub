{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- COMPONENTS */ }
import { forwardRef } from "react";

import { SimpleBarChart } from "./SimpleBarChart";
import DoughnutChart from "./DoughnutChart";
import RadarChart from "./RadarChart";
import LineChart from "./LineChart";
import PolarChart from "./PolarChart";
import { StackedBarChart } from "./StackedBarChart";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const ChartRenderer = forwardRef(function ChartRenderer({
    chart,
    data,
    json,
    fullscreen
}, ref) {

    const commonProps = {
        title: json.title,
        displayTitle: json.displayTitle,
        data: data,
        config: json.config,
        height: fullscreen? json.fullHeight: json.height 
    };

    switch (chart) {

        case "SimpleBarChart":
            return (
                <SimpleBarChart
                    {...commonProps}
                    ref={ref}
                />
            );

        case "StackedBarChart":
            return (
                <StackedBarChart
                    {...commonProps}
                    ref={ref}
                />
            );

        case "DoughnutChart":
            return (
                <DoughnutChart
                    {...commonProps}
                    ref={ref}
                />
            );

        case "LineChart":
            return (
                <LineChart
                    {...commonProps}
                    ref={ref}
                />
            );

        case "RadarChart":
            return (
                <RadarChart
                    {...commonProps}
                    ref={ref}
                />
            );

        case "PolarChart":
            return (
                <PolarChart
                    {...commonProps}
                    ref={ref}
                />
            );

        default:
            return (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Tipo de gráfico no válido: {chart}
                </div>
            );
    }
};

export default ChartRenderer;
