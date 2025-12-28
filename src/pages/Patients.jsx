// 📁 src/pages/Patients.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import * as patientService from '../services/patientService';
import {
  Users,
  Search,
  Plus,
  Eye,
  Trash2,
  Phone,
  User,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, patient: null });
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    const filtered = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.patient) return;
    try {
      setDeleting(true);
      await patientService.deletePatient(deleteDialog.patient.id);
      setPatients(patients.filter((p) => p.id !== deleteDialog.patient.id));
      setFilteredPatients(filteredPatients.filter((p) => p.id !== deleteDialog.patient.id));
      setError(null);
    } catch (error) {
      setError('ไม่สามารถลบผู้ป่วยได้');
      console.error('Error deleting patient:', error);
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, patient: null });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">รายชื่อผู้ป่วย</h1>
            <p className="text-sm text-slate-500">
              ผู้ป่วยทั้งหมด {patients.length} คน
            </p>
          </div>
        </div>

        <Button asChild>
          <Link to="/patients/new">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มผู้ป่วย
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="ค้นหาชื่อหรือเบอร์โทร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">ผู้ป่วยทั้งหมด</p>
              <p className="text-xl font-bold text-blue-600">{patients.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">ผลการค้นหา</p>
              <p className="text-xl font-bold text-emerald-600">{filteredPatients.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">ชื่อ</TableHead>
                  <TableHead className="font-semibold">เพศ</TableHead>
                  <TableHead className="font-semibold">อายุ</TableHead>
                  <TableHead className="font-semibold">เบอร์โทร</TableHead>
                  <TableHead className="font-semibold text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Users className="w-8 h-8" />
                        <p>ไม่พบข้อมูลผู้ป่วย</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{patient.name}</p>
                            <p className="text-xs text-slate-400">ID: {patient.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.gender === 'ชาย' ? 'info' : 'secondary'}>
                          {patient.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{patient.age}</span>
                        <span className="text-slate-400 text-sm"> ปี</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          {patient.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/patients/${patient.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              ดู
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteDialog({ open: true, patient })}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            ลบ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">ยืนยันการลบ</h3>
                <p className="text-sm text-slate-500">การกระทำนี้ไม่สามารถกู้คืนได้</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6">
              คุณแน่ใจหรือไม่ที่จะลบผู้ป่วย <span className="font-semibold">{deleteDialog.patient?.name}</span>?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, patient: null })}
                disabled={deleting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
