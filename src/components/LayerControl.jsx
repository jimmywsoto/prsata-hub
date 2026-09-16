{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: September, 2026.
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Layers, Earth, Database, X, ChevronDown, ChevronRight, Map } from "lucide-react";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function LayerControl({
    collapsed,
    setCollapsed,
    baseMaps = [],
    activeBasemap,
    onBasemapChange,
    layers = [],
    onToggleLayer,
    onRemoveLayer,
}) {
    const panelRef = useRef(null);
    const buttonRef = useRef(null);

    const [openSection, setOpenSection] = useState("layers");

    // Separar visualmente las capas WMS de las demás 
    const wmsLayers = layers.filter((layer) => layer.type === "wms");
    const dataLayers = layers.filter((layer) => layer.type !== "wms");

    useEffect(() => {

        const panel = panelRef.current;
        const button = buttonRef.current;

        if (!panel) return;

        if (panel) {
            L.DomEvent.disableClickPropagation(panel);
            L.DomEvent.disableScrollPropagation(panel);
        }

        if (button) {
            L.DomEvent.disableClickPropagation(button);
        }

    }, []);


    const toggleSection = (section) => {
        setOpenSection((current) =>
            current === section ? null : section
        );
    };

    return (
        <>
            {/* ============================================================ PRINCIPAL BUTTON */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className=" absolute bottom-4 left-4 z-[1000] bg-white text-green-700/80 rounded-full shadow-xl p-2 hover:bg-slate-100 cursor-pointer transition "
                title="Control de capas"
            >
                <Layers size={20} />
            </button>

            {/* ============================================================ PANEL */}
            <div
                ref={panelRef}
                className={`
                    absolute bottom-18 left-4 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 
                    ${collapsed
                        ? "w-0 opacity-0 pointer-events-none"
                        : "w-64 opacity-100"
                    } 
                `}
            >
                {/* ============================================================ HEADER */}
                <div className="p-2 border-b bg-green-700/80 text-white">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Layers size={16} /> Control de capas
                    </h3>
                </div>

                {/* ============================================================ BASEMAP CONTROLS */}
                {baseMaps.length > 0 && (
                    <section className=" border-b border-green-600/20">

                        <button
                            type="button"
                            onClick={() => toggleSection("basemap")}
                            className=" w-full px-3 py-2 flex items-center justify-between text-left text-green-700/80 font-semibold hover:bg-slate-50 transition cursor-pointer "
                        >
                            <span className="flex items-center gap-2">
                                <Earth size={16} /> Mapas base
                            </span>

                            {openSection === "basemap" ? (<ChevronDown size={16} />) : (<ChevronRight size={16} />)}
                        </button>

                        {openSection === "basemap" && (
                            <div className="px-3 pb-3">
                                <div className="space-y-1">
                                    {baseMaps.map((basemap) => (
                                        <button
                                            type="button"
                                            key={basemap.name}
                                            onClick={() => onBasemapChange(basemap.name)}
                                            className={`w-full text-left text-green-700/80 px-3 py-1 rounded transition 
                                        ${activeBasemap === basemap.name
                                                    ? "bg-green-700/80 text-white"
                                                    : "hover:bg-slate-100"
                                                } 
                                    `}
                                        >
                                            {basemap.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                    </section>
                )}

                {/* ============================================================ WMS CONTROLS */}
                {wmsLayers.length > 0 && (
                    <LayerSection
                        sectionId="wms"
                        title="Capas WMS"
                        icon={<Map size={16} />}
                        layers={wmsLayers}
                        openSection={openSection}
                        toggleSection={toggleSection}
                        onToggleLayer={onToggleLayer}
                        onRemoveLayer={null}
                        showSimbols={false}
                    />
                )}

                {/* ============================================================ LAYERS CONTROLS */}
                {dataLayers.length > 0 && (
                    <LayerSection
                        sectionId="layers"
                        title="Capas de datos"
                        icon={<Database size={16} />}
                        layers={dataLayers}
                        openSection={openSection}
                        toggleSection={toggleSection}
                        onToggleLayer={onToggleLayer}
                        onRemoveLayer={onRemoveLayer}
                        showSimbols={true}
                    />
                )}

            </div>
        </>);
}

{/* ============================================================ AUXILIAR FUNCTION */ }
function LayerSection({ sectionId, title, icon, layers, openSection, toggleSection, onToggleLayer, onRemoveLayer, showSimbols }) {
    const isOpen = openSection === sectionId;

    return (
        <section className=" border-b border-green-600/20 last:border-b-0">

            <button
                type="button"
                onClick={() => toggleSection(sectionId)}
                className=" w-full px-3 py-2 flex items-center justify-between text-left text-green-700/80 font-semibold hover:bg-slate-50 transition cursor-pointer "
            >
                <span className="flex items-center gap-2">
                    {icon} {title}
                </span>

                {isOpen ? (<ChevronDown size={16} />) : (<ChevronRight size={16} />)}
            </button>

            {isOpen && (
                <div className="px-3 pb-3">
                    <div className="max-h-64 overflow-auto">
                        {layers.map((layer) => (
                            <div
                                key={layer.id}
                                className="flex items-center justify-between border-b border-dashed border-gray-300 hover:bg-slate-50"
                            >

                                {/* SIMBOLOGY */}
                                {showSimbols && (
                                    <div className="flex">
                                        <span
                                            className="w-4 h-2 border border-2"
                                            style={{ background: layer.style.fill, borderColor: layer.style.stroke, borderRadius: layer.style.radius }}
                                        >
                                        </span>
                                    </div>
                                )}

                                <div className="w-full flex items-center justify-between gap-2 p-1 text-green-700/80 ">
                                    {/* NOMBRE */}
                                    <span
                                        className="truncate text-xs max-w-50"
                                        title={layer.name}
                                    >
                                        {layer.name}
                                    </span>

                                    {/* CONTROLES */}
                                    <div className="flex gap-1 items-center flex-shrink-0">

                                        {/* SWITCH */}
                                        <label className="relative inline-flex cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={layer.visible}
                                                onChange={() => onToggleLayer(layer.id)}
                                            />

                                            <div className=" relative w-8 h-4 rounded-full bg-slate-300 transition-colors duration-300 peer-checked:bg-green-700/80 after:content-[''] after:absolute after:left-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform after:duration-300 peer-checked:after:translate-x-4 " />
                                        </label>

                                        {/* ELIMINAR */}
                                        {onRemoveLayer && (
                                            <button
                                                type="button"
                                                onClick={() => onRemoveLayer(layer.id)}
                                                className="text-red-50 bg-red-200 rounded-full cursor-pointer hover:bg-red-400"
                                                title="Eliminar capa"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                </div>


                            </div>
                        ))}
                    </div>
                </div>
            )}

        </section>
    );
}
