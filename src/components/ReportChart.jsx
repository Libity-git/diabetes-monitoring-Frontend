// 📁 src/components/ReportChart.jsx
import React from 'react';
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

const ReportChart = ({ data, dataKeys, chartTitle }) => {
  // จัดการกรณี data เป็น undefined หรือว่าง
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
        {chartTitle}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dataKeys.xAxis} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default ReportChart;