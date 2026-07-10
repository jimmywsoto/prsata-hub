{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import geojsonvt from "geojson-vt";
import proj4 from "proj4";
import { Layers, Earth, Database, X } from 'lucide-react';
import leafletImage from 'leaflet-image';
import { toPng } from 'html-to-image';

{/* -------------------------------------------------------- DATA */ }
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { FullScreen } from 'leaflet.fullscreen'
import "leaflet.fullscreen/dist/Control.FullScreen.css";

proj4.defs(
  "EPSG:32717",
  "+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs"
);

{/* -------------------------------------------------------- COMPONENTS */ }
import { codMes, formatValue, parseDate } from "./CommonFunctions";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function GeoJSONVTMap({
  baseMapsConfig,
  panesConfig,
  data,
  defaultLayers = [],
  externalLayers = [],
  filters = {},
  onMapReady = () => { },
  location = {},
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const initializedRef = useRef(false);
  const markerRef = useRef(null);

  const layersRef = useRef({});
  const baseMapsRef = useRef({});

  const [layers, setLayers] = useState([]);
  const [activeBasemap, setActiveBasemap] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  {/* ============================================================ INIT MAP */ }
  useEffect(() => {
    const map = L.map(mapRef.current).setView([-2, -78], 6);

    // Build panes from config file
    Object.entries(panesConfig).forEach(([name, zIndex]) => {
      if (!map.getPane(name)) {
        map.createPane(name);
      }
      map.getPane(name).style.zIndex = zIndex;
    });

    // Build basemaps from config file
    const baseMaps = {};
    let defaultId = null;

    Object.values(baseMapsConfig).forEach((cfg) => {
      const layer = L.tileLayer(
        cfg.url,
        cfg.options || {}
      );

      baseMapsRef.current[cfg.name] = {
        ...cfg,
        layer
      };

      if (cfg.default) {
        defaultId = cfg.name;
      }
    });

    if (!defaultId) {
      defaultId =
        Object.keys(baseMapsRef.current)[0];
    }

    const defaultBasemap = baseMapsRef.current[defaultId];

    defaultBasemap.layer.addTo(map);

    setActiveBasemap(defaultId);

    mapInstance.current = map;

    // Creditos
    map.attributionControl.setPrefix(false); // Elimina los créditos por defecto

    map.attributionControl.setPrefix(
      '<a href="mailto:jimmy.cabrera@ambienteyenergia.gob.ec">PR-SATA © 2026</a>'
    );

    // Custom FullScreen Control ------------
    map.addControl(new FullScreen({
      position: 'topleft',
      title: "Expandir mapa",
      titleCancel: "Salir de pantalla completa",
      //content: "JWS",
      forceSeparateButton: true,
    }));

    // API pública
    onMapReady({
      addLayer,
      removeLayer,
      toggleLayer,
      setLocation,

      getMap: () => map,
      getBounds: () => {
        const b = map.getBounds();

        return {
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest()
        };
      },
      getCenter: () => {
        const c = map.getCenter();

        return {
          lat: c.lat,
          lng: c.lng
        };
      },
      getZoom: () => map.getZoom(),

      fitBounds: (bounds, options = {}) => {
        map.fitBounds(bounds, {
          padding: [20, 20],
          animate: false,
          ...options
        });
      },

      exportImageDeprecated: async () => {
        return new Promise((resolve, reject) => {
          leafletImage(map, (err, canvas) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(
              canvas.toDataURL("image/png")
            );
          });
        });
      },

      exportImageLeaflet: async () => {

        map.invalidateSize();

        await new Promise(resolve =>
          requestAnimationFrame(resolve)
        );

        return new Promise((resolve, reject) => {

          leafletImage(
            map,
            (err, canvas) => {

              if (err) {
                reject(err);
                return;
              }

              resolve(
                canvas.toDataURL("image/png")
              );
            }
          );

        });
      },

      exportImageAct: async () => {

        map.invalidateSize();

        await new Promise(resolve =>
          requestAnimationFrame(resolve)
        );

        await new Promise(resolve =>
          setTimeout(resolve, 150)
        );

        console.log(
          map.getCenter(),
          map.getZoom(),
          map.getBounds()
        );

        return await toPng(
          mapRef.current,
          {
            cacheBust: true,
            pixelRatio: 2
          }
        );
      },

      exportImage: async () => {

        const map =
          mapInstance.current;

        map.invalidateSize();

        await new Promise(resolve =>
          requestAnimationFrame(resolve)
        );

        await new Promise(resolve =>
          requestAnimationFrame(resolve)
        );

        await new Promise(resolve =>
          setTimeout(resolve, 100)
        );

        return await toPng(
          map.getContainer(),
          {
            cacheBust: true,
            pixelRatio: 2
          }
        );
      }

    });

    return () => map.remove();
  }, []);

  {/* ============================================================ LOAD LAYERS */ }
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    defaultLayers.forEach(loadLayerFromUrl);
  }, []);

  {/* ============================================================ INIT DEFAULT FILTRABLE LAYERS (TILE & VECTOR) */ }
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    Object.entries(layersRef.current).forEach(([id, obj]) => {

      if (obj.type === 'tile') {

        const filtered = applyFilters(obj.raw, filters, obj.filterConfig);

        const tileIndex = geojsonvt(filtered, {
          maxZoom: 18,
          tolerance: 3,
        });

        // Remove layer
        if (map.hasLayer(obj.layer)) {
          map.removeLayer(obj.layer);
        }

        const newLayer = createTileLayer(tileIndex, filtered, obj.style, obj.pane, obj.attribution);
        newLayer.addTo(map);

        obj.layer = newLayer;
        obj.filtered = filtered;

      } else if (obj.type === 'vector') {

        // NO tocar la capa dinámica (ya viene filtrada desde Home)
        if (obj.isDynamic) return;

        const filtered = applyFilters(obj.raw, filters, obj.filterConfig);

        // Remove layer
        if (map.hasLayer(obj.layer)) {
          map.removeLayer(obj.layer);
        }

        const newLayer = createVectorLayer(filtered, {
          style: obj.style,
          cluster: obj.cluster,
          popup: obj.popup,
          pane: obj.safePane || "mediumPane",
        });

        newLayer.addTo(map);

        obj.layer = newLayer;
        obj.filtered = filtered;
      }

    });

  }, [filters]);

  {/* ============================================================ INIT FILTERED DATA */ }
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !data) return;

    if (layersRef.current["dynamic"]) {
      removeLayer("dynamic");
    }

    addLayer("dynamic", data.geojson || null, data.name || 'Datos filtrados', {
      type: "vector", // Dynamic data must be vectorial type
      cluster: data.cluster, // For performance default cluster is true: Clustering on.
      pane: data.pane,
      style: data.style,
      popup: data.popup,
    });

  }, [data]);

  {/* ============================================================ ADD EXTERNAL LAYERS */ }
  useEffect(() => {
    externalLayers.forEach((layer) => {
      if (!layersRef.current[layer.id]) {
        addLayer(layer.id, layer.data, layer.name, {
          style: layer.style,
          zoomLayer: true,
        });
      }
    });
  }, [externalLayers]);

  {/* ============================================================ INIT TILE LAYERS */ }
  /* DEPRECATED CODE: Deprecated because actually merge all layers in a layersRef.current registry */
  /*useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    Object.entries(tileLayersRef.current).forEach(([id, obj]) => {

      const filtered = applyFilters(obj.raw, filters, obj.filterConfig);

      const tileIndex = geojsonvt(filtered, {
        maxZoom: 18,
        tolerance: 3,
      });

      // Remove layer
      if (map.hasLayer(obj.layer)) {
        map.removeLayer(obj.layer);
      }

      if (controlRef.current && controlRef.current._layers) {
        controlRef.current.removeLayer(obj.layer);
      }

      const newLayer = createTileLayer(tileIndex, filtered, obj.style, obj.safePane, obj.attribution);
      newLayer.addTo(map);

      // Registry control again
      controlRef.current.addOverlay(newLayer, obj.name);

      obj.layer = newLayer;
      obj.filtered = filtered;
    });

  }, [filters]);*/

  {/* ============================================================ INIT VECTOR LAYERS */ }
  /* DEPRECATED CODE: Deprecated because actually merge all layers in a layersRef.current registry */
  /*useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    console.log(vectorLayersRef.current)
    Object.entries(vectorLayersRef.current).forEach(([id, obj]) => {

      // NO tocar la capa dinámica (ya viene filtrada desde Home)
      if (obj.isDynamic) return;

      const filtered = applyFilters(obj.raw, filters, obj.filterConfig);

      // remover capa anterior
      map.removeLayer(obj.layer);
      controlRef.current.removeLayer(obj.layer);

      const newLayer = createVectorLayer(filtered, {
        style: obj.style,
        cluster: obj.cluster,
        popup: obj.popup,
        pane: obj.safePane || "mediumPane",
      });

      newLayer.addTo(map);

      controlRef.current.addOverlay(newLayer, obj.name);

      obj.layer = newLayer;
      obj.filtered = filtered;
    });

  }, [filters]);*/

  {/* ============================================================ INTERNAL UTILS */ }
  const loadLayerFromUrl = async (layer) => {
    const res = await fetch(layer.url);
    const geojson = await res.json();

    addLayer(layer.id, geojson, layer.name, layer);
  };

  const addLayer = (id, geojson, name = "Capa", options = {}) => {
    const map = mapInstance.current;
    if (!map || !geojson) return;

    // Reproyección desde EPSG:32717 a EPSG:4326
    if (geojson?.crs?.properties?.name?.includes("32717")) {
      geojson = reprojectGeoJSON(geojson);
    }

    // Validación de existencia de capas
    if (layersRef.current[id]) return;

    const {
      type = "tile",
      style = {},
      cluster = true,
      popup = {},
      filterConfig = {},
      pane = "lowestPane",
      zoomLayer = false,
      attribution = ""
    } = options;

    // Pane validation
    const safePane = map.getPane(pane) ? pane : "lowestPane";

    let layer;
    let bounds;

    if (type === "tile") {
      const tileIndex = geojsonvt(geojson, { maxZoom: 18, tolerance: 3 });

      layer = createTileLayer(tileIndex, geojson, style, safePane, attribution);
      bounds = getGeoJSONBounds(geojson);
    }

    if (type === "vector") {
      layer = createVectorLayer(geojson, { style, cluster, popup, pane: safePane, attribution });
      bounds = layer.getBounds?.() ?? getGeoJSONBounds(geojson);
    }

    layer.addTo(map);

    layersRef.current[id] = {
      id,
      name,
      type,
      layer,
      raw: geojson,
      style,
      popup,
      cluster,
      pane: safePane,
      filterConfig,
      attribution,
      //isDynamic: id === "dynamic",
      bounds
    };

    setLayers((prev) => {
      const exists = prev.find((l) => l.id === id);

      if (exists) {
        return prev.map((l) =>
          l.id === id
            ? {
              ...l,
              name,
              visible: true
            }
            : l
        );
      }

      return [
        ...prev,
        {
          id,
          name,
          visible: true,
          type
        }
      ];
    });

    if (zoomLayer && bounds?.isValid()) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true
      });
    }
  };

  const removeLayer = (id) => {
    const map =
      mapInstance.current;

    const item =
      layersRef.current[id];

    if (!item) return;

    map.removeLayer(item.layer);

    delete layersRef.current[id];

    setLayers((prev) =>
      prev.filter(
        (l) => l.id !== id
      )
    );
  };

  const toggleLayer = (id) => {
    const map =
      mapInstance.current;

    const item =
      layersRef.current[id];

    if (!item) return;

    const visible =
      !map.hasLayer(item.layer);

    if (visible) {
      item.layer.addTo(map);
    } else {
      map.removeLayer(item.layer);
    }

    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
            ...l,
            visible
          }
          : l
      )
    );
  };

  const applyFilters = (geojson, filters, config = {}) => {
    if (!geojson || !geojson.features) return geojson;

    const normalize = (v) => String(v);

    const isEmptyFilter = (f) => {
      return (
        f == null ||
        f === "Todos" ||
        (Array.isArray(f) && f.length === 0)
      );
    };

    const match = (featureValue, filterValue) => {
      if (isEmptyFilter(filterValue)) return true;
      if (featureValue == null) return false;

      // array (multi-select)
      if (Array.isArray(filterValue)) {
        return filterValue.some(
          (v) => normalize(v) === normalize(featureValue)
        );
      }

      // single value
      return normalize(featureValue) === normalize(filterValue);
    };

    const {
      anio,
      mes,
      delimitacion,
      provincia,
      dateFormat
    } = config;

    const filteredFeatures = geojson.features.filter((f) => {
      const p = f.properties;
      if (!p) return false;

      // 🔹 Manejo de fecha (una sola vez)
      let fecha = null;

      if (mes || anio) {
        const rawDate = p[mes] || p[anio];
        fecha = parseDate(rawDate, dateFormat);
      }

      const featureMes = fecha ? codMes(fecha.getMonth() + 1) : null;
      const featureAnio = fecha ? fecha.getFullYear() : null;

      // 🔹 Evaluaciones
      const condiciones = [];

      // Año
      if (anio) {
        condiciones.push(
          match(p[anio], filters.anio) ||
          match(featureAnio, filters.anio)
        );
      }

      // Mes
      if (mes) {
        condiciones.push(
          match(featureMes, filters.mes)
        );
      }

      // Delimitación
      if (delimitacion) {
        condiciones.push(
          match(p[delimitacion], filters.delimitacion)
        );
      }

      // Provincia
      if (provincia) {
        condiciones.push(
          match(p[provincia], filters.provincia)
        );
      }

      return condiciones.every(Boolean);
    });

    return {
      ...geojson,
      features: filteredFeatures
    };
  };

  const changeBasemap = (id) => {
    const map = mapInstance.current;

    Object.values(baseMapsRef.current)
      .forEach((bm) => {
        map.removeLayer(bm.layer);
      });

    const selected = baseMapsRef.current[id];

    if (!selected) return;

    selected.layer.addTo(map);

    setActiveBasemap(id);
  };

  const setLocation = ({ lat, lng, zoom = 14, popup = null }) => {
    const map = mapInstance.current;
    if (!map || lat == null || lng == null) return;

    // remover anterior
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: "#ff3b3b",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
      pane: "highPane",
    });

    if (popup) {
      marker.bindPopup(popup).openPopup();
    }

    marker.addTo(map);

    // Halo visual
    const halo = L.circle([lat, lng], {
      radius: 300, // metros
      color: "#ff3b3b",
      weight: 1,
      fillOpacity: 0.1,
      pane: "mediumPane",
    }).addTo(map);

    // agrupar ambos para poder eliminarlos juntos
    const group = L.layerGroup([marker, halo]);

    map.flyTo([lat, lng], zoom, { duration: 1.2 });

    markerRef.current = group;
  };

  return <>
    <div ref={mapRef} className="w-full h-full w-[500px] h-[500px]" >

      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute bottom-4 left-4 z-[1000] bg-white rounded-full shadow-xl p-2 hover:bg-slate-100 cursor:pointer">
        <Layers />
      </button>

      <div
        className={`
          absolute
          bottom-18
          left-4
          z-[1000]
          bg-white
          rounded-lg
          shadow-lg
          overflow-hidden
          transition-all
          duration-300
          ${collapsed
            ? "w-0 opacity-0"
            : "w-64 opacity-100"
          }
        `}
      >

        <div className="p-2 border-b bg-green-200/20">
          <h3 className="font-semibold flex items-center gap-2">
            <Layers size={16} /> Control de capas
          </h3>
        </div>

        {/* BASEMAPS */}
        <div className="p-3 border-b">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Earth size={16} /> Mapas base
          </h4>

          <div className="space-y-1">
            {Object.values(baseMapsRef.current).map((bm) => (

              <button
                key={bm.name}
                onClick={() =>
                  changeBasemap(bm.name)
                }
                className={`
                  w-full
                  text-left
                  px-3
                  py-1
                  rounded
                  transition
                  ${activeBasemap === bm.name
                    ? "bg-green-600 text-white"
                    : "hover:bg-slate-100"
                  }
                `}
              >
                {bm.name}
              </button>

            ))}
          </div>
        </div>

        {/* DATA LAYERS */}
        <div className="p-3">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Database size={16} /> Layers
          </h4>

          <div className="max-h-96 overflow-auto">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="
                  flex
                  items-center
                  justify-between
                  p-1
                  border-b
                  border-dashed
                  border-gray-300
                  hover:bg-slate-50
                ">
                <span className="truncate">
                  {layer.name}
                </span>

                <div className="flex gap-2 items-center">

                  <label className="relative inline-flex cursor-pointer">

                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={layer.visible}
                      onChange={() =>
                        toggleLayer(layer.id)
                      }
                    />

                    <div
                      className="
                        relative
                        w-8
                        h-4
                        rounded-full
                        bg-slate-300
                        transition-colors
                        duration-300
                        peer-checked:bg-blue-600

                        after:content-['']
                        after:absolute
                        after:left-[2px]
                        after:top-[2px]
                        after:h-3
                        after:w-3
                        after:rounded-full
                        after:bg-white
                        after:transition-transform
                        after:duration-300
                        peer-checked:after:translate-x-4
                      "
                    />

                  </label>

                  <button
                    onClick={() =>
                      removeLayer(layer.id)
                    }
                    className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer">
                    <X size={16} />
                  </button>

                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  </>;
}

