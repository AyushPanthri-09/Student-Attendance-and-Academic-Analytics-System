import AttendanceTrendChart from "../charts/AttendanceTrendChart";
import SubjectAttendanceChart from "../charts/SubjectAttendanceChart";
import RiskDistributionChart from "../charts/RiskDistributionChart";
import AttendanceHeatMap from "../charts/AttendanceHeatMap";
import RiskTable from "../components/RiskTable";
import InsightsPanel from "../components/InsightsPanel";

export default function AttendanceAnalysis({ data, riskData, riskList }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attendance Analysis</h2>
      <p className="text-gray-600">Detect attendance patterns and trends</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Charts */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Attendance Trend Over Time</h3>
          <AttendanceTrendChart data={data} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Attendance by Department</h3>
          <SubjectAttendanceChart data={data} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Eligible vs Not Eligible</h3>
          <RiskDistributionChart data={riskData} />
        </div>

        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Attendance Heatmap</h3>
          <AttendanceHeatMap data={data} />
        </div>

        {/* Insights Panel */}
        <div className="bg-white p-4 rounded-lg shadow">
          <InsightsPanel data={data} riskList={riskList} moduleType="attendance" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Students Below 75% Attendance</h3>
        <RiskTable data={riskList} />
      </div>
    </div>
  );
}