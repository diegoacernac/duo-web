import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { TabsLayout } from '@/components/TabsLayout'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import Plans from '@/pages/Plans'
import NewPlan from '@/pages/NewPlan'
import PlanDetail from '@/pages/PlanDetail'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="fixed inset-0 flex justify-center bg-[#07050e]">
          <div className="w-full max-w-[430px] bg-[#0e0b14] relative overflow-hidden flex flex-col">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<TabsLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/plans/new" element={<NewPlan />} />
              <Route path="/plans/:id" element={<PlanDetail />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
