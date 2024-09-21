"use client";

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CrimeData {
    location: {
        longitude: number;
        latitude: number;
    };
}


export default function MapPage({crimeData, mapCenter}: {crimeData: CrimeData[], mapCenter: { latitude: number; longitude: number }}) {
    const mapContainer = useRef(null);

    useEffect(() => {
        console.log(mapCenter);
        if (mapContainer.current) {
            const map = new maplibregl.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    sources: {
                        'osm': {
                            type: 'raster',
                            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '&copy; OpenStreetMap Contributors',
                        },
                    },
                    layers: [
                        {
                            id: 'background',
                            type: 'background',
                            paint: {
                                'background-color': '#0a0a0a'
                            }
                        },
                        {
                            id: 'osm',
                            type: 'raster',
                            source: 'osm',
                            paint: {
                                'raster-opacity': 0.5,
                                'raster-contrast': -0.2,
                                'raster-saturation': -0.5,
                                'raster-brightness-min': 0.2
                            }
                        }
                    ],
                },
                center: [mapCenter.longitude, mapCenter.latitude],
                zoom: 13
            });

            map.on('load', () => {
                map.addSource('crime-data', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                            features: crimeData.map(crime => ({
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [crime.location.longitude, crime.location.latitude]
                            }
                        }))
                    }
                });

                map.addLayer({
                    id: 'crime-heat',
                    type: 'heatmap',
                    source: 'crime-data',
                    paint: {
                        'heatmap-weight': 1,
                        'heatmap-intensity': 0.6,
                        'heatmap-color': [
                            'interpolate',
                            ['linear'],
                            ['heatmap-density'],
                            0, 'rgba(255, 0, 0, 0)',
                            0.2, 'rgba(255, 0, 0, 0.2)',
                            0.4, 'rgba(255, 0, 0, 0.4)',
                            0.6, 'rgba(255, 0, 0, 0.6)',
                            0.8, 'rgba(255, 0, 0, 0.8)',
                            1, 'rgba(255, 0, 0, 1)'
                        ],
                        'heatmap-radius': 40,
                        'heatmap-opacity': 0.7
                    }
                });
            });

            return () => map.remove();
        }
    }, [crimeData]);

    return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}
