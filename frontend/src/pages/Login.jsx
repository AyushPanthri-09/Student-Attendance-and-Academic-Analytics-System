import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function Login() {
  return (
    <div className="h-screen flex">

      {/* Left Branding Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center p-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap size={40} />
            <h1 className="text-4xl font-bold">Academic ERP</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-md">
            Manage students, teachers, and courses with a powerful
            and modern academic management system.
          </p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-96 border border-white/40"
        >

          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Welcome Back
          </h2>

          <div className="space-y-5">

            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition"
            >
              Login
            </motion.button>

          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            © 2026 Academic ERP System
          </p>

        </motion.div>

      </div>

    </div>
  );
}