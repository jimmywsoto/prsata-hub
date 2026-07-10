import { DATA_FILTERS } from "../data/dataFilters";
import { defaultPalette } from "../config/palette.config";

{/* ============================================================ FUNCTION: Group data by field. Returning data, labels and values for a categorized resume. */ }
export function agruparPorCampo(fulldata, campo) {
  const conteo = new Map();

  for (const f of fulldata.features) {
    const valor = f?.properties?.[campo] ?? "Sin dato";
    conteo.set(valor, (conteo.get(valor) || 0) + 1);
  }

  const data = Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]);

  const labels = data.map(([label]) => label);
  const values = data.map(([_, count]) => count);

  return { data, labels, values };
}

{/* ============================================================ FUNCTION: Group data by two fields. Returning data, labels and values for a categorized resume. */ }
export function agruparPorDosCampos(features, campo1, campo2) {
    const conteo = new Map();
    const setCampo1 = new Set();
    const setCampo2 = new Set();

    for (const f of features) {
        const val1 = f?.properties?.[campo1] ?? "Sin dato";
        const val2 = f?.properties?.[campo2] ?? "Sin dato";

        setCampo1.add(val1);
        setCampo2.add(val2);

        if (!conteo.has(val1)) {
            conteo.set(val1, new Map());
        }

        const subMap = conteo.get(val1);
        subMap.set(val2, (subMap.get(val2) || 0) + 1);
    }

    const labelsCampo1 = Array.from(setCampo1).sort();
    const labelsCampo2 = Array.from(setCampo2).sort();

    // Convertir Map anidado a objeto plano para compatibilidad con heatmap
    const conteoPlano = {};
    for (const val1 of labelsCampo1) {
        conteoPlano[val1] = {};
        const subMap = conteo.get(val1) || new Map();
        for (const val2 of labelsCampo2) {
            conteoPlano[val1][val2] = subMap.get(val2) || 0;
        }
    }

    return {
        conteo: conteoPlano,
        labelsCampo1,
        labelsCampo2,
    };
}



/* ========================================================= */
/* AGRUPAR PARA STACKED BAR CHART */
/*
Salida requerida:

{
  labels: [...],
  datasets: [
    {
      label: "Categoría",
      data: [...]
    }
  ]
}
*/
/* ========================================================= */

export function agruparParaStackedBar(
  features,
  campoX,
  campoCategoria,
  options = {}
) {
  const {
    campoXEsFecha = false,
    usarMes = false,
    dateFormat = null,
    ordenarLabels = true,
  } = options;

  const conteo = new Map();
  const labelsSet = new Set();
  const categoriasSet = new Set();


  const ORDEN_MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  for (const f of features) {
    const props = f?.properties || {};

    /* ========================= */
    /* EJE X */
    /* ========================= */
    let rawX = props[campoX] ?? "Sin dato";
    let labelX = rawX;

    if (campoXEsFecha) {
      const fecha = parseDate(rawX, dateFormat);

      if (fecha && !isNaN(fecha)) {
        if (usarMes) {
          labelX = codMes(fecha.getMonth() + 1);
        } else {
          labelX = fecha.getFullYear();
        }
      }
    }

    /* ========================= */
    /* CATEGORÍA */
    /* ========================= */
    const categoria =
      props[campoCategoria] ?? "Sin dato";

    labelsSet.add(labelX);
    categoriasSet.add(categoria);

    if (!conteo.has(categoria)) {
      conteo.set(categoria, new Map());
    }

    const subMap = conteo.get(categoria);

    subMap.set(
      labelX,
      (subMap.get(labelX) || 0) + 1
    );
  }

  /* ========================= */
  /* ORDEN LABELS */
  /* ========================= */
  /*let labels = Array.from(labelsSet);

  if (ordenarLabels) {
    labels.sort((a, b) => {
      if (!isNaN(a) && !isNaN(b)) {
        return Number(a) - Number(b);
      }

      return String(a).localeCompare(String(b));
    });
  }*/

    let labels = Array.from(labelsSet);

if (ordenarLabels) {

    if (usarMes) {

        labels.sort(
            (a, b) =>
                ORDEN_MESES.indexOf(a) -
                ORDEN_MESES.indexOf(b)
        );

    } else {

        labels.sort((a, b) => {

            if (!isNaN(a) && !isNaN(b)) {
                return Number(a) - Number(b);
            }

            return String(a).localeCompare(String(b));

        });

    }

}

  /* ========================= */
  /* DATASETS */
  /* ========================= */
  const categorias = Array.from(categoriasSet).sort();

  const datasets = categorias.map((categoria) => {
    const subMap = conteo.get(categoria);

    return {
      label: categoria,
      data: labels.map(
        (label) => subMap.get(label) || 0
      ),
    };
  });

  return {
    labels,
    datasets,
  };
}

