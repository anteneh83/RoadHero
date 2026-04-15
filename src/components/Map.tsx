"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@/hooks/useTheme';

// Fix for default marker icons in Leaflet with Next.js/Webpack
// Component to handle theme-based map tiles
const DarkTileLayer = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={isDark
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            }
        />
    );
};

const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for a premium look
const garageIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: white; border: 2px solid #1E3A8A; color: #1E3A8A; border-radius: 12px; width: 44px; height: 44px; display: flex; items-center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);"><span style="font-weight: 900; font-size: 16px;">+</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
});

const customerIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #F97316; border: 3px solid white; color: white; border-radius: 50%; width: 44px; height: 44px; display: flex; items-center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
});

const technicianIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: white; border: 2px solid #1E3A8A; color: #1E3A8A; border-radius: 12px; width: 44px; height: 44px; display: flex; items-center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
});

interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: {
        position: [number, number];
        type: 'garage' | 'customer' | 'technician' | 'default';
        label?: string;
        draggable?: boolean;
        onDragEnd?: (lat: number, lng: number) => void;
        onClick?: () => void;
    }[];
    polyline?: [number, number][];
    className?: string;
}

// Component to handle map center changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function Map({ center, zoom = 13, markers = [], polyline, className }: MapProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className={className}
            style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
            zoomControl={false}
        >
            <ChangeView center={center} zoom={zoom} />
            <ChangeView center={center} zoom={zoom} />
            <DarkTileLayer />
            {markers.map((marker, idx) => (
                <Marker
                    key={idx}
                    position={marker.position}
                    icon={
                        marker.type === 'garage' ? garageIcon :
                            marker.type === 'customer' ? customerIcon :
                                marker.type === 'technician' ? technicianIcon :
                                    DefaultIcon
                    }
                    draggable={marker.draggable}
                    eventHandlers={{
                        dragend: (e) => {
                            if (marker.onDragEnd) {
                                const latLng = e.target.getLatLng();
                                marker.onDragEnd(latLng.lat, latLng.lng);
                            }
                        },
                        click: () => {
                            if (marker.onClick) {
                                marker.onClick();
                            }
                        }
                    }}
                >
                    {marker.label && (
                        <Popup>
                            <span className="text-[10px] font-black uppercase tracking-widest">{marker.label}</span>
                        </Popup>
                    )}
                </Marker>
            ))}
            {polyline && <Polyline positions={polyline} color="#1E3A8A" weight={4} dashArray="10, 10" opacity={0.6} />}
        </MapContainer>
    );
}
