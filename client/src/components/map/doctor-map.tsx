import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type Doctor } from '@/types/doctor';

// Set your Mapbox token
mapboxgl.accessToken = 'pk.eyJ1Ijoic3VyeXNhZ2FyIiwiYSI6ImNtOHZvdXU4ZTBzcXYybHMzc3RtZTFmcWoifQ.p5UWQ9bTQS2wyls1ccuU9g';

interface DoctorMapProps {
  doctors: Doctor[];
  selectedDoctor?: Doctor | null;
  onDoctorSelect?: (doctor: Doctor) => void;
}

export function DoctorMap({ doctors, selectedDoctor, onDoctorSelect }: DoctorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3.5,
      attributionControl: false, // We'll add our own attribution
      maxBounds: [
        [-125.0, 24.0], // Southwest coordinates
        [-66.0, 50.0]   // Northeast coordinates
      ],
      minZoom: 2.5,
      maxZoom: 15
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add attribution
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    // Handle resize
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when doctors change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each doctor
    doctors.forEach(doctor => {
      if (!doctor.location?.lat || !doctor.location?.lng) return;

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'doctor-popup'
      }).setHTML(`
        <div class="p-2">
          <h3 class="font-medium">Dr. ${doctor.name}</h3>
          <p class="text-sm text-gray-600">${doctor.specialty}</p>
          <p class="text-sm text-gray-600">${doctor.area}, ${doctor.city}</p>
        </div>
      `);

      // Create marker
      const marker = new mapboxgl.Marker({
        color: selectedDoctor?.id === doctor.id ? '#2563eb' : '#64748b',
        scale: selectedDoctor?.id === doctor.id ? 1.2 : 1
      })
        .setLngLat([doctor.location.lng, doctor.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      marker.getElement().addEventListener('click', () => {
        if (onDoctorSelect) {
          onDoctorSelect(doctor);
        }
      });

      markers.current.push(marker);
    });

    // Fit bounds if there are markers
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
        duration: 1000
      });
    } else {
      // If no markers, focus on US
      map.current.flyTo({
        center: [-98.5795, 39.8283],
        zoom: 3.5,
        duration: 1000
      });
    }
  }, [doctors, selectedDoctor, mapLoaded, onDoctorSelect]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
} 