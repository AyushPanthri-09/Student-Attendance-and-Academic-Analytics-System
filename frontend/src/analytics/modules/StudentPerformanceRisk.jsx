import { useState } from "react";

// Mock components - will need to create proper charts
function ScatterPlot({ data }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Scatter Plot: Attendance vs Performance</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

function GaugeChart({ value }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">{value}%</div>
        <p className="text-sm text-gray-600">Overall Attendance Health</p>
      </div>
    </div>
  );
}

function LeaderboardTable({ data }) {
  const topStudents = [...data]
    .sort((a, b) => b.attendance - a.attendance)
    .slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Roll No</th>
            <th className="px-4 py-2 text-left">Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {topStudents.map((student, index) => (
            <tr key={student.id} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{student.name}</td>
              <td className="px-4 py-2">{student.rollNo}</td>
              <td className="px-4 py-2">{student.attendance.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StudentPerformanceRisk({ data }) {
  const [selectedThreshold, setSelectedThreshold] = useState(75);

  const atRiskStudents = data.filter(s => s.attendance < selectedThreshold);
  const avgAttendance = data.reduce((sum, s) => sum + s.attendance, 0) / data.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Student Performance Risk</h2>
      <p className="text-gray-600">Detect students who may fail eligibility</p>

      <div className="grid grid-cols-2 gap-6">
        {/* Scatter Plot - Attendance vs performance */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Attendance vs Performance</h3>
          <ScatterPlot data={data} />
        </div>

        {/* Bar Chart - Students close to shortage */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Students Close to Shortage</h3>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Risk Threshold: {selectedThreshold}%</label>
            <input
              type="range"
              min="50"
              max="85"
              value={selectedThreshold}
              onChange={(e) => setSelectedThreshold(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              {atRiskStudents.length} students below threshold
            </p>
          </div>
        </div>

        {/* Gauge Chart - Overall attendance health */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overall Attendance Health</h3>
          <GaugeChart value={avgAttendance.toFixed(1)} />
        </div>

        {/* Leaderboard Table - Best attendance students */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Best Attendance Students</h3>
          <LeaderboardTable data={data} />
        </div>
      </div>
    </div>
  );
}