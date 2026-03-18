import DepartmentComparisonChart from "../charts/DepartmentComparisonChart";

// Mock components for now
function RadarChart({ data }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p>Radar Chart: Department Performance Profile</p>
      <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
    </div>
  );
}

function StudentDistributionPie({ data }) {
  // Group by department
  const deptCount = data.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(deptCount).map(([dept, count]) => ({
    name: dept,
    value: count
  }));

  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <div className="text-center">
        <h4 className="font-semibold">Student Distribution</h4>
        {pieData.map(item => (
          <p key={item.name} className="text-sm">
            {item.name}: {item.value} students
          </p>
        ))}
      </div>
    </div>
  );
}

export default function DepartmentAnalytics({ data }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Department Analytics</h2>
      <p className="text-gray-600">Compare departments performance</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Stacked Bar - Dept attendance comparison */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Department Attendance Comparison</h3>
          <DepartmentComparisonChart data={data} />
        </div>

        {/* Radar Chart - Dept performance profile */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Department Performance Profile</h3>
          <RadarChart data={data} />
        </div>

        {/* Pie Chart - Student distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Student Distribution by Department</h3>
          <StudentDistributionPie data={data} />
        </div>
      </div>
    </div>
  );
}