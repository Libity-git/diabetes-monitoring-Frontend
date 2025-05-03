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
import { getSummaryStats, getHighSugarAndHighPressureReports, getAllReports } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssessmentIcon from '@mui/icons-material/Assessment';

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data for date:', selectedDate.toISOString());
      const [statsData, reportsData, allReportsData] = await Promise.all([
        getSummaryStats(selectedDate),
        getHighSugarAndHighPressureReports(selectedDate),
        getAllReports(selectedDate),
      ]);
      console.log('Stats Data:', statsData);
      console.log('Reports Data:', reportsData);
      console.log('All Reports Data:', allReportsData);
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
          ? 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง'
          : 'เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate, isAuthenticated, navigate]);

  useEffect(() => {
    console.log('Dashboard mounted or location changed:', location.pathname);
    fetchData();
  }, [fetchData, location.pathname]);

  useEffect(() => {
    console.log('Current state - stats:', stats);
    console.log('Current state - reports:', highSugarAndHighPressureReports);
    console.log('Current state - all reports:', allReports);
  }, [stats, highSugarAndHighPressureReports, allReports]);

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
  const criticalPatientsCount = [...new Set(
    highSugarAndHighPressureReports.map((report) => report.patient?.id)
  )].length;

  const uniquePatients = [...new Set(allReports.map((report) => report.patient?.id))].length;

  // เพิ่มการนับสำหรับสถานะเสี่ยงสูง
  const criticalSugarToday = highSugarAndHighPressureReports.filter(
    (report) => report.bloodSugarStatus === 'เสี่ยงสูง'
  ).length;
  const criticalPressureToday = highSugarAndHighPressureReports.filter(
    (report) => report.systolicStatus === 'เสี่ยงสูง'
  ).length;

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
          <DatePicker
            label="เลือกวันที่"
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
            slotProps={{
              textField: {
                variant: 'outlined',
                size: 'small',
                sx: { backgroundColor: theme.palette.common.white },
              },
            }}
          />
        </Box>

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
                  ผู้ป่วยที่มีระดับน้ำตาลหรือความดันอยู่ในเกณฑ์เสี่ยงสูงในวันที่เลือก
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
                  จำนวนผู้ป่วยที่บันทึกในวันที่เลือก
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
                    ไม่มีข้อมูลสำหรับวันที่เลือก
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
                  ไม่มีข้อมูลสถิติสำหรับวันที่เลือก
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