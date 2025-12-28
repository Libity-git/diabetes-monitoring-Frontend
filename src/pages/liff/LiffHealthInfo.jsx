// 📁 src/pages/liff/LiffHealthInfo.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { initLiff, getLiffProfile, closeWindow } from '../../utils/liff';
import { 
  Activity, 
  Loader2, 
  Droplets, 
  Heart, 
  Calendar,
  User,
  UserPlus
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diabetes-monitoring-backend.onrender.com';

const LiffHealthInfo = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ avgSugar: 0, avgSystolic: 0, totalReports: 0 });
  const [notRegistered, setNotRegistered] = useState(false);

  useEffect(() => {
    const init = async () => {
      const initialized = await initLiff();
      if (initialized) {
        const userProfile = await getLiffProfile();
        if (userProfile) {
          setProfile(userProfile);
          // Fetch patient data
          try {
            const res = await axios.get(`${API_URL}/api/users/${userProfile.userId}`);
            if (res.data) {
              setPatient(res.data);
              await fetchReports(res.data);
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

  const fetchReports = async (patientData) => {
    try {
      const reportsRes = await axios.get(`${API_URL}/api/reports`);
      const patientReports = reportsRes.data
        .filter(r => r.patientId === patientData.id)
        .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
        .slice(0, 10);
      
      setReports(patientReports);

      if (patientReports.length > 0) {
        const sugarReports = patientReports.filter(r => r.bloodSugar > 0);
        const pressureReports = patientReports.filter(r => r.systolic > 0);
        
        const avgSugar = sugarReports.length > 0 
          ? Math.round(sugarReports.reduce((sum, r) => sum + r.bloodSugar, 0) / sugarReports.length)
          : 0;
        const avgSystolic = pressureReports.length > 0
          ? Math.round(pressureReports.reduce((sum, r) => sum + r.systolic, 0) / pressureReports.length)
          : 0;
        
        setStats({ avgSugar, avgSystolic, totalReports: patientReports.length });
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ปกติ': return 'bg-green-100 text-green-700 border-green-200';
      case 'สูง': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ต่ำ': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'เสี่ยงสูง': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
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
            <p className="text-slate-600">กรุณาลงทะเบียนก่อนดูข้อมูล</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{patient?.name}</CardTitle>
                <p className="text-sm text-slate-500">
                  {patient?.gender} • อายุ {patient?.age} ปี
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 opacity-80" />
                <span className="text-xs opacity-80">น้ำตาลเฉลี่ย</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.avgSugar > 0 ? `${stats.avgSugar}` : '--'} 
                <span className="text-sm font-normal opacity-80"> mg/dL</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 opacity-80" />
                <span className="text-xs opacity-80">ความดันเฉลี่ย</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.avgSystolic > 0 ? `${stats.avgSystolic}` : '--'}
                <span className="text-sm font-normal opacity-80"> mmHg</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-base">ประวัติการบันทึก</CardTitle>
              </div>
              <Badge variant="secondary">{stats.totalReports} รายการ</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีข้อมูลการบันทึก</p>
                <p className="text-xs mt-1">เริ่มส่งค่าน้ำตาลและความดันได้เลย</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report, index) => (
                  <div 
                    key={report.id || index}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(report.recordedAt)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {report.bloodSugar > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Droplets className="w-4 h-4 text-amber-500" />
                            น้ำตาล: <strong>{report.bloodSugar}</strong> mg/dL
                          </span>
                          {report.bloodSugarStatus && (
                            <Badge className={`text-xs ${getStatusColor(report.bloodSugarStatus)}`}>
                              {report.bloodSugarStatus}
                            </Badge>
                          )}
                        </div>
                      )}
                      {report.systolic > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4 text-rose-500" />
                            ความดัน: <strong>{report.systolic}/{report.diastolic}</strong> mmHg
                          </span>
                          {report.systolicStatus && (
                            <Badge className={`text-xs ${getStatusColor(report.systolicStatus)}`}>
                              {report.systolicStatus}
                            </Badge>
                          )}
                        </div>
                      )}
                      {report.pulse > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Activity className="w-4 h-4" />
                          ชีพจร: {report.pulse} bpm
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Close Button */}
        <Button 
          onClick={closeWindow}
          variant="outline"
          className="w-full"
        >
          ปิดหน้านี้
        </Button>
      </div>
    </div>
  );
};

export default LiffHealthInfo;
