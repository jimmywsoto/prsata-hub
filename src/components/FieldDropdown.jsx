import { useEffect, useMemo, useRef, useState } from "react";

import {
    ChevronDown,
    Check,
    Search,
    Type,
    Hash,
    Calendar,
    CheckCircle,
    Satellite
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

export default function FieldDropdown({
    fields,
    value,
    onChange,
    placeholder = "Buscar...",
    showType = true,
    transformText = true
}) {

    const [open, setOpen] = useState(false);

    const [search, setSearch] = useState("");

    const ref = useRef();

    useEffect(() => {

        const click = (e) => {

            if (
                ref.current &&
                !ref.current.contains(e.target)
            ) {

                setOpen(false);

            }

        };

        document.addEventListener("mousedown", click);

        return () =>
            document.removeEventListener(
                "mousedown",
                click
            );

    }, []);

    const processedFields = useMemo(() => [

        {
            name: "Default",
            type: "default"
        },

        ...fields

    ], [fields]);

    const filtered = processedFields.filter(f =>
        f.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const selected =
        processedFields.find(
            f => f.name === value
        ) ??
        processedFields[0];

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
            ref={ref}
            className="relative w-full"
        >

            {/* -------------------------------- BUTTON */}

            <button

                onClick={() =>
                    setOpen(!open)
                }

                className="
                    w-full
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-green-700/70
                    hover:bg-green-700
                    text-white
                    px-3
                    py-2
                    transition
                "

            >

                <div className="flex items-center gap-2">

                    {
                        selected.type === "default"

                            ? <Type className="w-4 h-4 text-slate-500" />

                            : getIcon(selected.type)
                    }

                    <span className="text-sm">

                        {selected.name}

                    </span>

                </div>

                <ChevronDown
                    className={`
                        w-4
                        h-4
                        transition-transform
                        ${open ? "rotate-180" : ""}
                    `}
                />

            </button>

            {/* -------------------------------- MENU */}

            {

                open && (

                    <div

                        className="
                            absolute
                            mt-2
                            w-full
                            rounded-xl
                            bg-white
                            shadow-2xl
                            overflow-hidden
                        "

                    >

                        {/* SEARCH */}

                        <div className="p-2">

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    bg-gray-300/30
                                    rounded-lg
                                    px-2
                                "
                            >

                                <Search className="w-4 h-4 text-slate-400" />

                                <input

                                    value={search}

                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
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

                        {/* OPTIONS */}

                        <div
                            className="
                                max-h-64
                                overflow-y-auto
                            "
                        >

                            {

                                filtered.map(field => (

                                    <button

                                        key={field.name}

                                        onClick={() => {

                                            onChange(field.name);

                                            setOpen(false);

                                            setSearch("");

                                        }}

                                        className={`
                                            w-full
                                            flex
                                            items-center
                                            justify-between
                                            px-3
                                            py-2
                                            transition

                                            ${value === field.name

                                                ? "bg-green-600/30"

                                                : "hover:bg-green-600/20"
                                            }

                                        `}
                                    >

                                        <div className="flex items-center gap-2">

                                            {

                                                field.type === "default"

                                                    ?

                                                    <Type className="w-4 h-4 text-slate-500" />

                                                    :

                                                    getIcon(field.type)

                                            }

                                            <span className="truncate max-w-64">

                                                {replaceText(field.name)}

                                            </span>

                                        </div>

                                        <div className="flex items-center gap-2">
                                            {
                                                showType &&

                                                <span
                                                    className="
                                                    text-xs
                                                    text-slate-400
                                                "
                                                >

                                                    {
                                                        field.type === "default"

                                                            ?

                                                            ""

                                                            :

                                                            getTypeLabel(field.type)
                                                    }

                                                </span>
                                            }
                                            

                                            {

                                                value === field.name &&

                                                <Check className="w-4 h-4 text-green-400" />

                                            }

                                        </div>

                                    </button>

                                ))

                            }

                        </div>

                    </div>

                )

            }

        </div>

    );

}