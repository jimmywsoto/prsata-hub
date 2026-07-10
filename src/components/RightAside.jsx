{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

{/* -------------------------------------------------------- DATA */ }
import { META } from "../data/dataMeta";

{/* -------------------------------------------------------- CONTEXT */ }
import { accessPanelsRoutes } from "../config/accesibleroutes.config";

{/* ============================================================ TARJETAS */}
function CollapseCard({ id, title, icon, openId, setOpenId, children }) {
    const isOpen = openId === id;

    const toggle = () => {
        setOpenId(isOpen ? null : id);
    };

    return (
        <div className="mb-3">
            {/* HEADER */}
            <div
                onClick={toggle}
                className={`flex items-center justify-between ${isOpen ? "bg-green-600 text-white" : "bg-gray-100"} hover:bg-green-600 hover:text-white rounded-lg p-3
                 cursor-pointer transition`}
            >
                <div className="flex items-center space-x-3">
                    <img src={icon} alt="" className="w-8 h-8 bg-white rounded-full shadow-lg" />
                    <span className="font-semibold text-sm">{title}</span>
                </div>

                <svg
                    className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? "rotate-90" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </div>

            {/* CONTENT */}
            <div
                className={`overflow-y-auto rounded-b-lg shadow-lg transition-all duration-300 ${isOpen ? "max-h-[500px] mt-2" : "max-h-0"
                    }`}
            >
                {children}
            </div>
        </div>
    );
}

{/* ============================================================ RIGHT ASIDE*/}
export default function RightSidebar({ rightOpen, data }) {
    const [openId, setOpenId] = useState(null);

    const location = useLocation();
    const config = accessPanelsRoutes[location.pathname]?.right ?? false;
        
    return (
        config &&
        < aside
            className={`
                absolute top-0 right-0 h-full w-64
                bg-white shadow-xl z-[5000] overflow-y-auto
                transition-transform duration-200 scrollbar-none
                ${rightOpen ? "translate-x-0" : "translate-x-full"}
            `}
        >
            <div className="p-4 space-y-2">
                {/* Logo */}
                <img src={META.logo} alt="Logo" className="w-full" />

                {/* Título */}
                <div className="border-b border-[var(--color-border)] pb-2">
                    <h1 className="font-bold text-center text-xl leading-none">
                        {META.authority}
                    </h1>
                </div>

                <h2 className="font-semibold text-lg mb-3">
                    Resultados Tabulados
                </h2>

                {/* PROVINCIA */}
                <CollapseCard
                    id="provincia"
                    title="Recuento de alertas registradas por provincia"
                    icon="/icon-province.png"
                    openId={openId}
                    setOpenId={setOpenId}
                >
                    <Table data={data.provincia} searchable/>
                </CollapseCard>

                {/* CANTÓN */}
                <CollapseCard
                    id="canton"
                    title="Recuento de alertas registradas por cantón"
                    icon="/icon-canton.png"
                    openId={openId}
                    setOpenId={setOpenId}
                >
                    <Table data={data.canton} searchable/>
                </CollapseCard>

                {/* PARROQUIA */}
                <CollapseCard
                    id="parroquia"
                    title="Recuento de alertas registradas por parroquia"
                    icon="/icon-parroquia.png"
                    openId={openId}
                    setOpenId={setOpenId}
                >
                    <Table data={data.parroquia} searchable/>
                </CollapseCard>

                {/* SEVERIDAD */}
                <CollapseCard
                    id="severidad"
                    title="Recuento de alertas registradas por severidad"
                    icon="/icon-severidad.png"
                    openId={openId}
                    setOpenId={setOpenId}
                >
                    <>
                        <Table data={data.severidad}/>

                        <div className="text-xs text-gray-400 text-justify p-4">
                            <p className="text-center font-semibold">Descripción</p>
                            <p className="italic">
                                Grado de severidad definida a partir de la extensión superficial de las
                                perturbaciones y/o alteraciones identificadas.
                            </p>

                            <p className="text-center mt-2 font-semibold">Categorías</p>
                            <table className="w-full">
                                <tbody>
                                    <tr><td><b>ALTA:</b></td><td>Mayor a 0.7 ha</td></tr>
                                    <tr><td><b>MEDIA:</b></td><td>0.3 – 0.7 ha</td></tr>
                                    <tr><td><b>BAJA:</b></td><td>Menor a 0.3 ha</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                </CollapseCard>

                {/* DELIMITACIÓN */}
                <CollapseCard
                    id="delimitacion"
                    title="Recuento de alertas registradas por delimitación"
                    icon="/icon-delimitacion.png"
                    openId={openId}
                    setOpenId={setOpenId}
                >
                    <>
                        <Table data={data.delimitacion}/>

                        <div className="text-xs text-gray-400 text-justify p-4">
                            <p className="text-center font-semibold">Descripción</p>
                            <p className="italic">
                                Unidades de delimitación ambiental definidas por el MAE, las cuales agrupan
                                espacios naturales bajo diferentes regímenes de protección, conservación y manejo sostenible.
                            </p>

                            <p className="text-center mt-2 font-semibold">Categorías</p>
                            <table className="w-full">
                                <tbody>
                                    <tr><td><b>ABC-PSB:</b></td><td>Áreas Bajo Conservación Plan Socio Bosque</td></tr>
                                    <tr><td><b>BVP:</b></td><td>Bosques y Vegetación Protectora</td></tr>
                                    <tr><td><b>PFE:</b></td><td>Patrimonio Forestal del Estado</td></tr>
                                    <tr><td><b>PFN:</b></td><td>Patrimonio Forestal Nacional</td></tr>
                                    <tr><td><b>SNAP:</b></td><td>Sistema Nacional de Áreas Protegidas</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                </CollapseCard>
            </div>
        </aside>
    );
}

{/* ============================================================ TABLA RECUENTO */}
function Table({ data = [], searchable = false }) {
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: "value", // "label" | "value"
        direction: "desc", // "asc" | "desc"
    });

    // FILTRO
    const filteredData = data.filter(([label, value]) =>
        label.toLowerCase().includes(search.toLowerCase())
    );

    // ORDENAMIENTO
    const sortedData = [...filteredData].sort((a, b) => {
        if (sortConfig.key === "label") {
            return sortConfig.direction === "asc"
                ? a[0].localeCompare(b[0])
                : b[0].localeCompare(a[0]);
        } else {
            return sortConfig.direction === "asc"
                ? a[1] - b[1]
                : b[1] - a[1];
        }
    });

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    return (
        <div className="w-full">
            {/* BUSCADOR */}
            {searchable && (
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-2 p-1 border border-gray-200 rounded bg-gray-100 outline-none"
                />
            )}

            {/* TABLA */}
            <div className="max-h-96 overflow-y-auto rounded-lg shadow">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-green-600 text-white z-10">
                        <tr>
                            <th
                                className="p-2 cursor-pointer w-2/3 flex justify-left"
                                onClick={() => handleSort("label")}
                            >
                                Categoría
                            </th>
                            <th
                                className="p-2 cursor-pointer w-1/3"
                                onClick={() => handleSort("value")}
                            >
                                Total
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td className="p-2 text-center" colSpan={2}>
                                    Sin datos
                                </td>
                            </tr>
                        ) : (
                            sortedData.map(([label, value], index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="p-2">{label}</td>
                                    <td className="p-2 flex justify-end">{value}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}