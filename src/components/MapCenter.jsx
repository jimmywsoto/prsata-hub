{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    UPDATED AT: October, 2026
    VERSIÓN: 2.1.2
*/}

{/* -------------------------------------------------------- REACT */ }
import { useState } from "react";

import {
    X,
    MapPinned,
    LocateFixed
} from "lucide-react";

import proj4 from "proj4";

{/* -------------------------------------------------------- COMPONENTS */ }
import { useToast } from "../components/ToastProvider";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const MapCenter = ({
    onSelectLocation,
    locationInput,
    setLocationInput,
    open,
    onClose
}) => {

    const { showToast } = useToast();

    const [utmMode, setUtmMode] = useState(false);
    const [noCoords, setNoCoords] = useState(false);

    const handleGoToLocation = () => {

        if (!locationInput.x || !locationInput.y) {
            setNoCoords(true)

            setTimeout(() => {
                setNoCoords(false)
            }, 400);

            return;
        }

        let lat, lng;

        if (utmMode) {
            // UTM → WGS84
            const [lon, latConv] = proj4(
                "EPSG:32717",
                "EPSG:4326",
                [parseFloat(locationInput.x), parseFloat(locationInput.y)]
            );

            lat = latConv;
            lng = lon;
        } else {
            // Coordenadas geográficas directas
            lng = parseFloat(locationInput.x);
            lat = parseFloat(locationInput.y);
        }

        if (isNaN(lat) || isNaN(lng)) return;

        onSelectLocation?.({
            lat,
            lng,
            zoom: 14,
            popup: `<strong>Coordenadas:</strong></br> (${lat.toFixed(5)}, ${lng.toFixed(5)})`
        });

        showToast("Ubicación encontrada!", "success");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleGoToLocation();
        }
    };

    {/* -------------------------------------------------------- RENDER */ }
    if (!open) return null;

    return (
        <div className="w-64 bg-white rounded-lg shadow-xl overflow-hidden">

            {/* -------------------------------------------------------- HEADER */}
            <div className="flex items-center justify-between px-2 py-1 bg-green-700/80 text-white">

                <div className="flex items-center gap-2 font-semibold">
                    <MapPinned size={18} /> Centrar Mapa
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

            {/* -------------------------------------------------------- HEADER */}
            <div className="p-2">
                
                <p className="text-xs text-green-700/80 mb-1">
                    Ir a ubicación:
                </p>
                
                {/* -------------------------------------------------------- COORDINATES */}
                <div className="flex bg-gray-100 rounded-full p-1 items-center gap-1 text-[var(--color-text-secondary)]">
                    
                    <input
                        type="number"
                        value={locationInput.x}
                        onChange={(e) => setLocationInput(prev => ({ ...prev, x: e.target.value }))}
                        onKeyDown={handleKeyDown}
                        placeholder={`${utmMode ? 'Este: 780065' : 'Lon: -78.5'}`}
                        className="w-full px-2 py-2 text-xs rounded-l-full outline-none bg-white focus:ring-2 ring-green-200"
                    />

                    <input
                        type="number"
                        value={locationInput.y}
                        onChange={(e) => setLocationInput(prev => ({ ...prev, y: e.target.value }))}
                        onKeyDown={handleKeyDown}
                        placeholder={`${utmMode ? 'Norte: 9979800' : 'Lat: -2.5'}`}
                        className="w-full px-2 py-2 text-xs rounded-r-full outline-none bg-white focus:ring-2 ring-green-200"
                    />

                    <button
                        onClick={handleGoToLocation}
                        className={`w-8 h-8 p-1 rounded-full cursor-pointer text-green-700/80 shadow-lg ${noCoords ? 'shake bg-red-200' : 'hover:bg-white'}`}
                        title="Ir a ubicación"
                    >
                        <LocateFixed />
                    </button>

                </div>

                {/* -------------------------------------------------------- SWITCH */}
                <div className="flex items-center justify-between w-full max-w-xs mt-2">
                    
                    <span className="text-[11px] italic text-green-700/80">
                        Usar coordenadas UTM (EPSG:32717)
                    </span>

                    <label className="relative inline-flex items-center cursor-pointer">

                        <input
                            type="checkbox"
                            checked={utmMode}
                            onChange={(e) => setUtmMode(e.target.checked)}
                            className="sr-only peer"
                        />

                        <div
                            className="
                                w-7 h-4 bg-gray-200 rounded-full
                                peer-focus:ring-2 peer-focus:ring-blue-400
                                peer-checked:bg-green-700/80
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                after:bg-white after:border after:border-gray-300 after:rounded-full
                                after:h-3 after:w-3 after:transition-all
                                peer-checked:after:translate-x-3
                                peer-checked:after:border-white
                            "
                        ></div>

                    </label>
                </div>

            </div>

        </div>
    )
};

export default MapCenter;
