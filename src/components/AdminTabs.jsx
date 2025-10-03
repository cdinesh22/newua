import { NavLink } from 'react-router-dom'

export default function AdminTabs() {
  const link = ({ isActive }) => `px-3 py-2 rounded ind-trans ${isActive ? 'bg-saffron-100 text-saffron-700 border-b-2 border-[color:var(--india-saffron)]' : 'text-gray-700 hover:bg-orange-50'}`
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto border-b border-orange-100 pb-2">
      <NavLink to="/admin" className={link}>Overview</NavLink>
      <NavLink to="/admin/bookings" className={link}>Bookings</NavLink>
      <NavLink to="/admin/users" className={link}>Users</NavLink>
      <NavLink to="/admin/reports" className={link}>Reports</NavLink>
      <NavLink to="/admin/analytics" className={link}>Analytics</NavLink>
    </div>
  )
}
