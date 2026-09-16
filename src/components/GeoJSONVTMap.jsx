{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    UPDATED AT: September, 2026
    VERSIÓN: 2.1.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import geojsonvt from "geojson-vt";
import proj4 from "proj4";
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
import LayerControl from "./LayerControl";
import WMSFeatureInfo from "./WMSFeatureInfo";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function GeoJSONVTMap({
  baseMapsConfig,
  wmsLayersConfig,
  panesConfig,
  data,
  defaultLayers = [],
  externalLayers = [],
  filters = {},
  onMapReady = () => { },
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

  const [featureInfo, setFeatureInfo] = useState([]);
  const [featureInfoLoading, setFeatureInfoLoading] = useState(false);
  const [featureInfoError, setFeatureInfoError] = useState(null);
  const [featureInfoOpen, setFeatureInfoOpen] = useState(false);

  const featureInfoAbortControllerRef = useRef(null);

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

    // Here 001
    // ============================================================
    // WMS GETFEATUREINFO
    // ============================================================

    map.on("click", handleMapClick);


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

    //return () => map.remove();

    return () => {

      map.off("click", handleMapClick);

      if (
        featureInfoAbortControllerRef.current
      ) {
        featureInfoAbortControllerRef.current.abort();
        featureInfoAbortControllerRef.current = null;
      }

      map.remove();
    };

  }, []);

  {/* ============================================================ LOAD WMS LAYERS */ }
  useEffect(() => {

    const map = mapInstance.current;

    if (!map || !wmsLayersConfig?.length) return;

    wmsLayersConfig.forEach(addWMSLayer); // Si sucede un error, mover a (Here 001)

  }, [wmsLayersConfig]);

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

  {/* ============================================================ INTERNAL UTILS */ }
  const loadLayerFromUrl = async (layer) => {
    const res = await fetch(layer.url);
    const geojson = await res.json();

    //addLayer(layer.id, geojson, layer.name, layer); //INIT VERSION
    addLayer(layer.id, geojson, layer.name, layer, filters);
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
      attribution = "",
    } = options;

    // Pane validation
    const safePane = map.getPane(pane) ? pane : "lowestPane";

    let layer;
    let bounds;

    // Aplicar filtros iniciales
    const filteredGeoJSON = applyFilters(
      geojson,
      filters,
      filterConfig
    );

    if (type === "tile") {

      const tileIndex = geojsonvt(filteredGeoJSON, { maxZoom: 18, tolerance: 3 });

      layer = createTileLayer(tileIndex, geojson, style, safePane, attribution);
      bounds = getGeoJSONBounds(filteredGeoJSON);
    }

    if (type === "vector") {
      layer = createVectorLayer(filteredGeoJSON, { style, cluster, popup, pane: safePane, attribution });
      bounds = layer.getBounds?.() ?? getGeoJSONBounds(filteredGeoJSON);
    }

    layer.addTo(map);

    layersRef.current[id] = {
      id,
      name,
      type,
      layer,
      raw: geojson,
      filtered: filteredGeoJSON,
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
              visible: true,
              style,
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
          style,
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

  const addWMSLayer = (config) => {

    const map = mapInstance.current;

    if (!map) return;

    if (layersRef.current[config.id]) return;

    const {
      id,
      name = "WMS",
      url,
      layers,
      format = "image/png",
      transparent = true,
      version = "1.3.0",
      opacity = 1,
      pane = "lowestPane",
      attribution = "",
      visible = true,

      // ========================================================
      // GetFeatureInfo
      // ========================================================
      queryable = false,
      infoFormat = "application/json",
      crs = "EPSG:3857",
      featureCount = 20



    } = config;

    if (!url || !layers) {
      console.warn(`Configuración WMS inválida: ${id}`);
      return;
    }

    const safePane = map.getPane(pane)
      ? pane
      : "lowestPane";

    const layer = L.tileLayer.wms(url, {
      layers,
      format,
      transparent,
      version,
      opacity,
      pane: safePane,
      attribution
    });

    if (visible) {
      layer.addTo(map);
    }

    layersRef.current[id] = {
      id,
      name,
      type: "wms",
      layer,
      visible,
      pane: safePane,
      opacity,
      // GetFeatureInfo
      queryable,
      infoFormat,
      crs,
      featureCount,
      config
    };

    setLayers(prev => [
      ...prev,
      {
        id,
        name,
        type: "wms",
        visible
      }
    ]);
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

  // ================================================= GETFEATUREINFO FUNCTIONS
  const getFeatureInfoUrl = (map, layerConfig, latlng) => {
    const version = layerConfig.version || "1.3.0";
    const infoFormat = layerConfig.infoFormat || "application/json";

    // ------------------------------------------------------------
    // Punto del clic en coordenadas de pantalla
    // ------------------------------------------------------------
    const point = map.latLngToContainerPoint(latlng);

    const size = map.getSize();

    // ------------------------------------------------------------
    // BBOX en el CRS utilizado por Leaflet
    // Leaflet utiliza EPSG:3857 por defecto
    // ------------------------------------------------------------
    const bounds = map.getBounds();
    const crs = map.options.crs;

    const southWest = crs.project(bounds.getSouthWest());
    const northEast = crs.project(bounds.getNorthEast());

    const bbox = [
      southWest.x,
      southWest.y,
      northEast.x,
      northEast.y
    ].join(",");

    // ------------------------------------------------------------
    // Parámetros base WMS GetFeatureInfo
    // ------------------------------------------------------------
    const params = new URLSearchParams({
      SERVICE: "WMS",
      VERSION: version,
      REQUEST: "GetFeatureInfo",

      LAYERS: layerConfig.layers,
      QUERY_LAYERS: layerConfig.layers,

      INFO_FORMAT: infoFormat,

      BBOX: bbox,
      WIDTH: Math.round(size.x),
      HEIGHT: Math.round(size.y),

      FEATURE_COUNT: String(
        layerConfig.featureCount || 20
      )
    });

    // ------------------------------------------------------------
    // WMS 1.3.0
    // ------------------------------------------------------------
    if (version === "1.3.0") {

      params.set(
        "CRS",
        layerConfig.crs || "EPSG:3857"
      );

      params.set(
        "I",
        String(Math.round(point.x))
      );

      params.set(
        "J",
        String(Math.round(point.y))
      );

    } else {

      // --------------------------------------------------------
      // WMS 1.1.1
      // --------------------------------------------------------
      params.set(
        "SRS",
        layerConfig.crs || "EPSG:3857"
      );

      params.set(
        "X",
        String(Math.round(point.x))
      );

      params.set(
        "Y",
        String(Math.round(point.y))
      );
    }

    return `${layerConfig.url}?${params.toString()}`;
  };

  const handleMapClick = async (e) => {
    const map = mapInstance.current;

    if (!map) return;

    /*
     * ============================================================
     * BUSCAR WMS VISIBLES Y CONSULTABLES
     * ============================================================
     */

    const queryableLayers = Object.values(
      layersRef.current
    ).filter((item) => {

      if (item.type !== "wms") {
        return false;
      }

      if (!item.queryable) {
        return false;
      }

      return map.hasLayer(item.layer);
    });

    const queryableLayersParcialNOfuncionaBien = Object.values(layersRef.current).filter(
        (item) =>
            item.type === "wms" &&
            item.queryable
    );

    /*
     * No existen capas consultables
     */

    if (queryableLayers.length === 0) {
      return;
    }


    /*
     * ============================================================
     * CANCELAR CONSULTA ANTERIOR
     * ============================================================
     */

    if (featureInfoAbortControllerRef.current) {
      featureInfoAbortControllerRef.current.abort();
    }

    const controller = new AbortController();

    featureInfoAbortControllerRef.current = controller;

    /*
     * ============================================================
     * LIMPIAR RESULTADO ANTERIOR
     * ============================================================
     */

    setFeatureInfoOpen(true);
    setFeatureInfo([]);
    setFeatureInfoError(null);
    setFeatureInfoLoading(true);

    try {
      /*
       * ==========================================================
       * CONSULTAS EN PARALELO
       * ==========================================================
       */

      const results = await Promise.all(
        queryableLayers.map(async (item) => {
          const config = item.config;

          const url = getFeatureInfoUrl(
            map,
            config,
            e.latlng
          );

          try {
            const response = await fetch(url, {
              method: "GET",
              signal: controller.signal,
              headers: {
                Accept:
                  config.infoFormat === "text/html"
                    ? "text/html,application/json"
                    : "application/json,text/plain,text/html",
              },
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}`
              );
            }

            const contentType =
              response.headers.get(
                "content-type"
              ) || "";

            const text =
              await response.text();

            return {
              item,
              config,
              contentType,
              text,
              error: null,
            };

          } catch (error) {

            if (
              error.name === "AbortError"
            ) {
              throw error;
            }

            console.error(
              `Error GetFeatureInfo [${item.name}]`,
              error
            );

            return {
              item,
              config,
              contentType: "",
              text: "",
              error,
            };
          }
        })
      );

      /*
       * ==========================================================
       * VERIFICAR CANCELACIÓN
       * ==========================================================
       */

      if (controller.signal.aborted) {
        return;
      }

      /*
       * ==========================================================
       * CONVERTIR RESPUESTAS
       * ==========================================================
       */

      const parsedResults = results
        .map((result) => {

          if (
            result.error ||
            !result.text?.trim()
          ) {
            return null;
          }

          const parsed =
            parseFeatureInfoResponse(
              result.text,
              result.contentType
            );

          if (!parsed) {
            return null;
          }

          /*
           * JSON / GeoJSON
           */

          if (
            parsed.type ===
            "FeatureCollection"
          ) {
            if (
              !parsed.features?.length
            ) {
              return null;
            }

            return {
              layerId: result.item.id,
              layerName: result.item.name,
              type: "features",
              features: parsed.features,
            };
          }

          /*
           * HTML
           */

          if (parsed.type === "html") {
            return {
              layerId: result.item.id,
              layerName: result.item.name,
              type: "html",
              html: parsed.html,
              features: [],
            };
          }

          /*
           * Texto
           */

          if (parsed.type === "text") {
            return {
              layerId: result.item.id,
              layerName: result.item.name,
              type: "text",
              text: parsed.text,
              features: [],
            };
          }

          return null;
        })
        .filter(Boolean);

      /*
       * ==========================================================
       * ACTUALIZAR COMPONENTE
       * ==========================================================
       */

      setFeatureInfo(parsedResults);
      setFeatureInfoLoading(false);
      setFeatureInfoError(null);
      setFeatureInfoOpen(true);

    } catch (error) {

      if (error.name === "AbortError") {
        return;
      }

      console.error("Error consultando información WMS:", error);

      setFeatureInfo([]);
      setFeatureInfoLoading(false);
      setFeatureInfoError(
        error.message || "No fue posible obtener la información WMS."
      );
      setFeatureInfoOpen(true);

    } finally {

      if (!controller.signal.aborted) {
        setFeatureInfoLoading(false);
      }

    }
  };

  const parseFeatureInfoResponse = (
    text,
    contentType = ""
  ) => {
    if (!text?.trim()) {
      return null;
    }

    /*
     * ============================================================
     * JSON / GEOJSON
     * ============================================================
     */

    if (
      contentType.includes("application/json") ||
      contentType.includes("geo+json") ||
      contentType.includes("json")
    ) {
      try {
        const data = JSON.parse(text);

        /*
         * GeoJSON FeatureCollection
         */
        if (Array.isArray(data.features)) {
          return {
            type: "FeatureCollection",
            features: data.features.map((feature) => ({
              type: "Feature",
              geometry: feature.geometry || null,
              properties: feature.properties || {},
            })),
          };
        }

        /*
         * Feature individual
         */
        if (
          data.type === "Feature" &&
          data.properties
        ) {
          return {
            type: "FeatureCollection",
            features: [data],
          };
        }

        /*
         * JSON genérico
         */
        if (
          data &&
          typeof data === "object" &&
          !Array.isArray(data)
        ) {
          return {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: null,
                properties: data,
              },
            ],
          };
        }
      } catch (error) {
        console.warn(
          "No se pudo interpretar la respuesta JSON:",
          error
        );
      }
    }

    /*
     * ============================================================
     * HTML
     * ============================================================
     *
     * Lo conservamos como contenido especial.
     */

    if (
      contentType.includes("text/html") ||
      text.trim().startsWith("<")
    ) {
      return {
        type: "html",
        html: sanitizeFeatureInfoHtml(text),
      };
    }

    /*
     * ============================================================
     * TEXTO
     * ============================================================
     */

    if (text.trim()) {
      return {
        type: "text",
        text: text.trim(),
      };
    }

    return null;
  };

  const sanitizeFeatureInfoHtml = (html) => {

    const parser = new DOMParser();

    const doc = parser.parseFromString(
      html,
      "text/html"
    );

    // Eliminar elementos potencialmente peligrosos
    doc.querySelectorAll(
      "script, iframe, object, embed, form, style"
    ).forEach((element) => {
      element.remove();
    });

    // Eliminar atributos de eventos:
    // onclick, onload, onerror, etc.
    doc.querySelectorAll("*").forEach((element) => {

      [...element.attributes].forEach((attribute) => {

        if (
          attribute.name.toLowerCase()
            .startsWith("on")
        ) {
          element.removeAttribute(
            attribute.name
          );
        }

        if (
          attribute.name.toLowerCase() ===
          "href"
        ) {

          const value =
            attribute.value
              .trim()
              .toLowerCase();

          if (
            value.startsWith("javascript:")
          ) {
            element.removeAttribute(
              attribute.name
            );
          }
        }
      });
    });

    return `
        <div style="
            font-size:12px;
            max-width:390px;
            overflow-x:auto;
        ">
            ${doc.body.innerHTML}
        </div>
    `;
  };

  return <>
    <div ref={mapRef} className="w-full h-full w-[500px] h-[500px]" >

      <LayerControl
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        baseMaps={Object.values(baseMapsRef.current)}
        activeBasemap={activeBasemap}
        onBasemapChange={changeBasemap}
        layers={layers}
        onToggleLayer={toggleLayer}
        onRemoveLayer={removeLayer}
      />

      <WMSFeatureInfo
        open={featureInfoOpen}
        results={featureInfo}
        loading={featureInfoLoading}
        error={featureInfoError}
        onClose={() => {
          setFeatureInfoOpen(false);
          setFeatureInfo([]);
          setFeatureInfoError(null);
          setFeatureInfoLoading(false);
        }}
      />

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
