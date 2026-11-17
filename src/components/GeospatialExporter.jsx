{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    UPDATED AT: October, 2026
    VERSIÓN: 2.1.1
*/}


/* -------------------------------------------------------- REACT */
import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Download,
    X,
    MapPin,
    Route,
    Pentagon,
    FileJson,
    FileText,
    FileArchive,
    Database,
    AlertCircle,
    DownloadCloud
} from "lucide-react";

import * as shpwrite from "@mapbox/shp-write";

/* -------------------------------------------------------- GEOMETRY TYPES */
const GEOMETRY_TYPES = {

    Point: {
        label: "Puntos",
        shortLabel: "Punto",
        icon: MapPin
    },

    MultiPoint: {
        label: "Multi-puntos",
        shortLabel: "MultiPoint",
        icon: MapPin
    },

    LineString: {
        label: "Líneas",
        shortLabel: "Línea",
        icon: Route
    },

    MultiLineString: {
        label: "Multi-líneas",
        shortLabel: "MultiLineString",
        icon: Route
    },

    Polygon: {
        label: "Polígonos",
        shortLabel: "Polígono",
        icon: Pentagon
    },

    MultiPolygon: {
        label: "Multi-polígonos",
        shortLabel: "MultiPolygon",
        icon: Pentagon
    }

};

/* -------------------------------------------------------- SUPPORTED GEOMETRIES */
const SUPPORTED_GEOMETRIES = Object.keys(
    GEOMETRY_TYPES
);

