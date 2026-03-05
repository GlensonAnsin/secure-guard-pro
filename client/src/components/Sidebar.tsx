import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shield, Clock, Crosshair, FileCheck, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Guards', href: '/guards', icon: Shield },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Firearms', href: '/firearms', icon: Crosshair },
  { name: 'Firearm Issuance', href: '/issuance', icon: FileCheck },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const userName = user?.first_name + ' ' + user?.last_name;
  const userEmail = user?.email;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
        <Shield className="h-8 w-8 text-blue-500" />
        <span className="ml-3 text-lg font-bold text-white tracking-tight">Secure Guard</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-blue-600/10 text-blue-500'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-100',
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
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
            {user?.first_name[0] + user?.last_name[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{userName}</span>
            <span className="text-xs text-slate-400">{userEmail}</span>
          </div>
        </div>
        <button
          onClick={() => handleLogout()}
          className="ml-auto flex items-center gap-2 bg-red-600 p-2 rounded-lg mt-4 w-full justify-center cursor-pointer hover:bg-red-700"
        >
          <span className="text-xs text-white">Logout</span>
          <LogOut className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
