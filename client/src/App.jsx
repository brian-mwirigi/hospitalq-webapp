import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Reception from './pages/Reception'
import Doctor from './pages/Doctor'
import QueueBoard from './pages/QueueBoard'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/queue/:deptSlug" element={<QueueBoard />} />
        <Route
          path="/receptionist"
          element={
            <PrivateRoute roles={['receptionist', 'admin']}>
              <Reception />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <PrivateRoute roles={['doctor', 'admin']}>
              <Doctor />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['admin']}>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
