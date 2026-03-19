import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import analyticsService from '../services/analyticsService';
import { useButtonClick } from '../hooks/useButtonClick';
import { onAnalyticsDataChanged } from '../utils/analyticsSync';
import { 
  Users, Activity, AlertTriangle, TrendingUp, 
  BarChart3, PieChart as PieIcon, Sparkles, Brain,
  Calendar, Info, Target, ArrowUpRight, Gauge,
  ShieldAlert, Lightbulb, Zap, HelpCircle, ChevronRight,
  RefreshCcw, WifiOff, BookOpen
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ReferenceLine, Legend, LabelList,
  LineChart, Line
} from 'recharts';
import ChartNotation from '../components/ChartNotation';
import useChartScale from '../hooks/useChartScale';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const rawValue = payload[0]?.value;
    const displayValue = typeof rawValue === 'number' ? rawValue.toFixed(2) : rawValue;
    return (
      <div className="glass p-4 rounded-xl border-none shadow-2xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm font-semibold text-gray-900">
            {payload[0].name}: <span className="text-blue-600 font-black">{displayValue}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const RiskPieTooltip = ({ active, payload, totalRiskCount = 0 }) => {
  if (active && payload && payload.length) {
    const point = payload[0];
    const count = Number(point?.value) || 0;
    const percentage = totalRiskCount > 0 ? ((count / totalRiskCount) * 100).toFixed(1) : '0.0';
    return (
      <div className="glass p-4 rounded-xl border-none shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: point?.payload?.color || '#3b82f6' }}></div>
          <p className="text-sm font-semibold text-gray-900">
            {point?.name}: <span className="text-blue-600 font-black">{percentage}%</span>
            <span className="text-slate-500 font-semibold"> ({count})</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomXAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  const label = String(payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#64748b"
        fontSize={12}
        fontWeight={600}
      >
        {label.length > 16 ? `${label.substring(0, 14)}...` : label}
      </text>
    </g>
  );
};

export default function ComprehensiveAnalytics() {
  const [data, setData] = useState({
    overview: null,
    realtime: null,
    departments: [],
    subjects: [],
    risk: { content: [], totalElements: 0 },
    trends: [],
    insights: [],
    anomalies: [],
    recommendations: [],
    sentiment: null
  });
  const [loadingStage, setLoadingStage] = useState('priority'); // priority, charts, secondary
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const chartScale = useChartScale();
  const clampPercentage = (value) => Math.max(0, Math.min(100, Number(value) || 0));

  useEffect(() => {
    fetchComprehensiveDataProgressive();
  }, []);

  useEffect(() => {
    const unsubscribe = onAnalyticsDataChanged(() => {
      fetchComprehensiveDataProgressive();
    });
    return unsubscribe;
  }, []);

  const fetchComprehensiveDataProgressive = async () => {
    try {
      setLoadingStage('priority');
      setError(null);

      const safeFetch = async (promise, fallback = null) => {
        try {
          return await promise;
        } catch (e) {
          console.warn('API Fetch Error:', e);
          return fallback;
        }
      };

      // STAGE 1: Load ONLY overview first (fastest, no blocking)
      const overview = await safeFetch(analyticsService.getOverviewMetrics());

      if (!overview) {
        throw new Error('Critical data sync failure. Please verify backend connectivity.');
      }

      setData(prev => ({ ...prev, overview }));

      // STAGE 1B: Load realtime in parallel (but don't wait for it to block)
      analyticsService.getRealTimeMetrics().then(realtime => {
        setData(prev => ({ ...prev, realtime }));
      }).catch(() => {
        console.warn('Realtime metrics failed, continuing without');
      });

      // STAGE 2: Load charts data in parallel
      setLoadingStage('charts');
      const [departments, subjects, trendsData] = await Promise.all([
        safeFetch(analyticsService.getDepartmentAnalytics(), []),
        safeFetch(analyticsService.getSubjectAnalytics(), []),
        safeFetch(analyticsService.getTrendAnalysis(12), [])
      ]);

      setData(prev => ({ ...prev, departments, subjects, trends: trendsData }));

      // STAGE 3: Load risk data with smaller page size
      setLoadingStage('secondary');
      const riskData = await safeFetch(analyticsService.getAllRiskAnalysis(), { content: [], totalElements: 0 });
      setData(prev => ({ ...prev, risk: riskData }));

      // STAGE 4: Load secondary data (can be delayed)
      Promise.all([
        safeFetch(analyticsService.getInsights(), []),
        safeFetch(analyticsService.getAnomalies(), []),
        safeFetch(analyticsService.getGeneralRecommendations(), []),
        safeFetch(analyticsService.getSentimentAnalysis())
      ]).then(([insightsData, anomalies, recommendations, sentiment]) => {
        setData(prev => ({ ...prev, insights: insightsData, anomalies, recommendations, sentiment }));
        setLoadingStage('done');
      });

    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      setError(error.message);
      setLoadingStage('done');
    }
  };

  // Debounced refresh to prevent rapid clicks
  const debouncedRefresh = useButtonClick(fetchComprehensiveDataProgressive, 1000);

  if (error && loadingStage === 'priority') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-10">
        <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 shadow-2xl shadow-rose-500/10 max-w-md">
          <WifiOff className="text-rose-500 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Sync Interrupted</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            We encountered a critical error while aggregating your intelligence feast. {error}
          </p>
          <button 
            onClick={fetchComprehensiveDataProgressive}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            <RefreshCcw size={16} />
            Re-Initialize Hub
          </button>
        </div>
      </div>
    );
  }

  // Calculate risk distribution (department aware)
  const riskList = useMemo(() => {
    const all = data.risk?.content || [];
    if (selectedDepartment === 'ALL') return all;
    return all.filter((student) => student?.departmentName === selectedDepartment);
  }, [data.risk, selectedDepartment]);
  const formatCompactNumber = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(value);
  };

  const riskCounts = {
    SAFE: riskList.filter(s => s && s.riskLevel === 'LOW').length,
    WARNING: riskList.filter(s => s && s.riskLevel === 'MEDIUM').length,
    CRITICAL: riskList.filter(s => s && s.riskLevel === 'HIGH').length
  };

  const riskPieData = [
    { name: 'Safe (>= 75%)', value: riskCounts.SAFE, color: '#10b981' },
    { name: 'Moderate', value: riskCounts.WARNING, color: '#f59e0b' },
    { name: 'Critical (< 60%)', value: riskCounts.CRITICAL, color: '#ef4444' }
  ].filter(d => d.value > 0);
  const totalRiskCount = riskPieData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  const latestTrend = data.trends?.length ? data.trends[data.trends.length - 1]?.attendancePercentage || 0 : 0;
  const previousTrend = data.trends?.length > 1 ? data.trends[data.trends.length - 2]?.attendancePercentage || 0 : latestTrend;
  const trendDelta = latestTrend - previousTrend;
  const predictiveInsight = data.insights?.find(i => i?.type === 'PREDICTIVE') || data.insights?.[0];

  const trendChartData = useMemo(() => {
    return (data.trends || []).map((point, index, array) => {
      const curr = clampPercentage(point?.attendancePercentage || 0);
      const prev = clampPercentage(array[index - 1]?.attendancePercentage ?? curr);
      const prev2 = clampPercentage(array[index - 2]?.attendancePercentage ?? prev);
      const movingAvg = (curr + prev + prev2) / 3;
      return {
        ...point,
        attendancePercentage: curr,
        movingAverage: Number(movingAvg.toFixed(2)),
      };
    });
  }, [data.trends]);

  const departmentOptions = useMemo(() => {
    return (data.departments || [])
      .map((d) => d.departmentName)
      .filter(Boolean);
  }, [data.departments]);

  const comparativeDepartments = useMemo(() => {
    const source = selectedDepartment === 'ALL'
      ? (data.departments || [])
      : (data.departments || []).filter((d) => d.departmentName === selectedDepartment);

    return source.map((d) => ({
      ...d,
      attendancePercentage: clampPercentage(d?.attendancePercentage),
    }));
  }, [data.departments, selectedDepartment]);

  const comparativeSubjects = useMemo(() => {
    const subjects = data.subjects || [];
    const filtered = selectedDepartment === 'ALL'
      ? subjects
      : subjects.filter((s) => s.departmentName === selectedDepartment);
    return [...filtered]
      .map((s) => ({
        ...s,
        attendancePercentage: clampPercentage(s?.attendancePercentage),
      }))
      .sort((a, b) => (b.attendancePercentage || 0) - (a.attendancePercentage || 0))
      .slice(0, 8);
  }, [data.subjects, selectedDepartment]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  // Loading skeleton for initial state
  const isInitializing = loadingStage === 'priority' && !data.overview;

  return (
    <>
      {isInitializing && (
        <div className="min-h-screen p-8 space-y-10 animate-pulse bg-slate-50">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
              <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-12 w-48 bg-white rounded-2xl shadow-sm"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-3xl shadow-sm"></div>
            ))}
          </div>
        </div>
      )}

      {!isInitializing && (
        <motion.div 
          className="max-w-[1600px] mx-auto space-y-10 pb-16 px-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pt-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Unified Analysis</h1>
            <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200">
              V2.1 RESILIENT
            </div>
          </div>
          <p className="text-slate-500 font-semibold uppercase text-xs tracking-[0.24em]">Institutional Forensic Analytics And Predictive Engine</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-6 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Live Engine</p>
                <p className="text-xs font-bold text-slate-700">Cluster: 01-A</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="text-amber-500" size={18} />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Sync Status</p>
                <p className="text-xs font-bold text-slate-700">Cloud Optimized</p>
              </div>
            </div>
          </div>
          <button 
            onClick={debouncedRefresh} 
            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* Real-time Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Roster', value: formatCompactNumber(data.realtime?.activeStudents || data.overview?.totalStudents || 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Engagement', value: `${(data.realtime?.engagementRate || data.overview?.averageAttendance || 0).toFixed(1)}%`, icon: Gauge, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Live Present', value: formatCompactNumber(data.realtime?.presentToday || 0), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Model Accuracy', value: `${(data.realtime?.accuracy || 94).toFixed(2)}%`, icon: Target, color: 'text-slate-700', bg: 'bg-slate-100' },
        ].map((item, i) => (
          <motion.div key={i} variants={cardVariants} className="glass group p-6 rounded-[2rem] hover-lift border border-white hover:border-indigo-100 transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 blur-2xl -mr-12 -mt-12 rounded-full"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`${item.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <item.icon className={item.color} size={24} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{item.label}</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tight relative z-10">{item.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Temporal Velocity Graph */}
        <motion.div variants={cardVariants} className="lg:col-span-8 glass p-10 rounded-[3rem] border border-white">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Trend And Forecast Path</h3>
              <p className="text-sm text-slate-500 font-semibold mt-1">X-axis: week period. Y-axis: attendance percentage. Dashed line: 75% baseline target.</p>
            </div>
          </div>
          <div className="mb-6">
            <ChartNotation
              title="Trend Notation"
              items={[
                { label: 'Actual Attendance', color: '#1d4ed8' },
                { label: '3-Point Moving Average', color: '#0f766e' },
                { label: 'Target Baseline (75%)', color: '#ea580c' },
              ]}
            />
          </div>
          <div className="h-[400px]">
            {(trendChartData?.length || 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 12, right: 12, left: 6, bottom: chartScale.bottomMargin }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} interval={0} height={chartScale.xTickHeight} tick={<CustomXAxisTick />} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: chartScale.axisFontSize, fill: '#64748b', fontWeight: 700 }} domain={[0, 100]} width={48} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" iconType="line" wrapperStyle={{ fontSize: 12, fontWeight: 700, color: '#475569' }} />
                  <ReferenceLine y={75} stroke="#ea580c" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Target 75%', fill: '#c2410c', fontSize: 11, fontWeight: 800, position: 'insideTopRight' }} />
                  <Line type="monotone" dataKey="attendancePercentage" name="Actual Attendance" stroke="#1d4ed8" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="movingAverage" name="3-Point Moving Average" stroke="#0f766e" strokeWidth={3} strokeDasharray="7 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-base">No trend data available yet. Start recording attendance to see trend movement.</div>
            )}
          </div>
        </motion.div>

        {/* Global Distribution */}
        <motion.div variants={cardVariants} className="lg:col-span-4 glass p-10 rounded-[3rem] border border-white flex flex-col items-center">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 self-start">Risk Archetype</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 self-start">
            {selectedDepartment === 'ALL' ? 'Population Segmentation (All Departments)' : `Population Segmentation (${selectedDepartment})`}
          </p>
          <div className="mb-6 w-full">
            <ChartNotation
              title="Risk Notation"
              items={[
                { label: 'Safe (>= 75%)', color: '#10b981' },
                { label: 'Moderate (60-74%)', color: '#f59e0b' },
                { label: 'Critical (< 60%)', color: '#ef4444' },
              ]}
            />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskPieData.length > 0 ? riskPieData : [{ name: 'N/A', value: 1, color: '#f1f5f9' }]}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {(riskPieData.length > 0 ? riskPieData : [{ name: 'N/A', value: 1, color: '#e2e8f0' }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<RiskPieTooltip totalRiskCount={totalRiskCount} />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-4 w-full mt-8">
            {(riskPieData.length > 0 ? riskPieData : [{ name: 'No risk data available', value: 0, color: '#94a3b8' }]).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-lg font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Comparative View - Departments & Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dept Bar Chart */}
        <motion.div variants={cardVariants} className="glass p-10 rounded-[3rem] border border-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none text-center">Department matrix</h3>
            <BarChart3 className="text-slate-300" size={24} />
          </div>
          <div className="-mt-6 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm text-slate-500 font-semibold">X-axis: attendance percentage. Y-axis: departments. Use filter to focus on one department.</p>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativeDepartments} layout="vertical" margin={{ top: 10, right: 24, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: chartScale.axisFontSize, fill: '#64748b', fontWeight: 600 }} />
                <YAxis dataKey="departmentName" type="category" width={200} axisLine={false} tickLine={false} tick={{ fontSize: Math.max(chartScale.axisFontSize, 11), fill: '#475569', fontWeight: 600 }} interval={0} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <ReferenceLine x={75} stroke="#ea580c" strokeDasharray="5 5" strokeWidth={2} />
                <Bar dataKey="attendancePercentage" name="Attendance %" fill="#3b82f6" radius={[8, 8, 8, 8]} barSize={24}>
                  <LabelList
                    dataKey="attendancePercentage"
                    position="right"
                    formatter={(value) => `${clampPercentage(value).toFixed(1)}%`}
                    style={{ fill: '#334155', fontWeight: 700, fontSize: 11 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Subjects Bar Chart */}
        <motion.div variants={cardVariants} className="glass p-10 rounded-[3rem] border border-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none text-center">Module Diagnostics</h3>
            <BookOpen className="text-slate-300" size={24} />
          </div>
          <p className="text-sm text-slate-500 font-semibold -mt-6 mb-6">X-axis: attendance percentage. Y-axis: subjects. Showing top modules for selected department filter.</p>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativeSubjects} layout="vertical" margin={{ top: 10, right: 24, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: chartScale.axisFontSize, fill: '#64748b', fontWeight: 600 }} />
                <YAxis dataKey="subjectName" type="category" width={220} axisLine={false} tickLine={false} tick={{ fontSize: Math.max(chartScale.axisFontSize, 11), fill: '#475569', fontWeight: 600 }} interval={0} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="attendancePercentage" name="Attendance %" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={22}>
                  <LabelList
                    dataKey="attendancePercentage"
                    position="right"
                    formatter={(value) => `${clampPercentage(value).toFixed(1)}%`}
                    style={{ fill: '#334155', fontWeight: 700, fontSize: 11 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Strategic Insights Blocks */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Block 1: Anomaly Detection */}
        <motion.div variants={cardVariants} className="glass p-8 rounded-[2.5rem] border border-slate-100 bg-white/70 px-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Insight Block 1: Anomaly Sentinel</h3>
          </div>
          <div className="space-y-4">
            {(data.anomalies?.length || 0) > 0 ? data.anomalies.map((anno, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-md uppercase tracking-wide">{anno.type}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                </div>
                <h4 className="text-base font-black text-slate-900 mb-2">{anno.description}</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{anno.recommendation}</p>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <ShieldAlert size={40} className="mb-4 opacity-20" />
                <p className="text-sm font-bold text-slate-600">No anomaly records available at this time.</p>
                <p className="text-xs text-slate-500 mt-1">System is healthy or anomaly signals are still being computed.</p>
                <Link to="/attendance" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  View Attendance Log <ChevronRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Block 2: Recommendations */}
        <motion.div variants={cardVariants} className="glass p-8 rounded-[2.5rem] border border-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
              <Lightbulb className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Insight Block 2: Strategic Actions</h3>
          </div>
          <div className="space-y-6">
            {(data.recommendations?.length || 0) > 0 ? data.recommendations.map((rec, idx) => (
              <div key={idx} className="relative pl-10 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1.5 before:bg-indigo-500 before:rounded-full before:opacity-20">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-base font-black text-slate-900">{rec.title}</h4>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-4">{rec.description}</p>
                <div className="flex flex-wrap gap-2">
                  {rec.actionItems?.slice(0, 2).map((action, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                      <ChevronRight size={10} className="text-indigo-500" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <p className="text-sm font-bold text-slate-600">No recommendations available at this time.</p>
                <p className="text-xs text-slate-500 mt-1">As new attendance patterns emerge, targeted action items will appear here.</p>
                <Link to="/comprehensive" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  Refresh Unified Analysis <RefreshCcw size={12} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Block 3: Sentiment Analysis */}
        <motion.div variants={cardVariants} className="glass p-8 rounded-[2.5rem] border border-white flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <Brain className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Insight Block 3: Sentiment Spectrum</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{(data.sentiment?.overallSentiment || 'NEUTRAL')} BIAS</span>
              <span className="text-xs font-black text-blue-600">{data.sentiment?.totalResponses || 0} RESPONSES</span>
            </div>
            <div className="flex h-12 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <div 
                className="bg-emerald-600 h-full flex items-center justify-center text-xs font-black text-white" 
                style={{ width: `${(data.sentiment?.positive || 0.33) * 100}%` }}
              >
                {(data.sentiment?.positive || 0.33) > 0.1 && `${((data.sentiment?.positive || 0.33) * 100).toFixed(2)}%`}
              </div>
              <div 
                className="bg-slate-200 h-full flex items-center justify-center text-xs font-black text-slate-600" 
                style={{ width: `${(data.sentiment?.neutral || 0.34) * 100}%` }}
              >
                {(data.sentiment?.neutral || 0.34) > 0.1 && `${((data.sentiment?.neutral || 0.34) * 100).toFixed(2)}%`}
              </div>
              <div 
                className="bg-rose-500 h-full flex items-center justify-center text-xs font-black text-white" 
                style={{ width: `${(data.sentiment?.negative || 0.33) * 100}%` }}
              >
                {(data.sentiment?.negative || 0.33) > 0.1 && `${((data.sentiment?.negative || 0.33) * 100).toFixed(2)}%`}
              </div>
            </div>
            <p className="mt-8 text-sm text-slate-500 font-medium leading-relaxed italic px-2">
              "The current sentiment distribution suggests a {(data.sentiment?.overallSentiment || 'NEUTRAL').toLowerCase()} alignment with institutional attendance policy."
            </p>
          </div>
        </motion.div>

        {/* Block 4: Forecast Summary */}
        <motion.div variants={cardVariants} className="glass p-8 rounded-[2.5rem] border border-white flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Insight Block 4: Trends And Forecast</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Latest Attendance</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{latestTrend.toFixed(2)}%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Week Delta</p>
              <p className={`text-3xl font-black mt-1 ${trendDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{trendDelta >= 0 ? '+' : ''}{trendDelta.toFixed(2)}%</p>
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Predictive Note</p>
            <p className="text-base font-semibold text-slate-800">{predictiveInsight?.title || 'No predictive insight available yet.'}</p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{predictiveInsight?.description || 'Once more trend data is available, this block will display forecast-based recommendations.'}</p>
          </div>
        </motion.div>

      </div>
    </motion.div>
      )}
    </>
  );
}
