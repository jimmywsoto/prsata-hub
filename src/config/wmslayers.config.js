{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: September, 2026.
    VERSIÓN: 2.1.0
*/}

export const wmsLayersConfig = [
    {
        id: "snap",
        name: "SNAP: Sistema Nacional de Áreas Protegidas",
        url: "http://ide.ambiente.gob.ec:8080/geoserver/mae_ide/wms",
        layers: "v_fa210_snap_a",
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        opacity: 0.7,
        pane: "lowestPane",
        attribution: "Fuente: MAATE",
        visible: false,
        zIndex: 400,
        // GetFeatureInfo
        queryable: true,
        infoFormat: "application/json",
        crs: "EPSG:3857",
        featureCount: 20
    },
    {
        id: "bvp",
        name: "BVP: Bosques y Vegetación Protectora",
        url: "http://ide.ambiente.gob.ec:8080/geoserver/mae_ide/wms",
        layers: "v_hc000_bosque_vegetacion_protector_a",
        format: "image/png",
        transparent: true,
        opacity: 0.8,
        visible: false,
        zIndex: 410,
        // GetFeatureInfo
        queryable: true,
        infoFormat: "application/json"
    },
    {
        id: "psb",
        name: "PSB: Área Bajo Conservación",
        url: "http://ide.ambiente.gob.ec:8080/geoserver/mae_ide/wms",
        layers: "v_hc005_area_bajo_conservacion_a_anonimo",
        format: "image/png",
        transparent: true,
        opacity: 0.8,
        visible: false,
        zIndex: 410,
        // GetFeatureInfo
        queryable: true,
        infoFormat: "application/json"
    },
    {
        id: "pfe",
        name: "PFE: Patrimonio Forestal del Estado",
        url: "http://ide.ambiente.gob.ec:8080/geoserver/mae_ide/wms",
        layers: "v_hc001_pfe_a",
        format: "image/png",
        transparent: true,
        opacity: 0.8,
        visible: false,
        zIndex: 410,
        // GetFeatureInfo
        queryable: true,
        infoFormat: "application/json"
    },
    {
        id: "bosques_2024",
        name: "CUT: Cobertura de la Tierra 2024",
        url: "http://ide.ambiente.gob.ec:8080/geoserver/mae_ide/wms",
        layers: "v_ff010_cobertura_vegetal_2024_a",
        format: "image/png",
        transparent: true,
        opacity: 0.8,
        visible: false,
        zIndex: 410,
        // GetFeatureInfo
        queryable: true,
        infoFormat: "application/json"
    }
];
