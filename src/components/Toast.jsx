{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2024.
    UPDATED_AT: October, 2026.
    VERSIÓN: 2.1.1
*/}

import { useEffect } from "react";
import { Info } from "lucide-react";

export default function Toast({ message, type = "success", show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div className="fixed bottom-12 right-4 z-50">
            {show && (
                <div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white backdrop-blur ${type === "success" ? "bg-green-500/30 border border-green-700/20" : "bg-red-500/20 border border-red-300"
                        }`}
                >
                    <Info size={16}/> {message}
                </div>
            )}
        </div>
    );
}
