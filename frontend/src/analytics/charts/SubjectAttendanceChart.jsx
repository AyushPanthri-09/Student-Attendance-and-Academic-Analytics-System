import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function SubjectAttendanceChart({ data }) {

  return (

    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h3 className="text-lg font-semibold mb-4">
        Subject Attendance
      </h3>

      <ResponsiveContainer width="100%" height={300}>

        <BarChart data={data}>

          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="attendance" fill="#16a34a" />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}