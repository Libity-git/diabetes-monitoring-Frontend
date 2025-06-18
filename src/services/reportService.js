// 📁 src/services/reportService.js
import api from './api';

export const getReportsByPatientId = async (patientId) => {
  try {
    const res = await api.get(`/reports/patient/${patientId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching reports:', err);
    throw err; // Throw error เพื่อให้ component จัดการ
  }
};

export const getAllReports = async ({ startDate, endDate } = {}) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate.toISOString().split('T')[0];
    if (endDate) params.endDate = endDate.toISOString().split('T')[0];
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/reports${queryString ? `?${queryString}` : ''}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching all reports:', err);
    throw err;
  }
};

export const getSummaryStats = async ({ startDate, endDate } = {}) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate.toISOString().split('T')[0];
    if (endDate) params.endDate = endDate.toISOString().split('T')[0];
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/reports/summary${queryString ? `?${queryString}` : ''}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching summary stats:', err);
    throw err;
  }
};

export const getHighSugarAndHighPressureReports = async ({ startDate, endDate } = {}) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate.toISOString().split('T')[0];
    if (endDate) params.endDate = endDate.toISOString().split('T')[0];
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/reports/high-sugar-high-pressure${queryString ? `?${queryString}` : ''}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching high sugar and high pressure reports:', err);
    throw err;
  }
};