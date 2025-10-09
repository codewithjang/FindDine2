import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// Component สำหรับอัพเดทตำแหน่งแผนที่
function MapUpdater({ position, onMapClick }) {
    const map = useMap();

    useEffect(() => {
        map.setView(position, 15);
    }, [map, position]);

    // เพิ่ม event สำหรับคลิกบนแผนที่
    useMapEvent('click', (e) => {
        if (onMapClick) {
            onMapClick([e.latlng.lat, e.latlng.lng]);
        }
    });

    return null;
}

export default function MapPicker({ setCoordinates }) {
    const [position, setPosition] = useState([13.7563, 100.5018]); // กรุงเทพ
    const [confirmedPosition, setConfirmedPosition] = useState(null); // ตำแหน่งที่ยืนยันแล้ว
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasChanged, setHasChanged] = useState(false); // เช็คว่ามีการเปลี่ยนแปลงตำแหน่งหรือไม่
    const searchTimeoutRef = useRef(null);
    const suggestionsRef = useRef(null);

    // ฟังก์ชันค้นหาสถานที่
    const searchPlaces = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // ✅ เรียกผ่าน backend แทน
            const res = await fetch(
                `http://localhost:3001/api/map/search?q=${encodeURIComponent(query)}`
            );

            if (!res.ok) throw new Error('API request failed');
            const data = await res.json();

            const formattedSuggestions = data.map(item => ({
                id: item.place_id,
                name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type,
                address: item.display_name
            }));

            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
        } catch (err) {
            console.error('เกิดข้อผิดพลาดในการค้นหา:', err);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change with debouncing
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchPlaces(search);
        }, 300); // รอ 300ms หลังจากหยุดพิมพ์

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    // ปิด suggestions เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // เลือกสถานที่จาก suggestions
    const selectPlace = (place) => {
        const newPos = [place.lat, place.lon];
        setPosition(newPos);
        setSearch(place.name);
        setShowSuggestions(false);
        setSuggestions([]);
        setHasChanged(true); // มีการเปลี่ยนแปลงตำแหน่ง
    };


    // จัดการการลาก marker
    const handleMarkerDrag = (e) => {
        const latlng = e.target.getLatLng();
        const newPos = [latlng.lat, latlng.lng];
        setPosition(newPos);
        setHasChanged(true); // มีการเปลี่ยนแปลงตำแหน่ง
    };

    // จัดการการคลิกบนแผนที่เพื่อย้าย marker
    const handleMapClick = (latlngArr) => {
        setPosition(latlngArr);
        setHasChanged(true);
    };

    // ยืนยันตำแหน่ง
    const confirmPosition = () => {
        setConfirmedPosition(position);
        setCoordinates({ latitude: position[0], longitude: position[1] });
        setHasChanged(false);
        alert('ยืนยันตำแหน่งเรียบร้อยแล้ว!');
    };

    // รีเซ็ตตำแหน่ง
    const resetPosition = () => {
        if (confirmedPosition) {
            setPosition(confirmedPosition);
            setHasChanged(false);
        }
    };

    // ล้างการค้นหา
    const clearSearch = () => {
        setSearch('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // เช็คว่าตำแหน่งปัจจุบันต่างจากตำแหน่งที่ยืนยันแล้วหรือไม่
    const isPositionChanged = hasChanged || (
        confirmedPosition &&
        (Math.abs(position[0] - confirmedPosition[0]) > 0.000001 ||
            Math.abs(position[1] - confirmedPosition[1]) > 0.000001)
    );

    return (
        <div className="relative max-h-[80vh] overflow-y-auto p-4 bg-white rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="mb-4 relative" ref={suggestionsRef}>
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="ค้นหาสถานที่... (พิมพ์อย่างน้อย 2 ตัวอักษร)"
                        className="w-full px-4 py-3 pr-20 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                    />

                    {/* Loading indicator */}
                    {loading && (
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                        </div>
                    )}

                    {/* Clear button */}
                    {search && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((place) => (
                            <div
                                key={place.id}
                                onClick={() => selectPlace(place)}
                                className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {place.name.split(',')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {place.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No results message */}
                {showSuggestions && suggestions.length === 0 && search.length >= 2 && !loading && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="px-4 py-3 text-sm text-gray-500">
                            ไม่พบสถานที่ที่ตรงกับการค้นหา "{search}"
                        </div>
                    </div>
                )}
            </div>

            {/* Current Location Info */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    <strong>ตำแหน่งปัจจุบัน:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    {isPositionChanged && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            ยังไม่ได้ยืนยัน
                        </span>
                    )}
                </p>
                {confirmedPosition && (
                    <p className="text-xs text-green-600 mt-1">
                        <strong>ตำแหน่งที่ยืนยันแล้ว:</strong> {confirmedPosition[0].toFixed(6)}, {confirmedPosition[1].toFixed(6)}
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    * คุณสามารถคลิก หรือ ลากตัว marker เพื่อปรับตำแหน่งได้
                </p>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '400px', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapUpdater position={position} onMapClick={handleMapClick} />
                    <Marker
                        position={position}
                        draggable={true}
                        eventHandlers={{
                            dragend: handleMarkerDrag,
                        }}
                    />
                </MapContainer>
            </div>

            {/* Confirmation Buttons */}
            <div className="mt-4 flex gap-3">
                <button
                    onClick={confirmPosition}
                    disabled={!isPositionChanged}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${isPositionChanged
                        ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        ยืนยันตำแหน่ง
                    </div>
                </button>

                {confirmedPosition && isPositionChanged && (
                    <button
                        onClick={resetPosition}
                        className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            ยกเลิก
                        </div>
                    </button>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">วิธีใช้งาน:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• พิมพ์ชื่อสถานที่ในช่องค้นหา ระบบจะย้าย marker ไปยังตำแหน่งนั้นอัตโนมัติ</li>
                    <li>• หาก marker ไม่ถูกจุด คุณสามารถคลิก หรือ ลากเพื่อปรับตำแหน่งเพิ่มเติมได้</li>
                    <li>• เมื่อพอใจกับตำแหน่งแล้ว กด <strong>"ยืนยันตำแหน่ง"</strong> เพื่อส่งข้อมูลไปยังฟอร์ม</li>
                    <li>• สามารถกด <strong>"ยกเลิก"</strong> เพื่อกลับไปยังตำแหน่งที่ยืนยันล่าสุด</li>
                </ul>
            </div>
        </div>
    );
}