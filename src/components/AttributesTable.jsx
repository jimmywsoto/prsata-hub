import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    ModuleRegistry,
    AllCommunityModule,
} from "ag-grid-community";
import {
    FIELD_ALIASES,
    VISIBLE_FIELDS,
} from "../data/dataMeta";
import { Navigation } from 'lucide-react'

/* =========================================================
    REGISTER MODULES
========================================================= */

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AttributesTable({
    features = [],
    mapApiRef,
}) {

    const gridRef = useRef();

    /* =========================================================
        BUILD ROW DATA
    ========================================================= */

    const rowData = useMemo(() => {

        return features.map((feature, index) => {

            const row = {
                __index: index,
                __lat: feature.geometry.coordinates[1],
                __lng: feature.geometry.coordinates[0],
                __feature: feature,
            };

            /*
            =========================================================
            DYNAMIC FIELDS
            =========================================================
            */

            VISIBLE_FIELDS.basic.forEach((field) => {
                row[field] = feature.properties[field];
            });

            return row;
        });

    }, [features]);

    /* =========================================================
        COLUMN DEFINITIONS
    ========================================================= */

    const columnDefs = useMemo(() => {

        const dynamicColumns = VISIBLE_FIELDS.basic.map((field) => ({
            headerName: FIELD_ALIASES[field] || field,
            field,
            sortable: true,
            filter: true,
            floatingFilter: true,
            resizable: true,
            minWidth: 150,
            flex: 1,
        }));

        return [
            {
                headerName: "Acción",
                field: "__accion",
                width: 75,
                sortable: false,
                filter: false,
                pinned: "left",

                cellRenderer: (params) => {
                    const handleZoom = () => {
                        const row = params.data;

                        if (!mapApiRef?.current) return;
                        mapApiRef.current.setLocation({
                            lat: row.__lat,
                            lng: row.__lng,
                            zoom: 15,
                            popup: `
                                <b>${row.cod || "Registro"}</b>
                            `
                        });
                    };

                    return (
                        <button
                            onClick={handleZoom}
                            className="
                                bg-gray-100
                                hover:bg-white
                                hover:text-blue-500
                                text-gray-400
                                p-2
                                rounded-full
                                text-sm
                                transition-all
                                cursor-pointer
                                flex
                                w-full
                                items-center
                                align-items
                                text-center
                                align-content
                                justify-center
                                mt-1
                            "
                            title="Ir a ubicación"
                        >
                            <Navigation size={16}/>
                        </button>
                    );
                }
            },
            ...dynamicColumns
        ];
    }, [mapApiRef]);

    /* =========================================================
        DEFAULT COLUMN CONFIG
    ========================================================= */

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        floatingFilter: true,
        resizable: true,
    }), []);

    /* =========================================================
        QUICK FILTER
    ========================================================= */

    const onQuickFilterChange = (e) => {
        gridRef.current.api.setGridOption(
            "quickFilterText",
            e.target.value
        );
    };

    /* =========================================================
        ROW CLICK
    ========================================================= */

    const onRowClicked = (event) => {

        const row = event.data;
        if (!mapApiRef?.current) return;

        /*
        =========================================================
        ZOOM TO FEATURE
        =========================================================
        */

        mapApiRef.current.setLocation({
            lat: row.__lat,
            lng: row.__lng,
            zoom: 16,
            popup: `
                <div>
                    <b> ID. SATA: </b><br/>
                    ${row.cod|| ""}
                </div>
            `
        });

    };

    /* =========================================================
        RENDER
    ========================================================= */

    return (

        <div className="
            w-full
            h-full
            flex
            flex-col
            bg-white
            rounded-2xl
            shadow-xl
            p-4
            overflow-hidden
        ">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <div className="flex justify-between items-center mb-4">

                <h2 className="text-xl font-bold">
                    Tabla de atributos
                </h2>

                <input
                    type="text"
                    placeholder="Buscar..."
                    onChange={onQuickFilterChange}
                    className="
                        bg-gray-100/50
                        border
                        border-gray-300
                        rounded-full
                        px-4
                        py-2
                        w-72
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-400
                    "
                />

            </div>

            {/* =========================================================
                GRID
            ========================================================= */}

            <div
                className="
                    ag-theme-alpine
                    flex-1
                    min-h-0
                    w-full
                "
            >

                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={20}
                    animateRows={true}
                    rowSelection="single"
                    suppressRowClickSelection={false}
                    enableCellTextSelection={true}
                    onRowClicked={onRowClicked}
                />
            </div>
        </div>
    );
}