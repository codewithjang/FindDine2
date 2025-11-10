import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RestaurantMap = ({ latitude, longitude, name }) => {
  const [userLocation, setUserLocation] = useState(null);

  // ✅ ขอสิทธิ์เข้าถึงตำแหน่งของผู้ใช้
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("ไม่สามารถเข้าถึงตำแหน่งของคุณ:", err.message);
        }
      );
    }
  }, []);

  // ✅ เมื่อผู้ใช้คลิกบนแผนที่ ให้นำทางไปยัง Google Maps
  const MapClickHandler = () => {
    useMapEvent('click', () => {
      const destination = `${latitude},${longitude}`;
      const origin = userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : ''; // ถ้ามีตำแหน่งผู้ใช้
      const googleMapsUrl = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
        : `https://www.google.com/maps/search/?api=1&query=${destination}`;
      window.open(googleMapsUrl, '_blank');
    });
    return null;
  };

  if (!latitude || !longitude) {
    return <div>ไม่พบพิกัดร้านอาหาร</div>;
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        style={{ height: '400px', width: '100%', cursor: 'pointer' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            📍 {name || 'ร้านอาหาร'}
            <br />
            คลิกบนแผนที่เพื่อเปิดใน Google Maps
          </Popup>
        </Marker>
        <MapClickHandler />
      </MapContainer>
    </div>
  );
};

export default RestaurantMap;
