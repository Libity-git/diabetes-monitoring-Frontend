// 📁 src/components/ReportChart.jsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Typography, Box } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

// ฟังก์ชันสำหรับ format วันที่เป็นภาษาไทย
const formatDate = (dateStr) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'd MMM yyyy', { locale: th });
  } catch {
    return dateStr; // คืนค่าเดิมถ้า format ไม่ได้
  }
};

// ฟังก์ชันสำหรับ format ค่าใน tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedLabel = formatDate(label);
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          วันที่: {formattedLabel}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name.includes('HbA1c') ? ' %' : entry.name.includes('น้ำตาล') ? ' mg/dL' : ' mmHg'}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const ReportChart = ({ data, dataKeys, chartTitle, tooltipEnabled = true }) => {
  // คำนวณ chartData และ yAxisProps ก่อน return
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      ...item,
      [dataKeys.xAxis]: item[dataKeys.xAxis],
    }));
  }, [data, dataKeys.xAxis]);

  const yAxisProps = useMemo(() => {
    if (!data || data.length === 0) {
      return { domain: [0, 100], unit: '', tickFormatter: (value) => `${value}` };
    }
    const hasHbA1c = dataKeys.lines.some((line) => line.key.includes('hbA1c'));
    const hasBloodSugar = dataKeys.lines.some((line) => line.key.includes('bloodSugar'));
    if (hasHbA1c) {
      return { domain: [4, 12], unit: ' %', tickFormatter: (value) => `${value}%` };
    } else if (hasBloodSugar) {
      return { domain: [50, 300], unit: ' mg/dL', tickFormatter: (value) => `${value}` };
    } else {
      return { domain: [80, 200], unit: ' mmHg', tickFormatter: (value) => `${value}` };
    }
  }, [data, dataKeys.lines]);

  // จัดการกรณีไม่มีข้อมูล
  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          ไม่มีข้อมูลสำหรับวันที่เลือก
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" align="center" gutterBottom>
        {chartTitle.replace(/[<>]/g, (match) => (match === '<' ? '<' : '>'))}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={dataKeys.xAxis}
            tickFormatter={formatDate}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yAxisProps.domain}
            unit={yAxisProps.unit}
            tickFormatter={yAxisProps.tickFormatter}
          />
          {tooltipEnabled && <Tooltip content={<CustomTooltip />} />}
          <Legend />
          {dataKeys.lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name.replace(/[<>]/g, (match) => (match === '<' ? '<' : '>'))}
              stroke={line.color}
              strokeDasharray={line.borderDash ? line.borderDash.join(' ') : undefined}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default ReportChart;