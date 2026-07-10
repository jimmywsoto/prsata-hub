{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  CalendarDays,
  MapPin,
  TriangleAlert,
  House,
  LayoutDashboard
} from 'lucide-react';
import shp from "shpjs";
import proj4 from "proj4";

{/* -------------------------------------------------------- DATA */ }
import { META } from "../data/dataMeta";

{/* -------------------------------------------------------- CONTEXT */ }
import { accessPanelsRoutes } from "../config/accesibleroutes.config";

{/* -------------------------------------------------------- COMPONENTS */ }
import MultiSelect from "./MultiSelect";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function LeftSidebar({
  onAddLayer,
  filters,
  setFilters,
  onSelectLocation,
  locationInput,
  setLocationInput
}) {
  const location = useLocation();
  const config = accessPanelsRoutes[location.pathname]?.left ?? false;

  const resetFilters = () => {
    setFilters({
      anio: [],
      mes: [],
      provincia: [],
      delimitacion: [],
      trimestre: []
    });
  };

  const [filename, setFilename] = useState('');

  const handleFile = async (file) => {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    let geojson;

    try {
      if (ext === "geojson" || ext === "json") {
        const text = await file.text();
        geojson = JSON.parse(text);
      }

      else if (ext === "zip") {
        const buffer = await file.arrayBuffer();
        geojson = await shp(buffer);

        if (
          !geojson ||
          !geojson.features ||
          geojson.features.length === 0
        ) {
          throw new Error(
            "El shapefile no contiene entidades válidas."
          );
        }

        // Si el zip tiene varias capas
        if (Array.isArray(geojson)) {
          geojson.forEach((layer, i) => {
            onAddLayer({
              id: `${Date.now()}-${i}`,
              name: `${file.name} (${i + 1})`,
              data: layer,
              style: generateLayerStyle()
            });
          });

          return;
        }

        // Si retorna un objeto con varias capas
        if (
          geojson &&
          geojson.type !== "FeatureCollection"
        ) {
          Object.entries(geojson).forEach(([name, layer]) => {
            onAddLayer({
              id: `${Date.now()}-${name}`,
              name,
              data: layer,
              style: generateLayerStyle()
            });
          });

          return;
        }
      }

      else {
        alert("Formato no soportado");
        return;
      }

      // estilo automático
      const style = generateLayerStyle();

      onAddLayer({
        id: Date.now().toString(),
        name: file.name,
        data: geojson,
        style
      });

      // Finally
      setFilename(file.name || 'JWS File');

    } catch (err) {
      console.error("Error cargando archivo", err);
    }
  };

  const colors = [
    "#3b82f6", // azul
    "#ef4444", // rojo
    "#10b981", // verde
    "#f59e0b", // naranja
    "#8b5cf6", // violeta
  ];

  const colorIndex = useRef(0);

  function generateLayerStyle() {
    const color =
      colors[colorIndex.current % colors.length];

    colorIndex.current++;

    return {
      stroke: color,
      fill: hexToRgba(color, 0.25),
      radius: 5,
      width: 1.5,
    };
  }

  function hexToRgba(hex, alpha) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r},${g},${b},${alpha})`;
  }

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
      label: `<strong>Coordenadas:</strong></br> (${lat.toFixed(5)}, ${lng.toFixed(5)})`
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGoToLocation();
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  return (
    config &&
    <aside className="h-full w-64 bg-white shadow-xl z-30 transform transition-all duration-300 ease-in-out overflow-y-auto">
      <div className="p-4 space-y-2">

        {/* Logo */}
        <img src={META.logo} alt="Logo" className="w-full" />

        {/* Título */}
        <div className="border-b border-[var(--color-border)] pb-2">
          <h1 className="font-bold text-center text-xl leading-none">
            {META.authority}
          </h1>
        </div>

        {/* Filtros */}
        <section>
          <h2 className="font-semibold text-lg mb-3">
            Filtros de Información
          </h2>

          <MultiSelect
            filter="anio"
            label="Selecciona (Año)"
            style="rounded-t-lg"
            value={filters.anio}
            onChange={(value) => {
              setFilters(prev => ({ ...prev, anio: value }));
            }}
          />

          <MultiSelect
            filter="mes"
            label="Selecciona (Mes)"
            style="bg-gray-200"
            value={filters.mes}
            onChange={(value) => {
              setFilters(prev => ({ ...prev, mes: value }));
            }}
          />

          <MultiSelect
            filter="delimitacion"
            label="Selecciona (Delimitación)"
            style=""
            value={filters.delimitacion}
            onChange={(value) => {
              setFilters(prev => ({ ...prev, delimitacion: value }));
            }}
          />

          <MultiSelect
            filter="provincia"
            label="Selecciona (Provincia)"
            style="rounded-b-lg shadow-lg bg-gray-200"
            value={filters.provincia}
            onChange={(value) => {
              setFilters(prev => ({ ...prev, provincia: value }));
            }}
          />
        </section>

        {/* Botones */}
        <div className="flex gap-2 mt-4">
          <IconButton
            title="Restablecer filtros"
            icon="/icon-delete.png"
            hover="hover:bg-pink-200 hover:cursor-pointer"
            onClick={resetFilters}
          />

          {/*<IconButton
            title="Descargar CSV"
            icon="/icon-csv.png"
            hover="hover:bg-green-200 hover:cursor-pointer"
          />*/}
        </div>

        {/* Funcionalidades */}
        <section className="border-t border-[var(--color-border)] pt-3">
          <h2 className="font-semibold text-lg mb-2">
            Mapa
          </h2>

          {/* Coordenadas */}
          <p className="text-xs text-gray-500 mb-1">
            Centrar ubicación:
          </p>

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
              className={`w-8 h-8 p-1 rounded-full cursor-pointer ${noCoords ? 'shake bg-red-200' : 'hover:bg-white'}`}
              title="Ir a ubicación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#78A75A">
                <path
                  d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q152 0 263.5 98T876-538q-20-10-41.5-15.5T790-560q-19-73-68.5-130T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q11 0 20.5 5.5T595-459q-17 27-26 57t-9 62q0 63 32.5 117T659-122q-41 20-86 31t-93 11Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm340 82q-7 0-12-4t-7-10q-11-35-31-65t-43-59q-21-26-34-57t-13-65q0-58 41-99t99-41q58 0 99 41t41 99q0 34-13.5 64.5T873-218q-23 29-43 59t-31 65q-2 6-7 10t-12 4Zm0-113q10-17 22-31.5t23-29.5q14-19 24.5-40.5T860-340q0-33-23.5-56.5T780-420q-33 0-56.5 23.5T700-340q0 24 10.5 45.5T735-254q12 15 23.5 29.5T780-193Zm0-97q-21 0-35.5-14.5T730-340q0-21 14.5-35.5T780-390q21 0 35.5 14.5T830-340q0 21-14.5 35.5T780-290Z" />
              </svg>
            </button>
          </div>

          {/* Switch */}
          <div className="flex items-center justify-between w-full max-w-xs p-1 border-b border-[var(--color-border)] mt-2 pb-2">
            <span className="text-xs italic text-gray-400">
              Coordenadas UTM 17S
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
                  peer-checked:bg-blue-600
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                  after:bg-white after:border after:border-gray-300 after:rounded-full
                  after:h-3 after:w-3 after:transition-all
                  peer-checked:after:translate-x-3
                  peer-checked:after:border-white
                "
              ></div>
            </label>
          </div>

          {/* Dropzone */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">
              Adición de capas:
            </p>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => {
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`
                flex flex-col items-center justify-center
                h-36 border-2 border-dashed rounded-lg
                cursor-pointer transition-all duration-200

                ${isDragging
                  ? "border-green-500 bg-green-50 scale-105 shadow-lg"
                  : "border-[var(--color-border)] hover:bg-gray-100"
                }
              `}
            >
              <svg className="w-10 h-10 mb-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" height="24px"
                viewBox="0 -960 960 960" width="24px" fill="#B7B7B7">
                <path
                  d="M480-400 40-640l440-240 440 240-440 240Zm0 160L63-467l84-46 333 182 333-182 84 46-417 227Zm0 160L63-307l84-46 333 182 333-182 84 46L480-80Zm0-411 273-149-273-149-273 149 273 149Zm0-149Z" />
              </svg>
              <span className="text-gray-400 text-xs text-center">
                Haz clic o arrastra un archivo aquí
              </span>
              <p className="text-xs italic text-gray-300 text-center">Shapefile comprimido (.zip)</p>
              <p className="text-xs text-center truncate max-w-48">{filename}</p>
              <input
                type="file"
                accept=".geojson,.json,.zip,application/zip"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </label>
          </div>
        </section>

      </div>
    </aside>
  );
}

/* ================= COMPONENTES ================= */
function IconButton({ icon, title, hover, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 transition ${hover}`}
    >
      <img src={icon} alt="" className="w-4 h-4" />
    </button>
  );
}
