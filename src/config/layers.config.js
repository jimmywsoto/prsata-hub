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
        }*/
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
        }
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
