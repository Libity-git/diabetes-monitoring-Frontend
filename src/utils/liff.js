// 📁 src/utils/liff.js
import liff from '@line/liff';

// LIFF IDs from LINE Developers Console
const LIFF_IDS = {
  register: '2008792421-iVY1dt22',
  report: '2008792421-rhtZOZGm',
  healthInfo: '2008792421-2AewWTg2',
};

// Get LIFF ID based on current path
const getLiffIdByPath = () => {
  const path = window.location.pathname;
  if (path.includes('/liff/report')) return LIFF_IDS.report;
  if (path.includes('/liff/health-info')) return LIFF_IDS.healthInfo;
  if (path.includes('/liff/register')) return LIFF_IDS.register;
  return LIFF_IDS.register; // default
};

let isInitialized = false;

export const initLiff = async (customLiffId = null) => {
  if (isInitialized) return true;
  
  const liffId = customLiffId || getLiffIdByPath();
  
  try {
    await liff.init({ liffId });
    isInitialized = true;
    console.log('LIFF initialized successfully with ID:', liffId);
    return true;
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    return false;
  }
};

export const getLiffProfile = async () => {
  try {
    if (!liff.isLoggedIn()) {
      liff.login();
      return null;
    }
    const profile = await liff.getProfile();
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const getLineUserId = async () => {
  try {
    if (!liff.isLoggedIn()) {
      liff.login();
      return null;
    }
    const profile = await liff.getProfile();
    return profile.userId;
  } catch (error) {
    console.error('Error getting userId:', error);
    return null;
  }
};

export const isInClient = () => {
  return liff.isInClient();
};

export const isLoggedIn = () => {
  return liff.isLoggedIn();
};

export const login = () => {
  if (!liff.isLoggedIn()) {
    liff.login();
  }
};

export const logout = () => {
  if (liff.isLoggedIn()) {
    liff.logout();
  }
};

export const closeWindow = () => {
  if (liff.isInClient()) {
    liff.closeWindow();
  } else {
    window.close();
  }
};

export const sendMessages = async (messages) => {
  try {
    if (liff.isInClient()) {
      await liff.sendMessages(messages);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending messages:', error);
    return false;
  }
};

export { LIFF_IDS };
export default liff;