{/* ============================================================ FUNCTIONS */ }

function createTileLayer(tileIndex, geojson, style, pane, attribution) {
  const layer = L.gridLayer({
    tileSize: 256,
    pane: pane,
    attribution: attribution,
  });

  layer.createTile = function (coords) {
    const canvas = document.createElement("canvas");
    const size = this.getTileSize();

    canvas.width = size.x;
    canvas.height = size.y;

    const ctx = canvas.getContext("2d");
    const data = tileIndex.getTile(coords.z, coords.x, coords.y);

    if (data) {
      data.features.forEach((f) => {
        drawFeature(ctx, f, style);
      });
    }

    return canvas;
  };

  return layer;
}

function createVectorLayer(geojson, { style = {}, cluster = false, popup = {}, pane = 'mediumPane', attribution = "" }) {
  const geoLayer = L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: style.radius || 6,
        fillColor: style.fill || "orange",
        color: style.stroke || "#ba2e2e",
        weight: 1,
        fillOpacity: 1
      });
    },

    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};

      const content = popup.fields.map(key => [key, props[key]])
        .map(([key, value]) => {
          const alias = popup.aliases[key] || key;

          const val = formatValue(value);

          return `<tr class="trtable">
              <td style="font-weight:semibold; padding:6px;" class="tdalias">${alias}:</td>
              <td style="font-weight:lighter; padding:6px;" class="tdvalues">${val}</td>
            </tr>`;
        })
        .join("");

      layer.bindPopup(`
        <div style="max-height:300px; overflow-y:auto;">
          <table>${content}</table>
        </div>
      `);
    },

    pane: pane,
    attribution: attribution,
  });

  if (!cluster) return geoLayer;

  const clusterLayer = L.markerClusterGroup();

  geoLayer.eachLayer(layer => {
    clusterLayer.addLayer(layer);
  });

  return clusterLayer;
}

