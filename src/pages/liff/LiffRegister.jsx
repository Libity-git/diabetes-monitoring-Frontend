// 📁 src/pages/liff/LiffRegister.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { initLiff, getLiffProfile, closeWindow } from '../../utils/liff';
import { UserPlus, Loader2, CheckCircle, AlertTriangle, Heart } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diabetes-monitoring-backend.onrender.com';

const LiffRegister = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [existingPatient, setExistingPatient] = useState(null);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: '',
    phone: '',
  });

  useEffect(() => {
    const init = async () => {
      const initialized = await initLiff();
      if (initialized) {
        const userProfile = await getLiffProfile();
        if (userProfile) {
          setProfile(userProfile);
          // Check if already registered
          try {
            const res = await axios.get(`${API_URL}/api/users/${userProfile.userId}`);
            if (res.data) {
              setAlreadyRegistered(true);
              setExistingPatient(res.data);
            }
          } catch (err) {
            // Not registered yet - this is fine
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validation
    if (!form.name || !form.gender || !form.age || !form.phone) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      setSubmitting(false);
      return;
    }

    if (!['ชาย', 'หญิง'].includes(form.gender)) {
      setError('กรุณาเลือกเพศ');
      setSubmitting(false);
      return;
    }

    const age = parseInt(form.age);
    if (isNaN(age) || age < 0 || age > 120) {
      setError('อายุต้องเป็นตัวเลข 0-120');
      setSubmitting(false);
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError('เบอร์โทรต้องเป็นตัวเลข 10 หลัก');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/users`, {
        lineUserId: profile.userId,
        name: form.name,
        gender: form.gender,
        age: parseInt(form.age),
        phone: form.phone,
      });

      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 400) {
        setError('คุณลงทะเบียนแล้ว หรือเบอร์โทรนี้ถูกใช้แล้ว');
      } else {
        setError(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">ลงทะเบียนสำเร็จ! 🎉</h2>
            <p className="text-slate-600">ยินดีต้อนรับคุณ{form.name}</p>
            <p className="text-sm text-slate-500 mt-4">
              คุณสามารถส่งค่าน้ำตาลและความดันได้แล้ว
            </p>
            <Button 
              onClick={closeWindow}
              className="mt-6 bg-green-600 hover:bg-green-700"
            >
              ปิดหน้านี้
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">คุณลงทะเบียนแล้ว</h2>
            <p className="text-slate-600">สวัสดีคุณ{existingPatient?.name} 👋</p>
            <p className="text-sm text-slate-500 mt-2">คุณสามารถส่งค่าน้ำตาลและความดันได้เลย</p>
            <Button 
              onClick={closeWindow} 
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              ปิดหน้านี้
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl">ลงทะเบียนผู้ป่วย</CardTitle>
          <p className="text-sm text-slate-500">ระบบติดตามสุขภาพผู้ป่วยเบาหวาน</p>
          {profile && (
            <p className="text-xs text-blue-600 mt-2">
              LINE: {profile.displayName}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
              <Input
                id="name"
                placeholder="เช่น สมชาย ใจดี"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>เพศ *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={form.gender === 'ชาย' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, gender: 'ชาย' })}
                  className={form.gender === 'ชาย' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  👨 ชาย
                </Button>
                <Button
                  type="button"
                  variant={form.gender === 'หญิง' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, gender: 'หญิง' })}
                  className={form.gender === 'หญิง' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  👩 หญิง
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">อายุ (ปี) *</Label>
              <Input
                id="age"
                type="number"
                placeholder="เช่น 55"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="เช่น 0812345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  ลงทะเบียน
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiffRegister;
