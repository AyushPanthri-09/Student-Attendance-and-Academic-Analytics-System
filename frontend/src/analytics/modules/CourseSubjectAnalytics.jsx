// Mock components for subject analytics
function SubjectAttendanceBarChart({ data }) {
  // This would show attendance per subject across all students
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Bar Chart: Subject Attendance</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

function SubjectTrendLineChart({ data }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Line Chart: Subject Trend</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

function AttendanceBoxPlot({ data }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Box Plot: Attendance Spread</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

export default function CourseSubjectAnalytics({ data }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Course / Subject Analytics</h2>
      <p className="text-gray-600">Identify difficult subjects</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Bar Chart - Subject attendance */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Subject Attendance</h3>
          <SubjectAttendanceBarChart data={data} />
        </div>

        {/* Line Chart - Subject trend */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Subject Trend</h3>
          <SubjectTrendLineChart data={data} />
        </div>

        {/* Box Plot - Attendance spread */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Attendance Spread</h3>
          <AttendanceBoxPlot data={data} />
        </div>
      </div>
    </div>
  );
}