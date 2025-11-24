import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bgFood from '../assets/bg/bg_EP.png';

export default function EditProfile() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        console.log('[EditProfile] localStorage user:', userStr);
        if (!userStr) {
            navigate('/UserLogin');
            return;
        }
        let user = null;
        try {
            user = JSON.parse(userStr);
            console.log('[EditProfile] parsed user:', user);
        } catch {
            navigate('/UserLogin');
            return;
        }
        const userId = user.id;
        axios.get(`http://localhost:3001/api/users/${userId}`)
            .then(res => {
                setFormData({
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    email: res.data.email
                });
            })
            .catch(() => setError('ไม่สามารถโหลดข้อมูลผู้ใช้'));
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const handleChangePassword = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setError('กรุณาเข้าสู่ระบบก่อน');
            navigate('/UserLogin');
            return;
        }

        let user = JSON.parse(userStr);
        const userId = user.id || (user.user && user.user.id);

        if (!userId) {
            setError("ไม่พบข้อมูลผู้ใช้");
            return;
        }

        try {
            // 1) อัปเดตโปรไฟล์ก่อน
            const res = await axios.put(
                `http://localhost:3001/api/users/${userId}`,
                formData
            );

            if (res.data.success || res.data.id) {
                localStorage.setItem("user", JSON.stringify(res.data.user || res.data));
            } else {
                setError(res.data.message || "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
                return;
            }

            // 2) ตรวจว่าผู้ใช้ต้องการเปลี่ยนรหัสผ่านไหม
            const isChangingPassword =
                passwordData.currentPassword.trim() !== "" ||
                passwordData.newPassword.trim() !== "" ||
                passwordData.confirmPassword.trim() !== "";

            if (isChangingPassword) {
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    setError("รหัสผ่านใหม่ไม่ตรงกัน");
                    return;
                }

                const passRes = await axios.put(
                    `http://localhost:3001/api/users/${userId}/change-password`,
                    passwordData
                );

                if (!passRes.data.success) {
                    setError(passRes.data.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
                    return;
                }
            }

            setMessage("บันทึกข้อมูลสำเร็จ!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden px-4">
            {/* Background Image */}
            <img
                src={bgFood}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
            />

            {/* Form Container */}
            <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
                <h2 className="text-3xl font-semibold text-center mb-2">แก้ไขโปรไฟล์</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">ชื่อ</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">นามสกุล</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">อีเมล</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handleChangePassword}
                            className="w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">รหัสผ่านใหม่</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handleChangePassword}
                            className="w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handleChangePassword}
                            className="w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>

                    {error && <div className="text-red-500">{error}</div>}
                    {message && <div className="text-green-500">{message}</div>}

                    <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors"
                    >
                        บันทึก
                    </button>
                </form>
                {/* ปุ่มกลับหน้าหลัก */}
                <button
                    type="button"
                    className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded transition-colors"
                    onClick={() => navigate('/main_page')}
                >
                    กลับหน้าหลัก
                </button>
            </div>
        </div>
    );
}