export function buildLineChartData(
  data,
  {
    label = "Serie",
    sortLabels = true,
    parseAsDate = false,
    fill = false,
    tension = 0.3,
  } = {}
) {
  if (!Array.isArray(data)) {
    return {
      labels: [],
      datasets: [],
    };
  }

  let processed = [...data];

  /* =========================================================
     ORDENAMIENTO
  ========================================================= */
  if (sortLabels) {
    processed.sort((a, b) => {
      const labelA = a[0];
      const labelB = b[0];

      if (parseAsDate) {
        return new Date(labelA) - new Date(labelB);
      }

      if (!isNaN(labelA) && !isNaN(labelB)) {
        return Number(labelA) - Number(labelB);
      }

      return String(labelA).localeCompare(String(labelB));
    });
  }

  /* =========================================================
     ESTRUCTURA
  ========================================================= */
  return {
    labels: processed.map(([key]) => key),
    datasets: [
      {
        label,
        data: processed.map(([, value]) => value),
        fill,
        tension,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
}

{/* ============================================================ FUNCTION: Replace coded month (1 -12) to corresponding month name. */ }
export function codMes(numero) {
  const meses = DATA_FILTERS.mes;

  if (numero < 1 || numero > 12) {
    return "Todos";
  }
  return meses[numero - 1];
};

{/* ============================================================ FUNCTION: Format Value to apply in popups content. If null return "-". If Date return Formated Date */ }
export function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  // Typeof Date
  if (typeof value === "string" && !isNaN(Date.parse(value))) {
    const d = new Date(value);
    return d.toLocaleDateString();
  }

  return value;
}

{/* ============================================================ FUNCTION: Parsing Date */ }
export const parseDate = (value, format) => {
  if (!value) return null;

  if (format === "D/M/YYYY") {
    const [d, m, y] = value.split("/").map(Number);
    return new Date(y, m - 1, d);
  }

  return new Date(value); // fallback ISO
};

{/* ============================================================ FUNCTION: Single Group by field */ }
export function singleGroupBy(source, campo) {
    console.log(source)
    const conteo = new Map();
    const features = source?.features || [];

    for (const f of features) {
        const val = f?.properties?.[campo] ?? "Sin dato";
        conteo.set(val, (conteo.get(val) || 0) + 1);
    }

    return Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]);
}

{/* ============================================================ FUNCTION: Multiple Group by field */ }
export function multiGroupBy(source, campo) {
    const conteo = new Map();
    const features = source?.features || [];

    const normalize = (v) => String(v).trim();

    for (const f of features) {
        let val = f?.properties?.[campo];

        // Sin dato
        if (
            val === null ||
            val === undefined ||
            val === ""
        ) {
            val = ["Sin dato"];
        }

        // Si ya viene como array
        else if (Array.isArray(val)) {
            val = val;
        }

        // Si viene como texto separado
        else if (typeof val === "string" && (val.includes(",") || val.includes(";"))) {
            val = val.split(/[,;]+/);
        }

        // Valor único
        else {
            val = [val];
        }

        // Contabilizar cada valor
        for (const item of val) {
            const cleanVal = normalize(item || "Sin dato");

            conteo.set(
                cleanVal,
                (conteo.get(cleanVal) || 0) + 1
            );
        }
    }

    return Array.from(conteo.entries())
        .sort((a, b) => b[1] - a[1]);
}

{/* ============================================================ FUNCTION: Applying filters on data */ }
export const applyFilters = (geojson, filters, config = {}) => {
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

{/* ============================================================ FUNCTION: Generate gradient color palette */ }
export function generateGradientColors(startColor, endColor, steps) {

  if(!startColor || !endColor || !steps) return;
  
    // Convierte HEX a RGB
    const hexToRgb = (hex) => {
        const cleanHex = hex.replace("#", "");
        return {
            r: parseInt(cleanHex.substring(0, 2), 16),
            g: parseInt(cleanHex.substring(2, 4), 16),
            b: parseInt(cleanHex.substring(4, 6), 16),
        };
    };

    // Convierte RGB a HEX
    const rgbToHex = (r, g, b) => {
        return (
            "#" +
            [r, g, b]
                .map((value) =>
                    Math.round(value).toString(16).padStart(2, "0")
                )
                .join("")
        );
    };

    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);

    return Array.from({ length: steps }, (_, i) => {
        const factor = i / (steps - 1);

        const r = start.r + factor * (end.r - start.r);
        const g = start.g + factor * (end.g - start.g);
        const b = start.b + factor * (end.b - start.b);

        return rgbToHex(r, g, b);
    });
}

export function generateRandomColors(count) {
    const getRandomColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        return (
            "#" +
            [r, g, b]
                .map((v) => v.toString(16).padStart(2, "0"))
                .join("")
        );
    };

    return Array.from({ length: count }, () => getRandomColor());
}

// ======================================================
// Versión con mejor distribución visual (HSL)
// evita colores muy oscuros o muy claros
// ======================================================

export function generateRandomColorsHSL(count, saturation = 65, lightness = 55) {
    return Array.from({ length: count }, (_, i) => {
        const hue = Math.floor((360 / count) * i + Math.random() * 20);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
}

export function orderChartDataByConfigPalette(labels, values, configCategorized) {
  if (!configCategorized) {
    return { labels, values, colors: defaultPalette || [] };
  }

  const categoryOrder = Object.keys(configCategorized);

  const ordered = categoryOrder
    .map(category => {
      const index = labels.indexOf(category);

      if (index !== -1) {
        return {
          label: labels[index],
          value: values[index],
          color: configCategorized[category]
        };
      }

      return null;
    })
    .filter(Boolean);

  return {
    labels: ordered.map(item => item.label),
    values: ordered.map(item => item.value),
    colors: ordered.map(item => item.color)
  };
}

export function generateColors(count, configPalette, categorizedColors) {
  let palette = [];

  switch (configPalette?.palette) {
    case 'randomPalette':
      palette = generateRandomColorsHSL(count);
      break;

    case 'gradientPalette':
      if ( !configPalette.gradientPalette ) return defaultPalette;

      palette = generateGradientColors(configPalette.gradientPalette[0], configPalette?.gradientPalette[1], count);
      break;

    case 'customPalette':
      palette = configPalette.customPalette || defaultPalette;
      break;

    case 'categorizedPalette':
      palette = categorizedColors;
      break;

    default:
      palette = defaultPalette
  }

  return Array.from({ length: count }, (_, i) =>
    palette[i % palette.length]
  );
}