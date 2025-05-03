// 📁 src/components/DashboardStats.jsx
import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const DashboardStats = ({ stats }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">น้ำตาลสูงวันนี้</Typography>
            <Typography variant="h4">{stats.highSugarToday || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">น้ำตาลต่ำวันนี้</Typography>
            <Typography variant="h4">{stats.lowSugarToday || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">ความดันสูงวันนี้</Typography>
            <Typography variant="h4">{stats.highPressureToday || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">ความดันต่ำวันนี้</Typography>
            <Typography variant="h4">{stats.lowPressureToday || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardStats;