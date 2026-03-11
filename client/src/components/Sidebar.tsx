import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Clock,
  Crosshair,
  FileCheck,
  Settings as SettingsIcon,
  LogOut,
  X,
  Building2,
  Archive,
  BarChart3,
  RefreshCw,
  Users,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Guards', href: '/guards', icon: Shield },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Firearms', href: '/firearms', icon: Crosshair, adminOrHR: true },
  { name: 'Firearm Issuance', href: '/issuance', icon: FileCheck, adminOrHR: true },
  { name: 'Reports', href: '/reports', icon: BarChart3, adminOrHR: true },
  { name: 'Shift Rotation', href: '/shift-rotation', icon: RefreshCw, adminOrHR: true },
  { name: 'Users', href: '/user-management', icon: Users, adminOnly: true },
  { name: 'Archive', href: '/archive', icon: Archive, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isAdminOrHR = authService.isAdminOrHR();

  const userName = user?.first_name + ' ' + user?.last_name;
  const userEmail = user?.email;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const shouldShowItem = (item: (typeof navigation)[number]) => {
    if ('adminOnly' in item && item.adminOnly) return isAdmin;
    if ('adminOrHR' in item && item.adminOrHR) return isAdminOrHR;
    return true;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white border-r border-black/10 transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between bg-slate-900 px-6 border-b border-black/10 md:justify-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="ml-3 text-lg font-bold text-white tracking-tight">SecureGuard</span>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white p-2 -mr-2 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-6">
          <nav className="flex-1 space-y-1 px-3">
            {navigation
              .filter(shouldShowItem)
              .map((item) => {
                const isActive =
                  location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      isActive ? 'bg-slate-900 text-white' : 'text-[#333] hover:bg-[#333]/10 hover:text-[#333]',
                      'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-white' : 'text-[#333] group-hover:text-[#333]/80',
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
          </nav>
        </div>
        <div className="p-4 border-t border-black/10">
          <div className="flex items-center gap-3 rounded-lg p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-[#333] truncate">{userName}</span>
              <span className="text-xs text-[#555] truncate">{userEmail}</span>
            </div>
          </div>
          <button
            onClick={() => handleLogout()}
            className="ml-auto flex items-center gap-2 bg-[#C01C1C] p-2 rounded-lg mt-4 w-full justify-center cursor-pointer hover:bg-[#C01C1C]/80"
          >
            <span className="text-xs text-white">Logout</span>
            <LogOut className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}
