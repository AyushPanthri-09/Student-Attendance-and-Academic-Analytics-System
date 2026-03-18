import axios from "axios";

const API = "http://localhost:8080/api";

export const getStudents = () =>
  axios.get(`${API}/students`);

export const getSubjects = () =>
  axios.get(`${API}/subjects`);

export const getAttendancePercentage = (studentId, subjectId) =>
  axios.get(`${API}/attendance/percentage/${studentId}/${subjectId}`);

// NEW ANALYTICS ENDPOINTS
export const getOverviewAnalytics = () =>
  axios.get(`${API}/analytics/overview`);

export const getDepartmentAnalytics = () =>
  axios.get(`${API}/analytics/departments`);

export const getSubjectAnalytics = () =>
  axios.get(`${API}/analytics/subjects`);

export const getRiskAnalysis = () =>
  axios.get(`${API}/analytics/risk-analysis`);

export const getTrendAnalysis = (weeks = 8) =>
  axios.get(`${API}/analytics/trends?weeks=${weeks}`);

export const getAttendancePrediction = () =>
  axios.get(`${API}/analytics/predictions`);

// LEGACY ENDPOINTS (for backward compatibility)
export const getBulkAttendanceData = (filters = {}) =>
  axios.get(`${API}/attendance/bulk-data`, { params: filters });

export const getTeacherPerformance = (filters = {}) =>
  axios.get(`${API}/analytics/teacher-performance`, { params: filters });

export const getDepartmentAnalyticsLegacy = () =>
  axios.get(`${API}/analytics/department-analytics`);

export const getSubjectDifficulty = () =>
  axios.get(`${API}/analytics/subject-difficulty`);