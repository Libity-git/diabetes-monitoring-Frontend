// 📁 src/services/patientService.js
import api from './api';

export const getAllPatients = async () => {
    try {
      const res = await api.get('/patients');
      return res.data;
    } catch (err) {
      console.error('Error fetching patients:', err);
      return [];
    }
  };
  

export const getPatientById = async (id) => {
  const res = await api.get(`/patients/${id}`);
  return res.data;
};

export const createPatient = async (data) => {
  const res = await api.post('/patients', data);
  return res.data;
};

export const updatePatient = async (id, data) => {
  const res = await api.put(`/patients/${id}`, data);
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await api.delete(`/patients/${id}`);
  return res.data;
};
