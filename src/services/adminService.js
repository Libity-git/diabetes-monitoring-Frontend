// 📁 src/services/adminService.js
import api from './api';

export const getAllAdmins = async () => {
  const res = await api.get('/admin');
  return res.data;
};

export const createAdmin = async (data) => {
  const res = await api.post('/admin', data);
  return res.data;
};

export const updateAdmin = async (id, data) => {
  const res = await api.put(`/admin/${id}`, data);
  return res.data;
};

export const deleteAdmin = async (id) => {
  const res = await api.delete(`/admin/${id}`);
  return res.data;
};
