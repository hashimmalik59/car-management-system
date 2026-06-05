import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helper Functions ─────────────────────────────────────────────────
const formatShortDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const sumVehicleField = (vehicles = [], field) =>
  (vehicles || []).reduce((sum, v) => sum + (Number(v?.[field]) || 0), 0);

// ─── Date Helpers ─────────────────────────────────────────────────────
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getStartOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getStartOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
};

// ─── Get remaining/total/advance for any item ─────────────────────────
const getItemRemaining = (item) => {
  if (!item) return 0;
  if (item.type === "individual") {
    return Number(item.indRemaining || item.remainingBalance || 0);
  }
  if (item.type === "party") {
    const vehicles = item.vehicles || [];
    let partyRemaining = sumVehicleField(vehicles, "vehicleRemaining");
    if (partyRemaining === 0) {
      partyRemaining = Number(item.remainingBalance || 0);
    }
    return partyRemaining;
  }
  return Number(item.remainingBalance || 0);
};

const getItemTotal = (item) => {
  if (!item) return 0;
  if (item.type === "individual") {
    return Number(item.totalAmount || 0);
  }
  if (item.type === "party") {
    return (
      sumVehicleField(item.vehicles, "vehicleTotal") ||
      Number(item.totalAmount || 0)
    );
  }
  return Number(item.totalAmount || 0);
};

const getItemAdvance = (item) => {
  if (!item) return 0;
  if (item.type === "individual") {
    return Number(item.advancePaid || 0);
  }
  if (item.type === "party") {
    return (
      sumVehicleField(item.vehicles, "vehicleAdvance") ||
      Number(item.advancePaid || 0)
    );
  }
  return Number(item.advancePaid || 0);
};

