// 📁 src/components/Navbar.jsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease-in-out',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 'medium',
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
}));

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StyledIconButton
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'ปิด Sidebar' : 'เปิด Sidebar'}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <MenuIcon />
          </StyledIconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 'bold', letterSpacing: 1 }}
          >
            Diabetes Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StyledButton
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            aria-label="ออกจากระบบ"
          >
            ออกจากระบบ
          </StyledButton>
          <StyledIconButton
            onClick={handleLogout}
            aria-label="ออกจากระบบ"
            sx={{ display: { sm: 'none' } }}
          >
            <LogoutIcon />
          </StyledIconButton>
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;