/* -------------------------------------------------------- MAIN FUNCTION */
const GeospatialExporter = ({
    data,
    open,
    onClose
}) => {

    const [
        processedData,
        setProcessedData
    ] = useState(null);


    const [
        error,
        setError
    ] = useState(null);


    const [
        exporting,
        setExporting
    ] = useState(false);


    /* -------------------------------------------------------- NORMALIZE DATA */
    useEffect(() => {

        if (!open || !data) {

            setProcessedData(null);
            setError(null);

            return;

        }


        try {

            setError(null);


            let geojson = null;


            /*
             * Caso 1:
             *
             * {
             *     geojson: {
             *         type: "FeatureCollection",
             *         features: [...]
             *     }
             * }
             */

            if (
                data?.geojson &&
                typeof data.geojson === "object"
            ) {

                geojson = data.geojson;

            }


            /*
             * Caso 2:
             *
             * FeatureCollection directamente.
             */

            else if (
                data?.type === "FeatureCollection"
            ) {

                geojson = data;

            }


            /*
             * Caso 3:
             *
             * Feature individual.
             */

            else if (
                data?.type === "Feature" &&
                data?.geometry
            ) {

                geojson = {

                    type: "FeatureCollection",

                    features: [data]

                };

            }


            if (!geojson) {

                throw new Error(
                    "No se encontró una estructura GeoJSON válida."
                );

            }


            /*
             * Si se recibió un Feature individual
             * lo convertimos a FeatureCollection.
             */

            if (
                geojson.type === "Feature"
            ) {

                geojson = {

                    type: "FeatureCollection",

                    features: [geojson]

                };

            }


            if (
                geojson.type !==
                "FeatureCollection"
            ) {

                throw new Error(
                    `Tipo GeoJSON no soportado: ${geojson.type}`
                );

            }


            if (
                !Array.isArray(
                    geojson.features
                ) ||
                geojson.features.length === 0
            ) {

                throw new Error(
                    "El GeoJSON no contiene entidades espaciales."
                );

            }


            /*
             * Validamos las geometrías.
             */

            const validFeatures =
                geojson.features.filter(
                    feature => {

                        return (

                            feature?.type ===
                            "Feature"

                            &&

                            feature?.geometry

                            &&

                            feature.geometry.type

                            &&

                            SUPPORTED_GEOMETRIES.includes(
                                feature.geometry.type
                            )

                            &&

                            Array.isArray(
                                feature.geometry.coordinates
                            )

                        );

                    }
                );


            if (
                validFeatures.length === 0
            ) {

                throw new Error(
                    "No se encontraron geometrías compatibles."
                );

            }


            /*
             * Construimos nuestro FeatureCollection
             * normalizado.
             */

            const normalized = {

                type: "FeatureCollection",

                name:
                    geojson.name ||
                    data?.name ||
                    "geometry",

                features:
                    validFeatures

            };


            setProcessedData(
                normalized
            );


        } catch (err) {

            console.error(
                "Error procesando datos geoespaciales:",
                err
            );

            setProcessedData(null);

            setError(
                err?.message ||
                "No fue posible procesar los datos."
            );

        }

    }, [data, open]);

    /* -------------------------------------------------------- DATASET NAME */
    const datasetName = useMemo(() => {

        const name =
            processedData?.name ||
            data?.name ||
            "geometry";


        return name

            .toString()

            .trim()

            .replace(
                /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g,
                "_"
            )

            .replace(
                /_+/g,
                "_"
            )

            .replace(
                /^_+|_+$/g,
                ""
            )

            ||

            "geometry";

    }, [
        processedData,
        data
    ]);

    /* -------------------------------------------------------- GEOMETRY ANALYSIS */
    const geometryInfo = useMemo(() => {

        if (
            !processedData?.features?.length
        ) {

            return {

                types: [],

                count: 0,

                homogeneous: false,

                mixed: false

            };

        }


        const counts = {};


        processedData.features
            .forEach(
                feature => {

                    const type =
                        feature
                            ?.geometry
                            ?.type;

                    if (!type) return;

                    counts[type] =
                        (counts[type] || 0) + 1;

                }
            );


        const types =
            Object.keys(counts);


        return {

            types,

            counts,

            count:
                processedData
                    .features
                    .length,

            homogeneous:
                types.length === 1,

            mixed:
                types.length > 1

        };

    }, [
        processedData
    ]);

    /* -------------------------------------------------------- PRIMARY GEOMETRY */
    const primaryGeometryType = geometryInfo.types[0] || null;

    /* -------------------------------------------------------- GEOMETRY LABEL */
    const geometryLabel = useMemo(() => {

        if (
            !geometryInfo.types.length
        ) {

            return "Sin geometría";

        }


        return geometryInfo
            .types
            .map(
                type =>
                    GEOMETRY_TYPES[type]
                        ?.label || type
            )
            .join(", ");

    }, [
        geometryInfo.types
    ]);

    /* -------------------------------------------------------- ICON */
    const GeometryIcon = () => {

        const type =
            primaryGeometryType;


        const Icon =
            GEOMETRY_TYPES[type]
                ?.icon ||
            Database;


        return (
            <Icon size={14} />
        );

    };

    /* -------------------------------------------------------- DOWNLOAD BLOB */
    const downloadBlob = (
        blob,
        filename
    ) => {

        if (!blob) return;


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            filename;


        document
            .body
            .appendChild(link);


        link.click();


        document
            .body
            .removeChild(link);


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

    };

    /* -------------------------------------------------------- GEOJSON */
    const exportGeoJSON = () => {

        if (!processedData)
            return;


        try {

            setExporting(true);

            const geojson = {

                type:
                    "FeatureCollection",

                name:
                    datasetName,

                features:
                    processedData.features

            };


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            geojson,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/geo+json;charset=utf-8"
                    }
                );


            downloadBlob(
                blob,
                `${datasetName}.geojson`
            );


        } catch (err) {

            console.error(
                "Error exportando GeoJSON:",
                err
            );

            setError(
                "No fue posible exportar el GeoJSON."
            );

        } finally {

            setExporting(false);

        }

    };

    /* -------------------------------------------------------- SHAPEFILE */
    const exportShapefile = async () => {

        if (!processedData)
            return;


        /*
         * Shapefile necesita geometría homogénea.
         */

        if (
            !geometryInfo.homogeneous
        ) {

            setError(
                "Shapefile requiere un único tipo de geometría."
            );

            return;

        }


        try {

            setExporting(true);

            setError(null);


            const type =
                primaryGeometryType;


            let shpType;


            switch (type) {

                case "Point":
                case "MultiPoint":

                    shpType =
                        "point";

                    break;


                case "LineString":
                case "MultiLineString":

                    shpType =
                        "polyline";

                    break;


                case "Polygon":
                case "MultiPolygon":

                    shpType =
                        "polygon";

                    break;


                default:

                    throw new Error(
                        `Geometría no soportada: ${type}`
                    );

            }


            const geojson = {

                type:
                    "FeatureCollection",

                features:
                    processedData.features

            };


            const options = {

                folder:
                    datasetName,

                filename:
                    datasetName,

                outputType:
                    "blob",

                types: {

                    point:
                        datasetName,

                    polyline:
                        datasetName,

                    polygon:
                        datasetName

                },

                prj:
                    'GEOGCS["WGS 84",' +
                    'DATUM["WGS_1984",' +
                    'SPHEROID["WGS 84",' +
                    '6378137,298.257223563]],' +
                    'PRIMEM["Greenwich",0],' +
                    'UNIT["degree",' +
                    '0.0174532925199433]]'

            };


            /*
             * shp-write determina la geometría
             * a partir del FeatureCollection.
             */

            const zipBlob =
                await shpwrite.zip(
                    geojson,
                    options
                );


            downloadBlob(
                zipBlob,
                `${datasetName}.zip`
            );


        } catch (err) {

            console.error(
                "Error exportando Shapefile:",
                err
            );

            setError(
                err?.message ||
                "No fue posible exportar el Shapefile."
            );

        } finally {

            setExporting(false);

        }

    };

    /* -------------------------------------------------------- KML */
    const exportKML = () => {

        if (!processedData)
            return;


        try {

            setExporting(true);

            setError(null);


            const escapeXML = (
                value
            ) => {

                return String(
                    value ?? ""
                )
                    .replace(
                        /&/g,
                        "&amp;"
                    )
                    .replace(
                        /</g,
                        "&lt;"
                    )
                    .replace(
                        />/g,
                        "&gt;"
                    )
                    .replace(
                        /"/g,
                        "&quot;"
                    )
                    .replace(
                        /'/g,
                        "&apos;"
                    );

            };


            const coordinatesToKML =
                coordinates => {

                    return coordinates
                        .map(
                            coordinate =>
                                `${coordinate[0]},${coordinate[1]}${coordinate[2] !== undefined
                                    ? `,${coordinate[2]}`
                                    : ",0"}`
                        )
                        .join(" ");

                };


            const propertiesToHTML =
                properties => {

                    if (
                        !properties ||
                        typeof properties !==
                        "object"
                    ) {

                        return "";

                    }


                    return Object
                        .entries(properties)
                        .map(
                            ([key, value]) =>
                                `<b>${escapeXML(key)}</b>: ${escapeXML(value)}`
                        )
                        .join("<br/>");

                };


            const geometryToKML =
                geometry => {

                    if (!geometry)
                        return "";


                    const {
                        type,
                        coordinates
                    } = geometry;


                    switch (type) {

                        case "Point":

                            return `
                                <Point>
                                    <coordinates>
                                        ${coordinatesToKML(
                                            [coordinates]
                                        )}
                                    </coordinates>
                                </Point>
                            `;


                        case "MultiPoint":

                            return `
                                <MultiGeometry>
                                    ${coordinates
                                        .map(
                                            coordinate =>
                                                `
                                                    <Point>
                                                        <coordinates>
                                                            ${coordinatesToKML(
                                                                [coordinate]
                                                            )}
                                                        </coordinates>
                                                    </Point>
                                                `
                                        )
                                        .join("")}
                                </MultiGeometry>
                            `;


                        case "LineString":

                            return `
                                <LineString>
                                    <tessellate>1</tessellate>
                                    <coordinates>
                                        ${coordinatesToKML(
                                            coordinates
                                        )}
                                    </coordinates>
                                </LineString>
                            `;


                        case "MultiLineString":

                            return `
                                <MultiGeometry>
                                    ${coordinates
                                        .map(
                                            line =>
                                                `
                                                    <LineString>
                                                        <tessellate>1</tessellate>
                                                        <coordinates>
                                                            ${coordinatesToKML(
                                                                line
                                                            )}
                                                        </coordinates>
                                                    </LineString>
                                                `
                                        )
                                        .join("")}
                                </MultiGeometry>
                            `;


                        case "Polygon":

                            return `
                                <Polygon>
                                    <tessellate>1</tessellate>

                                    <outerBoundaryIs>
                                        <LinearRing>
                                            <coordinates>
                                                ${coordinatesToKML(
                                                    coordinates[0]
                                                )}
                                            </coordinates>
                                        </LinearRing>
                                    </outerBoundaryIs>

                                    ${coordinates
                                        .slice(1)
                                        .map(
                                            ring =>
                                                `
                                                    <innerBoundaryIs>
                                                        <LinearRing>
                                                            <coordinates>
                                                                ${coordinatesToKML(
                                                                    ring
                                                                )}
                                                            </coordinates>
                                                        </LinearRing>
                                                    </innerBoundaryIs>
                                                `
                                        )
                                        .join("")}

                                </Polygon>
                            `;


                        case "MultiPolygon":

                            return `
                                <MultiGeometry>
                                    ${coordinates
                                        .map(
                                            polygon =>
                                                geometryToKML({
                                                    type:
                                                        "Polygon",
                                                    coordinates:
                                                        polygon
                                                })
                                        )
                                        .join("")}
                                </MultiGeometry>
                            `;


                        default:

                            return "";

                    }

                };


            const placemarks =
                processedData
                    .features
                    .map(
                        (feature, index) => {

                            const name =
                                feature
                                    ?.properties
                                    ?.name ||
                                feature
                                    ?.properties
                                    ?.cod ||
                                `${datasetName}_${index + 1}`;


                            const description =
                                propertiesToHTML(
                                    feature.properties
                                );


                            return `

                                <Placemark>

                                    <name>
                                        ${escapeXML(name)}
                                    </name>

                                    <description>
                                        <![CDATA[
                                            ${description}
                                        ]]>
                                    </description>

                                    ${geometryToKML(
                                        feature.geometry
                                    )}

                                </Placemark>

                            `;

                        }
                    )
                    .join("");


            const kml = `<?xml version="1.0" encoding="UTF-8"?>

                <kml
                    xmlns="http://www.opengis.net/kml/2.2"
                >

                    <Document>

                        <name>
                            ${escapeXML(datasetName)}
                        </name>

                        ${placemarks}

                    </Document>

                </kml>
            `;


            const blob =
                new Blob(
                    [kml],
                    {
                        type:
                            "application/vnd.google-earth.kml+xml;charset=utf-8"
                    }
                );


            downloadBlob(
                blob,
                `${datasetName}.kml`
            );


        } catch (err) {

            console.error(
                "Error exportando KML:",
                err
            );

            setError(
                "No fue posible generar el archivo KML."
            );

        } finally {

            setExporting(false);

        }

    };

    /* -------------------------------------------------------- CSV */
    const exportCSV = () => {

        if (!processedData)
            return;


        try {

            setExporting(true);

            setError(null);


            /*
             * Reunimos todos los campos existentes.
             */

            const propertyKeys = [
                ...new Set(
                    processedData
                        .features
                        .flatMap(
                            feature =>
                                Object.keys(
                                    feature.properties ||
                                    {}
                                )
                        )
                )
            ];


            /*
             * Añadimos coordenadas.
             */

            const headers = [
                ...propertyKeys,
                "geometry_type",
                "longitude",
                "latitude"
            ];


            const escapeCSV =
                value => {

                    if (
                        value === null ||
                        value === undefined
                    ) {

                        return "";

                    }


                    const stringValue =
                        String(value);


                    if (
                        stringValue.includes(",") ||
                        stringValue.includes('"') ||
                        stringValue.includes("\n")
                    ) {

                        return `"${stringValue.replace(
                            /"/g,
                            '""'
                        )}"`;

                    }


                    return stringValue;

                };


            const rows =
                processedData
                    .features
                    .map(
                        feature => {

                            const properties =
                                feature.properties ||
                                {};


                            let longitude = "";

                            let latitude = "";


                            /*
                             * Para CSV utilizamos directamente
                             * las coordenadas cuando se trata
                             * de puntos.
                             */

                            if (
                                feature.geometry?.type ===
                                "Point"
                            ) {

                                longitude =
                                    feature.geometry
                                        .coordinates[0];

                                latitude =
                                    feature.geometry
                                        .coordinates[1];

                            }


                            return [

                                ...propertyKeys.map(
                                    key =>
                                        properties[key]
                                ),

                                feature
                                    .geometry
                                    ?.type,

                                longitude,

                                latitude

                            ]

                                .map(
                                    escapeCSV
                                )

                                .join(",");

                        }
                    );


            const csv = [

                headers
                    .map(
                        escapeCSV
                    )
                    .join(","),

                ...rows

            ].join("\r\n");


            /*
             * BOM para que Excel reconozca correctamente
             * Ñ y caracteres acentuados.
             */

            const blob =
                new Blob(
                    [
                        "\uFEFF",
                        csv
                    ],
                    {
                        type:
                            "text/csv;charset=utf-8"
                    }
                );


            downloadBlob(
                blob,
                `${datasetName}.csv`
            );


        } catch (err) {

            console.error(
                "Error exportando CSV:",
                err
            );

            setError(
                "No fue posible generar el CSV."
            );

        } finally {

            setExporting(false);

        }

    };

    /* -------------------------------------------------------- KML SUPPORT */
    const canExportKML =
        geometryInfo.types.every(
            type =>
                SUPPORTED_GEOMETRIES
                    .includes(type)
        );

    /* -------------------------------------------------------- SHAPEFILE SUPPORT */
    const canExportShapefile = geometryInfo.homogeneous;

    /* -------------------------------------------------------- RENDER */
    if (!open) return null;

    return (

        <div className="w-64 bg-white rounded-lg shadow-xl overflow-hidden">

            {/* -------------------------------------------------------- HEADER */}
            <div className="flex items-center justify-between px-2 py-1 bg-green-700/80 text-white">

                <div className="flex items-center gap-2 font-semibold">
                    <DownloadCloud size={18} /> Exportar Datos
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded hover:bg-white/20"
                    >
                        <X size={17} />
                    </button>
                )}

            </div>

            {/* -------------------------------------------------------- BODY */}
            <div className="p-2">

                {/* -------------------------------------------------------- DATASET */}
                {processedData && (
                    <div className="mb-2 rounded-lg bg-gray-50 border border-gray-100 p-2">

                        <div className="flex items-center gap-2 text-xs font-semibold text-green-700/80 mb-1 ">

                            <Database size={14}/>

                            <span
                                className="truncate"
                                title={datasetName}
                            >
                                {datasetName}
                            </span>

                        </div>

                        <div className=" flex items-center justify-between text-[11px] text-gray-500">

                            <div className="flex items-center gap-1">
                                <GeometryIcon />
                                {geometryLabel}
                            </div>

                            <span>
                                {geometryInfo.count}{" "}
                                {geometryInfo.count === 1
                                    ? "entidad"
                                    : "entidades"}
                            </span>

                        </div>

                        {/* -------------------------------------------------------- MIXED */}
                        {geometryInfo.mixed && (

                            <div
                                className="
                                    mt-2
                                    text-[10px]
                                    text-amber-700
                                    bg-amber-50
                                    border
                                    border-amber-200
                                    rounded
                                    p-1.5
                                "
                            >

                                El conjunto contiene
                                múltiples tipos de
                                geometría.

                                <div className="mt-0.5">

                                    {geometryInfo.types
                                        .map(
                                            type =>
                                                `${GEOMETRY_TYPES[type]?.label || type}: ${geometryInfo.counts[type]}`
                                        )
                                        .join(" · ")}

                                </div>

                            </div>

                        )}

                    </div>

                )}

                {/* -------------------------------------------------------- ERROR */}
                {error && (

                    <div className=" flex gap-2 items-start mb-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px]">

                        <AlertCircle
                            size={14}
                            className="shrink-0 mt-0.5"
                        />

                        <span>
                            {error}
                        </span>

                    </div>

                )}

                {/* -------------------------------------------------------- EXPORTS */}
                {processedData && (

                    <div className="grid grid-cols-2 gap-2">

                        {/* -------------------------------------------------------- GEOJSON */}
                        <button
                            type="button"
                            onClick={exportGeoJSON}
                            disabled={exporting}
                            className="
                                flex
                                items-center
                                justify-center
                                gap-1
                                px-2
                                py-2
                                rounded-lg
                                bg-gray-100
                                cursor-pointer
                                hover:bg-gray-200
                                disabled:opacity-50
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >

                            <FileJson
                                size={14}
                            />

                            GeoJSON

                        </button>

                        {/* -------------------------------------------------------- SHAPEFILE */}
                        <button
                            type="button"
                            onClick={exportShapefile}
                            disabled={
                                exporting ||
                                !canExportShapefile
                            }
                            title={
                                !canExportShapefile
                                    ? "Requiere un único tipo de geometría"
                                    : "Exportar Shapefile"
                            }
                            className="
                                flex
                                items-center
                                justify-center
                                gap-1
                                px-2
                                py-2
                                rounded-lg
                                bg-green-700/80
                                cursor-pointer
                                hover:bg-green-700
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                text-white
                                text-xs
                                font-medium
                            "
                        >

                            <FileArchive
                                size={14}
                            />

                            Shapefile

                        </button>

                        {/* -------------------------------------------------------- KML */}
                        <button
                            type="button"
                            onClick={exportKML}
                            disabled={
                                exporting ||
                                !canExportKML
                            }
                            className="
                                flex
                                items-center
                                justify-center
                                gap-1
                                px-2
                                py-2
                                rounded-lg
                                bg-blue-600
                                cursor-pointer
                                hover:bg-blue-700
                                disabled:opacity-50
                                text-white
                                text-xs
                                font-medium
                            "
                        >

                            <Download
                                size={14}
                            />

                            KML

                        </button>

                        {/* -------------------------------------------------------- CSV */}

                        <button
                            type="button"
                            onClick={exportCSV}
                            disabled={
                                exporting
                            }
                            className="
                                flex
                                items-center
                                justify-center
                                gap-1
                                px-2
                                py-2
                                rounded-lg
                                bg-gray-700
                                cursor-pointer
                                hover:bg-gray-800
                                disabled:opacity-50
                                text-white
                                text-xs
                                font-medium
                            "
                        >

                            <FileText
                                size={14}
                            />

                            CSV

                        </button>

                    </div>

                )}

                {/* -------------------------------------------------------- EMPTY */}
                {!processedData &&
                    !error && (

                        <div
                            className="
                                py-4
                                text-center
                                text-xs
                                text-gray-400
                            "
                        >

                            No hay información
                            geoespacial para
                            exportar.

                        </div>

                    )}

            </div>

        </div>

    );

};


export default GeospatialExporter;
