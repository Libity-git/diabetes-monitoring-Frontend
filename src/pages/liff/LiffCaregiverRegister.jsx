// 📁 src/pages/liff/LiffCaregiverRegister.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { initLiff, getLiffProfile, closeWindow } from '../../utils/liff';
import { UserPlus, Loader2, CheckCircle, AlertTriangle, Users, Phone, Search, User, Plus } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diabetes-monitoring-backend.onrender.com';

const LiffCaregiverRegister = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [step, setStep] = useState('check'); // check, register, add-patient, new-patient

  const [form, setForm] = useState({
    name: '',
    phone: '',
  });

  const [patientForm, setPatientForm] = useState({
    name: '',
    gender: '',
    age: '',
    phone: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const init = async () => {
      const initialized = await initLiff('caregiverRegister'); // Use caregiver register LIFF ID
      if (initialized) {
        const userProfile = await getLiffProfile();
        if (userProfile) {
          setProfile(userProfile);
          setForm(f => ({ ...f, name: userProfile.displayName || '' }));
          
          // Check if already registered as caregiver
          try {
            const res = await axios.get(`${API_URL}/api/caregiver/check/${userProfile.userId}`);
            if (res.data) {
              setCaregiver(res.data);
              setStep('add-patient');
            }
          } catch (err) {
            // Not registered as caregiver
            setStep('register');
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // Search patients
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const res = await axios.get(`${API_URL}/api/caregiver/search-patients?query=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Register as caregiver
  const handleRegisterCaregiver = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!form.name) {
      setError('กรุณากรอกชื่อ');
      setSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/caregiver/register`, {
        lineUserId: profile.userId,
        name: form.name,
        phone: form.phone,
      });
      setCaregiver(res.data.caregiver);
      setStep('add-patient');
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  // Add existing patient to caregiver
  const handleAddPatient = async (patientId) => {
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/caregiver/add-patient`, {
        lineUserId: profile.userId,
        patientId,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  // Register new patient without LINE
  const handleRegisterNewPatient = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!patientForm.name || !patientForm.gender || !patientForm.age) {
      setError('กรุณากรอกชื่อ เพศ และอายุ');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/caregiver/register-patient`, {
        caregiverLineUserId: profile.userId,
        ...patientForm,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
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
            <h2 className="text-2xl font-bold text-slate-800 mb-2">สำเร็จ! 🎉</h2>
            <p className="text-slate-600 mb-6">เพิ่มผู้ป่วยเข้าระบบเรียบร้อยแล้ว</p>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setSuccess(false);
                  setStep('add-patient');
                  setSearchQuery('');
                  setSearchResults([]);
                  setPatientForm({ name: '', gender: '', age: '', phone: '' });
                }}
                variant="outline"
                className="flex-1"
              >
                เพิ่มผู้ป่วยอีก
              </Button>
              <Button 
                onClick={closeWindow}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ปิดหน้านี้
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: Register as Caregiver
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">ลงทะเบียนเป็นผู้ดูแล</CardTitle>
            <p className="text-sm text-slate-500">สำหรับส่งข้อมูลแทนผู้สูงอายุที่ไม่มี LINE</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterCaregiver} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>ชื่อผู้ดูแล</Label>
                <Input
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>เบอร์โทร (ไม่บังคับ)</Label>
                <Input
                  type="tel"
                  placeholder="0812345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                ลงทะเบียนเป็นผู้ดูแล
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Add Patient
  if (step === 'add-patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">เพิ่มผู้ป่วยที่ดูแล</CardTitle>
            <p className="text-sm text-slate-500">สวัสดี {caregiver?.name} 👋</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search existing patient */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                ค้นหาผู้ป่วยที่มีในระบบ
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="ชื่อหรือเบอร์โทร"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="button" onClick={handleSearch} disabled={searching}>
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {searchResults.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-slate-500">อายุ {p.age} ปี</p>
                      </div>
                      <Button size="sm" onClick={() => handleAddPatient(p.id)} disabled={submitting}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center text-sm text-slate-500">หรือ</div>

            {/* Register new patient */}
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setStep('new-patient')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              ลงทะเบียนผู้ป่วยใหม่ (ไม่มี LINE)
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={closeWindow}
            >
              ปิดหน้านี้
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Register New Patient
  if (step === 'new-patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">ลงทะเบียนผู้ป่วยใหม่</CardTitle>
            <p className="text-sm text-slate-500">สำหรับผู้ป่วยที่ไม่มี LINE</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterNewPatient} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>ชื่อ-นามสกุล *</Label>
                <Input
                  type="text"
                  placeholder="ชื่อผู้ป่วย"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>เพศ *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={patientForm.gender === 'ชาย' ? 'default' : 'outline'}
                    onClick={() => setPatientForm({ ...patientForm, gender: 'ชาย' })}
                    className={patientForm.gender === 'ชาย' ? 'bg-blue-600' : ''}
                  >
                    ชาย
                  </Button>
                  <Button
                    type="button"
                    variant={patientForm.gender === 'หญิง' ? 'default' : 'outline'}
                    onClick={() => setPatientForm({ ...patientForm, gender: 'หญิง' })}
                    className={patientForm.gender === 'หญิง' ? 'bg-pink-600' : ''}
                  >
                    หญิง
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>อายุ (ปี) *</Label>
                <Input
                  type="number"
                  placeholder="65"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>เบอร์โทร (ไม่บังคับ)</Label>
                <Input
                  type="tel"
                  placeholder="0812345678"
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('add-patient')}
                >
                  กลับ
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  ลงทะเบียน
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default LiffCaregiverRegister;

