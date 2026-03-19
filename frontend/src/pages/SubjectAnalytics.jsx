import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import analyticsService from '../services/analyticsService';
import { onAnalyticsDataChanged } from '../utils/analyticsSync';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { BookOpen, TrendingDown, TrendingUp, AlertCircle, Users, Calendar, Filter, Award, Target, Hash } from 'lucide-react';
import ChartNotation from '../components/ChartNotation';
import useChartScale from '../hooks/useChartScale';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass p-5 rounded-2xl border-none shadow-2xl min-w-[200px]">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{data.subjectCode}</p>
        <p className="text-sm font-black text-gray-900 mb-2">{data.subjectName}</p>
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-400">ATTENDANCE</span>
            <span className="text-blue-600">{data.attendancePercentage.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-400">SEMESTER</span>
            <span className="text-gray-900">{data.semester}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SubjectAnalytics() {
  const [subjectAnalytics, setSubjectAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('attendance');
  const chartScale = useChartScale();
  const clampPercentage = (value) => Math.max(0, Math.min(100, Number(value) || 0));

  useEffect(() => {
    fetchSubjectData();
    const unsubscribe = onAnalyticsDataChanged(() => {
      fetchSubjectData();
    });
    return unsubscribe;
  }, []);

  const fetchSubjectData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getSubjectAnalytics();
      setSubjectAnalytics(data);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizedSubjects = useMemo(() => {
    return (subjectAnalytics || []).map((subject) => ({
      ...subject,
      attendancePercentage: clampPercentage(subject?.attendancePercentage),
    }));
  }, [subjectAnalytics]);

  const getSortedSubjects = () => {
    const sorted = [...normalizedSubjects];
    switch (sortBy) {
      case 'attendance':
        return sorted.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
      case 'name':
        return sorted.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
      case 'department':
        return sorted.sort((a, b) => a.departmentName.localeCompare(b.departmentName));
      default:
        return sorted;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
        <div className="h-20 bg-white rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-white rounded-[2rem] animate-pulse"></div>
      </div>
    );
  }

  const sortedSubjects = getSortedSubjects();
  const topPerformers = sortedSubjects.filter(s => s.attendancePercentage >= 85).length;
  const avgAttendance = normalizedSubjects.length > 0 
    ? (normalizedSubjects.reduce((sum, s) => sum + s.attendancePercentage, 0) / normalizedSubjects.length)
    : 0;

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
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Curriculum Intelligence</h1>
        <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">High-Granularity Module Analysis</p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Unit Health', value: `${avgAttendance.toFixed(1)}%`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Elite Modules', value: topPerformers, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Modules', value: normalizedSubjects.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical Units', value: normalizedSubjects.filter(s => s.attendancePercentage < 60).length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="glass p-6 rounded-[2rem] flex items-center gap-4 hover-lift">
            <div className={`${stat.bg} p-4 rounded-2xl`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sorting Controls */}
      <motion.div variants={itemVariants} className="glass p-2 rounded-2xl w-fit flex gap-1">
        {[
          { value: 'attendance', label: 'By Efficiency', icon: TrendingUp },
          { value: 'name', label: 'Alphabetical', icon: Hash },
          { value: 'department', label: 'Departmental', icon: Filter }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
              sortBy === option.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <option.icon size={12} />
            {option.label}
          </button>
        ))}
      </motion.div>

      {/* Subject Performance Chart */}
      <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Granular Module Diagnostics</h3>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TOP 10 MODULES BY VOLUME</div>
        </div>
        <div className="mb-4">
          <ChartNotation
            title="Chart Notation"
            items={[
              { label: 'Healthy (>= 75%)', color: '#6366f1' },
              { label: 'Watchlist (60-74%)', color: '#f59e0b' },
              { label: 'Critical (< 60%)', color: '#ef4444' },
            ]}
          />
        </div>
        <p className="text-sm text-slate-500 font-semibold mb-4">X-axis: attendance percentage. Y-axis: subject/module names. Horizontal layout improves long-label readability.</p>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedSubjects.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 24, left: 48, bottom: 10 }}>
              <defs>
                <linearGradient id="subjectBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#4338ca" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tick={{ fontSize: chartScale.axisFontSize, fill: '#64748b', fontWeight: 600 }}
              />
              <YAxis
                dataKey="subjectName"
                type="category"
                width={200}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: Math.max(chartScale.axisFontSize, 11), fill: '#475569', fontWeight: 600 }}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar 
                dataKey="attendancePercentage" 
                fill="url(#subjectBar)" 
                radius={[12, 12, 12, 12]} 
                barSize={24}
                animationDuration={2000}
              >
                {sortedSubjects.slice(0, 10).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.attendancePercentage < 60 ? '#ef4444' : entry.attendancePercentage < 75 ? '#f59e0b' : 'url(#subjectBar)'} 
                  />
                ))}
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

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSubjects.map((subject, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <BookOpen className="text-indigo-600" size={24} />
              </div>
              <p className="text-[10px] font-black leading-none bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full uppercase tracking-tighter">SEM {subject.semester}</p>
            </div>

            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{subject.subjectCode}</p>
            <h3 className="text-xl font-black text-gray-900 mb-6 truncate relative z-10">{subject.subjectName}</h3>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance Efficiency</span>
                <span className={`text-xl font-black ${
                  subject.attendancePercentage >= 75 ? 'text-emerald-600' :
                  subject.attendancePercentage >= 60 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {subject.attendancePercentage.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(subject.attendancePercentage ?? 0, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    subject.attendancePercentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    subject.attendancePercentage >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
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
                    <p className="text-sm font-black text-gray-900">{subject.totalStudents || 45}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Delivery</p>
                    <p className="text-sm font-black text-gray-900">{subject.presentCount}/{subject.totalClasses}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>{subject.departmentName}</span>
                {subject.attendancePercentage >= 75 ? 
                  <TrendingUp className="text-emerald-500" size={14} /> : 
                  <TrendingDown className="text-rose-500" size={14} />
                }
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
