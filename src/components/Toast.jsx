{/* COPYRIGHTS: JWS INGENIERÍA 2025 */}
{/* RELEASE VERSIÓN 2.0 */}

import { useEffect } from "react";

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
                    className={`px-4 py-2 rounded-lg shadow-lg text-white ${type === "success" ? "bg-green-500/40 border border-green-400" : "bg-red-500/20 border border-red-400"
                        }`}
                >
                    {message}
                </div>
            )}
        </div>
    );
}
