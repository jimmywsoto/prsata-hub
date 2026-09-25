import {
    LayoutDashboard,
    ShieldAlert,
    FileText,
    Building2,
    BookOpen,
    ShieldCheck,
    Mail,
    LifeBuoy,
} from "lucide-react";

export const heroConfig = {
    badge: {
        icon: "https://img.icons8.com/?size=80&id=EhW8HfpqG4ZO&format=png&color=000000",
        text: "Sistema Nacional de Monitoreo de Bosques",
    },
    title1: "Monitoreo Inteligente de",
    title2: "Alertas Tempranas",
    text: "Plataforma nacional para el monitoreo, análisis y gestión de alertas tempranas por deforestación en Ecuador, fortaleciendo la toma de decisiones mediante información satelital actualizada y herramientas geoespaciales.",
    tags: ["Cobertura Nacional", "Imágenes Satelitales", "Dashboard"],
    latestAlertsData: {
        text: ["Provincias en Alerta", "Alertas en Agosto de 2026"],
        count: [20, 211],
        img: "/imsat-creation-03.webp",
    },
};

export const contextConfig = {
    title: "Deforestación: Un desafío crítico para Ecuador",
    text: [
        "La deforestación representa uno de los principales desafíos ambientales del Ecuador, afectando directamente la biodiversidad, los recursos hídricos y la estabilidad climática.", 
        "Entre sus principales causas destacan la expansión agrícola y ganadera, el cambio de uso del suelo, la tala ilegal, la extracción no planificada de recursos forestales y el desarrollo de infraestructura sin adecuada planificación territorial.", 
        "Frente a esta problemática, el monitoreo satelital permite identificar patrones de pérdida de bosque, fortalecer estrategias de conservación y respaldar decisiones basadas en evidencia.",
    ],
    img: "/img-deforestacion-01.png",
};

export const capabilitiesConfig = {
    title: "Capacidades Estratégicas",
    text: "Herramientas tecnológicas orientadas a fortalecer el Sistema Nacional de Monitoreo de Bosques y la gestión integral de alertas.",
    sections: [
        {
            title: "Monitoreo Satelital Estratégico",
            description: "Detección, análisis y visualización avanzada de alertas tempranas por deforestación mediante tecnologías geoespaciales y observación satelital.",
            icon: "https://img.icons8.com/?size=100&id=EhW8HfpqG4ZO&format=png&color=000000",
        },
        {
            title: "Gestión Basada en Evidencia",
            description: "Facilita decisiones institucionales oportunas mediante estadísticas, métricas e indicadores territoriales confiables.",
            icon: "https://img.icons8.com/?size=100&id=JSTjjTyjWbTI&format=png&color=000000",
        },
        {
            title: "Conservación y Gobernanza",
            description: "Fortalece políticas forestales, sostenibilidad ambiental y compromisos climáticos nacionales e internacionales.",
            icon: "https://img.icons8.com/?size=100&id=y6lDocNIhe9A&format=png&color=000000",
        },
    ],
};

export const missionConfig = {
    title: "Nuestra Misión: Un monitoreo eficiente",
    text: "Esta plataforma ha sido desarrollada para agilizar la presentación de estadísticas, métricas y mecanismos de seguimiento que permitan identificar oportunamente la generación y atención de alertas satelitales, contribuyendo al fortalecimiento del Sistema Nacional de Monitoreo de Bosques, así como al cumplimiento de compromisos nacionales e internacionales en conservación, cambio climático y manejo sostenible de recursos forestales.",
}

export const footerConfig = {
    title: "PR-SATA",
    subtitle: "Plataforma de Reporte de Alertas Tempranas por Deforestación",
    text: "Plataforma nacional para la gestión, monitoreo y análisis de alertas tempranas por deforestación, permitiendo una respuesta oportuna y el fortalecimiento del control forestal en el Ecuador.",
    links: {
        Plataforma: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                label: "Alertas",
                path: "/registro",
                icon: ShieldAlert,
            },
            {
                label: "Reportes",
                path: "/report",
                icon: FileText,
            },
        ],

        Institucional: [
            {
                label: "Quiénes Somos",
                path: "/about",
                icon: Building2,
                url: "https://snmb.ambiente.gob.ec/snmb/?page_id=474",
                external: true,
            },
        ],

        Recursos: [
            {
                label: "Documentación",
                path: "/documentation",
                icon: BookOpen,
                url: "https://snmb.ambiente.gob.ec/snmb/",
                external: true,
            },
            {
                label: "Políticas",
                path: "/policies",
                icon: ShieldCheck,
                url: "https://snmb.ambiente.gob.ec/snmb/?page_id=374",
                external: true,
            },
            {
                label: "Contacto",
                path: "/contact",
                icon: Mail,
                url: "https://snmb.ambiente.gob.ec/snmb/?page_id=380",
                external: true,
            },
            {
                label: "Soporte",
                path: "/support",
                icon: LifeBuoy,
                url: "mailto:jimmy.cabrera@ambienteyenergia.gob.ec",
                external: true,
            },
        ],
    },
    credits: "© 2026 PR-SATA. Todos los derechos reservados.",
    developed: "Desarrollado por el Sistema Nacional de Monitoreo de Bosques",
}
