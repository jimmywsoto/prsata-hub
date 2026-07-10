{/* -------------------------------------------------------- REACT */}
import {
    useEffect,
    useState,
} from "react";

{/* -------------------------------------------------------- LEAFLET */}
import {
    MapContainer,
    TileLayer,
} from "react-leaflet";

{/* -------------------------------------------------------- LEAFLET CSS */}
import "leaflet/dist/leaflet.css";

{/* -------------------------------------------------------- ICONS */}
import {
    Globe2,
    Satellite,
    Loader2,
} from "lucide-react";

{/* -------------------------------------------------------- DATA */}
const API_URL =
    import.meta.env.VITE_BACKEND_URL
    || "http://localhost:3000";

{/* -------------------------------------------------------- MAIN FUNCTION */}
export default function PlanetMapViewer() {

    {/* -------------------------------------------------------- STATES */}
    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState(null);

    const [
        latest,
        setLatest
    ] = useState(null);


    {/* -------------------------------------------------------- FETCH MOSAIC */}
    const fetchLatestMosaic =
        async () => {

            try {

                setLoading(true);

                const response =
                    await fetch(
                        `${API_URL}/api/planet/latest-mosaic`
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.error
                    );
                }

                setLatest(result);

            } catch (err) {

                console.error(err);

                setError(
                    err.message
                );

            } finally {

                setLoading(false);
            }
        };

    {/* -------------------------------------------------------- EFFECT */}
    useEffect(() => {

        fetchLatestMosaic();

    }, []);


    {/* -------------------------------------------------------- LOADING */}
    if (loading) {

        return (

            <div
                className="
                    w-full
                    h-[700px]
                    rounded-3xl
                    bg-slate-900
                    border
                    border-slate-800
                    flex
                    items-center
                    justify-center
                    text-slate-300
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-4
                    "
                >

                    <Loader2
                        className="
                            w-10
                            h-10
                            animate-spin
                            text-cyan-400
                        "
                    />

                    <p>
                        Cargando mosaico Planet...
                    </p>

                </div>

            </div>
        );
    }


    {/* -------------------------------------------------------- ERROR */}
    if (error) {

        return (

            <div
                className="
                    w-full
                    h-[700px]
                    rounded-3xl
                    bg-red-500/10
                    border
                    border-red-500/30
                    flex
                    items-center
                    justify-center
                    text-red-300
                "
            >

                {error}

            </div>
        );
    }


    return (

        <div
            className="
                w-full
                bg-slate-900
                border
                border-slate-800
                rounded-3xl
                overflow-hidden
                shadow-2xl
            "
        >

            {/* ------------------------------------------------ HEADER */}

            <div
                className="
                    px-6
                    py-4
                    border-b
                    border-slate-800
                    flex
                    items-center
                    justify-between
                    bg-slate-950
                "
            >

                <div>

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <Satellite
                            className="
                                w-6
                                h-6
                                text-cyan-400
                            "
                        />

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-white
                            "
                        >

                            Planet Mosaic Viewer

                        </h2>

                    </div>

                    <p
                        className="
                            text-slate-400
                            text-sm
                            mt-1
                        "
                    >

                        Visualización de mosaicos
                        Planet en Leaflet

                    </p>

                </div>


                {/* ------------------------------------------------ MOSAIC INFO */}

                <div
                    className="
                        text-right
                    "
                >

                    <p
                        className="
                            text-cyan-300
                            font-mono
                            text-sm
                        "
                    >

                        {latest?.name}

                    </p>

                    <p
                        className="
                            text-slate-500
                            text-xs
                        "
                    >

                        {latest?.month}

                    </p>

                </div>

            </div>


            {/* ------------------------------------------------ MAP */}

            <div
                className="
                    w-full
                    h-[700px]
                "
            >

                <MapContainer

                    center={[
                        -1.831239,
                        -78.183406
                    ]}

                    zoom={7}

                    minZoom={4}

                    maxZoom={18}

                    scrollWheelZoom={true}

                    className="
                        w-full
                        h-full
                    "
                >

                    {/* ------------------------------------------------ OSM */}

                    <TileLayer

                        attribution='&copy; OpenStreetMap'

                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />


                    {/* ------------------------------------------------ PLANET */}

                    {
                        latest?.tile_url && (

                            <TileLayer

                                attribution='&copy; Planet'

                                url={
                                    `${API_URL}${latest.tile_url}`
                                }

                                opacity={1}

                                zIndex={1000}

                                maxZoom={18}

                                tileSize={256}
                            />
                        )
                    }

                </MapContainer>

            </div>


            {/* ------------------------------------------------ FOOTER */}

            <div
                className="
                    px-6
                    py-3
                    border-t
                    border-slate-800
                    bg-slate-950
                    flex
                    items-center
                    justify-between
                    text-sm
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-slate-400
                    "
                >

                    <Globe2
                        className="
                            w-4
                            h-4
                        "
                    />

                    Ecuador

                </div>


                <div
                    className="
                        text-slate-500
                    "
                >

                    Planet Monthly Basemap

                </div>

            </div>

        </div>
    );
}