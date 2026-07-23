export const META = {
    developer: 'Ing. Jimmy W. Cabrera Soto',
    authority: 'SISTEMA NACIONAL DE MONITOREO DE BOSQUES',
    projectAliase: 'PR-SATA',
    projectDesc: 'Plataforma de Reportes de Alertas Tempranas por Deforestación',
    copyright: '© 2026 PR-SATA Plataforma de Reportes de Alertas SATA v2.0 | Ministerio de Ambiente y Energía',
    logo: "/Logo-MAE.png"
}

export const FIELD_ALIASES = {
  DPA_DESPRO: "Provincia",
  DPA_DESCAN: "Cantón",
  DPA_DESPAR: "Parroquia",
  cod: "ID. SATA",
  delimitaci: "Delimitación",
  name: "Nombre Delimitación",
  severidad: "Severidad",
  fin: "Registro",
  fm_area: "Área (ha)",
  fm_este: "Coord. X (m)",
  fm_norte: "Coord. Y (m)",
  fm_date1: "Monitoreo 1",
  fm_date2: "Monitoreo 2",
  fm_monit: "Periodo monitoreo",
  PROVINCIA: "Provincia",
  CANTÓN: "Cantón",
  PARROQUIA: "Parroquia",
  CÓDIGO: "ID. SATA",
  DELIMITACI: "Delimitación",
  NAME: "Nombre Delimitación",
  SEVERIDAD: "Severidad",
  FECHA_FIN: "Registro",
  TIPO_DE_AC: "Tipo de Acción",
  ESTADO_PRO: "Estado del Proceso",
  DESCRIPCIO: "Descripción"
};

export const VISIBLE_FIELDS = {
  basic: [
    "DPA_DESPRO",
    "DPA_DESCAN",
    "DPA_DESPAR",
    "cod",
    "delimitaci",
    "name",
    "severidad",
    "fin",
  ],
  extended: [
    "DPA_DESPRO",
    "DPA_DESCAN",
    "DPA_DESPAR",
    "cod",
    "delimitaci",
    "name",
    "fm_area",
    "fm_este",
    "fm_norte",
    "fm_date1",
    "fm_date2",
    "fm_monit"
  ],
  alternative: [
    "PROVINCIA",
    "CANTÓN",
    "PARROQUIA",
    "CÓDIGO",
    "DELIMITACI",
    "NAME",
    "SEVERIDAD",
    "TIPO_DE_AC",
    "ESTADO_PRO",
    "DESCRIPCIO",
    "FECHA_FIN"
  ],
};

export const NAVBAR_TITLES = {
  "/": {
    extended: 'PR-SATA | Plataforma de Reportes de Alertas Tempranas por Deforestación',
    compacted: 'PR-SATA'
  },

  "/dashboard": {
    extended: 'PR-SATA | Dashboard de Alertas Tempranas por Deforestación',
    compacted: 'Dashboard'
  },

  "/registro": {
    extended: 'PR-SATA | Registro de Alertas Tempranas por Deforestación',
    compacted: 'Registro Alertas'
  },

  "/seguimiento": {
    extended: 'PR-SATA | Seguimiento de Atención a Alertas Tempranas',
    compacted: 'Seguimiento Alertas'
  },

  "/fichas": {
    extended: 'PR-SATA | Dashboard de Fichas de Monitoreo Satelital',
    compacted: 'Fichas Monitoreo'
  },

  "/report": {
    extended: 'PR-SATA | Generador de Reportes de Alertas Tempranas por Deforestación',
    compacted: 'Generador Reportes'
  },

  "/login": {
    extended: 'PR-SATA | Plataforma de Reportes de Alertas Tempranas por Deforestación',
    compacted: 'Login'
  },

  "/profile": {
    extended: 'PR-SATA | Configuración de Perfil',
    compacted: 'Perfil'
  },

  "/reset-pass": {
    extended: 'PR-SATA | Configuración de Contraseña',
    compacted: 'Restablecer Contraseña'
  },

  "/access-panel": {
    extended: 'PR-SATA | Panel de Control de Accesos de Usuarios',
    compacted: 'Acceso de Usuarios'
  },

  "/cache-panel": {
    extended: 'PR-SATA | Panel de Control de Basemap Planet',
    compacted: 'Basemaps Planet'
  },

  "/planet-validation-viewer": {
    extended: 'PR-SATA | Visor Satelital PlanetScope',
    compacted: 'Visor Satelital'
  }
}
