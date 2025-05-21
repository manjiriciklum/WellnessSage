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
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function DoctorMap({ doctors, selectedDoctor, onDoctorSelect, onMapReady }: DoctorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: doctors.length > 0 ? [doctors[0].location.lng, doctors[0].location.lat] : [-98.5795, 39.8283],
        zoom: doctors.length > 0 ? 12 : 3.5,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 20
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        if (onMapReady) {
          onMapReady(map.current);
        }
      });
    }
  }, [doctors, onMapReady]);

  // Update markers when doctors change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each doctor
    doctors.forEach(doctor => {
      if (!doctor.location?.lat || !doctor.location?.lng) return;

      // Create popup with styled content
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'doctor-popup',
        maxWidth: '300px'
      }).setHTML(`
        <div class="p-3 bg-white rounded-lg shadow-lg">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-blue-600 font-semibold">${doctor.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Dr. ${doctor.name}</h3>
              <p class="text-sm text-blue-600">${doctor.specialty}</p>
            </div>
          </div>
          <div class="space-y-1 text-sm text-gray-600">
            <p class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              ${doctor.area}, ${doctor.city}
            </p>
            <p class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              ${doctor.experience} years experience
            </p>
            <p class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              ${doctor.rating.toFixed(1)} rating
            </p>
          </div>
        </div>
      `);

      // Create marker with custom styling
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