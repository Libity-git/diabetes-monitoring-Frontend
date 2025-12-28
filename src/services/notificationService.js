// 📁 src/services/notificationService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diabetes-monitoring-backend.onrender.com';

// Get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all notifications
export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/notifications/unread-count`,
      getAuthHeader()
    );
    return response.data.unreadCount;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/notifications/${id}/read`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all as read
export const markAllAsRead = async () => {
  try {
    const response = await axios.put(
      `${API_URL}/api/notifications/read-all`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/notifications/${id}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

