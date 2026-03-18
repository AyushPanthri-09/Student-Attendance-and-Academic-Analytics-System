// Mock components for teacher analytics
function TeacherAttendanceBarChart({ data }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Bar Chart: Teacher Attendance Record</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

function TeacherActivityHeatmap({ data }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Heatmap: Classes Taken vs Missed</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

function TeacherActivityTrend({ data }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Trend Line: Teacher Activity Over Time</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

export default function TeacherAnalytics({ data }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Teacher Analytics</h2>
      <p className="text-gray-600">Evaluate teaching engagement</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Bar Chart - Teacher attendance record */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Teacher Attendance Record</h3>
          <TeacherAttendanceBarChart data={data} />
        </div>

        {/* Heatmap - Classes taken vs missed */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Classes Taken vs Missed</h3>
          <TeacherActivityHeatmap data={data} />
        </div>

        {/* Trend Line - Teacher activity over time */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Teacher Activity Over Time</h3>
          <TeacherActivityTrend data={data} />
        </div>
      </div>
    </div>
  );
}