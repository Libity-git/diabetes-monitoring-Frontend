// 📁 src/pages/liff/LiffReport.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { initLiff, getLiffProfile, closeWindow } from '../../utils/liff';
import { Activity, Loader2, CheckCircle, AlertTriangle, Droplets, Heart, UserPlus } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diabetes-monitoring-backend.onrender.com';

const LiffReport = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [patient, setPatient] = useState(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [form, setForm] = useState({
    bloodSugar: '',
    mealTime: 'before',
    systolic: '',
    diastolic: '',
    pulse: '',
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      const initialized = await initLiff();
      if (initialized) {
        const userProfile = await getLiffProfile();
        if (userProfile) {
          setProfile(userProfile);
          // Check if registered
          try {
            const res = await axios.get(`${API_URL}/api/liff/patient/${userProfile.userId}`);
            if (res.data) {
              setPatient(res.data);
            } else {
              setNotRegistered(true);
            }
          } catch (err) {
            setNotRegistered(true);
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

    const bloodSugar = form.bloodSugar ? parseInt(form.bloodSugar) : 0;
    const systolic = form.systolic ? parseInt(form.systolic) : 0;
    const diastolic = form.diastolic ? parseInt(form.diastolic) : 0;
    const pulse = form.pulse ? parseInt(form.pulse) : null;

    if (!bloodSugar && !systolic) {
      setError('กรุณากรอกค่าน้ำตาลหรือความดันอย่างน้อย 1 อย่าง');
      setSubmitting(false);
      return;
    }

    if (bloodSugar && (bloodSugar < 20 || bloodSugar > 600)) {
      setError('ค่าน้ำตาลต้องอยู่ระหว่าง 20-600 mg/dL');
      setSubmitting(false);
      return;
    }

    if (systolic && !diastolic) {
      setError('กรุณากรอกค่าความดันล่างด้วย');
      setSubmitting(false);
      return;
    }

    try {
      // Calculate status
      let bloodSugarStatus = null;
      if (bloodSugar) {
        if (form.mealTime === 'before') {
          if (bloodSugar < 70) bloodSugarStatus = 'ต่ำ';
          else if (bloodSugar <= 100) bloodSugarStatus = 'ปกติ';
          else if (bloodSugar <= 125) bloodSugarStatus = 'สูง';
          else bloodSugarStatus = 'เสี่ยงสูง';
        } else {
          if (bloodSugar < 70) bloodSugarStatus = 'ต่ำ';
          else if (bloodSugar < 140) bloodSugarStatus = 'ปกติ';
          else if (bloodSugar <= 199) bloodSugarStatus = 'สูง';
          else bloodSugarStatus = 'เสี่ยงสูง';
        }
      }

      let systolicStatus = null;
      if (systolic) {
        if (systolic < 90) systolicStatus = 'ต่ำ';
        else if (systolic <= 129) systolicStatus = 'ปกติ';
        else if (systolic <= 139) systolicStatus = 'สูง';
        else systolicStatus = 'เสี่ยงสูง';
      }

      // Submit report via LIFF API
      await axios.post(`${API_URL}/api/liff/report`, {
        lineUserId: profile.userId,
        bloodSugar,
        mealTime: form.mealTime,
        systolic,
        diastolic,
        pulse,
        bloodSugarStatus,
        systolicStatus,
      });

      setResult({ bloodSugarStatus, systolicStatus, bloodSugar, systolic, diastolic });
      setSuccess(true);
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (notRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">ยังไม่ได้ลงทะเบียน</h2>
            <p className="text-slate-600">กรุณาลงทะเบียนก่อนส่งข้อมูล</p>
            <Button 
              onClick={closeWindow}
              className="mt-6 bg-amber-600 hover:bg-amber-700"
            >
              ปิดหน้านี้
            </Button>
          </CardContent>
        </Card>
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
            <h2 className="text-2xl font-bold text-slate-800 mb-4">บันทึกสำเร็จ! 🎉</h2>
            
            {/* Results */}
            <div className="space-y-3 text-left bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-slate-600">ผลการวิเคราะห์:</p>
              {result?.bloodSugar > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-amber-500" />
                    น้ำตาล: {result.bloodSugar} mg/dL
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.bloodSugarStatus === 'ปกติ' ? 'bg-green-100 text-green-700' :
                    result.bloodSugarStatus === 'สูง' ? 'bg-amber-100 text-amber-700' :
                    result.bloodSugarStatus === 'เสี่ยงสูง' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {result.bloodSugarStatus}
                  </span>
                </div>
              )}
              {result?.systolic > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    ความดัน: {result.systolic}/{result.diastolic} mmHg
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.systolicStatus === 'ปกติ' ? 'bg-green-100 text-green-700' :
                    result.systolicStatus === 'สูง' ? 'bg-amber-100 text-amber-700' :
                    result.systolicStatus === 'เสี่ยงสูง' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {result.systolicStatus}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-500">ขอบคุณคุณ{patient?.name}ที่ส่งข้อมูล</p>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => {
                  setSuccess(false);
                  setForm({ bloodSugar: '', mealTime: 'before', systolic: '', diastolic: '', pulse: '' });
                }}
                variant="outline"
                className="flex-1"
              >
                ส่งอีกครั้ง
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">ส่งผลน้ำตาล / ความดัน</CardTitle>
          <p className="text-sm text-slate-500">สวัสดีคุณ{patient?.name} 👋</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Blood Sugar Section */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">ค่าน้ำตาล</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-amber-700">ค่าน้ำตาล (mg/dL)</Label>
                  <Input
                    type="number"
                    placeholder="เช่น 120"
                    value={form.bloodSugar}
                    onChange={(e) => setForm({ ...form, bloodSugar: e.target.value })}
                    className="border-amber-300 focus:border-amber-500 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm text-amber-700">ช่วงเวลา</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button
                      type="button"
                      variant={form.mealTime === 'before' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setForm({ ...form, mealTime: 'before' })}
                      className={form.mealTime === 'before' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                    >
                      ก่อนอาหาร
                    </Button>
                    <Button
                      type="button"
                      variant={form.mealTime === 'after' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setForm({ ...form, mealTime: 'after' })}
                      className={form.mealTime === 'after' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                    >
                      หลังอาหาร
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Pressure Section */}
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-rose-600" />
                <span className="font-medium text-rose-800">ค่าความดันโลหิต</span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-rose-700">ตัวบน (Sys)</Label>
                    <Input
                      type="number"
                      placeholder="120"
                      value={form.systolic}
                      onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                      className="border-rose-300 focus:border-rose-500 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-rose-700">ตัวล่าง (Dia)</Label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={form.diastolic}
                      onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                      className="border-rose-300 focus:border-rose-500 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-rose-700">ชีพจร (bpm) - ไม่บังคับ</Label>
                  <Input
                    type="number"
                    placeholder="75"
                    value={form.pulse}
                    onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                    className="border-rose-300 focus:border-rose-500 mt-1"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  ส่งข้อมูล
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiffReport;
