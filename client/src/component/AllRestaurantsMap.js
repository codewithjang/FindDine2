import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix default marker icon issue in leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AllRestaurantsMap = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/restaurants')
      .then(res => {
        setRestaurants(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลร้านอาหาร');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูลร้านอาหาร...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // หา center ของแผนที่ (ถ้ามีร้าน)
  const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);
  const center = validRestaurants.length > 0
    ? [Number(validRestaurants[0].latitude), Number(validRestaurants[0].longitude)]
    : [13.7563, 100.5018]; // Default: Bangkok

  return (
    <div style={{ height: '90vh', width: '100%' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validRestaurants.map((r, idx) => (
          <Marker
            key={r.id || idx}
            position={[Number(r.latitude), Number(r.longitude)]}
          >
            <Popup>
              <b>{r.restaurantName}</b><br />
              {r.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AllRestaurantsMap;
