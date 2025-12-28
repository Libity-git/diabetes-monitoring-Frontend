// 📁 src/pages/Reports.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { getAllReports } from '../services/reportService';
import {
  FileText,
  RefreshCw,
  Download,
  Calendar,
  AlertTriangle,
  Droplets,
  Heart,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
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
} from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReports({ startDate, endDate });
      if (!data || data.length === 0) {
        setReportData([]);
      } else {
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('ไม่สามารถโหลดข้อมูลรายงานได้');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatMealTime = (mealTime) => {
    switch (mealTime) {
      case 'before': return 'ก่อนอาหาร';
      case 'after': return 'หลังอาหาร';
      case 'other': return 'อื่นๆ';
      default: return '-';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'เสี่ยงสูง':
        return <Badge variant="danger">{status}</Badge>;
      case 'สูง':
        return <Badge variant="warning">{status}</Badge>;
      case 'ต่ำ':
        return <Badge variant="info">{status}</Badge>;
      case 'ปกติ':
        return <Badge variant="success">{status}</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const exportToExcel = () => {
    const formattedData = reportData.map((report) => ({
      'ชื่อผู้ป่วย': report.patient?.name || 'ไม่ระบุ',
      'ระดับน้ำตาล': report.bloodSugar || '-',
      'สถานะน้ำตาล': report.bloodSugarStatus || '-',
      'ความดัน': `${report.systolic || '-'}/${report.diastolic || '-'}`,
      'สถานะความดัน': report.systolicStatus || '-',
      'ช่วงเวลา': formatMealTime(report.mealTime),
      'วันที่บันทึก': new Date(report.recordedAt).toLocaleString('th-TH'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `Reports_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.xlsx`);
  };

  // Stats calculations
  const uniquePatients = [...new Set(reportData.map((r) => r.patient?.id))].length;
  const criticalPatients = [...new Set(
    reportData
      .filter((r) => r.bloodSugarStatus === 'เสี่ยงสูง' || r.systolicStatus === 'เสี่ยงสูง')
      .map((r) => r.patient?.id)
  )].length;
  const highSugarCount = reportData.filter((r) => r.bloodSugarStatus === 'สูง').length;
  const criticalSugarCount = reportData.filter((r) => r.bloodSugarStatus === 'เสี่ยงสูง').length;
  const lowSugarCount = reportData.filter((r) => r.bloodSugarStatus === 'ต่ำ').length;
  const highPressureCount = reportData.filter((r) => r.systolicStatus === 'สูง').length;
  const criticalPressureCount = reportData.filter((r) => r.systolicStatus === 'เสี่ยงสูง').length;
  const lowPressureCount = reportData.filter((r) => r.systolicStatus === 'ต่ำ').length;

  // Chart data
  const chartData = reportData.slice(0, 30).map((report) => ({
    date: new Date(report.recordedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
    bloodSugar: report.bloodSugar,
    systolic: report.systolic,
    diastolic: report.diastolic,
    name: report.patient?.name || 'ไม่ระบุ',
  })).reverse();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">รายงานค่าสุขภาพ</h1>
            <p className="text-sm text-slate-500">
              ข้อมูล {startDate.toLocaleDateString('th-TH')} - {endDate.toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="text-sm border-0 focus:ring-0 bg-transparent w-32"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="text-sm border-0 focus:ring-0 bg-transparent w-32"
            />
          </div>
          <Button onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
          <Button onClick={exportToExcel} disabled={loading || reportData.length === 0} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {criticalPatients > 0 && (
        <Alert variant="warning" className="border-amber-200 bg-amber-50">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-medium">แจ้งเตือน!</span> มีผู้ป่วย {criticalPatients} รายที่มีค่าเสี่ยงสูง
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">ผู้ป่วยเสี่ยงสูง</p>
                <p className="text-4xl font-bold mt-2">{criticalPatients}</p>
                <p className="text-red-100 text-xs mt-1">คน</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">รายงานทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{reportData.length}</p>
                <p className="text-emerald-100 text-xs mt-1">รายการ</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
            </div>
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
                <p className="font-bold text-red-600">{criticalSugarCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-slate-500">น้ำตาลสูง</p>
                <p className="font-bold text-orange-600">{highSugarCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500">น้ำตาลต่ำ</p>
                <p className="font-bold text-blue-600">{lowSugarCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-slate-500">ความดันเสี่ยงสูง</p>
                <p className="font-bold text-red-600">{criticalPressureCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-slate-500">ความดันสูง</p>
                <p className="font-bold text-orange-600">{highPressureCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-cyan-500" />
              <div>
                <p className="text-xs text-slate-500">ความดันต่ำ</p>
                <p className="font-bold text-cyan-600">{lowPressureCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTabIndex(0)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tabIndex === 0
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4 inline mr-2" />
          น้ำตาลในเลือด
        </button>
        <button
          onClick={() => setTabIndex(1)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tabIndex === 1
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 inline mr-2" />
          ความดันโลหิต
        </button>
      </div>

      {/* Chart */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-500" />
            {tabIndex === 0 ? 'กราฟระดับน้ำตาลในเลือด' : 'กราฟความดันโลหิต'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-80">
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
                  {tabIndex === 0 ? (
                    <Line
                      type="monotone"
                      dataKey="bloodSugar"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2 }}
                      name="น้ำตาล (mg/dL)"
                    />
                  ) : (
                    <>
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        name="ซิสโตลิก (mmHg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                        name="ไดแอสโตลิก (mmHg)"
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ไม่มีข้อมูลสำหรับช่วงวันที่เลือก</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-violet-500" />
            รายละเอียดรายงาน ({reportData.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportData.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ไม่พบข้อมูลรายงาน</p>
              <p className="text-sm mt-1">ลองเปลี่ยนช่วงวันที่หรือรีเฟรช</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">ชื่อผู้ป่วย</TableHead>
                    <TableHead className="font-semibold">น้ำตาล</TableHead>
                    <TableHead className="font-semibold">สถานะน้ำตาล</TableHead>
                    <TableHead className="font-semibold">ความดัน</TableHead>
                    <TableHead className="font-semibold">สถานะความดัน</TableHead>
                    <TableHead className="font-semibold">ช่วงเวลา</TableHead>
                    <TableHead className="font-semibold">วันที่</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((report) => (
                    <TableRow key={report.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {report.patient?.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium">{report.patient?.name || 'ไม่ระบุ'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{report.bloodSugar || '-'}</span>
                        <span className="text-slate-400 text-xs ml-1">mg/dL</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.bloodSugarStatus)}</TableCell>
                      <TableCell>
                        <span className="font-mono">{report.systolic || '-'}/{report.diastolic || '-'}</span>
                        <span className="text-slate-400 text-xs ml-1">mmHg</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.systolicStatus)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{formatMealTime(report.mealTime)}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(report.recordedAt).toLocaleString('th-TH', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
