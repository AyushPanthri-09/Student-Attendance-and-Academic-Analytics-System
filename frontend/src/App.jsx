import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import OverviewDashboard from "./pages/OverviewDashboard";
import DepartmentAnalytics from "./pages/DepartmentAnalytics";
import SubjectAnalytics from "./pages/SubjectAnalytics";
import RiskAnalytics from "./pages/RiskAnalytics";
import TrendsPredictions from "./pages/TrendsPredictions";
import AIInsightsDashboard from "./pages/AIInsightsDashboard";
import EligibilityReport from "./pages/EligibilityReport";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Attendance from "./pages/Attendance";
import { Toaster } from "react-hot-toast";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<OverviewDashboard />} />
          <Route path="departments" element={<DepartmentAnalytics />} />
          <Route path="subjects" element={<SubjectAnalytics />} />
          <Route path="risk-analysis" element={<RiskAnalytics />} />
          <Route path="trends" element={<TrendsPredictions />} />
          <Route path="ai-insights" element={<AIInsightsDashboard />} />
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