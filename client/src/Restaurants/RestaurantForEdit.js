import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Store, Upload, Save, PlusCircle, ArrowLeft, X } from 'lucide-react';
import bgRes2 from '../assets/bg/bgRes2.png';
import MapPicker from '../component/MapPicker';

// ---------- helpers ----------
const toArray = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim()) {
        try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
};
const normalizeFromBackend = (data) => {
    const photosArr = toArray(data.photos);
    const photos = photosArr.map(p => (typeof p === 'string' ? { url: p } : p));
    return {
        ...data,
        facilities: toArray(data.facilities),
        paymentOptions: toArray(data.paymentOptions),
        serviceOptions: toArray(data.serviceOptions),
        locationStyles: toArray(data.locationStyles),
        lifestyles: toArray(data.lifestyles),
        photos,
    };
};

export default function RestaurantForEdit() {
    const { id } = useParams();
    const restaurantId = id;
    const navigate = useNavigate();
    const isEditMode = Boolean(restaurantId);

    const [formData, setFormData] = useState({
        restaurantName: '',
        foodType: '',
        email: '',
        password: '',
        address: '',
        nearbyPlaces: '',
        phone: '',
        priceRange: '',
        startingPrice: '',
        description: '',
        latitude: '',
        longitude: '',
        facilities: [],
        paymentOptions: [],
        serviceOptions: [],
        locationStyles: [],
        lifestyles: [],
        photos: [], // may contain {url} objects (existing) or File (new)
    });

    const [previewImages, setPreviewImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);

    // ---------- load one restaurant in edit mode ----------
    useEffect(() => {
        if (!restaurantId) return;
        const token = localStorage.getItem('token');
        axios
            .get(`http://localhost:3001/api/restaurants/${restaurantId}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
            .then(res => {
                const normalized = normalizeFromBackend(res.data);
                setFormData(prev => ({ ...prev, ...normalized }));
                setPreviewImages(normalized.photos.map(p => p.url).filter(Boolean));
            })
            .catch(err => console.error('โหลดข้อมูลไม่สำเร็จ:', err));
    }, [restaurantId]);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = e => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
        const newUrls = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newUrls]);
        e.target.value = null;
    };

    const removePhoto = index => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (isEditMode) {
                // PUT: ส่งเป็น JSON (ตามโค้ดเดิมของโปรเจกต์)
                // ตัดไฟล์ออก (ถ้าจะอัปเดตรูปต้องรองรับ endpoint multipart เพิ่มเติม)
                const payload = { ...formData };
                payload.photos = payload.photos.filter(p => !(p instanceof File));
                // ✅ แปลงค่าที่ควรเป็นตัวเลข
                if (payload.startingPrice !== null && payload.startingPrice !== undefined && payload.startingPrice !== '') {
                    payload.startingPrice = parseInt(payload.startingPrice, 10);
                } else {
                    payload.startingPrice = null;
                }

                if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
                if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
                // ให้แน่ใจว่า fields แบบลิสต์เป็นอาเรย์ (หรือสตริง JSON ถ้า backend ต้องการ)
                // ถ้า backend คาดเป็นสตริง JSON ให้ uncomment บรรทัดด้านล่าง:
                // payload.paymentOptions = JSON.stringify(payload.paymentOptions || []);
                // payload.facilities = JSON.stringify(payload.facilities || []);
                // payload.serviceOptions = JSON.stringify(payload.serviceOptions || []);
                // payload.locationStyles = JSON.stringify(payload.locationStyles || []);
                // payload.lifestyles = JSON.stringify(payload.lifestyles || []);

                await axios.put(
                    `http://localhost:3001/api/restaurants/${restaurantId}`,
                    payload,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                );
                alert('✅ แก้ไขข้อมูลเรียบร้อยแล้ว');
            } else {
                // POST register: ใช้ multipart/form-data (รองรับอัปโหลดรูป)
                const fd = new FormData();
                const keysAsText = [
                    'restaurantName', 'foodType', 'email', 'password', 'address', 'nearbyPlaces',
                    'phone', 'priceRange', 'startingPrice', 'description', 'latitude', 'longitude'
                ];
                keysAsText.forEach(k => fd.append(k, formData[k] ?? ''));

                // fields แบบลิสต์ → ส่งเป็นสตริง JSON
                fd.append('facilities', JSON.stringify(formData.facilities || []));
                fd.append('paymentOptions', JSON.stringify(formData.paymentOptions || []));
                fd.append('serviceOptions', JSON.stringify(formData.serviceOptions || []));
                fd.append('locationStyles', JSON.stringify(formData.locationStyles || []));
                fd.append('lifestyles', JSON.stringify(formData.lifestyles || []));

                // แนบไฟล์ใหม่เท่านั้น
                formData.photos.forEach(file => { if (file instanceof File) fd.append('photos', file, file.name); });

                await fetch(`http://localhost:3001/api/restaurants/register`, { method: 'POST', body: fd });
                alert('✅ เพิ่มร้านใหม่เรียบร้อย');
            }

            navigate(`/RestaurantForMainPage/${restaurantId}`);
        } catch (err) {
            console.error(err);
            alert('❌ เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- UI ----------
    return (
        <div className="relative min-h-screen bg-gradient-to-r from-gray-200 via-white to-gray-200 overflow-hidden pt-20 pb-16 flex justify-center">

            <div className="relative z-10 w-4/5 max-w-6xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                {/* top bar */}
                <div className="flex items-center justify-between px-8 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Store className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {isEditMode ? 'แก้ไขข้อมูลร้านอาหาร' : 'เพิ่มร้านอาหารใหม่'}
                            </h2>
                            <p className="text-sm text-gray-500">{formData.restaurantName || 'โปรไฟล์ร้าน'}</p>
                        </div>
                    </div>
                    <Link to={`/RestaurantForMainPage/${restaurantId}`} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</Link>
                </div>

                {/* two-column layout */}
                <div className="flex">
                    {/* left: profile / photos */}
                    <aside className="w-1/3 bg-gray-50 border-r p-6">
                        <div className="flex flex-col items-center">
                            <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                                <Store className="w-14 h-14 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 text-center">{formData.restaurantName || 'ชื่อร้านอาหาร'}</h3>
                            <p className="text-gray-500 text-sm mb-4">{formData.foodType || 'ประเภทอาหาร'}</p>

                            {previewImages.length ? (
                                <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                                    {previewImages.map((img, i) => (
                                        <div key={i} className="relative">
                                            <img src={img} alt="" className="rounded-lg h-24 w-full object-cover" />
                                            <button
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic mt-2">ยังไม่มีรูปภาพร้าน</p>
                            )}

                            <label htmlFor="upload" className="cursor-pointer mt-4 text-orange-600 hover:underline text-sm flex items-center gap-2">
                                <Upload className="w-4 h-4" /> อัปโหลดรูปภาพ
                            </label>
                            <input id="upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    </aside>

                    {/* right: editable fields */}
                    <main className="w-2/3 p-8">
                        <div className="grid grid-cols-2 gap-5 text-gray-700">
                            <div>
                                <label className="text-sm font-medium">ชื่อร้านอาหาร</label>
                                <input name="restaurantName" value={formData.restaurantName} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">ประเภทอาหาร</label>
                                <input name="foodType" value={formData.foodType} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>

                            <div>
                                <label className="text-sm font-medium">อีเมลร้านอาหาร</label>
                                <input name="email" value={formData.email} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">เบอร์โทรศัพท์</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>

                            <div className="col-span-2">
                                <label className="text-sm font-medium">ที่อยู่ร้าน</label>
                                <input name="address" value={formData.address} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>

                            <div>
                                <label className="text-sm font-medium">สถานที่ใกล้เคียง</label>
                                <input name="nearbyPlaces" value={formData.nearbyPlaces} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">ช่วงราคา</label>
                                <input name="priceRange" value={formData.priceRange} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>

                            <div>
                                <label className="text-sm font-medium">ราคาเริ่มต้น</label>
                                <input name="startingPrice" value={formData.startingPrice} onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">รายละเอียดร้าน</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500"></textarea>
                            </div>

                            <div className="col-span-2 flex gap-4">
                                <input name="latitude" value={formData.latitude} readOnly onClick={() => setShowMapModal(true)}
                                    placeholder="ละติจูด"
                                    className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
                                <input name="longitude" value={formData.longitude} readOnly onClick={() => setShowMapModal(true)}
                                    placeholder="ลองจิจูด"
                                    className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-orange-600 hover:underline">
                                <ArrowLeft className="w-4 h-4" /> กลับ
                            </button>
                            <button onClick={handleSubmit} disabled={isLoading}
                                className="bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 disabled:opacity-50">
                                {isEditMode ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                                {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มร้านอาหาร'}
                            </button>
                        </div>
                    </main>
                </div>
            </div>

            {/* Map modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-11/12 max-w-2xl">
                        <h2 className="text-lg font-medium mb-2">เลือกตำแหน่งร้าน</h2>
                        <MapPicker setCoordinates={({ latitude, longitude }) => {
                            setFormData(prev => ({ ...prev, latitude, longitude }));
                            setShowMapModal(false);
                        }} />
                        <button onClick={() => setShowMapModal(false)}
                            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
}
