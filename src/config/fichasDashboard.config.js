{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: September, 2026.
    VERSIÓN: 2.1.0
*/}

export const jsonChartFD1 = {
    title: 'Recuento de Fichas de Monitoreo Satelital (Por Provincia)',
    displayTitle: false,
    info: 'Recuento de Fichas de Monitoreo Satelital, registrados por provincia.',
    config: {
        titleColor: '#10952b',
        titleFontSize: 18,
        titleWeight: 'bold',
        labelColor: '#2e8f6a',
        orderByLabels: false, // Default (false): is order by values
        configPalette: {
            palette: 'gradientPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette'
            gradientPalette: ["#72c972", "#3b82f6"],
            categorizedPalette: {
                'ABC-PSB': '#1E8449',
                'BVP': '#52BE80',
                'MANGLAR': '#27AE60',
                'PFE': '#82E0AA',
                'PFN': '#b3e0c7ff',
                'SNAP': '#145A32',
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

export const jsonChartFD2 = {
    title: 'Estadísticas por Delimitación',
    displayTitle: false,
    info: 'Proporción de Fichas de Monitoreo, con enfoque en su grado de severidad.',
    config: {
        titleColor: '#10952b',
        titleFontSize: 18,
        titleWeight: 'bold',
        labelColor: '#2e8f6a',
        orderByLabels: false, // Default (false): is order by values
        configPalette: {
            palette: 'categorizedPalette', // Palettes: 'defaultPalette', 'randomPalette', 'gradientPalette', 'customPalette', 'categorizedPalette'
            //gradientPalette: ["#ef4444", "#3b82f6"],
            //customPalette: ["yellow", "blue", "red"],
            categorizedPalette: {
                'ABC-PSB': '#1E8449',
                'BVP': '#52BE80',
                'MANGLAR': '#27AE60',
                'PFE': '#82E0AA',
                'PFN': '#b3e0c7ff',
                'SNAP': '#145A32',
            }
        },
        chartStyle: {
            borderColor: 'rgb(255, 255, 255)',
            borderWidth: 2,
            hoverBorderColor: "rgba(30, 228, 70, 0.75)",
            hoverBorderWidth: 3,
        },
    },
    height: 320,
    fullHeight: 700,
};

export const jsonChartFD3 = {
    title: "Estadísticas por Periodo",
    displayTitle: false,
    info: 'Gráfico de radar correspondiente al recuento de Fichas de Monitoreo, registros por periodo.',
    config: {
        titleColor: '#10952b',
        titleFontSize: 18,
        titleWeight: 'bold',
        labelColor: '#f7f6f6',
        orderByLabels: true, // Default (false): is order by values
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
            backgroundColor: "rgba(179, 224, 199, 0.6)",
            borderColor: "#145a3294",
            borderWidth: 2,
            pointBackgroundColor: "rgb(51, 209, 112)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(59,130,246,1)",
        },
    },
    height: 320,
    fullHeight: 700,
};
