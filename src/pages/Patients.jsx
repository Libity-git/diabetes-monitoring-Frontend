// 📁 src/pages/Patients.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add'; // เพิ่มการ import AddIcon
import { Link } from 'react-router-dom';
import * as patientService from '../services/patientService';

// Styled components
const PatientsContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
}));

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await patientService.getAllPatients();
        setPatients(res);
        setFilteredPatients(res);
        setError(null);
      } catch (error) {
        setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <PatientsContainer>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}
      >
        รายชื่อผู้ป่วยทั้งหมด
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          label="ค้นหาผู้ป่วย (ชื่อหรือเบอร์โทร)"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <SearchIcon color="action" sx={{ mr: 1 }} />
            ),
            sx: { borderRadius: 2 },
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <StyledButton
          variant="contained"
          component={Link}
          to="/patients/new"
          startIcon={<AddIcon />}
        >
          เพิ่มผู้ป่วย
        </StyledButton>
      </Box>

      <StyledPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>เพศ</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>อายุ</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>เบอร์โทร</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ดูข้อมูล
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      ไม่พบข้อมูลผู้ป่วย
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((p) => (
                  <TableRow
                    key={p.id}
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        component={Link}
                        to={`/patients/${p.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>
    </PatientsContainer>
  );
};

export default Patients;