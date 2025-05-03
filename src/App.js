// 📁 src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Reports from './pages/Reports';
import Admins from './pages/Admins';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PatientDetail from './components/PatientDetail';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSidebarOpen',
})(({ theme, isSidebarOpen }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.spacing(8),
  marginLeft: isSidebarOpen ? { sm: `${240}px` } : { sm: `${60}px` },
  transition: theme.transitions.create(['margin-left', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  width: isSidebarOpen ? { sm: `calc(100% - ${240}px)` } : { sm: `calc(100% - ${60}px)` },
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(7),
    padding: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
  },
}));

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Box sx={{ display: 'flex' }}>
              <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <MainContent isSidebarOpen={isSidebarOpen}>
                <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="admins" element={<Admins />} />
                  <Route path="patients/:patientId" element={<PatientDetail />} />
                  <Route path="patients/new" element={<PatientDetail />} />
                </Routes>
              </MainContent>
            </Box>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default AppWrapper;