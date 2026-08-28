const CARTO_API_KEY = import.meta.env.CARTO_API_KEY || 'NoKey';

export const baseMapsConfig = {
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      attribution: "&copy; OpenStreetMap contributors",
      pane: "lowestPane"
    }
  },
  satellite: {
    name: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      pane: "lowestPane"
    }
  },
  cartoLight: {
    name: "Carto Light",
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
    options: {
      pane: "lowestPane"
    },
    default: true
  },
  cartoDark: {
    name: "Carto Dark",
    url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
    options: {
      pane: "lowestPane"
    }
  }
};
