import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../component/MapPicker';
import { Store, Upload, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import bgRes2 from '../assets/bg/bgRes2.png';
export default function RestaurantRegistration() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1
        restaurantName: '',
        foodType: '',
        email: '',
        password: '',
        confirmPassword: '',
        latitude: '',
        longitude: '',

        // Step 2
        address: '',
        nearbyPlaces: '',
        phone: '',
        priceRange: '',
        startingPrice: '',
        description: '',

        // Step 3
        facilities: [],
        paymentOptions: [],
        serviceOptions: [],
        locationStyles: [],
        lifestyles: [],

        // Step 4
        photos: []
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [showMapModal, setShowMapModal] = useState(false);
    const navigate = useNavigate();

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

    const CustomCheckbox = ({ id, label, checked, onChange }) => (
        <div className="checkbox-wrapper-46">
            <input
                type="checkbox"
                id={id}
                className="inp-cbx hidden"
                checked={checked}
                onChange={onChange}
            />
            <label htmlFor={id} className="cbx cursor-pointer flex items-center gap-2 w-full select-none">
                <span className={`relative inline-block w-4 h-4 border rounded transform transition-all duration-200 ${checked ? 'bg-orange-500 border-orange-500' : 'border-gray-400'
                    }`}>
                    {checked && (
                        <svg viewBox="0 0 12 10" className="absolute top-0.5 left-0.5 w-3 h-2.5 fill-none stroke-white stroke-2">
                            <polyline points="1.5 6 4.5 9 10.5 1" strokeLinecap="round" strokeLinejoin="round"></polyline>
                        </svg>
                    )}
                </span>
                <span className="text-sm">{label}</span>
            </label>
        </div>
    );

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox') {
            const currentArray = formData[name] || [];
            if (checked) {
                setFormData(prev => ({
                    ...prev,
                    [name]: [...currentArray, value]
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: currentArray.filter(item => item !== value)
                }));
            }
        } else if (type === 'file' && name === 'photos') {
            const list = Array.from(files || []);

            // เก็บไฟล์จริงไว้ส่งให้ backend
            setFormData(prev => ({ ...prev, photos: [...prev.photos, ...list] }));

            // พรีวิวแบบเบา ๆ
            const urls = list.map(f => URL.createObjectURL(f));
            setPreviewImages(prev => [...prev, ...urls]);

            // เพื่อให้เลือกไฟล์ชื่อเดิมซ้ำได้อีกครั้ง
            e.target.value = null;
            return;
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

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

    const removePhoto = (index) => {
        setPreviewImages(prev => {
            const url = prev[index];
            if (url) URL.revokeObjectURL(url);
            return prev.filter((_, i) => i !== index);
        });
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    // useEffect(() => {
    //     return () => {
    //         previewImages.forEach(u => URL.revokeObjectURL(u));
    //     };
    // }, []);

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.restaurantName.trim()) newErrors.restaurantName = 'กรุณากรอกชื่อร้าน';
                if (!formData.foodType) newErrors.foodType = 'กรุณาเลือกประเภทอาหาร';
                if (!formData.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
                if (!formData.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
                else if (formData.password.length < 8) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
                if (!formData.confirmPassword) newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
                else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
                break;

            case 2:
                if (!formData.address.trim()) newErrors.address = 'กรุณากรอกที่อยู่';
                if (!formData.phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
                break;

            case 3:
                // ข้อมูลในขั้นตอนนี้เป็น optional
                break;

            case 4:
                // ข้อมูลในขั้นตอนนี้เป็น optional
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // แยก function สำหรับ submit
    const handleFinalSubmit = async () => {
        console.log("🚨 Final submit triggered from step:", currentStep);

        // ต้องอยู่ Step 4 และผ่าน validation
        if (currentStep !== 4) return;
        if (!validateStep(4)) return;

        setIsLoading(true);
        try {
            // 1) สร้าง FormData
            const fd = new FormData();

            // 2) แนบไฟล์ทั้งหมด (ชื่อคีย์ต้องตรงกับ backend: upload.array("photos", 10))
            (formData.photos || []).forEach(file => {
                fd.append("photos", file, file.name);
            });

            // 3) แนบฟิลด์ข้อความ/ตัวเลข (schema ตอนนี้ priceRange เป็น String? จึงส่งเป็นสตริง)
            const primitives = [
                "restaurantName",
                "foodType",
                "email",
                "password",
                "latitude",
                "longitude",
                "address",
                "nearbyPlaces",
                "phone",
                "priceRange",     // String?
                "startingPrice",  // Int? (backend จะ parseInt เอง ถ้าว่างจะเป็น null)
                "description",
            ];
            primitives.forEach(k => fd.append(k, formData[k] ?? ""));

            // 4) ฟิลด์ที่เป็นลิสต์ → stringify ก่อน (backend จะ parse JSON)
            fd.append("facilities", JSON.stringify(formData.facilities || []));
            fd.append("paymentOptions", JSON.stringify(formData.paymentOptions || []));
            fd.append("serviceOptions", JSON.stringify(formData.serviceOptions || []));
            fd.append("locationStyles", JSON.stringify(formData.locationStyles || []));
            fd.append("lifestyles", JSON.stringify(formData.lifestyles || []));

            // 5) ยิงไปที่ backend (อย่าเซ็ต headers: Content-Type เอง)
            const res = await fetch("http://localhost:3001/api/restaurants/register", {
                method: "POST",
                body: fd,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "ลงทะเบียนไม่สำเร็จ");
            }

            alert("ลงทะเบียนร้านอาหารเรียบร้อย!");
            navigate("/RestaurantLogin");
        } catch (error) {
            console.error("Submit error:", error);
            alert(error.message || "เกิดข้อผิดพลาดขณะส่งข้อมูล");
        } finally {
            setIsLoading(false);
        }
    };


    // ป้องกัน form submit
    const handleFormSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // ไม่ทำอะไรเลย - ให้ปุ่ม Submit จัดการเอง
        console.log("🛑 Form submit prevented");
    };

    // ป้องกัน Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentStep < 4) {
                handleNext();
            }
            // ใน step 4 ไม่ทำอะไร เพื่อป้องกัน submit
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="w-1/2">
                    <input
                        name="restaurantName"
                        type="text"
                        value={formData.restaurantName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.restaurantName ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="ชื่อร้านอาหาร"
                        required
                    />
                    {errors.restaurantName && <p className="mt-1 text-sm text-red-600">{errors.restaurantName}</p>}
                </div>
                <div className="w-1/2">
                    <select
                        name="foodType"
                        value={formData.foodType}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.foodType ? 'border-red-300' : 'border-gray-300'
                            }`}
                        required
                    >
                        <option value="" disabled>เลือกประเภทอาหาร</option>
                        <optgroup label="อาหารเอเชีย">
                            {foodTypeOptions.slice(0, 9).map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อาหารยุโรป & ตะวันตก">
                            {foodTypeOptions.slice(9, 13).map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อาหารตะวันออกกลาง & ฮาลาล">
                            {foodTypeOptions.slice(13, 15).map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อาหารตามไลฟ์สไตล์ & สุขภาพ">
                            {foodTypeOptions.slice(15, 17).map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="อื่น ๆ">
                            {foodTypeOptions.slice(17).map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </optgroup>
                    </select>
                    {errors.foodType && <p className="mt-1 text-sm text-red-600">{errors.foodType}</p>}
                </div>
            </div>

            <div>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="ที่อยู่อีเมล"
                    required
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="รหัสผ่าน"
                    required
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
                <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="ยืนยันรหัสผ่าน"
                    required
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="flex gap-4">
                <input
                    name="latitude"
                    type="text"
                    value={formData.latitude}
                    readOnly
                    onClick={() => setShowMapModal(true)}
                    className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="ละติจูด *ไม่บังคับ"
                />
                <input
                    name="longitude"
                    type="text"
                    value={formData.longitude}
                    readOnly
                    onClick={() => setShowMapModal(true)}
                    className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="ลองจิจูด *ไม่บังคับ"
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div>
                <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="ที่อยู่"
                    required
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
                <input
                    name="nearbyPlaces"
                    type="text"
                    value={formData.nearbyPlaces}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="สถานที่ใกล้เคียง (เช่น สถานีรถไฟ, ห้างสรรพสินค้า)"
                    required
                />
            </div>

            <div>
                <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="หมายเลขโทรศัพท์"
                    required
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="flex gap-4">
                <input
                    name="priceRange"
                    type="text"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="ช่วงราคา เช่น: 5-500"
                    required
                />
                <input
                    name="startingPrice"
                    type="text"
                    value={formData.startingPrice}
                    onChange={handleInputChange}
                    className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    placeholder="ราคาเริ่มต้น"
                    required
                />
            </div>

            <div>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
                    rows={3}
                    placeholder="รายละเอียด"
                ></textarea>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            {/* Facilities */}
            <div>
                <h4 className="text-sm text-gray-500 mb-1">สิ่งอำนวยความสะดวก</h4>
                <div className="grid grid-cols-2 gap-2">
                    {facilitiesOptions.map(option => (
                        <CustomCheckbox
                            key={option.id}
                            id={option.id}
                            label={option.label}
                            checked={formData.facilities.includes(option.id)}
                            onChange={() => handleCheckboxChange('facilities', option.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Payment Options */}
            <div>
                <h4 className="text-sm text-gray-500 mb-1">การชำระเงิน</h4>
                <div className="grid grid-cols-2 gap-2">
                    {paymentOptionsData.map(option => (
                        <CustomCheckbox
                            key={option.id}
                            id={option.id}
                            label={option.label}
                            checked={formData.paymentOptions.includes(option.id)}
                            onChange={() => handleCheckboxChange('paymentOptions', option.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Service Options */}
            <div>
                <h4 className="text-sm text-gray-500 mb-1">การบริการ</h4>
                <div className="grid grid-cols-2 gap-2">
                    {serviceOptionsData.map(option => (
                        <CustomCheckbox
                            key={option.id}
                            id={option.id}
                            label={option.label}
                            checked={formData.serviceOptions.includes(option.id)}
                            onChange={() => handleCheckboxChange('serviceOptions', option.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Location Style */}
            <div>
                <h4 className="text-sm text-gray-500 mb-1">รูปแบบสถานที่</h4>
                <div className="grid grid-cols-2 gap-2">
                    {locationStylesData.map(option => (
                        <CustomCheckbox
                            key={option.id}
                            id={option.id}
                            label={option.label}
                            checked={formData.locationStyles.includes(option.id)}
                            onChange={() => handleCheckboxChange('locationStyles', option.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Lifestyle */}
            <div>
                <h4 className="text-sm text-gray-500 mb-1">ไลฟ์สไตล์</h4>
                <div className="grid grid-cols-2 gap-2">
                    {lifestylesData.map(option => (
                        <CustomCheckbox
                            key={option.id}
                            id={option.id}
                            label={option.label}
                            checked={formData.lifestyles.includes(option.id)}
                            onChange={() => handleCheckboxChange('lifestyles', option.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-gray-700 mb-2">อัปโหลดรูปภาพ</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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

                {/* Preview uploaded images */}
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
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            default: return null;
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden">
            <img
                src={bgRes2}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
            />
            <div className="relative w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
                {/* Close button */}
                <Link
                    to="/main_page"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    &times;
                </Link>
                <p className="text-lg font-regular text-center mb-4">ลงทะเบียนร้านอาหาร</p>

                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Store className="w-10 h-10 text-orange-500" />
                    </div>
                </div>

                <form id="multiStepForm"
                    onSubmit={handleFormSubmit}
                    onKeyDown={handleKeyDown}>

                    {getCurrentStepContent()}

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-6">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="text-orange-600 hover:underline flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> ก่อนหน้า
                            </button>
                        ) : <div></div>}

                        <span className="text-sm text-gray-500">ขั้นตอนที่ {currentStep} จาก 4</span>

                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-700"
                            >
                                ถัดไป
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={handleFinalSubmit}
                                className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Submitting...' : 'ลงทะเบียน'}
                            </button>
                        )}
                    </div>
                </form>

                {errors.general && (
                    <p className="mt-4 text-sm text-red-600 text-center">{errors.general}</p>
                )}

                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>มีบัญชีอยู่แล้ว? <a href="/RestaurantLogin" className="text-orange-600 hover:underline">เข้าสู่ระบบ</a></p>
                </div>

                {/* Google Login Button */}
                <div className="mt-4">
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-3xl shadow-md transition-all hover:bg-gray-100 active:bg-gray-300 transform active:scale-95 text-sm font-medium"
                    >
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            version="1.1"
                            x="0px"
                            y="0px"
                            className="w-5 h-5"
                            viewBox="0 0 48 48"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
                            c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
                            c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
                            C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
                            c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
                            c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        <span>ลงทะเบียนด้วยบัญชี Google</span>
                    </button>
                </div>
            </div>

            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-11/12 max-w-2xl">
                        <h2 className="text-lg font-medium mb-2">เลือกตำแหน่งร้าน</h2>

                        <MapPicker setCoordinates={({ latitude, longitude }) => {
                            setFormData(prev => ({ ...prev, latitude, longitude }));
                            setShowMapModal(false); // ปิด modal หลังเลือก
                        }} />

                        <button
                            onClick={() => setShowMapModal(false)}
                            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}