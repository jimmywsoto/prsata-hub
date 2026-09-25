{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: September, 2026.
    VERSIÓN: 2.1.0
*/}

/*
    JSON ESTRUCTURE:
    =================================================================================================
    const layersConfig = {
        data: {},
        defaultLayers: [
            {
                id: "",
                url: "",
                name: "",
                type: "", // Options: tile, vector.
                pane: "", // Options: lowestPane, lowPane, mediumPane, highPane, highestPane.
                attribution: "", // Linked element: <a href="">NAME</a>
                // Use popup config only in vector layers.
                popup: {
                    fields: VISIBLE_FIELDS,
                    aliases: FIELD_ALIASES,
                }, 
                style: {
                    fill: "",
                    stroke: "",
                    width: "",
                    radius: "",
                },
                // Do not include filterConfig if you doesn´t want to filter data. 
                // Could you use one to four filters. If you want to use only of them, you should use one.
                filterConfig: {
                    anio: "ano", // Layer field name
                    mes: "fin", // Layer field name
                    delimitacion: "delimitaci", // Layer field name
                    provincia: "DPA_DESPRO", // Layer field name
                    dateFormat: "YYYY-MM-DD", // Date format used to compare dates. Default format is "YYYY-MM-DD".
                },
            },
            {},
        ]
    }
    
*/

import { FIELD_ALIASES, VISIBLE_FIELDS } from "../data/dataMeta"

export const mainLayersConfig = {
    data: {},
    defaultLayers: [
        {
            id: "provincias",
            url: "/data/LAYER_PROVINCIAS.geojson",
            name: "Provincias",
            type: "tile",
            pane: 'lowestPane',
            attribution: '<a href="">CONALI</a>',
            style: { fill: "rgba(87, 83, 83, 0.3)", stroke: 'rgba(255, 255, 255, 0.72)', width: 1.3 },
            filterConfig: {
                provincia: "DPA_DESPRO"
            }
        },
        {
            id: "db_sata",
            url: "/data/DB_ALERTAS_SATA_P.geojson",
            name: "Ubicación Alertas",
            type: "tile",
            pane: 'mediumPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(255, 179, 0, 0.92)", stroke: 'rgba(200, 3, 3, 0.20)', width: 1, radius: 3 },
            filterConfig: {
                anio: "ano",
                mes: "fin",
                delimitacion: "delimitaci",
                provincia: "DPA_DESPRO"
            }
        },
        /*{
            id: "alertas",
            url: "/data/DB_ALERTAS_SATA_A.geojson",
            name: "Área identificada",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(200, 3, 3, 0.75)', width: 1 },
            filterConfig: {
                anio: "ano",
                mes: "fin",
                delimitacion: "delimitaci",
                provincia: "DPA_DESPRO"
            }
        },*/ // This layer is not active because cannot upload to GitHub, it´s size is too large (>25 Mb). I fix that separating in a year layer.
        {
            id: "alertas_2023",
            url: "/data/DB_ALERTAS_SATA_A_2023.geojson",
            name: "Alertas SATA - 2023",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(232, 109, 8, 0.84)', width: 1 },
        },
        {
            id: "alertas_2024",
            url: "/data/DB_ALERTAS_SATA_A_2024.geojson",
            name: "Alertas SATA - 2024",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(200, 3, 124, 0.75)', width: 1 },
        },
        {
            id: "alertas_2025",
            url: "/data/DB_ALERTAS_SATA_A_2025.geojson",
            name: "Alertas SATA - 2025",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(3, 200, 164, 0.75)', width: 1 },
        },
        {
            id: "alertas_2026",
            url: "/data/DB_ALERTAS_SATA_A_2026.geojson",
            name: "Alertas SATA - 2026",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(3, 16, 200, 0.75)', width: 1 },
        },
    ]
}

