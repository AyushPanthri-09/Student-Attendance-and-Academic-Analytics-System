import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3, AlertTriangle, TrendingUp, Brain } from "lucide-react";

export default function Sidebar() {
  const linkStyle = "flex items-center gap-3 p-3 rounded-lg transition-all duration-200";
  const activeStyle = "bg-blue-600 text-white shadow-md";
  const normalStyle = "text-gray-300 hover:bg-gray-800 hover:text-white";

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white h-screen fixed left-0 top-0 p-6 shadow-2xl border-r border-gray-700/50">
      <motion.h2 
        className="text-2xl font-bold mb-10 text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        Attendance Analytics
      </motion.h2>

      <motion.nav 
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.2
            }
          }
        }}
      >
        {/* Analytics Section */}
        <motion.div 
          className="mb-6"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Analytics</p>
          
          <motion.div variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : normalStyle}`
              }
            >
              <LayoutDashboard size={18} />
              Overview
            </NavLink>
          </motion.div>

          <motion.div variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}>
            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : normalStyle}`
              }
            >
              <BarChart3 size={18} />
              Department Analytics
            </NavLink>
          </motion.div>

          <motion.div variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}>
            <NavLink
              to="/subjects"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : normalStyle}`
              }
            >
              <BookOpen size={18} />
              Subject Analytics
            </NavLink>
          </motion.div>

          <motion.div variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}>
            <NavLink
              to="/risk-analysis"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : normalStyle}`
              }
            >
              <AlertTriangle size={18} />
              Risk Analysis
            </NavLink>
          </motion.div>

          <motion.div variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}>
            <NavLink
              to="/trends"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : normalStyle}`
              }
            >
              <TrendingUp size={18} />
              Trends & Predictions
            </NavLink>
          </motion.div>

          <motion.div variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}>
            <NavLink
              to="/ai-insights"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : normalStyle}`
              }
            >
              <Brain size={18} />
              AI Insights
            </NavLink>
          </motion.div>
        </motion.div>

        {/* Management Section */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Management</p>
          
          <NavLink
            to="/students"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : normalStyle}`
            }
          >
            <Users size={18} />
            Students
          </NavLink>

          <NavLink
            to="/subjects-management"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : normalStyle}`
            }
          >
            <BookOpen size={18} />
            Subjects
          </NavLink>

          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : normalStyle}`
            }
          >
            <ClipboardList size={18} />
            Attendance
          </NavLink>

          <NavLink
            to="/eligibility"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : normalStyle}`
            }
          >
            <ClipboardList size={18} />
            Eligibility Report
          </NavLink>
        </div>
      </motion.nav>
    </div>
  );
}