{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    UPDATED AT: 25/09/2026
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Trees, Activity, Satellite, MapPinned,} from "lucide-react";

{/* -------------------------------------------------------- DATA */ }
import { FIELD_ALIASES, VISIBLE_FIELDS} from "../data/dataMeta";
import { baseMapsConfig } from "../config/basemaps.config";
import { panesConfig } from "../config/panes.config";
import { heroConfig, contextConfig, capabilitiesConfig, missionConfig, footerConfig } from "../config/landing.config"; 
import { landingLayersConfig } from "../config/layers.config";

{/* -------------------------------------------------------- COMPONENTS */ }
import GeoJSONVTMap from "../components/GeoJSONVTMap";
import { applyFilters } from "../components/CommonFunctions";
import Loader from "../components/Loader";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
export default function LandingPage({
    externalLayers = [],
    filters = { filters },
    location = {},
}) {
    const navigate = useNavigate();

    const [rawData, setRawData] = useState(null);
    const mapApiRef = useRef(null);

    {/* ============================================================ LOAD PRINCIPAL DATA */ }
    useEffect(() => {
        fetch("/data/DB_ALERTAS_SATA_P.geojson")
            .then((res) => res.json())
            .then(setRawData)
            .catch(console.error);
    }, []);

    {/* ============================================================ FILTERED DATA */ }
    const filteredData = useMemo(() => {
        if (!rawData?.features) return null;

        const filterConfig = {
            provincia: "DPA_DESPRO",
            delimitacion: "delimitaci",
            mes: "fin",
            anio: "ano",
            dateFormat: "YYYY-MM-DD"
        }

        const { features } = applyFilters(rawData, filters, filterConfig)

        return { ...rawData, features };
    }, [rawData, filters]);

    useEffect(() => {
        if (!location || !mapApiRef.current) return;

        mapApiRef.current.setLocation({
            lat: location.lat,
            lng: location.lng,
            zoom: 14,
            popup: location.label
        });

    }, [location]);

    {/* ============================================================ RENDER */ }
    if (!rawData) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen overflow-x-hidden">

            {/* HERO */}
            <section className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center">

                {/* Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e')] bg-cover bg-center opacity-15"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-emerald-50"></div>
                    <div className="absolute inset-0 patterns opacity-20"></div>
                </div>

                {/* Glow */}
                <div className="absolute -top-48 -left-48 w-96 h-96 bg-green-300 rounded-full blur-[140px] opacity-25"></div>

                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-[160px] opacity-20"></div>

                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-20 py-16">

                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Texto */}
                        <div>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-3 rounded-full border border-green-300 bg-white/70 backdrop-blur px-5 py-2 shadow-lg">
                                <img
                                    src={heroConfig.badge.icon}
                                    className="w-8 h-8"
                                />
                                <span className="text-sm font-semibold text-slate-700">
                                    {heroConfig.badge.text || "JWS Ingeniería Core"}
                                </span>
                            </div>

                            {/* Título */}
                            <h1 className="mt-8 text-5xl md:text-6xl xl:text-7xl font-black leading-tight">
                                {heroConfig.title1 || "Monitoreo Inteligente de"}
                                <span className="block bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                                    {heroConfig.title2 || "Alertas Tempranas"}
                                </span>
                            </h1>

                            {/* Texto */}
                            <p className="mt-8 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                                {heroConfig.text}
                            </p>

                            {/* Chips */}
                            <div className="flex flex-wrap gap-3 mt-8">
                                
                                {heroConfig.tags && heroConfig.tags.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 rounded-full bg-white shadow text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                ))}

                            </div>

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-10">

                                <Link
                                    to="/dashboard"
                                    className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-semibold shadow-xl transition-all hover:-translate-y-1"
                                >
                                    Explorar Dashboard →
                                </Link>

                                <Link
                                    to="https://snmb.ambiente.gob.ec/snmb/"
                                    target="_blank"
                                    className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl border border-slate-300 hover:border-green-500 hover:text-green-600 bg-white/60 backdrop-blur transition-all"
                                >
                                    Conocer el SNMB
                                </Link>

                            </div>

                        </div>

                        {/* Imagen */}

                        <div className="relative">

                            <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-emerald-300 rounded-[40px] blur-3xl opacity-20 scale-110"></div>

                            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-white/40 bg-white/40 backdrop-blur">

                                <img
                                    src={heroConfig.latestAlertsData.img}
                                    className="w-full object-cover h-[320px] md:h-[500px] hover:scale-105 transition duration-700"
                                />

                                <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-4 m-2 flex">
                                    
                                    <div className="grid grid-cols-2 gap-4">

                                        <div className="flex items-center gap-3">

                                            <div className="bg-green-100 p-3 rounded-xl">
                                                <Trees className="text-green-600" />
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-xl">
                                                    {heroConfig.latestAlertsData.count[0]}
                                                </h4>

                                                <p className="text-sm text-slate-500">
                                                    {heroConfig.latestAlertsData.text[0]}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex items-center gap-3">

                                            <div className="bg-red-100 p-3 rounded-xl">
                                                <Activity className="text-red-500" />
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-xl">
                                                    {heroConfig.latestAlertsData.count[1]}
                                                </h4>

                                                <p className="text-sm text-slate-500">
                                                    {heroConfig.latestAlertsData.text[1]}
                                                </p>
                                            </div>

                                        </div>

                                        {/*<div className="flex items-center gap-3">

                                            <div className="bg-blue-100 p-3 rounded-xl">
                                                <Satellite className="text-blue-600" />
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-xl">
                                                    Sentinel-1/2 
                                                </h4>

                                                <p className="text-sm text-slate-500">
                                                    Fuente
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex items-center gap-3">

                                            <div className="bg-orange-100 p-3 rounded-xl">
                                                <MapPinned className="text-orange-500" />
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-xl">
                                                    Ecuador
                                                </h4>

                                                <p className="text-sm text-slate-500">
                                                    Cobertura
                                                </p>
                                            </div>

                                        </div>*/}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* CONTEXTO */}
            <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-14 items-center">
                    <div>
                        <img
                            src={contextConfig.img}
                            alt="Deforestación"
                            className="rounded-3xl shadow-2xl object-cover w-full h-[550px]"
                        />
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-4xl font-bold text-green-400">
                            {contextConfig.title}
                        </h3>

                        {contextConfig.text && contextConfig.text.map((item, index) => (
                            <p 
                                key={index}
                                className="text-[var(--color-pattern-text)] leading-relaxed text-lg"
                            >
                                {item}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {/* CARACTERÍSTICAS */}
            <section className="flex py-24 bg-gray-50 backdrop-blur-sm px-6 lg:px-20">

                {/* -------------------------------------------------------- BACKGROUND */}
                <div className="absolute inset-0 patterns opacity-30" />

                <div className="z-60 max-w-7xl mx-auto text-center space-y-16">
                    <div>
                        <h3 className="text-4xl lg:text-5xl font-bold text-green-400">
                            {capabilitiesConfig.title}
                        </h3>
                        <p className="text-[var(--color-pattern-text)] mt-4 max-w-3xl mx-auto text-lg">
                            {capabilitiesConfig.text}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {capabilitiesConfig.sections && capabilitiesConfig.sections.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white border border-white/10 rounded-3xl p-8 hover:bg-green-500/50 hover:border-green-400/30 transition-all shadow-xl text-slate-400 hover:text-white"
                            >
                                <div className="text-5xl mb-6 flex justify-center">
                                    <img src={item.icon} alt="" />
                                </div>
                                <h4 className="text-2xl font-semibold mb-4 ">
                                    {item.title}
                                </h4>
                                <p className="leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MISSION + MAP */}
            <section className="flex py-24 px-6 lg:px-20 max-w-7xl mx-auto  border border-green-400/20 rounded-3xl p-12 shadow-2xl backdrop-blur-md mt-12 mb-12">
                {/* -------------------------------------------------------- BACKGROUND */}
                <div className="absolute inset-0 patterns opacity-20 rounded-3xl" />

                <div className="z-60 grid lg:grid-cols-2 gap-14 items-center">
                    
                    <div className="space-y-8">
                        <h3 className="text-4xl font-bold text-green-400">
                            {missionConfig.title}
                        </h3>

                        <p className="text-slate-400 leading-relaxed text-lg">
                            {missionConfig.text}
                        </p>

                        <Link
                            to="/dashboard"
                            className="bg-green-500 text-white hover:bg-green-400 transition-all px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl inline-flex items-center justify-center"
                        >
                            Ir al Dashboard
                        </Link>
                    </div>

                    <div>
                        <div className="bg-white rounded-3xl  overflow-hidden w-full h-[550px]">
                            <GeoJSONVTMap
                                baseMapsConfig={baseMapsConfig}
                                panesConfig={panesConfig}
                                data={{
                                    geojson: filteredData,
                                    name: "Clúster SATA",
                                    cluster: true,
                                    style: {
                                        fill: "rgb(249, 200, 76)",
                                        stroke: 'rgb(249, 200, 76)',
                                        width: 1,
                                        radius: 12
                                    },
                                    popup: {
                                        fields: VISIBLE_FIELDS.basic,
                                        aliases: FIELD_ALIASES,
                                    },
                                    pane: "highestPane",
                                }}
                                defaultLayers={landingLayersConfig.defaultLayers}
                                externalLayers={externalLayers}
                                filters={filters}
                                onMapReady={(api) => {
                                    mapApiRef.current = api;
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative overflow-hidden bg-gradient-to-b from-green-700 to-green-900 text-gray-200">

                {/* Background */}
                <div className="absolute inset-0 patterns opacity-20"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 py-16">

                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

                        {/* Logo */}
                        <div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">
                                        {footerConfig.title}
                                    </h3>

                                    <p className="text-sm">
                                        {footerConfig.subtitle}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-6 leading-relaxed text-sm">
                                {footerConfig.text}
                            </p>
                        </div>

                        {/* Links */}
                        {Object.entries(footerConfig.links).map(([category, links]) => (

                            <div key={category}>

                                <h4 className="text-white font-semibold mb-5">
                                    {category}
                                </h4>

                                <ul className="space-y-3">

                                    {links.map(({ label, path, icon: Icon, url, external }) => (

                                        <li key={label}>

                                            {external ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center gap-2 text-sm hover:text-green-400 transition-all"
                                                >
                                                    <Icon size={16} />
                                                    <span>{label}</span>
                                                </a>
                                            ) : (

                                                <button
                                                    onClick={() => navigate(path)}
                                                    className="group flex items-center gap-2 text-sm transition-all hover:text-green-400"
                                                >
                                                    <Icon
                                                        size={16}
                                                        className="group-hover:scale-110 transition-transform"
                                                    />

                                                    <span>{label}</span>

                                                    <ChevronRight
                                                        size={14}
                                                        className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                                                    />
                                                </button>
                                            )}
                                        </li>

                                    ))}

                                </ul>

                            </div>

                        ))}

                    </div>

                    {/* Línea */}
                    <div className="my-10 border-t border-white/10"></div>

                    {/* Footer Bottom */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <span>
                            {footerConfig.credits}
                        </span>

                        <span> 
                            {footerConfig.developed}
                        </span>
                    </div>

                </div>

            </footer>

        </div>
    );
}
