// 📁 src/pages/Admins.jsx
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAllAdmins, createAdmin, deleteAdmin } from '../services/adminService';

// Styled components
const AdminContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
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

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, username: '' });

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

  const handleCreate = async () => {
    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    try {
      setLoading(true);
      await createAdmin({ username, password });
      setUsername('');
      setPassword('');
      setSuccess('เพิ่มผู้ดูแลระบบสำเร็จ');
      setError(null);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มผู้ดูแล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteAdmin(deleteDialog.id);
      setSuccess('ลบผู้ดูแลระบบสำเร็จ');
      setError(null);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบผู้ดูแล');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, id: null, username: '' });
    }
  };

  const openDeleteDialog = (id, username) => {
    setDeleteDialog({ open: true, id, username });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, username: '' });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <AdminContainer>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}
      >
        จัดการผู้ดูแลระบบ
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <StyledPaper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
          เพิ่มผู้ดูแลระบบ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <StyledButton
            variant="contained"
            onClick={handleCreate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          >
            เพิ่ม
          </StyledButton>
        </Box>
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
          รายการผู้ดูแล
        </Typography>
        {loading && !admins.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : admins.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            ไม่พบผู้ดูแลระบบ
          </Typography>
        ) : (
          <List>
            {admins.map((admin) => (
              <ListItem
                key={admin.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => openDeleteDialog(admin.id, admin.username)}
                    disabled={loading}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <ListItemText
                  primary={admin.username}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </StyledPaper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>ยืนยันการลบผู้ดูแล</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ว่าต้องการลบผู้ดูแล "{deleteDialog.username}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">
            ยกเลิก
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </AdminContainer>
  );
};

export default Admins;