export const registryLayersConfig = {
    data: {},
    defaultLayers: [
        {
            id: "provincias",
            url: "/data/LAYER_PROVINCIAS.geojson",
            name: "Provincias",
            type: "tile",
            pane: 'lowestPane',
            attribution: '<a href="">CONALI</a>',
            style: { fill: "rgba(87, 83, 83, 0.3)", stroke: 'rgba(255, 255, 255, 0.72)', width: 1.3 },
            filterConfig: {
                provincia: "DPA_DESPRO"
            }
        },
        {
            id: "alertas_2023",
            url: "/data/DB_ALERTAS_SATA_A_2023.geojson",
            name: "Alertas SATA - 2023",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(232, 109, 8, 0.84)', width: 1 },
        },
        {
            id: "alertas_2024",
            url: "/data/DB_ALERTAS_SATA_A_2024.geojson",
            name: "Alertas SATA - 2024",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(200, 3, 124, 0.75)', width: 1 },
        },
        {
            id: "alertas_2025",
            url: "/data/DB_ALERTAS_SATA_A_2025.geojson",
            name: "Alertas SATA - 2025",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(3, 200, 164, 0.75)', width: 1 },
        },
        {
            id: "alertas_2026",
            url: "/data/DB_ALERTAS_SATA_A_2026.geojson",
            name: "Alertas SATA - 2026",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(3, 16, 200, 0.75)', width: 1 },
        },
    ]
}

export const fichasLayersConfig = {
    data: {},
    defaultLayers: [
        {
            id: "provincias",
            url: "/data/LAYER_PROVINCIAS.geojson",
            name: "Provincias",
            type: "tile",
            pane: 'lowestPane',
            attribution: '<a href="">CONALI</a>',
            style: { fill: "rgba(87, 83, 83, 0.3)", stroke: 'rgba(255, 255, 255, 0.72)', width: 1.3 },
            filterConfig: {
                provincia: "DPA_DESPRO"
            }
        },
        {
            id: "db_fichas",
            url: "/data/DB_FICHAS_MONITOREO_A.geojson",
            name: "Fichas Monitoreo",
            type: "vector",
            pane: 'mediumPane',
            attribution: '<a href="https://geoinspire-hub.vercel.app/">JWS</a>',
            popup: {
                fields: VISIBLE_FIELDS.extended,
                aliases: FIELD_ALIASES,
            },
            style: { fill: "rgba(212, 11, 27, 0.92)", stroke: 'rgba(200, 3, 3, 0.20)', width: 1.5 },
            filterConfig: {
                provincia: "DPA_DESPRO",
                delimitacion: "delimitaci",
                mes: "fm_monit",
                anio: "fm_monit",
                dateFormat: "YYYY-MM-DD"
            }
        }
    ]
}

export const seguimientoLayersConfig = {
    data: {},
    defaultLayers: [
        {
            id: "provincias",
            url: "/data/LAYER_PROVINCIAS.geojson",
            name: "Provincias",
            type: "tile",
            pane: 'lowestPane',
            attribution: '<a href="">CONALI</a>',
            style: { fill: "rgba(87, 83, 83, 0.3)", stroke: 'rgba(255, 255, 255, 0.72)', width: 1.3 },
            filterConfig: {
                provincia: "DPA_DESPRO"
            }
        },
    ]
}

export const landingLayersConfig = {
    data: {},
    defaultLayers: [
        {
            id: "provincias",
            url: "/data/LAYER_PROVINCIAS.geojson",
            name: "Provincias",
            type: "tile",
            pane: 'lowestPane',
            style: { fill: "rgba(87, 83, 83, 0.3)", stroke: 'rgba(255, 255, 255, 0.72)', width: 1.3 },
            filterConfig: {
                provincia: "DPA_DESPRO"
            }
        },
        {
            id: "alertas_2026",
            url: "/data/DB_ALERTAS_SATA_A_2026.geojson",
            name: "Alertas SATA - 2026",
            type: "tile",
            pane: 'lowPane',
            attribution: '<a href="https://snmb.ambiente.gob.ec/snmb/">SNMB</a>',
            style: { fill: "rgba(242, 255, 0, 0.5)", stroke: 'rgba(3, 16, 200, 0.75)', width: 1 },
        },
    ],
}

