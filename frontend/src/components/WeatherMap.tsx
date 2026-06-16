import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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
