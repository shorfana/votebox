import { House, Vote } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import LogoBrand from '../assets/logokambar.png';

export default function Sidebar() {
  const [showSidebar, setShowSidebar] = useState('-left-64');
  return (
    <div className="w-1/6 border border-gray-300 h-screen rounded-xl ml-4 mt-2">
      <div className="">
        <div className="flex items-center p-6">
          <img src={LogoBrand} alt="" width={120} />
          <p className="text-xl tracking-tight font-extrabold">VOTEBOX.</p>
        </div>
      </div>
      <div className="mt-4">
        <ul>
          <li className="mb-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center p-4 bg-gray-100'
                  : 'flex items-center p-4'
              }
            >
              <House color="#77767b" strokeWidth={1.75} className="mx-6" />
              <span className="text-xl tracking-tighter">Dashboard</span>
            </NavLink>
          </li>

          <li className="mb-2">
            <NavLink
              to="/voting"
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center p-4 bg-gray-100'
                  : 'flex items-center p-4'
              }
            >
              <Vote color="#77767b" strokeWidth={1.75} className="mx-6" />
              <span className="text-xl tracking-tighter">Voting</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}
