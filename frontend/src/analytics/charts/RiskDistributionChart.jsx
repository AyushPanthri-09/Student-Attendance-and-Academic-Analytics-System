import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function RiskDistributionChart({ data }) {

  return (

    <div className="bg-white p-8 rounded-xl shadow-lg">

      <h3 className="text-xl font-bold mb-6 text-gray-800">
        📊 Student Risk Distribution
      </h3>

      <ResponsiveContainer width="100%" height={400}>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >

            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}

          </Pie>

          <Tooltip 
            formatter={(value, name) => [`${value} students`, name]}
            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />

          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />

        </PieChart>

      </ResponsiveContainer>

    </div>

  );

}