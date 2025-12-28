// 📁 src/pages/Admins.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { getAllAdmins, createAdmin, deleteAdmin } from '../services/adminService';
import {
  UserCog,
  Plus,
  Trash2,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Shield,
  Key,
} from 'lucide-react';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, admin: null });
  const [deleting, setDeleting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
      setError(null);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดรายการผู้ดูแล');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    try {
      setCreating(true);
      await createAdmin({ username, password });
      setUsername('');
      setPassword('');
      setSuccess('เพิ่มผู้ดูแลระบบสำเร็จ');
      setError(null);
      fetchAdmins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มผู้ดูแล');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.admin) return;
    try {
      setDeleting(true);
      await deleteAdmin(deleteDialog.admin.id);
      setSuccess('ลบผู้ดูแลระบบสำเร็จ');
      setError(null);
      fetchAdmins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบผู้ดูแล');
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, admin: null });
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
          <UserCog className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการผู้ดูแลระบบ</h1>
          <p className="text-sm text-slate-500">
            ผู้ดูแลทั้งหมด {admins.length} คน
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Admin Form */}
        <Card className="shadow-lg border-0 lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-emerald-500" />
              เพิ่มผู้ดูแลใหม่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  ชื่อผู้ใช้
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  รหัสผ่าน
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={creating}
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังเพิ่ม...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มผู้ดูแล
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin List */}
        <Card className="shadow-lg border-0 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-blue-500" />
              รายการผู้ดูแล
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <UserCog className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ไม่พบผู้ดูแลระบบ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((admin, index) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {admin.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{admin.username}</p>
                        <p className="text-xs text-slate-400">
                          ผู้ดูแลระบบ #{index + 1}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteDialog({ open: true, admin })}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      ลบ
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              คุณแน่ใจหรือไม่ที่จะลบผู้ดูแล <span className="font-semibold">"{deleteDialog.admin?.username}"</span>?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, admin: null })}
                disabled={deleting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
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

export default Admins;
