{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: September, 2026.
    VERSIÓN: 2.1.0
*/}

export const jsonChart1 = {
    title: 'Recuento de Alertas SATA (Por Provincia)',
    displayTitle: false,
    info: 'Recuento a nivel provincial de Alertas Tempranas por Deforestación (SATA).',
    config: {
        titleColor: '#10952b',
        titleFontSize: 18,
        titleWeight: 'bold',
        labelColor: '#676767',
        orderByLabels: false, // Default (false): is order by values
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
    },
    height: 320,
    fullHeight: 700,
};

export const jsonChart2 = {
    title: "Estadísticas por Severidad",
    displayTitle: false,
    info: 'Proporción de Alertas Tempranas por Deforestación (SATA), con enfoque en su grado de severidad.',
    config: {
        titleColor: '#10952b',
        titleFontSize: 18,
        titleWeight: 'bold',
        labelColor: '#f7f6f6',
        orderByLabels: false, // Default (false): is order by values
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
    },
    height: 280,
    fullHeight: 700,
};

export const jsonChart3 = {
    title: "Estadísticas por Periodo",
    displayTitle: false,
    info: 'Gráfico de radar correspondiente al recuento de Alertas Temprana por Deforestación (SATA), registros por periodo.',
    config: {
        titleColor: '#10952b',
        titleFontSize: 18,
        titleWeight: 'bold',
        labelColor: '#f7f6f6',
        orderByLabels: false, // Default (false): is order by values
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
    },
    height: 320,
    fullHeight: 700,
};
