import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const redIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 36px; height: 36px; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});
L.Marker.prototype.options.icon = redIcon;

interface WeatherMapProps {
  lat: number;
  lon: number;
}

function MapUpdater({ lat, lon }: { lat: number, lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 10, { duration: 1.5 });
  }, [lat, lon, map]);
  return null;
}

export default function WeatherMap({ lat, lon }: WeatherMapProps) {
  if (lat === undefined || lon === undefined) return null;

  return (
    <section className="rounded-2xl overflow-hidden border border-border h-96 z-0 relative isolate">
      <MapContainer 
        center={[lat, lon]} 
        zoom={10} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }} 
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]} />
        <MapUpdater lat={lat} lon={lon} />
      </MapContainer>
    </section>
  );
}
