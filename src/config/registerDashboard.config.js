{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: September, 2026.
    VERSIÓN: 2.1.0
*/}

export const jsonChartRD1 = {
    title: 'Evolución mensual por año',
    displayTitle: false,
    info: 'Evolución mensual de Alertas Tempranas por Deforestación (SATA), registradas en un periodo anual.',
    config: {
        titleColor: '#10952b',
        titleFontSize: 18,
        titleWeight: 'bold',
        labelColor: '#ab1111',
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
