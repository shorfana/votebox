import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NavDashboard from './NavDashboard';

export default function LayoutDashboard() {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <NavDashboard />
        <div className="p-2 flex-1 overflow-y-auto rounded-t-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
