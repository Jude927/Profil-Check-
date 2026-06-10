import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login                from './pages/Login'
import ResetPassword        from './pages/ResetPassword'
import Dashboard            from './pages/Dashboard'
import DashboardDG          from './pages/DashboardDG'
import TestPortal           from './pages/TestPortal'
import ExamPortal           from './pages/ExamPortal'
import EmployeDetail        from './pages/EmployeDetail'
import Rapport              from './pages/Rapport'
import Employes             from './pages/Employes'
import Alertes              from './pages/Alertes'
import Directives           from './pages/Directives'
import Console              from './pages/Console'
import GestionUtilisateurs  from './pages/GestionUtilisateurs'
import VueDepartement       from './pages/VueDepartement'
import FichesPostes         from './pages/FichesPostes'
import ProfilUtilisateur    from './pages/ProfilUtilisateur'
import NotFound             from './pages/NotFound'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Publiques ── */}
          <Route path="/"               element={<Navigate to="/login" replace />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Portail examen (employé, lien par email) ── */}
          <Route path="/exam/:token"    element={<ExamPortal />} />
          <Route path="/exam"           element={<ExamPortal />} />

          {/* ── RH ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['RH_MANAGER']}>
              <Dashboard />
            </ProtectedRoute>
          }/>
          <Route path="/employes" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <Employes />
            </ProtectedRoute>
          }/>
          <Route path="/employe" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <EmployeDetail />
            </ProtectedRoute>
          }/>
          <Route path="/employe/:id" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <EmployeDetail />
            </ProtectedRoute>
          }/>
          <Route path="/alertes" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <Alertes />
            </ProtectedRoute>
          }/>
          <Route path="/test" element={
            <ProtectedRoute roles={['RH_MANAGER']}>
              <TestPortal />
            </ProtectedRoute>
          }/>
          <Route path="/rapport" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <Rapport />
            </ProtectedRoute>
          }/>
          <Route path="/rapport/:reportId" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <Rapport />
            </ProtectedRoute>
          }/>

          {/* ── DG ── */}
          <Route path="/dg" element={
            <ProtectedRoute roles={['DG']}>
              <DashboardDG />
            </ProtectedRoute>
          }/>
          <Route path="/directives" element={
            <ProtectedRoute roles={['DG']}>
              <Directives />
            </ProtectedRoute>
          }/>

          {/* ── Partagées ── */}
          <Route path="/departement" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <VueDepartement />
            </ProtectedRoute>
          }/>
          <Route path="/fiches-postes" element={
            <ProtectedRoute roles={['RH_MANAGER', 'DG']}>
              <FichesPostes />
            </ProtectedRoute>
          }/>
          <Route path="/profil" element={
            <ProtectedRoute>
              <ProfilUtilisateur />
            </ProtectedRoute>
          }/>

          {/* ── Admin / Technique ── */}
          <Route path="/console" element={
            <ProtectedRoute roles={['ADMIN', 'RH_MANAGER']}>
              <Console />
            </ProtectedRoute>
          }/>
          <Route path="/utilisateurs" element={
            <ProtectedRoute roles={['ADMIN']}>
              <GestionUtilisateurs />
            </ProtectedRoute>
          }/>

          {/* ── Erreurs ── */}
          <Route path="/403"  element={<NotFound code="403" />} />
          <Route path="*"     element={<NotFound code="404" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
