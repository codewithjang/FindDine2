import React, { useState } from "react";
import axios from "axios";
import { Upload, X, MapPin } from "lucide-react";
import MapPicker from "../component/MapPicker";

const AdminAddRestaurantForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1
        restaurantName: "",
        foodType: "",
        email: "",
        password: "",
        latitude: "",
        longitude: "",

        // Step 2
        address: "",
        phone: "",
        priceRange: "",
        startingPrice: "",
        description: "",
        openTime: "",
        closeTime: "",

        // Step 3
        facilities: [],
        paymentOptions: [],
        serviceOptions: [],
        locationStyles: [],
        lifestyles: [],
        photos: []
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [previewImages, setPreviewImages] = useState([]);
    const [showMapModal, setShowMapModal] = useState(false);

    const foodTypeOptions = [
        { value: "thai", label: "อาหารไทย" },
        { value: "chinese", label: "อาหารจีน" },
        { value: "japanese", label: "อาหารญี่ปุ่น" },
        { value: "korean", label: "อาหารเกาหลี" },
        { value: "vietnamese", label: "อาหารเวียดนาม" },
        { value: "indian", label: "อาหารอินเดีย" },
        { value: "malaysian", label: "อาหารมาเลย์" },
        { value: "indonesian", label: "อาหารอินโดนีเซีย" },
        { value: "filipino", label: "อาหารฟิลิปปินส์" },
        { value: "western", label: "อาหารตะวันตก" },
        { value: "italian", label: "อาหารอิตาเลียน" },
        { value: "french", label: "อาหารฝรั่งเศส" },
        { value: "mexican", label: "อาหารแม็กซิกัน" },
        { value: "middle-eastern", label: "อาหารตะวันออกกลาง" },
        { value: "halal", label: "อาหารฮาลาล" },
        { value: "vegetarian", label: "อาหารมังสวิรัติ" },
        { value: "vegan", label: "อาหารเจ" },
        { value: "fast-food", label: "อาหารจานด่วน" },
        { value: "seafood", label: "อาหารทะเล" },
        { value: "dessert", label: "ของหวาน / เบเกอรี่" },
        { value: "cafe", label: "ร้านกาแฟ" },
        { value: "street-food", label: "อาหารริมทาง" },
        { value: "fusion", label: "อาหารผสมผสาน" },
        { value: "bbq", label: "บาร์บีคิว / ปิ้งย่าง" }
    ];

    const facilitiesOptions = [
        { id: 'parking_space', label: 'ที่จอดรถ' },
        { id: 'wifi_available', label: 'มี Wi-Fi' },
        { id: 'work_space_available', label: 'พื้นที่ทำงาน' },
        { id: 'pet_friendly', label: 'เป็นมิตรกับสัตว์เลี้ยง' },
        { id: 'kids_area', label: 'โซนสำหรับเด็ก' }
    ];

    const paymentOptionsData = [
        { id: 'accepts_bank_payment', label: 'รับชำระผ่านธนาคาร' },
        { id: 'accepts_credit_card', label: 'รับบัตรเครดิต' }
    ];

    const serviceOptionsData = [
        { id: 'accepts_reservation', label: 'รับการจอง' }
    ];

    const locationStylesData = [
        { id: 'in_city', label: 'ในเมือง' },
        { id: 'sea_view', label: 'วิวทะเล' },
        { id: 'natural_style', label: 'สไตล์ธรรมชาติ' }
    ];

    const lifestylesData = [
        { id: 'halal', label: 'ฮาลาล' },
        { id: 'vegan_option', label: 'มังสวิรัติ/วีแกน' }
    ];

    const handleCheckboxChange = (category, value) => {
        const currentArray = formData[category] || [];
        if (currentArray.includes(value)) {
            setFormData(prev => ({
                ...prev,
                [category]: currentArray.filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [category]: [...currentArray, value]
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file" && name === "photos") {
            const newFiles = Array.from(files);
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...newFiles]
            }));

            // Preview images
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImages(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const removePhoto = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const validateStep = (step) => {
        setError("");

        if (step === 1) {
            if (!formData.restaurantName) {
                setError("กรุณากรอกชื่อร้านอาหาร");
                return false;
            }
            if (!formData.foodType) {
                setError("กรุณาเลือกประเภทอาหาร");
                return false;
            }
            if (!formData.email) {
                setError("กรุณากรอกอีเมล");
                return false;
            }
            if (!formData.password || formData.password.length < 6) {
                setError("กรุณากรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)");
                return false;
            }
        }

        if (step === 2) {
            if (!formData.address) {
                setError("กรุณากรอกที่อยู่");
                return false;
            }
            if (!formData.phone) {
                setError("กรุณากรอกเบอร์โทรศัพท์");
                return false;
            }
            if (!formData.priceRange) {
                setError("กรุณากรอกช่วงราคา");
                return false;
            }
            if (!formData.startingPrice) {
                setError("กรุณากรอกราคาเริ่มต้น");
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) {
            setError("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const fd = new FormData();

            // เพิ่มรูปภาพ
            formData.photos.forEach(file => {
                fd.append("photos", file);
            });

            // เพิ่ม arrays (serialize เป็น JSON) และข้อมูลฟอร์ม
            fd.append("facilities", JSON.stringify(formData.facilities || []));
            fd.append("paymentOptions", JSON.stringify(formData.paymentOptions || []));
            fd.append("serviceOptions", JSON.stringify(formData.serviceOptions || []));
            fd.append("locationStyles", JSON.stringify(formData.locationStyles || []));
            fd.append("lifestyles", JSON.stringify(formData.lifestyles || []));

            // เพิ่มข้อมูลฟอร์ม
            fd.append("restaurantName", formData.restaurantName);
            fd.append("foodType", formData.foodType);
            fd.append("email", formData.email);
            fd.append("password", formData.password);
            fd.append("address", formData.address);
            fd.append("phone", formData.phone);
            fd.append("latitude", formData.latitude || "");
            fd.append("longitude", formData.longitude || "");
            fd.append("priceRange", formData.priceRange);
            fd.append("startingPrice", formData.startingPrice);
            fd.append("description", formData.description);
            fd.append("openTime", formData.openTime);
            fd.append("closeTime", formData.closeTime);

            const res = await axios.post("http://localhost:3001/api/restaurants/register", fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": localStorage.getItem("token") || ""
                }
            });

            setMessage("เพิ่มร้านอาหารสำเร็จ!");

            // รีเซ็ตฟอร์ม
            setCurrentStep(1);
            setFormData({
                restaurantName: "",
                foodType: "",
                email: "",
                password: "",
                address: "",
                phone: "",
                latitude: "",
                longitude: "",
                priceRange: "",
                startingPrice: "",
                description: "",
                openTime: "",
                closeTime: "",
                facilities: [],
                paymentOptions: [],
                serviceOptions: [],
                locationStyles: [],
                lifestyles: [],
                photos: []
            });
            setPreviewImages([]);
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาด: " + err.message);
        }
        setLoading(false);
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm text-gray-600 mb-1">ชื่อร้านอาหาร *</label>
                    <input
                        name="restaurantName"
                        type="text"
                        value={formData.restaurantName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                        placeholder="กรอกชื่อร้านอาหาร"
                    />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm text-gray-600 mb-1">ประเภทอาหาร *</label>
                    <select
                        name="foodType"
                        value={formData.foodType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    >
                        <option value="">เลือกประเภทอาหาร</option>
                        <optgroup label="อาหารเอเชีย">
                            {foodTypeOptions.slice(0, 9).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อาหารยุโรป & ตะวันตก">
                            {foodTypeOptions.slice(9, 13).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อาหารตะวันออกกลาง & ฮาลาล">
                            {foodTypeOptions.slice(13, 15).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อาหารตามไลฟ์สไตล์ & สุขภาพ">
                            {foodTypeOptions.slice(15, 17).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อื่น ๆ">
                            {foodTypeOptions.slice(17).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">อีเมล *</label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="กรอกอีเมลร้านอาหาร"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">รหัสผ่าน *</label>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                />
            </div>

            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">ละติจูด</label>
                    <input
                        name="latitude"
                        type="text"
                        value={formData.latitude}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 border-gray-300"
                        placeholder="ระบุจากแผนที่"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">ลองจิจูด</label>
                    <input
                        name="longitude"
                        type="text"
                        value={formData.longitude}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 border-gray-300"
                        placeholder="ระบุจากแผนที่"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                    <MapPin className="w-4 h-4" />
                    เลือกพิกัด
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm text-gray-600 mb-1">ที่อยู่ *</label>
                <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="กรอกที่อยู่ร้านอาหาร"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์ *</label>
                <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="กรอกเบอร์โทรศัพท์"
                />
            </div>

            <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm text-gray-600 mb-1">เวลาเปิดร้าน</label>
                    <input
                        name="openTime"
                        type="time"
                        value={formData.openTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm text-gray-600 mb-1">เวลาปิดร้าน</label>
                    <input
                        name="closeTime"
                        type="time"
                        value={formData.closeTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm text-gray-600 mb-1">ช่วงราคา *</label>
                    <input
                        name="priceRange"
                        type="text"
                        value={formData.priceRange}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                        placeholder="เช่น: 100-500"
                    />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm text-gray-600 mb-1">ราคาเริ่มต้น *</label>
                    <input
                        name="startingPrice"
                        type="number"
                        value={formData.startingPrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                        placeholder="กรอกราคาเริ่มต้น"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">รายละเอียด</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    rows="4"
                    placeholder="กรอกรายละเอียดเกี่ยวกับร้านอาหาร"
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            {/* Facilities */}
            <div>
                <h4 className="text-sm text-gray-500 mb-2">สิ่งอำนวยความสะดวก</h4>
                <div className="grid grid-cols-2 gap-2">
                    {facilitiesOptions.map(option => (
                        <label key={option.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.facilities.includes(option.id)}
                                onChange={() => handleCheckboxChange('facilities', option.id)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Payment Options */}
            <div>
                <h4 className="text-sm text-gray-500 mb-2">การชำระเงิน</h4>
                <div className="grid grid-cols-2 gap-2">
                    {paymentOptionsData.map(option => (
                        <label key={option.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.paymentOptions.includes(option.id)}
                                onChange={() => handleCheckboxChange('paymentOptions', option.id)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Service Options */}
            <div>
                <h4 className="text-sm text-gray-500 mb-2">การบริการ</h4>
                <div className="grid grid-cols-2 gap-2">
                    {serviceOptionsData.map(option => (
                        <label key={option.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.serviceOptions.includes(option.id)}
                                onChange={() => handleCheckboxChange('serviceOptions', option.id)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location Styles */}
            <div>
                <h4 className="text-sm text-gray-500 mb-2">รูปแบบสถานที่</h4>
                <div className="grid grid-cols-2 gap-2">
                    {locationStylesData.map(option => (
                        <label key={option.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.locationStyles.includes(option.id)}
                                onChange={() => handleCheckboxChange('locationStyles', option.id)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Lifestyle */}
            <div>
                <h4 className="text-sm text-gray-500 mb-2">ไลฟ์สไตล์</h4>
                <div className="grid grid-cols-2 gap-2">
                    {lifestylesData.map(option => (
                        <label key={option.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.lifestyles.includes(option.id)}
                                onChange={() => handleCheckboxChange('lifestyles', option.id)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Photos */}
            <div>
                <label className="block text-sm text-gray-600 mb-1">อัปโหลดรูปภาพร้านอาหาร</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="fileUpload"
                        onChange={handleInputChange}
                        name="photos"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดหรือลากและวาง</p>
                    </label>
                </div>

                {previewImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {previewImages.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image}
                                    alt={`Preview ${index}`}
                                    className="w-full h-20 object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const getCurrentStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return renderStep1();
        }
    };

    return (
        <div className="flex justify-center ">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">

                <h2 className="text-2xl font-bold mb-4">เพิ่มร้านอาหารใหม่</h2>

                {message && (
                    <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
                        ✅ {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
                        ❌ {error}
                    </div>
                )}

                <form>
                    {getCurrentStepContent()}

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="text-orange-600 hover:text-orange-700 font-medium transition"
                            >
                                ← ย้อนกลับ
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <span className="text-sm text-gray-500">
                            ขั้นตอนที่ {currentStep} จาก 3
                        </span>

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
                            >
                                ถัดไป →
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleSubmit}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "กำลังบันทึก..." : "✓ ยืนยันและเพิ่มร้านอาหาร"}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">เลือกพิกัดร้านอาหาร</h3>

                        <MapPicker
                            setCoordinates={({ latitude, longitude }) => {
                                setFormData(prev => ({ ...prev, latitude, longitude }));
                                setShowMapModal(false);
                            }}
                        />

                        <button
                            type="button"
                            onClick={() => setShowMapModal(false)}
                            className="mt-4 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 w-full"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAddRestaurantForm;
