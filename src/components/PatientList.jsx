// 📁 src/components/PatientList.jsx
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button
} from '@mui/material';

const PatientList = ({ patients, onSelect }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ชื่อ</TableCell>
            <TableCell>เพศ</TableCell>
            <TableCell>อายุ</TableCell>
            <TableCell>เบอร์โทร</TableCell>
            <TableCell>ดูรายละเอียด</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onSelect(patient)}
                >
                  ดู
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PatientList;
