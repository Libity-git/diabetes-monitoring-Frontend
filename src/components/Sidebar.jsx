import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCog,
  Activity,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ClipboardPlus,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { path: '/patients', label: 'ผู้ป่วย', icon: Users },
  { path: '/add-patient', label: 'เพิ่มผู้ป่วย', icon: UserPlus },
  { path: '/manual-report', label: 'กรอกแทน', icon: ClipboardPlus },
  { path: '/reports', label: 'รายงาน', icon: FileText },
  { path: '/admins', label: 'ผู้ดูแล', icon: UserCog },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200 shadow-lg transition-all duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "w-64" : "w-20",
          "lg:translate-x-0",
          !isSidebarOpen && "max-lg:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            !isSidebarOpen && "lg:justify-center"
          )}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-slate-800 text-lg leading-tight">
                  Diabetes
                </h1>
                <p className="text-xs text-slate-500">Monitoring</p>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex h-8 w-8"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  !isSidebarOpen && "lg:justify-center lg:px-2"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {isSidebarOpen && (
                  <span className="font-medium animate-fade-in">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-slate-200",
          !isSidebarOpen && "lg:p-2"
        )}>
          {isSidebarOpen ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">สถานะระบบ</span>
              </div>
              <p className="text-xs text-slate-500">ทำงานปกติ</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
