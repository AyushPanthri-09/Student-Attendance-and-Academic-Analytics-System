import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3, GraduationCap, Sparkles } from "lucide-react";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const linkStyle = "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 relative group z-10";
  const activeTextStyle = "text-white font-semibold";
  const normalTextStyle = "text-gray-400 group-hover:text-gray-100";

  const NavItem = ({ to, icon: Icon, label, end = false }) => (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      <NavLink
        to={to}
        end={end}
        onClick={onClose}
        className={({ isActive }) =>
          `${linkStyle} ${isActive ? activeTextStyle : normalTextStyle}`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-900/20 -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-sm">{label}</span>
          </>
        )}
      </NavLink>
    </motion.div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/55 backdrop-blur-[1px] z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`w-64 max-w-[85vw] lg:max-w-none bg-[#0f172a] text-white h-dvh fixed left-0 top-0 p-6 shadow-2xl border-r border-gray-800/50 flex flex-col z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
          <GraduationCap className="text-white" size={24} />
        </div>
        <motion.h2 
          className="text-xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Academic ERP
        </motion.h2>
      </div>

      <motion.nav 
        className="space-y-8 overflow-y-auto flex-1 pr-2 custom-scrollbar"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1
            }
          }
        }}
      >
        {/* Analytics Section */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Analytics Engine</p>
          <NavItem to="/" icon={LayoutDashboard} label="Overview" end />
          <NavItem to="/comprehensive" icon={Sparkles} label="Unified Analysis" />
          <NavItem to="/departments" icon={BarChart3} label="Department Analytics" />
          <NavItem to="/subjects" icon={BookOpen} label="Subject Insights" />
        </div>

        {/* Management Section */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Core Management</p>
          <NavItem to="/students" icon={Users} label="Students" />
          <NavItem to="/department-management" icon={BarChart3} label="Department Master" />
          <NavItem to="/subjects-management" icon={BookOpen} label="Curriculum" />
          <NavItem to="/attendance" icon={ClipboardList} label="Attendance Log" />
          <NavItem to="/eligibility" icon={ClipboardList} label="Eligibility Center" />
        </div>
      </motion.nav>

      <div className="mt-auto pt-6 border-t border-gray-800/50">
        <div className="bg-gray-800/40 rounded-xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div>
            <p className="text-xs font-semibold">Admin Panel</p>
            <p className="text-[10px] text-gray-500 italic">Data Analyst Mode</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}