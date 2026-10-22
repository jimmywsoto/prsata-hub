export const META = {
    developer: 'Ing. Jimmy W. Cabrera Soto',
    authority: 'SISTEMA NACIONAL DE MONITOREO DE BOSQUES',
    projectAliase: 'PR-SATA',
    projectDesc: 'Plataforma de Reportes de Alertas Tempranas por Deforestación',
    copyright: '© 2026 PR-SATA Plataforma de Reportes de Alertas SATA v2.1.1 | Ministerio de Ambiente y Energía',
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
  ano: "Año de registro",
  area: "Área (ha)",
  fm_cod: "ID. Ficha",
  fm_este: "Coord. X (m)",
  fm_norte: "Coord. Y (m)",
  fm_date1: "Monitoreo 1",
  fm_date2: "Monitoreo 2",
  fm_mntr: "Periodo Monitoreo",
  fm_sensor1: "Fuente 1",
  fm_sensor2: "Fuente 2",
  fm_resol1: "Resolución 1",
  fm_resol2: "Resolución 2",
};

export const VISIBLE_FIELDS = {
  basic: [
    "cod",
    "DPA_DESPRO",
    "DPA_DESCAN",
    "DPA_DESPAR",
    "delimitaci",
    "name",
    "severidad",
    "fin",
  ],
  extended: [
    "fm_cod",
    "cod",
    "DPA_DESPRO",
    "DPA_DESCAN",
    "DPA_DESPAR",
    "delimitaci",
    "name",
    "area",
    "ano",
    "fm_este",
    "fm_norte",
    "fm_date1",
    "fm_sensor1",
    "fm_resol1",
    "fm_date2",
    "fm_sensor2",
    "fm_resol2",
    "fm_mntr",
    "fm_story"
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
    compacted: 'Dashboard Alertas'
  },

  "/registro": {
    extended: 'PR-SATA | Registro de Alertas Tempranas por Deforestación',
    compacted: 'Dashboard Registro'
  },

  "/seguimiento": {
    extended: 'PR-SATA | Seguimiento de Atención a Alertas Tempranas',
    compacted: 'Dashboard Seguimiento'
  },

  "/fichas": {
    extended: 'PR-SATA | Dashboard de Fichas de Monitoreo Satelital',
    compacted: 'Dashboard Fichas'
  },

  "/fichas-monitoreo": {
    extended: 'PR-SATA | Fichas de Monitoreo Satelital',
    compacted: 'Fichas Monitoreo'
  },

  "/report": {
    extended: 'PR-SATA | Generador de Reportes de Alertas Tempranas por Deforestación',
    compacted: 'Reportes'
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
    compacted: 'Contraseña'
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
    extended: 'PR-SATA | Visor Satelital Planet',
    compacted: 'Visor Satelital'
  }
}
