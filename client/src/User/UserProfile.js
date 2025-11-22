
import React, { useEffect, useState } from 'react';
import bgFood from '../assets/bg/bgFood.png';

export default function UserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('ไม่พบข้อมูลผู้ใช้');
      setLoading(false);
      return;
    }
    try {
      const userObj = JSON.parse(userStr);
      const userId = userObj.id;
      fetch(`http://localhost:3001/api/users/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้');
          return res.json();
        })
        .then(data => {
          setUserProfile(data);
          setLoading(false);
        })
        .catch(() => {
          setError('ไม่สามารถโหลดข้อมูลผู้ใช้');
          setLoading(false);
        });
    } catch {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้');
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden">
      <img src={bgFood} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-80 z-0" />
      <div className="relative z-10 p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
    </div>
  );
  if (error) return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden">
      <img src={bgFood} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-80 z-0" />
      <div className="relative z-10 p-8 text-center text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden px-4">
      <img src={bgFood} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" />
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">โปรไฟล์ผู้ใช้</h2>
        <div className="space-y-3 text-gray-800 text-base">
          <div><span className="font-semibold">ชื่อ:</span> {userProfile.firstName} {userProfile.lastName}</div>
          <div><span className="font-semibold">อีเมล:</span> {userProfile.email}</div>
          <div><span className="font-semibold">สร้างเมื่อ:</span> {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleString() : '-'}</div>
          <div><span className="font-semibold">อัปเดตล่าสุด:</span> {userProfile.updatedAt ? new Date(userProfile.updatedAt).toLocaleString() : '-'}</div>
        </div>
      </div>
    </div>
  );
}
