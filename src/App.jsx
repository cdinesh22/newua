import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Simulation from './pages/Simulation'
import Book from './pages/Book'
import Contact from './pages/Contact'
import ExploreLive from './pages/ExploreLive'
import Calendar from './pages/Calendar'
import Community from './pages/Community'
import ProtectedRoute from './components/ProtectedRoute'
import AdminBookings from './pages/admin/AdminBookings'
import AdminUsers from './pages/admin/AdminUsers'
import AdminReports from './pages/admin/AdminReports'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AITutor from './components/AITutor'

export default function App() {
  const location = useLocation()
  return (
    <AuthProvider>
      <div key={location.pathname} className="animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book" element={<Book />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/community" element={<Community />} />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={["pilgrim", "admin"]}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/live" element={<ExploreLive />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Global floating AI Tutor */}
        <AITutor />
      </div>
    </AuthProvider>
  )
}
