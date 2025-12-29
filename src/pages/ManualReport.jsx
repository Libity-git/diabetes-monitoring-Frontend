// 📁 src/pages/ManualReport.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Activity, Loader2, CheckCircle, AlertTriangle, ArrowLeft, 
  Search, User, Droplets, Heart 
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diabetes-monitoring-backend.onrender.com';

const ManualReport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [form, setForm] = useState({
    bloodSugar: '',
    mealTime: 'before',
    systolic: '',
    diastolic: '',
    pulse: '',
  });
  const [result, setResult] = useState(null);

  // Load patients
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
        
        // If preselected patient
        if (preselectedPatientId) {
          const patient = res.data.find(p => p.id === parseInt(preselectedPatientId));
          if (patient) {
            setSelectedPatient(patient);
            setSearchQuery(patient.name);
          }
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [preselectedPatientId]);

  // Calculate status
  const calculateBloodSugarStatus = (value, mealTime) => {
    if (!value) return null;
    const v = parseInt(value);
    if (mealTime === 'before') {
      if (v < 70) return 'ต่ำ';
      if (v <= 100) return 'ปกติ';
      if (v <= 125) return 'สูง';
      return 'เสี่ยงสูง';
    } else {
      if (v < 70) return 'ต่ำ';
      if (v < 140) return 'ปกติ';
      if (v <= 199) return 'สูง';
      return 'เสี่ยงสูง';
    }
  };

  const calculateSystolicStatus = (value) => {
    if (!value) return null;
    const v = parseInt(value);
    if (v < 90) return 'ต่ำ';
    if (v <= 129) return 'ปกติ';
    if (v <= 139) return 'สูง';
    return 'เสี่ยงสูง';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedPatient) {
      setError('กรุณาเลือกผู้ป่วย');
      return;
    }

    const bloodSugar = form.bloodSugar ? parseInt(form.bloodSugar) : 0;
    const systolic = form.systolic ? parseInt(form.systolic) : 0;
    const diastolic = form.diastolic ? parseInt(form.diastolic) : 0;

    if (!bloodSugar && !systolic) {
      setError('กรุณากรอกค่าน้ำตาลหรือความดันอย่างน้อย 1 อย่าง');
      return;
    }

    if (systolic && !diastolic) {
      setError('กรุณากรอกค่าความดันล่างด้วย');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const bloodSugarStatus = calculateBloodSugarStatus(bloodSugar, form.mealTime);
      const systolicStatus = calculateSystolicStatus(systolic);

      await axios.post(
        `${API_URL}/api/reports/manual`,
        {
          patientId: selectedPatient.id,
          bloodSugar,
          mealTime: form.mealTime,
          systolic,
          diastolic,
          pulse: form.pulse ? parseInt(form.pulse) : null,
          bloodSugarStatus,
          systolicStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResult({ bloodSugarStatus, systolicStatus, bloodSugar, systolic, diastolic });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">บันทึกสำเร็จ! 🎉</h2>
            
            {/* Results */}
            <div className="space-y-3 text-left bg-slate-50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
              <p className="text-sm font-medium text-slate-600 text-center">ผลการวิเคราะห์:</p>
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

            <p className="text-slate-500 mb-6">บันทึกข้อมูลให้ {selectedPatient?.name} เรียบร้อยแล้ว</p>
            
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  setForm({ bloodSugar: '', mealTime: 'before', systolic: '', diastolic: '', pulse: '' });
                }}
              >
                บันทึกอีกครั้ง
              </Button>
              <Button
                onClick={() => navigate('/reports')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ดูรายงาน
              </Button>
            </div>
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
          onClick={() => navigate(-1)}
          className="mb-4 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับ
        </Button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">กรอกข้อมูลแทนผู้ป่วย</h1>
            <p className="text-slate-500">บันทึกค่าน้ำตาลและความดันให้ผู้ป่วยที่ไม่มี LINE</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            เลือกผู้ป่วย
          </CardTitle>
          <CardDescription>
            ค้นหาและเลือกผู้ป่วยที่ต้องการกรอกข้อมูลให้
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

            {/* Patient Search */}
            <div className="space-y-2 relative">
              <Label>ค้นหาผู้ป่วย</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="พิมพ์ชื่อหรือเบอร์โทร..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) setSelectedPatient(null);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-10 h-11"
                />
              </div>
              
              {/* Dropdown */}
              {showDropdown && searchQuery && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between border-b last:border-0"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchQuery(patient.name);
                        setShowDropdown(false);
                      }}
                    >
                      <div>
                        <p className="font-medium text-slate-800">{patient.name}</p>
                        <p className="text-sm text-slate-500">
                          อายุ {patient.age} ปี • {patient.phone || 'ไม่มีเบอร์'}
                          {!patient.lineUserId && (
                            <span className="ml-2 text-amber-600">(ไม่มี LINE)</span>
                          )}
                        </p>
                      </div>
                      {selectedPatient?.id === patient.id && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Patient */}
            {selectedPatient && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">กำลังกรอกข้อมูลให้:</p>
                <p className="font-semibold text-blue-800">{selectedPatient.name}</p>
                <p className="text-sm text-blue-600">
                  อายุ {selectedPatient.age} ปี • เพศ{selectedPatient.gender}
                </p>
              </div>
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
                    className="border-amber-300 focus:border-amber-500 mt-1 bg-white"
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
                      className="border-rose-300 focus:border-rose-500 mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-rose-700">ตัวล่าง (Dia)</Label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={form.diastolic}
                      onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                      className="border-rose-300 focus:border-rose-500 mt-1 bg-white"
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
                    className="border-rose-300 focus:border-rose-500 mt-1 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 h-12"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                disabled={submitting || !selectedPatient}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    บันทึกข้อมูล
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

export default ManualReport;

