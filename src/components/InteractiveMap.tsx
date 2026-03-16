"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the Map component with No SSR
const MapContent = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center transition-colors">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest transition-colors">Initializing Radar...</p>
            </div>
        </div>
    )
});

interface MapWrapperProps {
    center: [number, number];
    zoom?: number;
    markers?: {
        position: [number, number];
        type: 'garage' | 'customer' | 'technician' | 'default';
        label?: string;
        draggable?: boolean;
        onDragEnd?: (lat: number, lng: number) => void;
    }[];
    polyline?: [number, number][];
    className?: string;
}

export default function InteractiveMap(props: MapWrapperProps) {
    return <MapContent {...props} />;
}
