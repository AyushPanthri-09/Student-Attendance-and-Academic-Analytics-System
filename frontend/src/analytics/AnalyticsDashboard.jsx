import { useEffect, useState } from "react";

/* COMPONENTS */
import KPICards from "./components/KPICards";
import RiskTable from "./components/RiskTable";
import AnalyticsFilters from "./components/AnalyticsFilters";
import ModuleSelector from "./components/ModuleSelector";

/* MODULES */
import AttendanceAnalysis from "./modules/AttendanceAnalysis";
import StudentPerformanceRisk from "./modules/StudentPerformanceRisk";
import DepartmentAnalytics from "./modules/DepartmentAnalytics";
import CourseSubjectAnalytics from "./modules/CourseSubjectAnalytics";
import TeacherAnalytics from "./modules/TeacherAnalytics";

/* CHARTS */
import AttendanceTrendChart from "./charts/AttendanceTrendChart";
import SubjectAttendanceChart from "./charts/SubjectAttendanceChart";
import DepartmentComparisonChart from "./charts/DepartmentComparisonChart";
import AttendanceHeatMap from "./charts/AttendanceHeatMap";
import SubjectDifficultyChart from "./charts/SubjectDifficultyChart";
import RiskDistributionChart from "./charts/RiskDistributionChart";

/* AI PANELS */
import DropoutPredictionPanel from "./panels/DropoutPredictionPanel";
import AttendanceForecastPanel from "./panels/AttendanceForecastPanel";

/* SERVICES */
import {
  getStudents,
  getSubjects,
  getAttendancePercentage,
  getBulkAttendanceData
} from "./services/analyticsAPI";

/* UTILS */
import { exportCSV } from "./utils/exportCSV";
import { exportPDF } from "./utils/exportPDF";

/* AI */
import { predictDropout } from "./ai/dropoutAI";

export default function AnalyticsDashboard() {

  const [studentsData, setStudentsData] = useState([]);
  const [riskList, setRiskList] = useState([]);

  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [eligible, setEligible] = useState(0);
  const [risk, setRisk] = useState(0);

  const [riskChartData, setRiskChartData] = useState([]);

  const [selectedModule, setSelectedModule] = useState('attendance');

  const [filters, setFilters] = useState({
    department: "",
    course: "",
    semester: "",
    subject: ""
  });

  useEffect(() => {
    loadAnalytics();
  }, [filters]); // Reload when filters change

  /* =========================
     LOAD ANALYTICS DATA
  ========================== */

  const loadAnalytics = async () => {

    try {

      // Use bulk endpoint instead of N+1 queries
      const bulkData = (await getBulkAttendanceData({
        departmentId: filters.department || undefined,
        courseId: filters.course || undefined,
        semester: filters.semester || undefined
      })).data;

      // Group by student to calculate averages
      const studentMap = new Map();

      bulkData.forEach(item => {
        if (!studentMap.has(item.studentId)) {
          studentMap.set(item.studentId, {
            id: item.studentId,
            name: item.studentName,
            rollNo: item.studentRollNo,
            department: item.department,
            course: item.course,
            semester: item.semester,
            attendances: [],
            totalPercentage: 0,
            subjectCount: 0
          });
        }

        const student = studentMap.get(item.studentId);
        student.attendances.push({
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          percentage: item.attendancePercentage
        });
        student.totalPercentage += item.attendancePercentage;
        student.subjectCount++;
      });

      // Calculate student averages
      const dataset = Array.from(studentMap.values()).map(student => ({
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        department: student.department,
        course: student.course,
        semester: student.semester,
        attendance: student.subjectCount > 0 ? student.totalPercentage / student.subjectCount : 0,
        attendances: student.attendances
      }));

      // Build risk table (students below 75% in any subject)
      const riskTable = [];
      bulkData.forEach(item => {
        if (item.attendancePercentage < 75) {
          riskTable.push({
            name: item.studentName,
            rollNo: item.studentRollNo,
            subject: item.subjectName,
            percentage: item.attendancePercentage,
            department: item.department
          });
        }
      });

      // Calculate KPIs
      const attendanceSum = dataset.reduce((sum, s) => sum + s.attendance, 0);
      const eligibleCount = dataset.filter(s => s.attendance >= 75).length;

      /* AI DROPOUT RISK - Using actual data now */
      const dropoutPredictions = dataset.map(s => ({
        name: s.name,
        risk: predictDropout({
          attendance: s.attendance,
          assignments: 70, // Still hardcoded, could be enhanced
          examScore: 65
        })
      }));

      /* RISK DISTRIBUTION */
      const highRisk = dataset.filter(s => s.attendance < 50).length;
      const mediumRisk = dataset.filter(s => s.attendance >= 50 && s.attendance < 75).length;
      const safe = dataset.filter(s => s.attendance >= 75).length;

      const riskData = [
        { name: "Safe", value: safe },
        { name: "Medium Risk", value: mediumRisk },
        { name: "High Risk", value: highRisk }
      ];

      setStudentsData(dataset);
      setRiskList(riskTable);

      setTotalStudents(dataset.length);
      setAvgAttendance((attendanceSum / dataset.length).toFixed(2));
      setEligible(eligibleCount);
      setRisk(dataset.length - eligibleCount);
      setRiskChartData(riskData);

    } catch (error) {
      console.error("Analytics Load Error:", error);
    }
  };

  /* =========================
     UI
  ========================== */

  return (

    <div
      id="analytics-dashboard"
      className="p-6 space-y-8 bg-gray-50 min-h-screen"
    >

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          University Analytics Dashboard
        </h1>

        <div className="flex gap-4">

          <button
            onClick={() => exportCSV(studentsData)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>

          <button
            onClick={() => exportPDF("analytics-dashboard")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>

        </div>

      </div>

      {/* FILTERS */}

      <AnalyticsFilters
        filters={filters}
        setFilters={setFilters}
      />

      {/* MODULE SELECTOR */}

      <ModuleSelector
        selectedModule={selectedModule}
        onModuleChange={setSelectedModule}
      />

      {/* KPI CARDS */}

      <KPICards
        totalStudents={totalStudents}
        avgAttendance={avgAttendance}
        eligible={eligible}
        risk={risk}
      />

      {/* =========================
          DYNAMIC MODULE CONTENT
         ========================= */}

      {selectedModule === 'attendance' && (
        <AttendanceAnalysis
          data={studentsData}
          riskData={riskChartData}
          riskList={riskList}
        />
      )}

      {selectedModule === 'performance' && (
        <StudentPerformanceRisk data={studentsData} />
      )}

      {selectedModule === 'department' && (
        <DepartmentAnalytics data={studentsData} />
      )}

      {selectedModule === 'subject' && (
        <CourseSubjectAnalytics data={studentsData} />
      )}

      {selectedModule === 'teacher' && (
        <TeacherAnalytics data={studentsData} />
      )}

    </div>

  );

}