import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function SubjectDifficultyChart({ data }) {

  const subjects = [...new Set(data.map(s => s.subject))];

  const chartData = subjects.map(sub => {

    const subjectData = data.filter(s => s.subject === sub);

    const avg =
      subjectData.reduce((a,b)=>a + b.attendance,0) /
      subjectData.length;

    return {
      subject: sub,
      attendance: avg
    };

  });

  return (

    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h3 className="text-lg font-semibold mb-4">
        Subject Difficulty Index
      </h3>

      <ResponsiveContainer width="100%" height={350}>

        <RadarChart data={chartData}>

          <PolarGrid />

          <PolarAngleAxis dataKey="subject" />

          <PolarRadiusAxis />

          <Radar
            name="Attendance"
            dataKey="attendance"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.6}
          />

          <Tooltip />

        </RadarChart>

      </ResponsiveContainer>

    </div>

  );

}