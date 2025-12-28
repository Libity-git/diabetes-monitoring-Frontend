// 📁 src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { cn } from './lib/utils';

// LIFF Pages
import LiffRegister from './pages/liff/LiffRegister';
import LiffReport from './pages/liff/LiffReport';
import LiffHealthInfo from './pages/liff/LiffHealthInfo';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* LIFF Routes (No authentication required) */}
      <Route path="/liff/register" element={<LiffRegister />} />
      <Route path="/liff/report" element={<LiffReport />} />
      <Route path="/liff/health-info" element={<LiffHealthInfo />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-slate-50">
              <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
              
              <main
                className={cn(
                  "pt-20 pb-8 px-4 lg:px-8 transition-all duration-300 min-h-screen",
                  isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
                )}
              >
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="admins" element={<Admins />} />
                  <Route path="patients/:patientId" element={<PatientDetail />} />
                  <Route path="patients/new" element={<PatientDetail />} />
                </Routes>
              </main>
            </div>
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
