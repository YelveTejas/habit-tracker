import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import HabitDetail from './pages/HabitDetail';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.auth.status);

  useEffect(() => {
    if (localStorage.getItem('hf_token')) dispatch(loadUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={status === 'authenticated' ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={status === 'authenticated' ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
