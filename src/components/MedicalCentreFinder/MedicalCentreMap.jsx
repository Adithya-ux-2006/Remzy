import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const USER_ICON = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function createCentreIcon(isSelected) {
  const color = isSelected ? '#dc2626' : '#16a34a';
  const size = isSelected ? 28 : 22;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:all 0.2s;"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MedicalCentreMap({ userLocation, centres, selectedCentre, onSelectCentre }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lon],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: USER_ICON })
      .addTo(map)
      .bindPopup('<strong>Your Location</strong>');

    markersRef.current.push(userMarker);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker, i) => {
      if (i > 0) marker.remove();
    });
    markersRef.current = markersRef.current.slice(0, 1);

    const bounds = L.latLngBounds([[userLocation.lat, userLocation.lon]]);

    centres.forEach((centre) => {
      const icon = createCentreIcon(selectedCentre?.id === centre.id);
      const marker = L.marker([centre.lat, centre.lon], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px">
            <strong style="font-size:14px">${centre.name}</strong>
            <div style="color:#666;font-size:12px;margin:4px 0">${centre.type}</div>
            <div style="font-size:12px;margin-bottom:4px">${centre.distance.toFixed(1)} km away</div>
            ${centre.address ? `<div style="font-size:12px;color:#666;margin-bottom:4px">${centre.address}</div>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${centre.lat},${centre.lon}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;font-size:12px;text-decoration:none;font-weight:600">
              Get Directions &#8599;
            </a>
          </div>
        `);

      marker.on('click', () => onSelectCentre(centre));
      markersRef.current.push(marker);
      bounds.extend([centre.lat, centre.lon]);
    });

    if (centres.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [centres, selectedCentre, onSelectCentre, userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCentre) return;

    map.setView([selectedCentre.lat, selectedCentre.lon], 14, { animate: true });

    const targetMarker = markersRef.current.find(
      (m) => m.getLatLng().lat === selectedCentre.lat && m.getLatLng().lng === selectedCentre.lon
    );
    if (targetMarker) {
      targetMarker.openPopup();
    }
  }, [selectedCentre]);

  return (
    <div
      ref={mapRef}
      className="medical-centre-map w-full h-full"
      style={{ minHeight: '350px' }}
      role="img"
      aria-label="Map showing medical centres near your location"
    />
  );
}
