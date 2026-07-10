import { useMemo, useState } from "react";

import {
    Search,
    Type,
    Hash,
    Calendar,
    CheckCircle,
    Satellite,
    Check
} from "lucide-react";

function getIcon(type) {

    switch (type) {

        case "number":
            return <Hash className="w-4 h-4 text-sky-400" />;

        case "date":
            return <Calendar className="w-4 h-4 text-amber-400" />;

        case "boolean":
            return <CheckCircle className="w-4 h-4 text-emerald-400" />;

        case "raster":
            return <Satellite className="w-4 h-4 text-emerald-400" />;

        default:
            return <Type className="w-4 h-4 text-slate-400" />;

    }

}

function getTypeLabel(type) {

    switch (type) {

        case "number":
            return "Número";

        case "date":
            return "Fecha";

        case "boolean":
            return "Booleano";

        case "raster":
            return "Mosaico";

        default:
            return "Texto";

    }

}

export default function ClickableList({
    items = [],
    selected,
    onItemClick,
    placeholder = "Buscar...",
    height = "h-48",
    showType = true,
    transformText = true

}) {

    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {

        return items.filter(item =>
            item.name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );

    }, [items, search]);

    const replaceText = (text) => {

        if (!transformText)
            return text;

        return text
            ?.replace("global_monthly_", "Mensual: ")
            ?.replace("planet_medres_visual_", "Medres: ")
            ?.replace("_mosaic", "");

    };

    return (

        <div
            className="
                w-full
                bg-white
                overflow-hidden
            "
        >

            {/* SEARCH */}

            <div className="p-2 border-b border-gray-100">

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        bg-gray-100
                        rounded-lg
                        px-2
                    "
                >

                    <Search className="w-4 h-4 text-slate-400"/>

                    <input

                        value={search}

                        onChange={(e) =>
                            setSearch(e.target.value)
                        }

                        placeholder={placeholder}

                        className="
                            w-full
                            bg-transparent
                            outline-none
                            py-2
                            text-sm
                        "

                    />

                </div>

            </div>

            {/* LIST */}

            <div
                className={`
                    overflow-y-auto
                    ${height}
                `}
            >

                {

                    filtered.length === 0 && (

                        <div
                            className="
                                text-center
                                text-slate-500
                                py-8
                                text-sm
                            "
                        >

                            No existen elementos.

                        </div>

                    )

                }

                {

                    filtered.map(item => (

                        <button

                            key={item.name}

                            onClick={() =>
                                onItemClick(item)
                            }

                            className={`
                                w-full
                                flex
                                items-center
                                justify-between
                                px-3
                                py-2
                                transition
                                cursor-pointer

                                ${
                                    selected === item.name

                                        ? "bg-green-600/25"

                                        : "hover:bg-green-600/15"
                                }

                            `}

                        >

                            <div className="flex items-center gap-2">

                                {getIcon(item.type)}

                                <span className="truncate">

                                    {replaceText(item.name)}

                                </span>

                            </div>

                            <div className="flex items-center gap-2">

                                {

                                    showType &&

                                    <span className="text-xs text-slate-400">

                                        {getTypeLabel(item.type)}

                                    </span>

                                }

                                {

                                    selected === item.name &&

                                    <Check className="w-4 h-4 text-green-500"/>

                                }

                            </div>

                        </button>

                    ))

                }

            </div>

        </div>

    );

}