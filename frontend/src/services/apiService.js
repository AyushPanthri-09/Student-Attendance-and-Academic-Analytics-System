import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiService = {
  // Students
  getStudents: async () => {
    const response = await axios.get(`${API_BASE_URL}/students`);
    return response.data;
  },

  getStudent: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/students/${id}`);
    return response.data;
  },

  createStudent: async (student) => {
    const response = await axios.post(`${API_BASE_URL}/students`, student);
    return response.data;
  },

  updateStudent: async (id, student) => {
    const response = await axios.put(`${API_BASE_URL}/students/${id}`, student);
    return response.data;
  },

  deleteStudent: async (id) => {
    await axios.delete(`${API_BASE_URL}/students/${id}`);
  },

  getStudentsByDepartment: async (departmentId) => {
    const response = await axios.get(`${API_BASE_URL}/students/department/${departmentId}`);
    return response.data;
  },

  // Subjects
  getSubjects: async () => {
    const response = await axios.get(`${API_BASE_URL}/subjects`);
    return response.data;
  },

  getSubject: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/subjects/${id}`);
    return response.data;
  },

  createSubject: async (subject) => {
    const response = await axios.post(`${API_BASE_URL}/subjects`, subject);
    return response.data;
  },

  updateSubject: async (id, subject) => {
    const response = await axios.put(`${API_BASE_URL}/subjects/${id}`, subject);
    return response.data;
  },

  deleteSubject: async (id) => {
    await axios.delete(`${API_BASE_URL}/subjects/${id}`);
  },

  getSubjectsByDepartment: async (departmentId) => {
    const response = await axios.get(`${API_BASE_URL}/subjects/department/${departmentId}`);
    return response.data;
  },

  // Attendance
  markAttendance: async (attendanceData) => {
    const response = await axios.post(`${API_BASE_URL}/attendance`, attendanceData);
    return response.data;
  },

  getStudentAttendance: async (studentId) => {
    const response = await axios.get(`${API_BASE_URL}/attendance/student/${studentId}`);
    return response.data;
  },

  getSubjectAttendance: async (subjectId) => {
    const response = await axios.get(`${API_BASE_URL}/attendance/subject/${subjectId}`);
    return response.data;
  },

  getAttendancePercentage: async (studentId, subjectId) => {
    const response = await axios.get(`${API_BASE_URL}/attendance/percentage/${studentId}/${subjectId}`);
    return response.data;
  },

  getStudentAttendancePercentage: async (studentId) => {
    const response = await axios.get(`${API_BASE_URL}/attendance/student/${studentId}/percentage`);
    return response.data;
  },

  getSubjectAttendancePercentage: async (subjectId) => {
    const response = await axios.get(`${API_BASE_URL}/attendance/subject/${subjectId}/percentage`);
    return response.data;
  },

  updateAttendance: async (attendanceId, attendanceData) => {
    const response = await axios.put(`${API_BASE_URL}/attendance/${attendanceId}`, attendanceData);
    return response.data;
  },

  deleteAttendance: async (attendanceId) => {
    await axios.delete(`${API_BASE_URL}/attendance/${attendanceId}`);
  }
};

export default apiService;