const printReport = (
  reportType,
  dateRange,
  individualData,
  partyData,
  totals,
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups!");
    return;
  }

  // Yahan tumhara wahi purana CSS aur HTML wapas hai
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <h1>IQRA MOTOR INSURANCE</h1>
      <h2>Report Details</h2>
      
      <table>
        <thead>
          <tr><th>Date</th><th>Customer</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${individualData.map((item) => `<tr><td>${item.createdAt}</td><td>${item.partyName}</td><td class="text-right">${totals.grandTotalAmount}</td></tr>`).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `);

  printWindow.document.close();

  // Ab ye "Bulletproof" trigger kaam karega
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
};

// ─── Animated Counter Component ──────────────────────────────────────
const AnimatedCounter = ({ value, prefix = "" }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {value.toLocaleString()}
    </motion.span>
  );
};

// ─── Glassmorphism Card Component ────────────────────────────────────
const GlassCard = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-black/30 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ─── Main Reports Component ───────────────────────────────────────────
const Reports = ({ customerData = [] }) => {
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [activeView, setActiveView] = useState("all");

  // ─── Date Range Calculation ───────────────────────────────────────
  const dateRange = useMemo(() => {
    const date = new Date(selectedDate);
    switch (reportType) {
      case "daily": {
        const start = getStartOfDay(date);
        const end = getEndOfDay(date);
        return {
          start,
          end,
          label: date.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      }
      case "weekly": {
        const start = getStartOfWeek(date);
        const end = getEndOfWeek(date);
        return {
          start,
          end,
          label: `${start.toLocaleDateString("en-GB")} — ${end.toLocaleDateString("en-GB")}`,
        };
      }
      case "monthly": {
        const start = getStartOfMonth(date);
        const end = getEndOfMonth(date);
        return {
          start,
          end,
          label: date.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          }),
        };
      }
      case "annual": {
        const start = getStartOfYear(date);
        const end = getEndOfYear(date);
        return {
          start,
          end,
          label: date.getFullYear().toString(),
        };
      }
      default:
        return { start: new Date(0), end: new Date(), label: "" };
    }
  }, [reportType, selectedDate]);

  // ─── Filter Data ──────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!Array.isArray(customerData)) return [];
    return customerData.filter((item) => {
      const itemDate = item.createdAt ? new Date(item.createdAt) : new Date();
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }, [customerData, dateRange]);

  const individualData = filteredData.filter(
    (item) => item.type === "individual",
  );
  const partyData = filteredData.filter((item) => item.type === "party");

  // ─── Calculate Totals ─────────────────────────────────────────────
  const totals = useMemo(() => {
    const individualTotal = individualData.reduce(
      (sum, item) => sum + getItemTotal(item),
      0,
    );
    const individualAdvance = individualData.reduce(
      (sum, item) => sum + getItemAdvance(item),
      0,
    );
    const individualRemaining = individualData.reduce(
      (sum, item) => sum + getItemRemaining(item),
      0,
    );

    const partyTotal = partyData.reduce(
      (sum, item) => sum + getItemTotal(item),
      0,
    );
    const partyAdvance = partyData.reduce(
      (sum, item) => sum + getItemAdvance(item),
      0,
    );
    const partyRemaining = partyData.reduce(
      (sum, item) => sum + getItemRemaining(item),
      0,
    );

    return {
      individualTotal,
      individualAdvance,
      individualRemaining,
      partyTotal,
      partyAdvance,
      partyRemaining,
      grandTotalAmount: individualTotal + partyTotal,
      grandTotalAdvance: individualAdvance + partyAdvance,
      grandTotalRemaining: individualRemaining + partyRemaining,
      totalCustomers: filteredData.length,
    };
  }, [individualData, partyData, filteredData]);

  // ─── Navigation ─────────────────────────────────────────────────────
  const navigateDate = (direction) => {
    const date = new Date(selectedDate);
    switch (reportType) {
      case "daily":
        date.setDate(date.getDate() + direction);
        break;
      case "weekly":
        date.setDate(date.getDate() + direction * 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + direction);
        break;
      case "annual":
        date.setFullYear(date.getFullYear() + direction);
        break;
      default:
        break;
    }
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const reportTypes = [
    {
      key: "daily",
      label: "Daily",
      icon: "📅",
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/30",
    },
    {
      key: "weekly",
      label: "Weekly",
      icon: "📆",
      color: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-500/30",
    },
    {
      key: "monthly",
      label: "Monthly",
      icon: "📊",
      color: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/30",
    },
    {
      key: "annual",
      label: "Annual",
      icon: "📈",
      color: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/30",
    },
  ];

  const displayData =
    activeView === "all"
      ? filteredData
      : activeView === "individual"
        ? individualData
        : partyData;

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Header */}
      <GlassCard delay={0}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white"
            >
              Reports &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
                Analytics
              </span>
            </motion.h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              Generate Daily, Weekly, Monthly & Annual Reports
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              printReport(
                reportType,
                dateRange,
                individualData,
                partyData,
                totals,
              )
            }
            className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-gray-500/30 hover:shadow-xl transition-all"
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              🖨️
            </motion.span>
            Print {reportType.charAt(0).toUpperCase() + reportType.slice(1)}{" "}
            Report
          </motion.button>
        </div>
      </GlassCard>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((type, index) => (
          <motion.button
            key={type.key}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setReportType(type.key);
              setSelectedDate(new Date().toISOString().split("T")[0]);
            }}
            className={`relative overflow-hidden py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
              reportType === type.key
                ? `bg-gradient-to-r ${type.color} text-white shadow-lg ${type.shadow} transform scale-105`
                : "bg-white/60 dark:bg-gray-800/60 backdrop-blur text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50"
            }`}
          >
            <motion.span
              animate={reportType === type.key ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="text-2xl block mb-1"
            >
              {type.icon}
            </motion.span>
            <span className="text-sm">{type.label}</span>
            {reportType === type.key && (
              <motion.div
                layoutId="reportIndicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full mx-4"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Date Navigation */}
      <GlassCard delay={0.2}>
        <div className="flex flex-col sm:flex-row items-center gap-4 p-5">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateDate(-1)}
            className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-md"
          >
            ← Prev
          </motion.button>

          <div className="flex-1 text-center">
            <motion.div
              key={dateRange.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-black text-gray-800 dark:text-white"
            >
              {dateRange.label}
            </motion.div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">
              {reportType} Report Period
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateDate(1)}
            className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-md"
          >
            Next →
          </motion.button>
        </div>
      </GlassCard>

      {/* Date Picker */}
      <div className="flex items-center gap-3 px-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Jump to:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            setSelectedDate(new Date().toISOString().split("T")[0])
          }
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30"
        >
          Today
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total Customers",
            value: totals.totalCustomers,
            subtext: `${individualData.length} Individual · ${partyData.length} Party`,
            color: "from-amber-400 to-orange-500",
            icon: "👥",
            delay: 0.3,
          },
          {
            title: "Total Amount",
            value: `Rs. ${totals.grandTotalAmount.toLocaleString()}`,
            subtext: "All services combined",
            color: "from-blue-400 to-blue-600",
            icon: "💰",
            delay: 0.4,
          },
          {
            title: "Total Advance",
            value: `Rs. ${totals.grandTotalAdvance.toLocaleString()}`,
            subtext: "Received payments",
            color: "from-emerald-400 to-emerald-600",
            icon: "💵",
            delay: 0.5,
          },
          {
            title: "Total Remaining",
            value: `Rs. ${totals.grandTotalRemaining.toLocaleString()}`,
            subtext: "Pending balance",
            color: "from-red-400 to-rose-600",
            icon: "📊",
            delay: 0.6,
          },
        ].map((card) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: card.delay, type: "spring" }}
            whileHover={{ y: -6, scale: 1.03 }}
            className={`relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
            <div className="relative z-10">
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {card.title}
              </div>
              <div className="text-lg font-black mt-1">{card.value}</div>
              <div className="text-[9px] opacity-70 mt-1">{card.subtext}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Toggle */}
      <GlassCard delay={0.7}>
        <div className="flex p-2">
          {[
            { key: "all", label: "All Records", icon: "📋" },
            { key: "individual", label: "Individual", icon: "👤" },
            { key: "party", label: "Party", icon: "🏢" },
          ].map((view) => (
            <motion.button
              key={view.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(view.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase transition-all ${
                activeView === view.key
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <span>{view.icon}</span>
              {view.label}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Records Display */}
      <AnimatePresence mode="wait">
        {displayData.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              📭
            </motion.div>
            <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
              No records found
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try selecting a different date or report type
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Individual Records */}
            {(activeView === "all" || activeView === "individual") &&
              individualData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/30">
                        👤
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800 dark:text-white">
                          Individual Records
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {individualData.length} customers found
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                      Total: Rs. {totals.individualTotal.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {individualData.map((item, idx) => {
                      const remaining = getItemRemaining(item);
                      const total = getItemTotal(item);
                      const advance = getItemAdvance(item);
                      return (
                        <motion.div
                          key={item.id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-black/20 p-5 transition-all"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Customer Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center text-xl">
                                  🚗
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-800 dark:text-white">
                                    {item.partyName || "N/A"}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.phone || "—"} · {item.cnic || "—"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(Array.isArray(item.serviceType)
                                  ? item.serviceType
                                  : []
                                ).map((serviceName, si) => {
                                  // Yahan hum data check kar rahe hain taake NaN na aaye
                                  const rawData =
                                    item.servicePrices?.[serviceName];
                                  const price =
                                    typeof rawData === "object" &&
                                    rawData !== null
                                      ? Number(
                                          rawData.price ||
                                            rawData.customPrice ||
                                            0,
                                        )
                                      : Number(rawData || 0);

                                  return (
                                    <motion.div
                                      key={si}
                                      whileHover={{ scale: 1.1 }}
                                      className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 text-[10px] px-3 py-1.5 rounded-lg font-bold border border-blue-200/50 dark:border-blue-700/30"
                                    >
                                      {serviceName} · Rs.{" "}
                                      {price.toLocaleString()}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Vehicle & Amount */}
                            <div className="flex gap-6 items-center">
                              <div className="text-center">
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">
                                  Vehicle
                                </div>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                  {item.plate || "—"}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {item.model || "—"}
                                </div>
                              </div>
                              <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                              <div className="text-center">
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">
                                  Total
                                </div>
                                <div className="text-lg font-black text-gray-800 dark:text-white">
                                  {total.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">
                                  Advance
                                </div>
                                <div className="text-lg font-black text-green-600 dark:text-green-400">
                                  {advance.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">
                                  Remaining
                                </div>
                                <div
                                  className={`text-lg font-black ${remaining > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                                >
                                  {remaining.toLocaleString()}
                                </div>
                              </div>
                              <motion.span
                                whileHover={{ scale: 1.2 }}
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                  remaining > 0
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                }`}
                              >
                                {remaining > 0 ? "● Pending" : "✓ Cleared"}
                              </motion.span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Individual Total Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-violet-500/10 dark:from-blue-900/20 dark:to-violet-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30"
                  >
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-700 dark:text-gray-300">
                        Individual Totals
                      </span>
                      <div className="flex gap-6">
                        <span className="text-gray-800 dark:text-white">
                          {totals.individualTotal.toLocaleString()}
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {totals.individualAdvance.toLocaleString()}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          {totals.individualRemaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

            {/* Party Records */}
            {(activeView === "all" || activeView === "party") &&
              partyData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg shadow-lg shadow-orange-500/30">
                        🏢
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800 dark:text-white">
                          Party / Business Records
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {partyData.length} parties found
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                      Total: Rs. {totals.partyTotal.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {partyData.map((item, idx) => {
                      const vehicles = item.vehicles || [];
                      const vTotal = getItemTotal(item);
                      const vAdvance = getItemAdvance(item);
                      const vRemaining = getItemRemaining(item);

                      return (
                        <motion.div
                          key={item.id || idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          whileHover={{ scale: 1.01 }}
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-black/20 overflow-hidden"
                        >
                          {/* Party Header */}
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
                                  🏢
                                </div>
                                <div>
                                  <h4 className="font-black text-white text-lg">
                                    {item.partyName || "N/A"}
                                  </h4>
                                  <p className="text-xs text-orange-100">
                                    {item.ntn || item.phone || "No Contact"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-orange-100 uppercase font-bold">
                                  {formatShortDate(item.createdAt)}
                                </p>
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase mt-1 ${
                                    vRemaining > 0
                                      ? "bg-red-500/30 text-white"
                                      : "bg-green-500/30 text-white"
                                  }`}
                                >
                                  {vRemaining > 0 ? "● PENDING" : "✓ CLEARED"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Vehicles */}
                          <div className="p-4 space-y-3">
                            {vehicles.map((v, vidx) => (
                              <motion.div
                                key={vidx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: vidx * 0.05 }}
                                whileHover={{ x: 4 }}
                                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center text-lg">
                                  🚙
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-gray-800 dark:text-white text-sm">
                                    {v.plate || "—"}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {v.model || "—"}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {(Array.isArray(v.serviceType)
                                      ? v.serviceType
                                      : []
                                    ).map((serviceName, si) => {
                                      const price =
                                        v.servicePrices?.[serviceName] || 0;
                                      return (
                                        <span
                                          key={si}
                                          className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[9px] px-2 py-0.5 rounded-md font-bold"
                                        >
                                          {serviceName} · Rs.{" "}
                                          {Number(price).toLocaleString()}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex gap-4 text-right">
                                  <div>
                                    <div className="text-[9px] text-gray-400 uppercase font-bold">
                                      Total
                                    </div>
                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                      {Number(
                                        v.vehicleTotal || 0,
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] text-gray-400 uppercase font-bold">
                                      Advance
                                    </div>
                                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                      {Number(
                                        v.vehicleAdvance || 0,
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] text-gray-400 uppercase font-bold">
                                      Remaining
                                    </div>
                                    <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                      {Number(
                                        v.vehicleRemaining || 0,
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Party Footer */}
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                            <div className="flex gap-4 text-[10px] text-gray-500 dark:text-gray-400">
                              <span>📞 {item.phone || "—"}</span>
                              <span>📍 {item.region || "—"}</span>
                              <span>💳 {item.bankName || "Cash"}</span>
                            </div>
                            <div className="flex gap-4 text-xs font-mono font-bold">
                              <span className="text-gray-700 dark:text-gray-300">
                                {vTotal.toLocaleString()}
                              </span>
                              <span className="text-green-600 dark:text-green-400">
                                {vAdvance.toLocaleString()}
                              </span>
                              <span className="text-red-600 dark:text-red-400">
                                {vRemaining.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Party Grand Total */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white shadow-lg shadow-orange-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <span className="font-black text-lg">
                          Party Grand Total
                        </span>
                      </div>
                      <div className="flex gap-6 text-sm font-mono font-bold">
                        <span>{totals.partyTotal.toLocaleString()}</span>
                        <span className="opacity-80">
                          {totals.partyAdvance.toLocaleString()}
                        </span>
                        <span className="opacity-80">
                          {totals.partyRemaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Reports;
