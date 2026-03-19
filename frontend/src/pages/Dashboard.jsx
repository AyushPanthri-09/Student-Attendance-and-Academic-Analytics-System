import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { Users, GraduationCap, BookOpen } from "lucide-react";

export default function Dashboard() {

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/api/dashboard/stats")
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const chartData = [
    { name: "Students", value: stats.students },
    { name: "Teachers", value: stats.teachers },
    { name: "Courses", value: stats.courses }
  ];

  const Card = ({ title, value, icon, color }) => (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex justify-between items-center"
    >
      <div>
        <h2 className="text-gray-500 text-sm mb-1">{title}</h2>
        <p className="text-3xl font-bold">{loading ? "--" : value}</p>
      </div>

      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen">

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Academic ERP Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <Card
          title="Total Students"
          value={stats.students}
          icon={<Users size={22} />}
          color="bg-blue-100 text-blue-600"
        />

        <Card
          title="Total Teachers"
          value={stats.teachers}
          icon={<GraduationCap size={22} />}
          color="bg-green-100 text-green-600"
        />

        <Card
          title="Total Courses"
          value={stats.courses}
          icon={<BookOpen size={22} />}
          color="bg-purple-100 text-purple-600"
        />

      </div>

      {/* CHART */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >

        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          System Overview
        </h2>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart data={chartData}>

            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="value"
              fill="#6366f1"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </motion.div>

    </div>
  );
}