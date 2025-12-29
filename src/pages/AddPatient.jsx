// 📁 src/pages/AddPatient.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { UserPlus, Loader2, CheckCircle, AlertTriangle, ArrowLeft, User, Phone, Calendar, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diabetes-monitoring-backend.onrender.com';

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: '',
    phone: '',
    lineUserId: '', // Optional - empty for patients without LINE
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!form.name || !form.gender || !form.age) {
      setError('กรุณากรอกชื่อ เพศ และอายุ');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/patients`,
        {
          name: form.name,
          gender: form.gender,
          age: parseInt(form.age),
          phone: form.phone || '',
          lineUserId: form.lineUserId || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/patients');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">ลงทะเบียนสำเร็จ! 🎉</h2>
            <p className="text-slate-600 mb-6">เพิ่มผู้ป่วย {form.name} เข้าระบบเรียบร้อยแล้ว</p>
            <p className="text-sm text-slate-500">กำลังนำกลับไปหน้าผู้ป่วย...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/patients')}
          className="mb-4 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับไปหน้าผู้ป่วย
        </Button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">เพิ่มผู้ป่วยใหม่</h1>
            <p className="text-slate-500">ลงทะเบียนผู้ป่วยที่ไม่มี LINE เข้าสู่ระบบ</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            ข้อมูลผู้ป่วย
          </CardTitle>
          <CardDescription>
            กรอกข้อมูลผู้ป่วย (ช่อง LINE User ID ไม่จำเป็นต้องกรอก)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="เช่น สมหญิง ใจดี"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                เพศ <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={form.gender === 'ชาย' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, gender: 'ชาย' })}
                  className={form.gender === 'ชาย' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  ชาย
                </Button>
                <Button
                  type="button"
                  variant={form.gender === 'หญิง' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, gender: 'หญิง' })}
                  className={form.gender === 'หญิง' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  หญิง
                </Button>
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                อายุ (ปี) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="เช่น 65"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="h-11"
                min="1"
                max="120"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                เบอร์โทรศัพท์
              </Label>
              <Input
                type="tel"
                placeholder="เช่น 0812345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11"
              />
            </div>

            {/* LINE User ID - Optional */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Label className="flex items-center gap-2 text-slate-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 5.93 2 10.72c0 3.67 2.91 6.74 6.85 7.84.27.06.64.18.74.42.09.22.06.56.03.78l-.12.76c-.04.22-.16.88.77.48.93-.4 5.03-2.96 6.86-5.07C18.79 13.91 22 12.31 22 10.72 22 5.93 17.52 2 12 2z"/>
                </svg>
                LINE User ID (ไม่บังคับ)
              </Label>
              <Input
                type="text"
                placeholder="เว้นว่างไว้ถ้าผู้ป่วยไม่มี LINE"
                value={form.lineUserId}
                onChange={(e) => setForm({ ...form, lineUserId: e.target.value })}
                className="h-11 bg-white"
              />
              <p className="text-xs text-slate-500">
                💡 ถ้าผู้ป่วยไม่มี LINE ให้เว้นว่างไว้ เจ้าหน้าที่สามารถกรอกข้อมูลแทนได้
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/patients')}
                className="flex-1 h-12"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    เพิ่มผู้ป่วย
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPatient;

