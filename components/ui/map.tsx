"use client";

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Define the structure of crime data
interface CrimeData {
    location: {
        longitude: number;
        latitude: number;
    };
}

// Main component for rendering the map
export default function MapPage({crimeData, mapCenter}: {crimeData: CrimeData[], mapCenter: { latitude: number; longitude: number }}) {
    // Create a ref to hold the map container DOM element
    const mapContainer = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        
        // Check if the map container is available
        if (mapContainer.current) {
            // Initialize the map
            const map = new maplibregl.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    sources: {
                        // Define OpenStreetMap as the base map source
                        'osm': {
                            type: 'raster',
                            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '&copy; OpenStreetMap Contributors',
                        },
                    },
                    layers: [
                        // Set a dark background
                        {
                            id: 'background',
                            type: 'background',
                            paint: {
                                'background-color': '#0a0a0a'
                            }
                        },
                        // Add the OpenStreetMap layer with custom styling
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

            // Add crime data to the map once it's loaded
            map.on('load', () => {
                // Add crime data as a GeoJSON source
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

                // Add a heatmap layer to visualize crime density
                map.addLayer({
                    id: 'crime-heat',
                    type: 'heatmap',
                    source: 'crime-data',
                    paint: {
                        // Customize heatmap appearance
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

                // Set loading state to false after map is loaded
                setIsLoading(false);
            });

            // Clean up function to remove the map when the component unmounts
            return () => map.remove();
        }
    }, [crimeData]); // Re-run effect when crimeData changes

    // Render the map container with a loading spinner
    return (
        <div style={{ position: 'relative', width: '100%', height: '400px' }}>
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                }}>
                    <div className="spinner"></div>
                </div>
            )}
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
