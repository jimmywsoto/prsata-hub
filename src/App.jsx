{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- REACT */ }
import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

{/* -------------------------------------------------------- DATA */ }
import { META } from "./data/dataMeta";

{/* -------------------------------------------------------- CONTEXT */ }
import { useAuth } from "./context/AuthContext";

{/* -------------------------------------------------------- COMPONENTS */ }
import Navbar from './components/Navbar';
import { ToastProvider } from "./components/ToastProvider";
import LeftSidebar from "./components/LeftAside";
import RightSidebar from "./components/RightAside";
import ProtectedRoute from "./components/ProtectedRoute";
import AccesibleRoute from "./components/AccesibleRoute";
import SuperadminRoute from "./components/SuperadminRoute";
import AdminRoute from "./components/AdminRoute";
import PlanetMapViewer from "./components/PlanetMapViewer";
import PlanetValidationViewer from "./components/PlanetValidationViewer";

{/* -------------------------------------------------------- PAGES */ }
import LandingPage from "./pages/Landing";
import MainDashboard from "./pages/MainDashboard";
import FichasMonitoreoDashboard from "./pages/FichasMonitoreoDashboard";
import SeguimientoDashboard from "./pages/SeguimientoDashboard";
import RegistroDashboard from "./pages/RegistroDashboard";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import UnauthorizedWelcome from "./pages/UnauthorizedWelcome";
import AdminAccessRequestsPanel from "./pages/AdminAccessRequestPanel";
import EditProfilePage from "./pages/EditProfilePage";
import ResetPassPage from "./pages/ResetPassPage";
import AdminPlanetCachePanel from "./pages/AdminPlanetCachePanel";

import ReportGeneratorHTML from "./pages/ReportGeneratorHTML";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
function App() {
    const { user } = useAuth();
    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);

    // Integración mapas
    const [layers, setLayers] = useState([]);

    const [filters, setFilters] = useState({
        anio: [], // Cambiar todos a [] para habilitar selección multiple
        mes: [],
        provincia: [],
        delimitacion: [],
        trimestre: []
    });

    const [stats, setStats] = useState({});
    const [location, setLocation] = useState(null);
    const [locationInput, setLocationInput] = useState({
        x: "",
        y: "",
        utm: false
    });

    return (
        <BrowserRouter>
            <ToastProvider>
                <div className="h-screen flex flex-col">

                    {/* NAVBAR */}
                    <Navbar
                        user={user}
                        onToggleLeft={() => setLeftOpen(!leftOpen)}
                        onToggleRight={() => setRightOpen(!rightOpen)}
                    />

                    {/* CUERPO */}
                    <div className="flex flex-1 overflow-hidden relative">

                        {/* LEFT SIDEBAR */}
                        {leftOpen &&
                            <LeftSidebar
                                onAddLayer={(layer) => {
                                    setLayers((prev) => [...prev, layer]);
                                }}
                                filters={filters}
                                setFilters={setFilters}
                                onSelectLocation={setLocation}

                                //Nuevo
                                locationInput={locationInput}
                                setLocationInput={setLocationInput}
                            />
                        }

                        {/* MAIN */}
                        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <LandingPage
                                            externalLayers={layers}
                                            filters={filters}
                                            location={location}
                                            onStats={(statistics => {
                                                if (statistics) return setStats(statistics);
                                            })}
                                        />
                                    }
                                />
                                <Route
                                    path="/welcome"
                                    element={
                                        <ProtectedRoute>
                                            <UnauthorizedWelcome />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <EditProfilePage userId={user?.id} currentUserRole={user?.role}/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/reset-pass"
                                    element={
                                        <ProtectedRoute>
                                            <ResetPassPage userId={user?.id} currentUserRole={user?.role}/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/access-panel"
                                    element={
                                        <ProtectedRoute>
                                            <SuperadminRoute>
                                                <AdminAccessRequestsPanel />
                                            </SuperadminRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/cache-panel"
                                    element={
                                        <ProtectedRoute>
                                            <SuperadminRoute>
                                                <AdminPlanetCachePanel/>
                                            </SuperadminRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/planet-viewer"
                                    element={
                                        <ProtectedRoute>
                                            <SuperadminRoute>
                                                <PlanetMapViewer/>
                                            </SuperadminRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/planet-validation-viewer"
                                    element={
                                        <ProtectedRoute>
                                            <AdminRoute>
                                                <PlanetValidationViewer/>
                                            </AdminRoute>
                                        </ProtectedRoute>
                                    }
                                />


                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <AccesibleRoute>
                                                <MainDashboard
                                                    externalLayers={layers}
                                                    filters={filters}
                                                    location={location}
                                                    onStats={(statistics => {
                                                        if (statistics) return setStats(statistics);
                                                    })}
                                                />
                                            </AccesibleRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/report"
                                    element={
                                        <ProtectedRoute>
                                            <AccesibleRoute>
                                                <ReportGeneratorHTML
                                                    externalLayers={layers}
                                                    filters={filters}
                                                    location={location}
                                                    onStats={(statistics => {
                                                        if (statistics) return setStats(statistics);
                                                    })}
                                                />
                                            </AccesibleRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/fichas"
                                    element={
                                        <ProtectedRoute>
                                            <AccesibleRoute>
                                                <FichasMonitoreoDashboard
                                                    externalLayers={layers}
                                                    filters={filters}
                                                    location={location}
                                                    onStats={(statistics => {
                                                        if (statistics) return setStats(statistics);
                                                    })}
                                                />
                                            </AccesibleRoute>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/seguimiento"
                                    element={
                                        <ProtectedRoute>
                                            <SuperadminRoute>
                                                <SeguimientoDashboard
                                                    externalLayers={layers}
                                                    filters={filters}
                                                    location={location}
                                                    onStats={(statistics => {
                                                        if (statistics) return setStats(statistics);
                                                    })}
                                                />
                                            </SuperadminRoute>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/registro"
                                    element={
                                        <ProtectedRoute>
                                            <RegistroDashboard
                                                externalLayers={layers}
                                                filters={filters}
                                                location={location}
                                                onStats={(statistics => {
                                                    if (statistics) return setStats(statistics);
                                                })}
                                            />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/login"
                                    element={<Login />}
                                />
                                <Route
                                    path="/register"
                                    element={<Register />}
                                />
                            </Routes>
                        </main>

                        {/* RIGHT SIDEBAR */}
                        {<RightSidebar rightOpen={rightOpen} data={stats} />}

                    </div>

                    {/* FOOTER */}
                    <footer className="h-10 flex items-center justify-center text-xs text-white">
                        {META.copyright}
                    </footer>

                </div>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;
