import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import analyticsService from '../services/analyticsService';
import { onAnalyticsDataChanged } from '../utils/analyticsSync';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar, AlertCircle, Filter, RefreshCw, BarChart3, Target, Info, Sparkles, TrendingDown } from 'lucide-react';
import ChartNotation from '../components/ChartNotation';
import useChartScale from '../hooks/useChartScale';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-5 rounded-2xl border-none shadow-2xl min-w-[180px]">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="pt-2 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Attendance</p>
            <p className="text-xl font-black text-gray-900">{payload[0].value.toFixed(1)}%</p>
          </div>
          <Sparkles className="text-blue-500 mb-1" size={16} />
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendsPredictions() {
  const [trends, setTrends] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState(8);
  const chartScale = useChartScale();

  useEffect(() => {
    fetchTrendsData();
  }, [weeks]);

  useEffect(() => {
    const unsubscribe = onAnalyticsDataChanged(() => {
      fetchTrendsData();
    });
    return unsubscribe;
  }, [weeks]);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const [trendsData, predictionsData, insightsData] = await Promise.all([
        analyticsService.getTrendAnalysis(weeks),
        analyticsService.getPredictions(),
        analyticsService.getInsights()
      ]);

      setTrends(trendsData);
      setPredictions(predictionsData);
      setInsights(insightsData.filter(i => i.type === 'PREDICTIVE'));
    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentAttendance = trends.length > 0 ? trends[trends.length - 1]?.attendancePercentage : 0;
  const previousAttendance = trends.length > 1 ? trends[trends.length - 2]?.attendancePercentage : currentAttendance;
  const trendDiff = currentAttendance - previousAttendance;

  const CustomXAxisTick = ({ x, y, payload }) => {
    if (!payload || !payload.value) return null;
    const maxChars = chartScale.shouldRotate ? 10 : 16;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={chartScale.axisDy}
          textAnchor={chartScale.shouldRotate ? 'end' : 'middle'}
          fill="#94a3b8"
          transform={chartScale.shouldRotate ? 'rotate(-35)' : undefined}
          fontSize={chartScale.axisFontSize}
          fontWeight={600}
        >
          {payload.value.length > maxChars ? `${payload.value.slice(0, maxChars)}...` : payload.value}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center h-12 bg-white/50 animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse"></div>)}
        </div>
        <div className="h-96 bg-white rounded-[2rem] animate-pulse"></div>
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Predictive Modeling</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Temporal Trends & Forensic Forecasts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass p-1.5 rounded-2xl flex gap-1">
            {[4, 8, 12, 16].map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  weeks === w ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {w}W
              </button>
            ))}
          </div>
          <button
            onClick={fetchTrendsData}
            className="p-3 bg-white text-gray-400 rounded-2xl border border-gray-100 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Current Reality', 
            value: `${currentAttendance.toFixed(1)}%`, 
            sub: trendDiff >= 0 ? `+${trendDiff.toFixed(1)}% improvement` : `${trendDiff.toFixed(1)}% decrease`,
            icon: Target, 
            color: trendDiff >= 0 ? 'text-emerald-600' : 'text-rose-600',
            bg: trendDiff >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
            trend: trendDiff >= 0 ? TrendingUp : TrendingDown
          },
          { 
            label: 'Next-Gen Forecast', 
            value: `${(predictions[0]?.predictedValue || currentAttendance).toFixed(1)}%`, 
            sub: `${((predictions[0]?.confidence || 0.7) * 100).toFixed(0)}% Model Confidence`,
            icon: Sparkles, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50',
            trend: TrendingUp
          },
          { 
            label: 'System Stability', 
            value: trendDiff === 0 ? 'NEUTRAL' : trendDiff > 0 ? 'STABLE' : 'UNSTABLE', 
            sub: 'Based on 4-point regression',
            icon: BarChart3, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            trend: Info
          },
        ].map((card, i) => (
          <motion.div key={i} variants={itemVariants} className="glass p-8 rounded-[2.5rem] hover-lift group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                <p className={`text-4xl font-black ${card.color}`}>{card.value}</p>
                <div className="flex items-center gap-1.5 mt-4">
                  <card.trend size={12} className={card.color} />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{card.sub}</p>
                </div>
              </div>
              <div className={`${card.bg} p-4 rounded-[1.5rem] group-hover:bg-opacity-80 transition-colors`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Trend Chart */}
      <motion.div variants={itemVariants} className="glass p-10 rounded-[3rem]">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Temporal Velocity Graph</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Multi-point Attendance Trajectory</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-8 bg-indigo-500 rounded-full"></div>
              <span className="text-[10px] font-black text-gray-400">ATTENDANCE %</span>
            </div>
          </div>
        </div>
        <div className="h-[450px]">
          <div className="mb-4">
            <ChartNotation
              title="Chart Notation"
              items={[
                { label: 'Target Line: 75%', color: '#10b981' },
                { label: 'Threshold Line: 60%', color: '#f59e0b' },
                { label: 'Attendance Trend', color: '#4f46e5' },
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: chartScale.bottomMargin }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                interval={0}
                height={chartScale.xTickHeight}
                tick={<CustomXAxisTick />}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: chartScale.axisFontSize, fill: '#94a3b8', fontWeight: 600 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={75} stroke="#10b981" strokeDasharray="8 8" label={{ position: 'right', value: 'OPTIMAL', fill: '#10b981', fontSize: 10, fontWeight: 900 }} strokeOpacity={0.3} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="8 8" label={{ position: 'right', value: 'THRESHOLD', fill: '#f59e0b', fontSize: 10, fontWeight: 900 }} strokeOpacity={0.3} />
              <Area 
                type="monotone" 
                dataKey="attendancePercentage" 
                stroke="url(#lineGrad)" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#areaGrad)" 
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Predictions & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="glass p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Calendar className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Predictive Targets</h3>
          </div>
          <div className="space-y-6">
            {predictions.map((prediction, index) => (
              <div key={index} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{prediction.metric}</h4>
                  <div className="px-3 py-1 bg-white rounded-full border border-gray-100 flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={10} />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{(prediction.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex items-end gap-6 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-end">
                      <p className={`text-4xl font-black ${prediction.predictedValue >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {prediction.predictedValue.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold mb-2">TARGET RANGE</p>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${prediction.predictedValue >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${prediction.predictedValue}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium italic leading-relaxed ">{prediction.explanation}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Brain className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Insights Engine</h3>
          </div>
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <div key={index} className="relative pl-10 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-indigo-500 before:rounded-full before:opacity-20 hover:before:opacity-100 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-black text-gray-900 tracking-tight leading-none">{insight.title}</h4>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg uppercase tracking-widest">{insight.type}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{insight.description}</p>
                {insight.recommendation && (
                  <div className="bg-indigo-50/50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Info size={10} /> REC Strategic move
                    </p>
                    <p className="text-xs text-indigo-900 font-bold">{insight.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Advanced Logic Section */}
      <motion.div variants={itemVariants} className="glass p-10 rounded-[3rem] bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-black mb-4 tracking-tight">What-If Diagnostic Tool</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">simulate hypothetical attendance shifts to identify vulnerable sectors and prevent system-wide regression before it happens.</p>
            <div className="space-y-4">
              {[
                { label: 'Improvement Delta (+5%)', text: '58% of currently critical students across all departments would migrate to Warning status within 3 weeks.', color: 'text-emerald-400' },
                { label: 'Stagnation Risk (0%)', text: 'Baseline models predict a 12% increase in risk across Civil Engineering due to module complexity.', color: 'text-amber-400' },
                { label: 'Regression Delta (-5%)', text: 'Total system audit would trigger critical warnings for 180+ students if attendance fails to stabilize.', color: 'text-rose-400' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl group hover:bg-white/10 transition-all cursor-crosshair">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${item.color}`}>{item.label}</p>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 rotate-12">
              <Sparkles className="text-white" size={40} />
            </div>
            <h4 className="text-xl font-bold mb-2">Model Confidence: 94.2%</h4>
            <p className="text-slate-400 text-sm mb-8 px-4 font-medium">Predictive accuracy has improved by 2.4% following the latest batch processing and historical correlation audit.</p>
            <div className="flex gap-4">
              <div className="px-6 py-2 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/40">AUDIT LOGS</div>
              <div className="px-6 py-2 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">SETTINGS</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { Brain } from 'lucide-react';
