// 📁 src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import {
  getSummaryStats,
  getHighSugarAndHighPressureReports,
  getAllReports,
} from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  AlertTriangle,
  Users,
  Heart,
  Droplets,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [highSugarAndHighPressureReports, setHighSugarAndHighPressureReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [statsData, reportsData, allReportsData] = await Promise.all([
        getSummaryStats({ startDate, endDate }),
        getHighSugarAndHighPressureReports({ startDate, endDate }),
        getAllReports({ startDate, endDate }),
      ]);
      if (!statsData || !reportsData || !allReportsData) {
        throw new Error('ข้อมูลจากเซิร์ฟเวอร์ว่างเปล่า');
      }
      setStats(statsData);
      setHighSugarAndHighPressureReports(reportsData);
      setAllReports(allReportsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, isAuthenticated, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData, location.pathname]);

  const handleResetDates = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setError(null);
  };

  const hasStatsData = stats && Object.keys(stats).length > 0;
  const hasReportsData = highSugarAndHighPressureReports && highSugarAndHighPressureReports.length > 0;

  const criticalPatientsCount = hasReportsData
    ? [...new Set(highSugarAndHighPressureReports.map((report) => report.patient?.id))].length
    : 0;

  const uniquePatients = [...new Set(allReports.map((report) => report.patient?.id))].length;

  const criticalSugarToday = hasReportsData
    ? highSugarAndHighPressureReports.filter((report) => report.bloodSugarStatus === 'เสี่ยงสูง').length
    : 0;
  const criticalPressureToday = hasReportsData
    ? highSugarAndHighPressureReports.filter((report) => report.systolicStatus === 'เสี่ยงสูง').length
    : 0;

  // Prepare chart data
  const chartData = allReports.slice(0, 20).map((report) => ({
    date: new Date(report.recordedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
    bloodSugar: report.bloodSugar,
    systolic: report.systolic,
    name: report.patient?.name || 'ไม่ระบุ',
  })).reverse();

  // Calculate patient distribution for Pie Chart
  const calculatePatientDistribution = () => {
    if (!allReports || allReports.length === 0) return [];
    
    // Group reports by patient
    const patientMap = new Map();
    allReports.forEach(report => {
      const patientId = report.patient?.id;
      if (!patientId) return;
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, { highSugar: false, highPressure: false });
      }
      
      const status = patientMap.get(patientId);
      if (report.bloodSugarStatus === 'เสี่ยงสูง' || report.bloodSugarStatus === 'สูง') {
        status.highSugar = true;
      }
      if (report.systolicStatus === 'เสี่ยงสูง' || report.systolicStatus === 'สูง') {
        status.highPressure = true;
      }
    });

    let normal = 0, highSugarOnly = 0, highPressureOnly = 0, highRisk = 0;
    
    patientMap.forEach(status => {
      if (status.highSugar && status.highPressure) {
        highRisk++;
      } else if (status.highSugar) {
        highSugarOnly++;
      } else if (status.highPressure) {
        highPressureOnly++;
      } else {
        normal++;
      }
    });

    return [
      { name: 'ปกติ', value: normal, color: '#22c55e' },
      { name: 'น้ำตาลสูง', value: highSugarOnly, color: '#f59e0b' },
      { name: 'ความดันสูง', value: highPressureOnly, color: '#f97316' },
      { name: 'เสี่ยงสูง (ทั้งสอง)', value: highRisk, color: '#ef4444' },
    ].filter(item => item.value > 0);
  };

  const pieData = calculatePatientDistribution();
  const totalPatientsInPie = pieData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ดภาพรวม</h1>
            <p className="text-sm text-slate-500">
              ข้อมูลวันที่ {startDate.toLocaleDateString('th-TH')} - {endDate.toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="text-sm border-0 focus:ring-0 bg-transparent"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="text-sm border-0 focus:ring-0 bg-transparent"
            />
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Alert for critical patients */}
      {criticalPatientsCount > 0 && (
        <Alert variant="warning" className="border-amber-200 bg-amber-50">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-medium">แจ้งเตือน!</span> มีผู้ป่วย {criticalPatientsCount} รายที่มีระดับน้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูง
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Critical Patients */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">ผู้ป่วยเสี่ยงสูง</p>
                <p className="text-4xl font-bold mt-2">{criticalPatientsCount}</p>
                <p className="text-red-100 text-xs mt-1">คน</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">ผู้ป่วยทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{uniquePatients}</p>
                <p className="text-blue-100 text-xs mt-1">คน</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Reports */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">รายงานทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{stats?.totalReportsToday || 0}</p>
                <p className="text-emerald-100 text-xs mt-1">รายการ</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Sugar Today */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">น้ำตาลสูง</p>
                <p className="text-4xl font-bold mt-2">{stats?.highSugarToday || 0}</p>
                <p className="text-amber-100 text-xs mt-1">รายการ</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Droplets className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Pie Chart and Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - Patient Distribution */}
        <Card className="shadow-lg border-0 lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-indigo-500" />
              สัดส่วนผู้ป่วย
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} คน`, name]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-slate-600">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-slate-500 mt-3">
                  รวม {totalPatientsInPie} คน
                </p>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>ไม่มีข้อมูลผู้ป่วย</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="shadow-lg border-0 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-blue-500" />
              แนวโน้มค่าสุขภาพ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bloodSugar"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2 }}
                      name="น้ำตาล (mg/dL)"
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      name="ความดัน (mmHg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>ไม่มีข้อมูลสำหรับช่วงวันที่เลือก</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Status Summary */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-rose-500" />
            สถานะสุขภาพ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-slate-500">น้ำตาลเสี่ยงสูง</p>
                <p className="font-bold text-red-600">{criticalSugarToday}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-slate-500">น้ำตาลสูง</p>
                <p className="font-bold text-orange-600">{stats?.highSugarToday || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500">น้ำตาลต่ำ</p>
                <p className="font-bold text-blue-600">{stats?.lowSugarToday || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-slate-500">ความดันเสี่ยงสูง</p>
                <p className="font-bold text-red-600">{criticalPressureToday}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-slate-500">ความดันสูง</p>
                <p className="font-bold text-orange-600">{stats?.highPressureToday || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-cyan-500" />
              <div>
                <p className="text-xs text-slate-500">ความดันต่ำ</p>
                <p className="font-bold text-cyan-600">{stats?.lowPressureToday || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
