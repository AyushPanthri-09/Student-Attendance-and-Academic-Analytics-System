import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import OverviewDashboard from "./pages/OverviewDashboard";
import DepartmentAnalytics from "./pages/DepartmentAnalytics";
import Department from "./pages/Department";
import SubjectAnalytics from "./pages/SubjectAnalytics";
import EligibilityReport from "./pages/EligibilityReport";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Attendance from "./pages/Attendance";
import ComprehensiveAnalytics from "./pages/ComprehensiveAnalytics";
import { Toaster } from "react-hot-toast";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<OverviewDashboard />} />
          <Route path="comprehensive" element={<ComprehensiveAnalytics />} />
          <Route path="departments" element={<DepartmentAnalytics />} />
          <Route path="department" element={<Navigate to="/departments" replace />} />
          <Route path="department-management" element={<Department />} />
          <Route path="subjects" element={<SubjectAnalytics />} />
          <Route path="risk-analysis" element={<Navigate to="/comprehensive" replace />} />
          <Route path="trends" element={<Navigate to="/comprehensive" replace />} />
          <Route path="ai-insights" element={<Navigate to="/comprehensive" replace />} />
          <Route path="eligibility" element={<EligibilityReport />} />
          <Route path="students" element={<Students />} />
          <Route path="subjects-management" element={<Subjects />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster />
      <AnimatedRoutes />
    </Router>
  );
}