// 📁 src/pages/PatientDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, TextField, Button } from '@mui/material';
import * as patientService from '../services/patientService'; // ดึงข้อมูลจาก service

const PatientDetail = () => {
  const { patientId } = useParams(); // ดึง id จาก URL
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (patientId) {
      // ดึงข้อมูลผู้ป่วยหากมี patientId
      const fetchPatient = async () => {
        try {
          const data = await patientService.getPatientById(patientId);
          setName(data.name);
          setGender(data.gender);
          setAge(data.age);
          setPhone(data.phone);
        } catch (error) {
          console.error('ไม่สามารถดึงข้อมูลผู้ป่วย:', error);
        }
      };
      fetchPatient();
    }
  }, [patientId]);

  // ฟังก์ชันในการบันทึกข้อมูลที่ถูกแก้ไขหรือเพิ่ม
  const handleSubmit = async () => {
    const patientData = { name, gender, age, phone };
    try {
      if (patientId) {
        // ถ้ามี patientId คือการแก้ไข
        await patientService.updatePatient(patientId, patientData);
      } else {
        // ถ้าไม่มี patientId คือการเพิ่ม
        await patientService.createPatient(patientData);
      }
      navigate('/patients'); // หลังจากบันทึกแล้วกลับไปที่หน้า Patients
    } catch (error) {
      console.error('ไม่สามารถบันทึกข้อมูลผู้ป่วย:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        {patientId ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มข้อมูลผู้ป่วย'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <TextField
          label="ชื่อ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="เพศ"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="อายุ"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="เบอร์โทร"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleSubmit}>
          {patientId ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ป่วย'}
        </Button>
      </Paper>
    </Container>
  );
};

export default PatientDetail;