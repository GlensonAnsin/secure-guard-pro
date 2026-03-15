import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Shield, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 relative flex flex-col overflow-y-auto focus:outline-none">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between bg-slate-900 px-4 border-b border-black/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="text-lg font-bold text-white tracking-tight">Secure Guard</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 sm:px-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
