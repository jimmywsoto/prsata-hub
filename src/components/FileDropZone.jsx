import { useRef, useState } from "react";
import {
    Upload,
    File,
    X,
    CheckCircle
} from "lucide-react";

export default function FileDropZone({

    accept = "*",

    onFileSelected,

    title = "Importar un archivo",

    dragTitle = "Arrastra y suelta el archivo aquí",

    helperText = "",

    className = "",

    expandedHeight = "h-40",

    collapsedHeight = "h-24"

}) {

    const inputRef = useRef();

    const [isDragging, setIsDragging] = useState(false);

    const [file, setFile] = useState(null);

    const [error, setError] = useState("");

    const openDialog = () => {

        inputRef.current?.click();

    };

    const processFile = (selectedFile) => {

        if (!selectedFile)
            return;

        const accepted = accept
            .split(",")
            .map(v => v.trim().toLowerCase());

        if (accept !== "*") {

            const extension =
                "." +
                selectedFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            if (!accepted.includes(extension)) {

                setError("Formato no permitido.");

                return;

            }

        }

        setError("");

        setFile(selectedFile);

        onFileSelected?.(selectedFile);

    };

    const onInputChange = (e) => {

        processFile(e.target.files[0]);

    };

    const onDrop = (e) => {

        e.preventDefault();

        setIsDragging(false);

        processFile(e.dataTransfer.files[0]);

    };

    const clearFile = (e) => {

        e.stopPropagation();

        setFile(null);

        inputRef.current.value = "";

    };

    return (

        <div className={className}>

            <label

                onClick={openDialog}

                onDragOver={(e) => {

                    e.preventDefault();

                    setIsDragging(true);

                }}

                onDragLeave={() =>
                    setIsDragging(false)
                }

                onDrop={onDrop}

                className={`
                    relative
                    flex
                    flex-col
                    w-full
                    justify-center
                    items-center
                    border-2
                    border-dashed
                    rounded-xl
                    cursor-pointer
                    overflow-hidden
                    transition-all
                    duration-300

                    ${isDragging
                        ? `border-green-500 bg-green-50 scale-[1.02] shadow-lg ${expandedHeight}`
                        : `border-slate-300 hover:bg-slate-50 ${collapsedHeight}`
                    }
                `}

            >

                <input

                    ref={inputRef}

                    type="file"

                    className="hidden"

                    accept={accept}

                    onChange={onInputChange}

                />

                {

                    !file &&

                    <>

                        <Upload
                            className={`
                                transition-all
                                duration-300
                                text-slate-400

                                ${isDragging
                                    ? "w-12 h-12 text-green-500"
                                    : "w-8 h-8"
                                }
                            `}
                        />

                        <span
                            className="
                                mt-3
                                font-medium
                                text-sm
                            "
                        >

                            {

                                isDragging

                                    ? dragTitle

                                    : title

                            }

                        </span>

                        {

                            helperText &&

                            <span
                                className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                "
                            >

                                {helperText}

                            </span>

                        }

                    </>

                }

                {

                    file &&

                    <>

                        <CheckCircle
                            className="
                                w-10
                                h-10
                                text-green-500
                            "
                        />

                        <div
                            className="
                                mt-2
                                flex
                                items-center
                                gap-2
                                max-w-[90%]
                            "
                        >

                            <File
                                className="
                                    w-4
                                    h-4
                                    text-slate-500
                                "
                            />

                            <span
                                className="
                                    text-sm
                                    truncate
                                "
                            >

                                {file.name}

                            </span>

                        </div>

                        <button

                            type="button"

                            onClick={clearFile}

                            className="
                                absolute
                                top-2
                                right-2
                                p-1
                                rounded-full
                                hover:bg-red-100
                            "

                        >

                            <X
                                className="
                                    w-4
                                    h-4
                                    text-red-500
                                "
                            />

                        </button>

                    </>

                }

            </label>

            {

                error &&

                <p
                    className="
                        text-xs
                        text-red-500
                        mt-2
                    "
                >

                    {error}

                </p>

            }

        </div>

    );

}