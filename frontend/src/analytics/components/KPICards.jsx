export default function KPICards({
  totalStudents,
  avgAttendance,
  eligible,
  risk
}) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      <Card title="Total Students" value={totalStudents} color="blue" icon="👥" />
      <Card title="Avg Attendance" value={`${avgAttendance}%`} color="green" icon="📊" />
      <Card title="Eligible Students" value={eligible} color="emerald" icon="✅" />
      <Card title="At Risk" value={risk} color="red" icon="⚠️" />

    </div>

  );

}

function Card({ title, value, color, icon }) {

  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    red: 'bg-red-500 text-white'
  };

  return (

    <div className={`${colorClasses[color]} p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200`}>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="text-4xl font-bold">{value}</p>

    </div>

  );
}