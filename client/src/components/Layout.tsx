import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6 px-6 sm:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
