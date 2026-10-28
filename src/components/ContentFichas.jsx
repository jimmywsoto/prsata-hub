{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    UPDATED AT: October, 2026
    VERSIÓN: 2.1.1
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

{/* -------------------------------------------------------- COMPONENTS */ }
import Loader from "./Loader";

{/* -------------------------------------------------------- AUX FUNCTIONS */ }
const Field = ({ label, value, unit, highlight = true }) => {
    const isEmpty =
        value === null ||
        value === undefined ||
        String(value).trim() === "";

    return (
        <div className="min-w-0 rounded-lg border border-green-700/10 bg-white p-3 transition-colors hover:border-green-700/30">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p
                className={`break-words text-sm font-semibold ${
                    highlight
                        ? "text-emerald-800"
                        : "text-slate-800"
                }`}
            >
                {isEmpty ? (
                    <span className="font-normal italic text-slate-400">
                        No disponible
                    </span>
                ) : (
                    <>
                        {value}
                        {unit && (
                            <span className="ml-1 font-normal text-slate-500">
                                {unit}
                            </span>
                        )}
                    </>
                )}
            </p>
        </div>
    );
};

const Section = ({ title, subtitle, children }) => (
    <section className="overflow-hidden rounded-lg  bg-white shadow-lg">
        <div className="flex items-start gap-3 bg-green-700/10 px-4 py-4 sm:px-5">

            <div className="min-w-0">
                <h2 className="text-sm font-bold text-green-700/80 sm:text-base">
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-1 text-xs text-green-700/60 sm:text-sm">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {children}
        </div>
    </section>
);

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const ContentFichas = ({ content }) => {
    const [pdf, setPdf] = useState("");

    const json = useMemo(() => {
        const feature = content;

        if (!feature || typeof feature !== "object") {
            return null;
        }

        return {
            provincia: feature.DPA_DESPRO,
            canton: feature.DPA_DESCAN,
            parroquia: feature.DPA_DESPAR,
            delimitacion: feature.delimitaci,
            name: feature.name,
            severidad: feature.severidad,
            area: feature.area,
            ano: feature.ano,
            fmCod: feature.fm_cod,
            date1: feature.fm_date1,
            sensor1: feature.fm_sensor1,
            resolucion1: feature.fm_resol1,
            date2: feature.fm_date2,
            sensor2: feature.fm_sensor2,
            resolucion2: feature.fm_resol2,
            cod: feature.cod,
            este: feature.fm_este,
            norte: feature.fm_norte,
            driveId: feature.id_drive,
        };
    }, [content]);

    useEffect(() => {

        if (!json?.driveId) return;

        const goToDrive = () => {
            const id = json.driveId;
            const drive = "https://drive.google.com/drive/folders/" + id + "?usp=drive_link";
            setPdf(drive);
        }

        goToDrive();

    }, [json]);

    if (!json) {
        return <Loader />;
    }

    const severidad = String(json.severidad ?? "")
        .trim()
        .toUpperCase();

    const severityStyles = {
        ALTA: "border-red-200 bg-red-50 text-red-700",
        MEDIA: "border-amber-200 bg-amber-50 text-amber-700",
        BAJA: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };

    const severityClass =
        severityStyles[severidad] ??
        "border-slate-200 bg-slate-50 text-slate-600";

    return (
        <main className="mx-auto w-full max-w-6xl space-y-5 bg-slate-50/70 p-3 sm:p-5 lg:p-4">

            {/* Encabezado */}
            <header className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 p-5 text-white shadow-lg sm:p-7">
                <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border-[24px] border-white/5" />
                <div className="pointer-events-none absolute -bottom-20 right-20 h-44 w-44 rounded-full bg-emerald-400/10 blur-2xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-300" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-50 sm:text-xs">
                                Monitoreo forestal
                            </span>
                        </div>

                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                            Ficha de monitoreo SATA
                        </h1>

                        <p className="mt-2 text-sm text-emerald-100">
                            Registro de Alertas Tempranas por Deforestación
                        </p>
                    </div>

                    <div className="shrink-0 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:min-w-48">
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">
                            Código de ficha
                        </p>

                        <p className="mt-1 break-all text-xl font-bold text-white">
                            {json.fmCod ?? "Sin código"}
                        </p>

                        <p className="mt-1 text-xs text-emerald-100">
                            Año {json.ano ?? "No disponible"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Resumen */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-green-700/10 bg-white p-4 shadow-lg">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Severidad
                    </p>

                    <div className="mt-2">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${severityClass}`}>
                            {json.severidad ?? "No disponible"}
                        </span>
                    </div>
                </div>

                <div className="rounded-lg border border-green-700/10 bg-white p-4 shadow-lg">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Área reportada
                    </p>

                    <p className="mt-2 text-xl font-bold text-emerald-800">
                        {json.area ?? "No disponible"}
                        {json.area !== null &&
                            json.area !== undefined &&
                            String(json.area).trim() !== "" && (
                                <span className="ml-1 text-sm font-medium text-slate-500">
                                    ha
                                </span>
                            )}
                    </p>
                </div>

                <div className="rounded-lg border border-green-700/10 bg-white p-4 shadow-lg">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Delimitación
                    </p>

                    <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                        {json.delimitacion ?? "No disponible"}
                    </p>
                </div>
            </section>

            {/* Ubicación */}
            <Section
                title="Ubicación político-administrativa"
                subtitle="Localización territorial de la alerta identificada."
            >
                <Field label="Provincia" value={json.provincia} highlight />
                <Field label="Cantón" value={json.canton} highlight />
                <Field label="Parroquia" value={json.parroquia} highlight />
                <Field label="Delimitación" value={json.name} />
            </Section>

            {/* Monitoreos */}
            <section className="space-y-3">
                <div className="px-1">
                    <h2 className="text-base font-bold text-green-700/80 sm:text-lg">
                        Comparación de monitoreos
                    </h2>
                    <p className="mt-1 text-sm text-green-700/60">
                        Información de los sensores e insumos utilizados en el análisis.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Section
                        title="Monitoreo 01"
                        subtitle="Primer registro de observación"
                    >
                        <Field label="Fecha de monitoreo" value={json.date1} />
                        <Field label="Sensor" value={json.sensor1} highlight />
                        <Field label="Resolución espacial" value={json.resolucion1} unit="m" />
                    </Section>

                    <Section
                        title="Monitoreo 02"
                        subtitle="Segundo registro de observación"
                    >
                        <Field label="Fecha de monitoreo" value={json.date2} />
                        <Field label="Sensor" value={json.sensor2} highlight />
                        <Field label="Resolución espacial" value={json.resolucion2} unit="m" />
                    </Section>
                </div>
            </section>

            {/* Alerta */}
            <Section
                title="Identificación de la alerta SATA"
                subtitle="Código y coordenadas registradas para la alerta (EPSG:32717)."
            >
                <Field label="Código SATA" value={json.cod} highlight />
                <Field label="Código de ficha" value={json.fmCod} />
                <Field label="Coordenada Este" value={json.este} unit="m" />
                <Field label="Coordenada Norte" value={json.norte} unit="m" />
                <Field label="Año del registro" value={json.ano} />
            </Section>

            {/* Acciones */}
            <div className="flex flex-col gap-3 rounded-lg bg-green-700/10 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                    <p className="text-sm font-semibold text-green-700/80">
                        Ficha técnica de monitoreo
                    </p>
                    <p className="mt-1 text-xs text-green-700/60">
                        Generada por Sistema Nacional de Monitoreo de Bosques
                    </p>
                </div>

                <a 
                    href={pdf} 
                    target="blank"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm"
                >
                    <Download size={16}/>
                    Descargar ficha PDF    
                </a>
            </div>
        </main>
    );
};

export default ContentFichas;
