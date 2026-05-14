import React from "react";
import { motion } from "framer-motion";
import { useDarkMode } from "./DarkModeContext";

const Header = ({ totalReceivable, customerCount, pendingCount }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const stats = [
    {
      label: "Customers",
      value: customerCount,
      icon: "👥",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: "⏳",
      gradient: "from-orange-500 to-red-500",
    },
    {
      label: "Receivable",
      value: `Rs. ${(totalReceivable || 0).toLocaleString()}`,
      icon: "💰",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-black/30 transition-all duration-500"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/30"
            >
              🚗
            </motion.div>
            <div>
              <h1 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">
                IQRA{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  MOTOR INSURANCE
                </span>
              </h1>
            </div>
          </motion.div>

          {/* Stats + Dark Mode */}
          <div className="flex items-center gap-2 md:gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                whileHover={{ y: -3, scale: 1.05 }}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r ${stat.gradient} text-white shadow-lg cursor-pointer`}
              >
                <span className="text-lg">{stat.icon}</span>
                <div className="hidden sm:block">
                  <div className="text-[8px] font-bold uppercase tracking-wider opacity-80">
                    {stat.label}
                  </div>
                  <div className="text-xs font-black">{stat.value}</div>
                </div>
                <div className="sm:hidden text-xs font-black">{stat.value}</div>
              </motion.div>
            ))}

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: darkMode ? -15 : 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-300 shadow-md"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              <motion.span
                animate={{ rotate: darkMode ? 180 : 0 }}
                transition={{ duration: 0.5 }}
                className="text-lg"
              >
                {darkMode ? "☀️" : "🌙"}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
