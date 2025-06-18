// 📁 src/components/DashboardStats.jsx
import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MedicationIcon from '@mui/icons-material/Medication';

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

const DashboardStats = ({ stats }) => {
  const theme = useTheme();

  // ตรวจสอบว่ามีข้อมูล stats หรือไม่
  const hasStatsData = stats && Object.keys(stats).length > 0;

  // ข้อมูลตัวอย่างสำหรับเปรียบเทียบกับวันก่อนหน้า (สมมติว่ามีใน stats)
  const highSugarTrend = stats?.highSugarToday > (stats?.highSugarYesterday || 0) ? 'เพิ่มขึ้น' : 'ลดลง';
  const lowSugarTrend = stats?.lowSugarToday > (stats?.lowSugarYesterday || 0) ? 'เพิ่มขึ้น' : 'ลดลง';
  const controlledHbA1cCount = stats?.controlledHbA1cCount || 0;
  const highRiskHbA1cCount = stats?.highRiskHbA1cCount || 0; // ใช้ highRiskHbA1cCount
  const medicationCompliance = stats?.medicationCompliance || 0;

  return (
    <Grid container spacing={2}>
      {/* การ์ดน้ำตาลสูง */}
      <Grid item xs={12} sm={6} md={3}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <WarningIcon sx={{ color: theme.palette.error.main }} />
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                น้ำตาลสูงวันนี้ ({'>'}200 mg/dL)
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
              {hasStatsData ? stats.highSugarToday : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {hasStatsData ? `แนวโน้ม: ${highSugarTrend}` : 'ไม่มีข้อมูล'}
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* การ์ดน้ำตาลต่ำ */}
      <Grid item xs={12} sm={6} md={3}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <WarningIcon sx={{ color: theme.palette.warning.main }} />
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                น้ำตาลต่ำวันนี้ ({'<'}70 mg/dL)
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>
              {hasStatsData ? stats.lowSugarToday : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {hasStatsData ? `แนวโน้ม: ${lowSugarTrend}` : 'ไม่มีข้อมูล'}
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* การ์ด HbA1c ควบคุมได้ */}
      <Grid item xs={12} sm={6} md={3}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <HealthAndSafetyIcon sx={{ color: theme.palette.success.main }} />
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                HbA1c ควบคุมได้ ({'<'}7%)
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
              {hasStatsData ? controlledHbA1cCount : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              ผู้ป่วยที่ควบคุมน้ำตาลในระยะยาวได้ดี
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* การ์ด HbA1c เสี่ยงสูง */}
      <Grid item xs={12} sm={6} md={3}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <WarningIcon sx={{ color: theme.palette.error.main }} />
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                HbA1c เสี่ยงสูง ({'>'}9%)
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
              {hasStatsData ? highRiskHbA1cCount : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              ผู้ป่วยที่มีความเสี่ยงสูงจาก HbA1c
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* การ์ดการปฏิบัติตามการใช้ยา */}
      <Grid item xs={12} sm={6} md={3}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <MedicationIcon sx={{ color: theme.palette.info.main }} />
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                การปฏิบัติตามการใช้ยา
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 'bold' }}>
              {hasStatsData ? `${medicationCompliance}%` : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              เปอร์เซ็นต์ผู้ป่วยที่ใช้ยาตามกำหนด
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default DashboardStats;