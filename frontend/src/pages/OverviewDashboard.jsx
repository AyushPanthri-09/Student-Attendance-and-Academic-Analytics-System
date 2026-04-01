import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import analyticsService from '../services/analyticsService';
import { onAnalyticsDataChanged } from '../utils/analyticsSync';
import { Users, BookOpen, AlertTriangle, TrendingUp, Activity, BarChart3, PieChart as PieIcon, ArrowUpRight, Brain, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, LabelList, ReferenceLine } from 'recharts';
import ChartNotation from '../components/ChartNotation';
import useChartScale from '../hooks/useChartScale';

const CustomTooltip = ({ active, payload, label, totalRiskCount = 0 }) => {
  if (active && payload && payload.length) {
    const point = payload[0];
    const rawValue = Number(point?.value) || 0;
    const payloadName = String(point?.name || '').toLowerCase();
    const isRiskSlice = payloadName === 'safe' || payloadName === 'warning' || payloadName === 'critical';
    const displayValue = isRiskSlice
      ? `${totalRiskCount > 0 ? ((rawValue / totalRiskCount) * 100).toFixed(1) : '0.0'}% (${rawValue})`
      : `${rawValue.toFixed(2)}%`;
    return (
      <div className="glass p-4 rounded-xl border-none shadow-2xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm font-semibold text-gray-900">
            {point?.name}: <span className="text-blue-600">{displayValue}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function OverviewDashboard() {
  const [overviewMetrics, setOverviewMetrics] = useState(null);
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [riskAnalytics, setRiskAnalytics] = useState({ safe: 0, warning: 0, critical: 0, content: [] });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartScale = useChartScale();
  const clampPercentage = (value) => Math.max(0, Math.min(100, Number(value) || 0));

  useEffect(() => {
    fetchOverviewData();
    const unsubscribe = onAnalyticsDataChanged(() => {
      fetchOverviewData();
    });
    return unsubscribe;
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [overview, departments, riskData, insightsData] = await Promise.all([
        analyticsService.getOverviewMetrics(),
        analyticsService.getDepartmentAnalytics(),
        analyticsService.getAllRiskAnalysis(),
        analyticsService.getInsights()
      ]);

      setOverviewMetrics(overview);
      setDepartmentAnalytics(departments);
      setRiskAnalytics(riskData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCompactNumber = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(value);
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    if (!payload || !payload.value) return null;
    const maxChars = 14;
    const label = payload.value.length > maxChars ? `${payload.value.slice(0, maxChars)}...` : payload.value;
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
          {label}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>
          <div className="h-80 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const riskData = riskAnalytics?.content || [];
  const safeCount = riskData.filter(student => student && student.riskLevel === 'LOW').length;
  const warningCount = riskData.filter(student => student && student.riskLevel === 'MEDIUM').length;
  const criticalCount = riskData.filter(student => student && student.riskLevel === 'HIGH').length;
  
  const totalStudents = overviewMetrics?.totalStudents || 0;
  const atRiskCount = overviewMetrics?.studentsBelowThreshold || 0;
  const avgAttendance = clampPercentage(overviewMetrics?.averageAttendance || 0);

  const fullRiskDistribution = [
    { name: 'Safe', value: safeCount, color: '#0ea5e9', grad: 'url(#grad-safe)' },
    { name: 'Warning', value: warningCount, color: '#f59e0b', grad: 'url(#grad-warn)' },
    { name: 'Critical', value: criticalCount, color: '#ef4444', grad: 'url(#grad-crit)' }
  ];

  const totalRiskCount = fullRiskDistribution.reduce((sum, item) => sum + item.value, 0);
  const riskDistribution = totalRiskCount > 0
    ? fullRiskDistribution.filter((item) => item.value > 0)
    : [{ name: 'No Data', value: 1, color: '#cbd5e1', grad: '#cbd5e1' }];

  const topDepartments = departmentAnalytics
    .slice(0, 5)
    .map((dept) => ({
      ...dept,
      attendancePercentage: clampPercentage(dept?.attendancePercentage),
      benchmark: 75,
    }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Executive Summary</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Operational Intelligence Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-8 w-8 rounded-full border-2 border-white bg-gray-200 shadow-sm flex items-center justify-center text-[10px] font-bold`}>
                {i === 1 ? 'JD' : i === 2 ? 'AS' : '+12'}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 font-bold">LIVE ANALYTICS</p>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
          { label: 'Total Enrollment', value: formatCompactNumber(totalStudents), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Verified Students', to: '/students' },
          { label: 'Avg Attendance', value: `${avgAttendance.toFixed(1)}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Global Average', to: '/comprehensive' },
          { label: 'At-Risk Cohort', value: formatCompactNumber(atRiskCount), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', sub: `${clampPercentage(totalStudents > 0 ? (atRiskCount / totalStudents) * 100 : 0).toFixed(1)}% Vulnerable`, to: '/comprehensive' },
          { label: 'System Health', value: 'Active', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Real-time Sync', to: '/attendance' },
        ].map((card, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass p-6 rounded-3xl hover-lift group cursor-pointer"
          >
            <Link to={card.to} className="block">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                  <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  <p className="text-[10px] text-gray-500 font-bold mt-2 flex items-center gap-1">
                    <ArrowUpRight size={12} className="text-green-500" /> {card.sub}
                  </p>
                </div>
                <div className={`${card.bg} p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-500`}>
                  <card.icon className={`${card.color}`} size={24} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Risk Distribution Pie Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Student Risk Breakdown</h3>
            <PieIcon className="text-gray-400" size={20} />
          </div>
          <p className="text-sm text-slate-500 font-semibold -mt-3 mb-5">This chart shows how many students are in safe, warning, and critical attendance ranges.</p>
          <div className="-mt-3 mb-5">
            <ChartNotation
              title="Risk Labels"
              items={[
                { label: 'Safe (>= 75%)', color: '#0ea5e9' },
                { label: 'Warning (60-74%)', color: '#f59e0b' },
                { label: 'Critical (< 60%)', color: '#ef4444' },
              ]}
            />
          </div>
          <div className="relative h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id="grad-safe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="grad-warn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="grad-crit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={74}
                outerRadius={108}
                paddingAngle={8}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                animationBegin={200}
                animationDuration={1500}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.grad} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip totalRiskCount={totalRiskCount} />} />
            </PieChart>
          </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-2 border border-slate-100 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Students In This Chart</p>
                <p className="text-2xl font-black text-slate-800 leading-none mt-1">{totalRiskCount}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {fullRiskDistribution.map((item, i) => (
              <Link key={i} to="/comprehensive" className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white/50 px-3 py-2 hover:bg-blue-50/40 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-700">{item.value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    {totalRiskCount > 0 ? `${((item.value / totalRiskCount) * 100).toFixed(1)}%` : '0.0%'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Department Performance Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3 glass p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Department Attendance Comparison</h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <p className="text-sm text-slate-500 font-semibold -mt-3 mb-4">Each bar is one department's average attendance percentage.</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDepartments} margin={{ top: 16, right: 10, left: 0, bottom: chartScale.bottomMargin }}>
                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="departmentName" 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={chartScale.xTickHeight}
                  tick={<CustomXAxisTick />}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: chartScale.axisFontSize, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <ReferenceLine
                  y={75}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{ value: 'Target 75%', position: 'insideTopRight', fill: '#b45309', fontSize: 11, fontWeight: 700 }}
                />
                <Bar 
                  dataKey="attendancePercentage" 
                  radius={[12, 12, 6, 6]}
                  barSize={34}
                  animationDuration={2000}
                >
                  {topDepartments.map((entry, index) => {
                    const value = entry.attendancePercentage || 0;
                    const fill = value >= 85 ? '#10b981' : value >= 75 ? '#3b82f6' : value >= 60 ? '#f59e0b' : '#ef4444';
                    return <Cell key={`dept-cell-${index}`} fill={fill} />;
                  })}
                  <LabelList
                    dataKey="attendancePercentage"
                    position="top"
                    formatter={(value) => `${clampPercentage(value).toFixed(1)}%`}
                    style={{ fill: '#334155', fontWeight: 700, fontSize: 12 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
            Color bands: Green ≥ 85, Blue 75-84, Amber 60-74, Red &lt; 60
          </p>
        </motion.div>
      </div>

      {/* Quick Navigation Section */}
      <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Brain className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Open Detailed Analysis</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">Use these quick links to open complete sections with deeper charts and actionable analysis.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: 'Unified Analysis', text: 'All risk, trends, and insight blocks in one place.', to: '/comprehensive' },
            { title: 'Department Analytics', text: 'Department-wise performance and drill-down.', to: '/departments' },
            { title: 'Subject Insights', text: 'Subject-level trend and attendance diagnostics.', to: '/subjects' },
            { title: 'Attendance Log', text: 'Operational attendance workflows and updates.', to: '/attendance' },
          ].map((item, index) => (
            <Link key={index} to={item.to} className="group rounded-2xl border border-gray-100 bg-white/60 p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              <p className="text-sm font-black text-gray-900 mb-2">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[38px]">{item.text}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-600">
                Open Section <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
