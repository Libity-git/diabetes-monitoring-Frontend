// 📁 src/components/Sidebar.jsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useLocation } from 'react-router-dom';

// Styled components
const drawerWidth = 240;
const collapsedWidth = 60;

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  flexShrink: 0,
  zIndex: theme.zIndex.appBar - 1,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : collapsedWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
  },
  [theme.breakpoints.down('sm')]: {
    width: collapsedWidth,
    '& .MuiDrawer-paper': {
      width: collapsedWidth,
    },
    '& .MuiListItemText-root': {
      display: 'none',
    },
    '& .MuiListItemIcon-root': {
      justifyContent: 'center',
    },
  },
}));

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'active', // ป้องกัน active ถูกส่งไป DOM
})(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  transition: 'all 0.3s ease-in-out',
  backgroundColor: active ? theme.palette.primary.light : 'transparent',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(5px)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    minWidth: 40,
  },
}));

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' }, // เปลี่ยนจาก /dashboard เป็น /
    { text: 'รายงาน', icon: <BarChartIcon />, path: '/reports' },
    { text: 'ผู้ป่วย', icon: <PeopleIcon />, path: '/patients' },
    { text: 'ผู้ดูแลระบบ', icon: <AdminPanelSettingsIcon />, path: '/admins' },
  ];

  return (
    <StyledDrawer variant="permanent" anchor="left" open={isSidebarOpen}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            display: isSidebarOpen ? 'block' : 'none',
          }}
        >
          HealthCare
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <StyledListItem
              button
              component={Link}
              to={item.path}
              key={item.text}
              active={location.pathname === item.path} // ยังคงใช้ active สำหรับ styling
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ display: isSidebarOpen ? 'block' : 'none' }}
              />
            </StyledListItem>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;