function drawFeature(ctx, feature, style) {
  const type = feature.type;

  ctx.strokeStyle = style.stroke || "red";
  ctx.fillStyle = style.fill || "rgba(255,0,0,0.3)";
  ctx.lineWidth = style.width || 1;

  // Polígonos
  if (type === 3) {
    ctx.beginPath();

    feature.geometry.forEach((ring) => {
      ring.forEach((p, i) => {
        const x = (p[0] / 4096) * 256;
        const y = (p[1] / 4096) * 256;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
    });

    ctx.fill();
    ctx.stroke();
  }

  // Líneas
  if (type === 2) {
    ctx.beginPath();

    feature.geometry.forEach((line) => {
      line.forEach((p, i) => {
        const x = (p[0] / 4096) * 256;
        const y = (p[1] / 4096) * 256;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
    });

    ctx.stroke();
  }

  // Puntos
  if (type === 1) {
    feature.geometry.forEach((p) => {
      const x = (p[0] / 4096) * 256;
      const y = (p[1] / 4096) * 256;

      ctx.beginPath();
      ctx.arc(x, y, style.radius || 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
}

function reprojectGeoJSON(geojson) {
  const transform = (coords) => {
    const [x, y] = coords;
    const [lon, lat] = proj4("EPSG:32717", "EPSG:4326", [x, y]);
    return [lon, lat];
  };

  const recurse = (coords) => {
    if (typeof coords[0] === "number") return transform(coords);
    return coords.map(recurse);
  };

  geojson.features.forEach((f) => {
    f.geometry.coordinates = recurse(f.geometry.coordinates);
  });

  return geojson;
}

function getGeoJSONBounds(geojson) {
  const bounds = L.latLngBounds();

  function visit(coords) {
    if (typeof coords[0] === "number") {
      bounds.extend([coords[1], coords[0]]);
      return;
    }

    coords.forEach(visit);
  }

  geojson.features.forEach((f) => {
    visit(f.geometry.coordinates);
  });

  return bounds;
}