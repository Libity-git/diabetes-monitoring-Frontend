// 📁 src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DashboardStats from '../components/DashboardStats';
import ReportChart from '../components/ReportChart';
import {
  getSummaryStats,
  getHighSugarAndHighPressureReports,
  getAllReports,
} from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';

const DashboardContainer = styled(Box)(({ theme }) => ({
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

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [highSugarAndHighPressureReports, setHighSugarAndHighPressureReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7))); // 31/05/2025
  const [endDate, setEndDate] = useState(new Date()); // 07/06/2025 16:10

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data for period:', { startDate, endDate });
      const [statsData, reportsData, allReportsData] = await Promise.all([
        getSummaryStats({ startDate, endDate }),
        getHighSugarAndHighPressureReports({ startDate, endDate }),
        getAllReports({ startDate, endDate }),
      ]);
      // Debug: ตรวจสอบโครงสร้างข้อมูล
      console.log('Stats Data:', JSON.stringify(statsData, null, 2));
      console.log('Reports Data:', JSON.stringify(reportsData, null, 2));
      console.log('All Reports Data:', JSON.stringify(allReportsData, null, 2));
      if (!statsData || !reportsData || !allReportsData) {
        throw new Error(`ข้อมูลจากเซิร์ฟเวอร์ว่างเปล่าสำหรับช่วงวันที่ ${startDate.toISOString()} - ${endDate.toISOString()}`);
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
      setError(
        err.response?.status === 500
          ? `เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้งสำหรับช่วงวันที่ ${startDate.toISOString()} - ${endDate.toISOString()}`
          : err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด'
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, isAuthenticated, navigate]);

  useEffect(() => {
    console.log('Dashboard mounted or location changed:', location.pathname);
    fetchData();
  }, [fetchData, location.pathname]);

  useEffect(() => {
    console.log('Current state - stats:', stats);
    console.log('Current state - reports:', highSugarAndHighPressureReports);
    console.log('Current state - all reports:', allReports);
  }, [stats, highSugarAndHighPressureReports, allReports]);

  const handleDateChange = (type, newDate) => {
    if (type === 'start' && newDate > endDate) {
      setError('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
      return;
    }
    if (type === 'end' && newDate < startDate) {
      setError('วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น');
      return;
    }
    setError(null);
    type === 'start' ? setStartDate(newDate) : setEndDate(newDate);
    fetchData(); // อัปเดตข้อมูลทันทีเมื่อเปลี่ยนวันที่
  };

  const handleResetDates = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setError(null);
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} color="primary" />
        </Box>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          {error}
          <Box mt={2} display="flex" gap={2}>
            <StyledButton onClick={fetchData}>ลองโหลดใหม่</StyledButton>
            <StyledButton
              onClick={() => navigate('/reports')}
              variant="outlined"
              color="secondary"
            >
              ไปที่หน้ารายงาน
            </StyledButton>
          </Box>
        </Alert>
      </DashboardContainer>
    );
  }

  const hasStatsData = stats && Object.keys(stats).length > 0;
  const hasReportsData = highSugarAndHighPressureReports && highSugarAndHighPressureReports.length > 0;

  // คำนวณจำนวนผู้ป่วยที่มีความเสี่ยงโดยอิงจาก patient ID
  const criticalPatientsCount = hasReportsData
    ? [...new Set(highSugarAndHighPressureReports.map((report) => report.patient?.id))].length
    : 0;

 const uniquePatients = [...new Set(allReports.map((report) => report.patient?.id))].length;

  // เพิ่มการนับสำหรับสถานะเสี่ยงสูง
  const criticalSugarToday = hasReportsData
    ? highSugarAndHighPressureReports.filter((report) => report.bloodSugarStatus === 'เสี่ยงสูง').length
    : 0;
  const criticalPressureToday = hasReportsData
    ? highSugarAndHighPressureReports.filter((report) => report.systolicStatus === 'เสี่ยงสูง').length
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardContainer>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <HealthAndSafetyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              แดชบอร์ดภาพรวมสุขภาพ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="วันที่เริ่มต้น"
              value={startDate}
              onChange={(newDate) => handleDateChange('start', newDate)}
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
              onChange={(newDate) => handleDateChange('end', newDate)}
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
              onClick={fetchData}
              disabled={loading}
            >
              รีเฟรช
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

        {criticalPatientsCount > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            มีผู้ป่วย {criticalPatientsCount} รายที่มีระดับน้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูง กรุณาตรวจสอบ!
          </Alert>
        )}

        {(!hasStatsData && !hasReportsData) && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            ไม่มีข้อมูลสำหรับช่วงวันที่เลือก กรุณาเลือกช่วงวันที่อื่นหรือตรวจสอบฐานข้อมูล
          </Alert>
        )}

        <Grid container spacing={3}>
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
                  {criticalPatientsCount} คน
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  ผู้ป่วยที่มีระดับน้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูงในช่วงวันที่เลือก
                </Typography>
                {criticalPatientsCount > 0 && (
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/reports')}
                    sx={{ mt: 2 }}
                    startIcon={<AssessmentIcon />}
                  >
                    ดูรายงาน
                  </StyledButton>
                )}
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
                    label={`น้ำตาลเสี่ยงสูง: ${criticalSugarToday}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium', backgroundColor: theme.palette.error.dark }}
                  />
                  <Chip
                    label={`น้ำตาลสูง: ${stats?.highSugarToday || 0}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={`น้ำตาลต่ำ: ${stats?.lowSugarToday || 0}`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={`ความดันเสี่ยงสูง: ${criticalPressureToday}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium', backgroundColor: theme.palette.error.dark }}
                  />
                  <Chip
                    label={`ความดันสูง: ${stats?.highPressureToday || 0}`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={`ความดันต่ำ: ${stats?.lowPressureToday || 0}`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* กราฟผู้ป่วยที่มีความเสี่ยง */}
          <Grid item xs={12}>
            <StyledPaper elevation={3}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <WarningIcon sx={{ color: theme.palette.error.main }} />
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                  กราฟผู้ป่วยที่มีน้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูง
                </Typography>
              </Box>
              <Box sx={{ height: { xs: 300, md: 400 }, mt: 2 }}>
                {hasReportsData ? (
                  <ReportChart
                    data={highSugarAndHighPressureReports}
                    dataKeys={{
                      xAxis: 'recordedAt',
                      lines: [
                        { key: 'bloodSugar', name: 'ระดับน้ำตาล (mg/dL)', color: theme.palette.error.main },
                        { key: 'systolic', name: 'ความดันซิสโตลิก (mmHg)', color: theme.palette.success.main },
                      ],
                    }}
                    chartTitle="ผู้ป่วยที่น้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูง"
                    tooltipEnabled={true}
                  />
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center">
                    ไม่มีข้อมูลสำหรับช่วงวันที่เลือก
                  </Typography>
                )}
              </Box>
            </StyledPaper>
          </Grid>

          {/* สถิติเพิ่มเติมจาก DashboardStats */}
          <Grid item xs={12}>
            <StyledPaper elevation={3}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AssessmentIcon sx={{ color: theme.palette.info.main }} />
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                  สถิติสุขภาพรายวัน
                </Typography>
              </Box>
              {hasStatsData ? (
                <DashboardStats stats={stats} />
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  ไม่มีข้อมูลสถิติสำหรับช่วงวันที่เลือก
                </Typography>
              )}
            </StyledPaper>
          </Grid>
        </Grid>
      </DashboardContainer>
    </LocalizationProvider>
  );
};

export default Dashboard;