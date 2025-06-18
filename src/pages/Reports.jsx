// 📁 src/pages/Reports.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getAllReports } from '../services/reportService';
import ReportChart from '../components/ReportChart';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Styled components
const ReportsContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.default} 100%)`,
  minHeight: '100vh',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.common.white,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: theme.spacing(1.5, 3),
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    transition: 'all 0.3s ease-in-out',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1, 2),
  fontWeight: 'medium',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'medium',
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  '&:first-of-type': {
    fontWeight: 'bold',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.common.white,
  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

const Reports = () => {
  const theme = useTheme();
  const [reportData, setReportData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7))); // 31/05/2025
  const [endDate, setEndDate] = useState(new Date()); // 07/06/2025 15:43

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReports({ startDate, endDate });
      console.log('Fetched report data:', data);
      if (!data || data.length === 0) {
        setError('ไม่พบข้อมูลรายงานสำหรับช่วงวันที่ที่เลือก');
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

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleRefresh = () => {
    fetchReports();
  };

  const handleResetDates = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
  };

  // ฟังก์ชันสำหรับแปลง mealTime ให้เป็นภาษาไทย
  const formatMealTime = (mealTime) => {
    switch (mealTime) {
      case 'before':
        return 'ก่อนอาหาร';
      case 'after':
        return 'หลังอาหาร';
      case 'other':
        return 'อื่นๆ';
      default:
        return '-';
    }
  };

  // ฟังก์ชันสำหรับ export ตารางเป็น Excel
  const exportToExcel = () => {
    const formattedData = reportData.map((report) => ({
      'ชื่อผู้ป่วย': report.patient?.name || 'ไม่ระบุ',
      'ระดับน้ำตาล': report.bloodSugar || '-',
      'สถานะน้ำตาล': report.bloodSugarStatus || '-',
      'ความดัน (ซิสโตลิก/ไดแอสโตลิก)': `${report.systolic || '-'}/${report.diastolic || '-'}`,
      'สถานะความดัน': report.systolicStatus || '-',
      'ช่วงเวลาที่วัด': formatMealTime(report.mealTime),
      'วันที่บันทึก': new Date(report.recordedAt).toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fileName = `Reports_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
  };

  // คำนวณข้อมูลสรุป
  const uniquePatients = reportData.length > 0 ? [...new Set(reportData.map((report) => report.patient?.id))].length : 0;
  const criticalPatients = reportData.length > 0
    ? [...new Set(
        reportData
          .filter((report) => report.bloodSugarStatus === 'เสี่ยงสูง' || report.systolicStatus === 'เสี่ยงสูง')
          .map((report) => report.patient?.id)
      )].length
    : 0;

  const highSugarCount = reportData.length > 0 ? reportData.filter((report) => report.bloodSugarStatus === 'สูง').length : 0;
  const criticalSugarCount = reportData.length > 0 ? reportData.filter((report) => report.bloodSugarStatus === 'เสี่ยงสูง').length : 0;
  const lowSugarCount = reportData.length > 0 ? reportData.filter((report) => report.bloodSugarStatus === 'ต่ำ').length : 0;
  const highPressureCount = reportData.length > 0 ? reportData.filter((report) => report.systolicStatus === 'สูง').length : 0;
  const criticalPressureCount = reportData.length > 0 ? reportData.filter((report) => report.systolicStatus === 'เสี่ยงสูง').length : 0;
  const lowPressureCount = reportData.length > 0 ? reportData.filter((report) => report.systolicStatus === 'ต่ำ').length : 0;

  // เตรียม dataKeys สำหรับ ReportChart
  const dataKeys = tabIndex === 0
    ? {
        xAxis: 'recordedAt',
        lines: [
          { key: 'bloodSugar', name: 'ระดับน้ำตาล (mg/dL)', color: theme.palette.error.main },
        ],
      }
    : {
        xAxis: 'recordedAt',
        lines: [
          { key: 'systolic', name: 'ความดันซิสโตลิก (mmHg)', color: theme.palette.success.main },
          { key: 'diastolic', name: 'ความดันไดแอสโตลิก (mmHg)', color: theme.palette.error.main },
        ],
      };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ReportsContainer maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <AssessmentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              รายงานค่าสุขภาพผู้ป่วย
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="วันที่เริ่มต้น"
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { backgroundColor: theme.palette.common.white },
                },
              }}
            />
            <DatePicker
              label="วันที่สิ้นสุด"
              value={endDate}
              onChange={(newDate) => setEndDate(newDate)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { backgroundColor: theme.palette.common.white },
                },
              }}
            />
            <StyledButton
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              รีเฟรช
            </StyledButton>
            <StyledButton
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
              disabled={loading || reportData.length === 0}
            >
              Export เป็น Excel
            </StyledButton>
            <StyledButton
              variant="outlined"
              onClick={handleResetDates}
              sx={{ ml: 1 }}
              disabled={loading}
            >
              รีเซ็ตวันที่
            </StyledButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ข้อมูลช่วงวันที่ {startDate.toLocaleDateString('th-TH')} - {endDate.toLocaleDateString('th-TH')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {criticalPatients > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            มีผู้ป่วย {criticalPatients} รายที่มีระดับน้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูง กรุณาตรวจสอบ!
          </Alert>
        )}

        <Grid container spacing={3} mb={3}>
          {/* การ์ดสรุปผู้ป่วยที่มีความเสี่ยง */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <WarningIcon sx={{ color: theme.palette.error.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                    ผู้ป่วยที่มีความเสี่ยง
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                  {criticalPatients} คน
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  ผู้ป่วยที่มีระดับน้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูงในช่วงวันที่เลือก
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* การ์ดสรุปจำนวนผู้ป่วยทั้งหมด */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <TrendingUpIcon sx={{ color: theme.palette.success.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                    จำนวนผู้ป่วยทั้งหมด
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                  {uniquePatients} คน
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  จำนวนผู้ป่วยที่บันทึกในช่วงวันที่เลือก
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* การ์ดสถานะ */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <HealthAndSafetyIcon sx={{ color: theme.palette.info.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                    สถานะสุขภาพ
                  </Typography>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Chip
                    label={`น้ำตาลเสี่ยงสูง: ${criticalSugarCount}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium', backgroundColor: theme.palette.error.dark }}
                  />
                  <Chip
                    label={`น้ำตาลสูง: ${highSugarCount}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={`น้ำตาลต่ำ: ${lowSugarCount}`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={`ความดันเสี่ยงสูง: ${criticalPressureCount}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium', backgroundColor: theme.palette.error.dark }}
                  />
                  <Chip
                    label={`ความดันสูง: ${highPressureCount}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={`ความดันต่ำ: ${lowPressureCount}`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <StyledPaper>
          <StyledTabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="standard"
            sx={{ flexGrow: 1, mb: 3 }}
          >
            <Tab label="น้ำตาลในเลือด" />
            <Tab label="ความดันโลหิต" />
          </StyledTabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={60} color="primary" />
            </Box>
          ) : reportData.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="text.secondary" variant="h6" gutterBottom>
                ไม่พบข้อมูลรายงาน
              </Typography>
              <Typography color="text.secondary">
                ลองเปลี่ยนวันที่หรือรีเฟรชข้อมูล
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* กราฟ */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AssessmentIcon sx={{ color: theme.palette.info.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                    {tabIndex === 0 ? 'กราฟระดับน้ำตาลในเลือด' : 'กราฟความดันโลหิต'}
                  </Typography>
                </Box>
                <Box sx={{ height: { xs: 300, md: 400 } }}>
                  <ReportChart
                    data={reportData}
                    dataKeys={dataKeys}
                    chartTitle={tabIndex === 0 ? 'กราฟระดับน้ำตาลในเลือด' : 'กราฟความดันโลหิต'}
                    tooltipEnabled={true}
                  />
                </Box>
              </Grid>

              {/* ตาราง */}
              <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>ชื่อผู้ป่วย</StyledTableCell>
                        <StyledTableCell>ระดับน้ำตาล</StyledTableCell>
                        <StyledTableCell>สถานะน้ำตาล</StyledTableCell>
                        <StyledTableCell>ความดัน (ซิสโตลิก/ไดแอสโตลิก)</StyledTableCell>
                        <StyledTableCell>สถานะความดัน</StyledTableCell>
                        <StyledTableCell>ช่วงเวลาที่วัด</StyledTableCell>
                        <StyledTableCell>วันที่บันทึก</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.map((report) => (
                        <TableRow key={report.id} hover sx={{ '&:hover': { backgroundColor: theme.palette.grey[50] } }}>
                          <StyledTableCell>{report.patient?.name || 'ไม่ระบุ'}</StyledTableCell>
                          <StyledTableCell>{report.bloodSugar || '-'}</StyledTableCell>
                          <StyledTableCell
                            sx={{
                              color:
                                report.bloodSugarStatus === 'เสี่ยงสูง'
                                  ? theme.palette.error.dark
                                  : report.bloodSugarStatus === 'ต่ำ'
                                  ? theme.palette.warning.main
                                  : report.bloodSugarStatus === 'สูง'
                                  ? theme.palette.error.main
                                  : theme.palette.success.main,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {(report.bloodSugarStatus === 'เสี่ยงสูง' || report.bloodSugarStatus === 'ต่ำ' || report.bloodSugarStatus === 'สูง') && (
                              <WarningIcon sx={{ fontSize: 16, color: 'inherit' }} />
                            )}
                            {report.bloodSugarStatus || '-'}
                          </StyledTableCell>
                          <StyledTableCell>{`${report.systolic || '-'}/${report.diastolic || '-'}`}</StyledTableCell>
                          <StyledTableCell
                            sx={{
                              color:
                                report.systolicStatus === 'เสี่ยงสูง'
                                  ? theme.palette.error.dark
                                  : report.systolicStatus === 'ต่ำ'
                                  ? theme.palette.warning.main
                                  : report.systolicStatus === 'สูง'
                                  ? theme.palette.error.main
                                  : theme.palette.success.main,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {(report.systolicStatus === 'เสี่ยงสูง' || report.systolicStatus === 'ต่ำ' || report.systolicStatus === 'สูง') && (
                              <WarningIcon sx={{ fontSize: 16, color: 'inherit' }} />
                            )}
                            {report.systolicStatus || '-'}
                          </StyledTableCell>
                          <StyledTableCell>{formatMealTime(report.mealTime)}</StyledTableCell>
                          <StyledTableCell>
                            {new Date(report.recordedAt).toLocaleString('th-TH', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </StyledTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </StyledPaper>
      </ReportsContainer>
    </LocalizationProvider>
  );
};

export default Reports;