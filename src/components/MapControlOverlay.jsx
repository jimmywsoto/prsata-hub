import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import {
    Earth,
    Blend,
    Database
} from "lucide-react";

import ClickableList from './ClickableList';

export function MapControlOverlay({
    opacity,
    onChange,
    fields,
    value,
    onMosaicChange
}) {
    const map = useMap(); // Pulls the active Leaflet instance from React Context
    const containerRef = useRef(null);

    const [selectedLayer, setSelectedLayer] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Disables all event leakage into the active map background
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
    }, [map]);

    return (
        <div
            ref={containerRef}
            className="shadow-md"
        >
            <div className="p-2 border-b bg-green-200/20">
                <h3 className="font-semibold flex items-center gap-2">
                    <Earth size={16} /> Planet Mosaics
                </h3>
            </div>

            {/* PLANET CONTROL */}
            <div className="p-2 border-b">
                
                <div className="space-y-1">
                    <div className="flex gap-3 items-center">

                        <ClickableList

                            items={fields}

                            selected={value}

                            onItemClick={(selected) => {

                                setSelectedLayer(selected.name);
                                onMosaicChange(selected.name)

                            }}

                        />

                    </div>
                </div>
            </div>

            {/* OPACITY CONTROL */}
            <div className="p-3">

                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Blend size={16} /> Control de opacidad
                </h4>

                <div className="space-y-1">

                    <input
                        className='flex w-full'
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={opacity}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>

            </div>

        </div>
    );
}

