import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Calendar, 
  Target, 
  Layers, 
  ChevronRight, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  Filter,
  Users,
  Award
} from "lucide-react";
import toast from "react-hot-toast";

const API = "/api";

export default function EligibilityReport() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [semesterTotal, setSemesterTotal] = useState("60");
  const [threshold, setThreshold] = useState(75);
  const [report, setReport] = useState([]);
  const [perSubjectMode, setPerSubjectMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [safeCount, setSafeCount] = useState(0);
  const [riskCount, setRiskCount] = useState(0);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await axios.get(`${API}/departments`);
      setDepartments(res.data);
    } catch (err) {
      toast.error("Structural sync failure");
    }
  };

  const generateReport = async () => {
    if (!selectedDept || !semesterTotal) {
      toast.error("Input missing: Dept/Volume required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/attendance/report/department/${selectedDept}/${semesterTotal}`,
        { params: { threshold, perSubject: perSubjectMode } }
      );

      setReport(res.data);
      let safe = 0;
      let risk = 0;
      res.data.forEach((s) => {
        if (s.status === "ELIGIBLE") safe++;
        else risk++;
      });
      setSafeCount(safe);
      setRiskCount(risk);
      toast.success("Intelligence report compiled");
    } catch (error) {
      toast.error("Generation sequence interrupted");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (report.length === 0) {
      toast.error("Protocol Error: No data to export");
      return;
    }

    try {
      toast.loading("Encrypting PDF...", { id: "pdf" });
      const res = await axios.get(
        `${API}/attendance/report/pdf/department/${selectedDept}/${semesterTotal}`,
        { params: { threshold, perSubject: perSubjectMode }, responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eligibility_report_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      toast.success("PDF Downloaded successfully", { id: "pdf" });
    } catch (error) {
      toast.error("PDF Export Protocol failed", { id: "pdf" });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Eligibility Audit</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Academic Compliance Engine</p>
        </div>
        
        {report.length > 0 && (
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download size={16}/>
            Export Intelligence (PDF)
          </button>
        )}
      </div>

      {/* CONTROL GRID */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[2.5rem] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 relative z-10">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2 px-1 flex items-center gap-2">
              <Building2 size={12} /> Department
            </label>
            <select
              className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">Select Sector</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2 px-1 flex items-center gap-2">
              <Layers size={12} /> Total Classes
            </label>
            <input
              type="number"
              className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={semesterTotal}
              onChange={(e) => setSemesterTotal(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2 px-1 flex items-center gap-2">
              <Target size={12} /> Threshold %
            </label>
            <input
              type="number"
              className="w-full bg-gray-50 border-none p-4 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col justify-end gap-3">
             <div className="flex items-center gap-3 px-1">
                <input
                  id="perSubject"
                  type="checkbox"
                  checked={perSubjectMode}
                  onChange={(e) => setPerSubjectMode(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="perSubject" className="text-xs font-black text-gray-600 uppercase tracking-wider cursor-pointer select-none">Classes per subject</label>
             </div>
             <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <ChevronRight size={16}/>}
              Audit System
            </button>
          </div>
        </div>
      </motion.div>

      {/* SUMMARY DASHBOARD */}
      {report.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Audited', val: report.length, sub: 'Active Enrollment', color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
            { label: 'Eligible', val: safeCount, sub: `${((safeCount/report.length)*100).toFixed(1)}% Passing`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
            { label: 'Not Eligible', val: riskCount, sub: `${((riskCount/report.length)*100).toFixed(1)}% Flagged`, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
            { label: 'Target Ratio', val: `${threshold}%`, sub: 'Audit Baseline', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Award },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-[2.5rem] flex items-center gap-4 hover-lift"
            >
              <div className={`${card.bg} p-4 rounded-2xl`}>
                <card.icon className={card.color} size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{card.label}</p>
                <p className={`text-4xl font-black ${card.color}`}>{card.val}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-tight">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AUDIT TABLE */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-[3rem] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-6 text-sm font-black text-gray-600 uppercase tracking-wider">Roll Identifier</th>
                <th className="px-8 py-6 text-sm font-black text-gray-600 uppercase tracking-wider">Full Name</th>
                <th className="px-8 py-6 text-sm font-black text-gray-600 uppercase tracking-wider">Department</th>
                <th className="px-8 py-6 text-sm font-black text-gray-600 uppercase tracking-wider text-center">Efficiency %</th>
                <th className="px-8 py-6 text-sm font-black text-gray-600 uppercase tracking-wider text-center">Required</th>
                <th className="px-8 py-6 text-sm font-black text-gray-600 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <FileText size={64} className="mb-4" />
                      <h2 className="text-xl font-black uppercase tracking-widest italic">Awaiting Protocol Activation</h2>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {report.map((s, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5 text-base font-black text-gray-500 tracking-tight">{s.rollNo}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-black text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-all text-gray-400">
                            {s.name.charAt(0)}
                          </div>
                          <span className="text-base font-bold text-gray-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-600 uppercase tracking-tight">{s.department}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-xl font-black ${
                          s.attendancePercentage >= threshold ? 'text-emerald-600' : 
                          s.attendancePercentage >= threshold - 10 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {s.attendancePercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center text-sm font-bold text-gray-500">{s.requiredClasses} classes</td>
                      <td className="px-8 py-5 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wide ${
                          s.status === "ELIGIBLE" ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status === "ELIGIBLE" ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                          {s.status}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}