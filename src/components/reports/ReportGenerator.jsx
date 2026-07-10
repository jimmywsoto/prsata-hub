// src/components/reports/ReportGenerator.jsx

import {
    forwardRef,
    useImperativeHandle,
    useState,
} from "react";

import {
    buildReportData
} from "../../reports/buildReportData";

const ReportGenerator = forwardRef(({

    template = "sata-trimestral",

    filters = {},

    filteredData = null,

    stats = {},

    mapApiRef,

    chartRefs = {},

    onSuccess = () => { },

    onError = () => { },

}, ref) => {

    const [loading, setLoading] =
        useState(false);

    const [progress, setProgress] =
        useState("");

    useImperativeHandle(ref, () => ({

        generate: async () => {

            try {

                setLoading(true);

                /*
                ======================================
                MAPA
                ======================================
                */

                setProgress(
                    "Capturando mapa..."
                );

                const map = {
                    image:
                        await mapApiRef.current
                            ?.exportImage(),

                    bounds:
                        mapApiRef.current
                            ?.getBounds(),

                    center:
                        mapApiRef.current
                            ?.getCenter(),

                    zoom:
                        mapApiRef.current
                            ?.getZoom(),
                };

                /*
                ======================================
                GRÁFICOS
                ======================================
                */

                setProgress(
                    "Capturando gráficos..."
                );

                const charts = {};

                for (
                    const [name, chartRef]
                    of Object.entries(chartRefs)
                ) {

                    charts[name] =
                        chartRef.current
                            ?.exportImage() ?? null;
                }

                /*
                ======================================
                REPORT DATA
                ======================================
                */

                setProgress(
                    "Construyendo informe..."
                );

                const reportData =
                    buildReportData({

                        template,

                        filters,

                        filteredData,

                        stats,

                        map,

                        charts,
                    });

                setLoading(false);
                setProgress("");

                onSuccess(reportData);

                return reportData;

            }
            catch (error) {

                console.error(error);

                setLoading(false);
                setProgress("");

                onError(error);

                throw error;
            }
        }

    }));

    return null;
});

export default ReportGenerator;