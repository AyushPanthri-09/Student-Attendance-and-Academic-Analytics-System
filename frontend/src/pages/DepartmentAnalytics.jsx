import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import analyticsService from '../services/analyticsService';
import { onAnalyticsDataChanged } from '../utils/analyticsSync';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import { Building2, Users, BookOpen, TrendingDown, TrendingUp, Minus, Award, Target, AlertCircle } from 'lucide-react';
import ChartNotation from '../components/ChartNotation';
import useChartScale from '../hooks/useChartScale';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-xl border-none shadow-2xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].fill }}></div>
          <p className="text-sm font-black text-gray-900">
            Attendance: <span className="text-blue-600">{payload[0].value.toFixed(2)}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function DepartmentAnalytics() {
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartScale = useChartScale();
  const clampPercentage = (value) => Math.max(0, Math.min(100, Number(value) || 0));

  useEffect(() => {
    fetchDepartmentData();
    const unsubscribe = onAnalyticsDataChanged(() => {
      fetchDepartmentData();
    });
    return unsubscribe;
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDepartmentAnalytics();
      setDepartmentAnalytics(data);
    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    if (!payload || !payload.value) return null;
    const maxChars = 15;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={chartScale.axisDy + 2}
          textAnchor="middle"
          fill="#64748b"
          fontSize={Math.max(chartScale.axisFontSize, 11)}
          fontWeight={600}
        >
          {payload.value.length > maxChars ? `${payload.value.slice(0, maxChars)}...` : payload.value}
        </text>
      </g>
    );
  };

  const normalizedDepartmentAnalytics = useMemo(() => {
    return (departmentAnalytics || []).map((dept) => ({
      ...dept,
      attendancePercentage: clampPercentage(dept?.attendancePercentage),
    }));
  }, [departmentAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
        <div className="h-80 bg-white rounded-[2rem] animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-[2rem] animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8 pb-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Departmental Intelligence</h1>
        <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Comparative Cross-Sectional Analysis</p>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Elite Performers', count: normalizedDepartmentAnalytics.filter(d => (d.attendancePercentage ?? 0) >= 75).length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Award, sub: 'Above 75% Threshold' },
          { label: 'Attention Required', count: normalizedDepartmentAnalytics.filter(d => (d.attendancePercentage ?? 0) >= 60 && (d.attendancePercentage ?? 0) < 75).length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Target, sub: 'Maintenance Zone' },
          { label: 'Critical Intervention', count: normalizedDepartmentAnalytics.filter(d => (d.attendancePercentage ?? 0) < 60).length, color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle, sub: 'Urgent Action Needed' },
        ].map((chip, i) => (
          <motion.div key={i} variants={itemVariants} className="glass p-6 rounded-[2rem] flex items-center gap-4">
            <div className={`${chip.bg} p-4 rounded-2xl`}>
              <chip.icon className={chip.color} size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{chip.label}</p>
              <p className={`text-2xl font-black ${chip.color}`}>{chip.count}</p>
              <p className="text-[10px] text-gray-400 font-bold italic">{chip.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Department Performance Chart */}
      <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Structural Performance Index</h3>
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attendance %</span>
          </div>
        </div>
        <div className="mb-4">
          <ChartNotation
            title="Chart Notation"
            items={[
              { label: 'High Performance (>= 75%)', color: '#3b82f6' },
              { label: 'Attention (60-74%)', color: '#f59e0b' },
              { label: 'Critical (< 60%)', color: '#ef4444' },
            ]}
          />
        </div>
        <p className="text-sm text-slate-500 font-semibold mb-4">X-axis: departments. Y-axis: attendance percentage. Dashed line marks the 75% target.</p>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={normalizedDepartmentAnalytics} margin={{ top: 20, right: 10, left: 10, bottom: chartScale.bottomMargin }}>
            <defs>
              <linearGradient id="primaryBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="departmentName" 
              axisLine={false}
              tickLine={false}
              interval={0}
              height={chartScale.xTickHeight}
              tick={<CustomXAxisTick />}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: chartScale.axisFontSize, fill: '#64748b', fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <ReferenceLine y={75} stroke="#ea580c" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Target 75%', position: 'insideTopRight', fill: '#c2410c', fontSize: 11, fontWeight: 800 }} />
            <Bar 
              dataKey="attendancePercentage" 
              fill="url(#primaryBar)"
              radius={[12, 12, 12, 12]}
              barSize={45}
              animationDuration={2000}
            >
              {normalizedDepartmentAnalytics.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.attendancePercentage < 60 ? '#ef4444' : entry.attendancePercentage < 75 ? '#f59e0b' : 'url(#primaryBar)'} 
                />
              ))}
              <LabelList dataKey="attendancePercentage" position="top" formatter={(value) => `${clampPercentage(value).toFixed(1)}%`} style={{ fill: '#334155', fontWeight: 700, fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {normalizedDepartmentAnalytics.map((department, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                department.attendancePercentage >= 75 ? 'bg-emerald-100 text-emerald-700' :
                department.attendancePercentage >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {department.attendancePercentage >= 75 ? 'Sustainable' : 
                 department.attendancePercentage >= 60 ? 'Attention' : 'Risk'}
              </div>
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-6 truncate relative z-10">{department.departmentName}</h3>

            <div className="space-y-6 relative z-10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Efficiency</p>
                  <p className={`text-4xl font-black ${
                    department.attendancePercentage >= 75 ? 'text-emerald-600' :
                    department.attendancePercentage >= 60 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {(department.attendancePercentage ?? 0).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {department.attendancePercentage >= 75 ? 
                    <TrendingUp className="text-emerald-500" size={20} /> : 
                    <TrendingDown className="text-rose-500" size={20} />
                  }
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(department.attendancePercentage ?? 0, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    department.attendancePercentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    department.attendancePercentage >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                    'bg-gradient-to-r from-rose-500 to-red-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Users size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Students</p>
                    <p className="text-sm font-black text-gray-900">{department.studentCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center">
                    <BookOpen size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Modules</p>
                    <p className="text-sm font-black text-gray-900">{department.subjectCount}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                "{department.insight || 'Aggregated performance metrics within normal parameters for current semester.'}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
