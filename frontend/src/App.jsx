import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* RH */}
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/employes"        element={<Employes />} />
        <Route path="/employe"         element={<EmployeDetail />} />
        <Route path="/alertes"         element={<Alertes />} />
        <Route path="/test"            element={<TestPortal />} />
        <Route path="/rapport"         element={<Rapport />} />

        {/* DG */}
        <Route path="/dg"              element={<DashboardDG />} />
        <Route path="/directives"      element={<Directives />} />

        {/* Partagé RH + DG */}
        <Route path="/departement"     element={<VueDepartement />} />
        <Route path="/fiches-postes"   element={<FichesPostes />} />
        <Route path="/profil"          element={<ProfilUtilisateur />} />

        {/* Admin / Technique */}
        <Route path="/console"         element={<Console />} />
        <Route path="/utilisateurs"    element={<GestionUtilisateurs />} />

        {/* Portail public employé (lien envoyé par email avec token) */}
        <Route path="/exam/:token"     element={<ExamPortal />} />
        <Route path="/exam"            element={<ExamPortal />} />

        {/* Erreurs */}
        <Route path="/403"             element={<NotFound code="403" />} />
        <Route path="*"                element={<NotFound code="404" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
