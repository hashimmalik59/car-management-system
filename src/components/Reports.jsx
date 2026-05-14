import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helper Functions ─────────────────────────────────────────────────
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

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

// ─── Get remaining for any item (handles all data formats) ──────────────
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
    return sumVehicleField(item.vehicles, "vehicleTotal") || Number(item.totalAmount || 0);
  }
  return Number(item.totalAmount || 0);
};

const getItemAdvance = (item) => {
  if (!item) return 0;
  if (item.type === "individual") {
    return Number(item.advancePaid || 0);
  }
  if (item.type === "party") {
    return sumVehicleField(item.vehicles, "vehicleAdvance") || Number(item.advancePaid || 0);
  }
  return Number(item.advancePaid || 0);
};

// ─── Print Report Function ────────────────────────────────────────────
const printReport = (reportType, dateRange, individualData, partyData, totals) => {
  const reportTitles = {
    daily: "DAILY REPORT",
    weekly: "WEEKLY REPORT",
    monthly: "MONTHLY REPORT",
    annual: "ANNUAL REPORT",
  };

  const rangeText = {
    daily: `Date: ${dateRange.label}`,
    weekly: `Week: ${dateRange.label}`,
    monthly: `Month: ${dateRange.label}`,
    annual: `Year: ${dateRange.label}`,
  };

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print reports!");
    return;
  }

  const getServicesHtml = (item) => {
    const services = Array.isArray(item.serviceType) ? item.serviceType : [];
    return services.map((s) => {
      const price = item.servicePrices?.[s] || 0;
      return `<div style="margin-bottom:2px"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:bold;text-transform:uppercase;background:#dbeafe;color:#1e40af">${s}</span> <span style="font-size:9px">Rs. ${Number(price).toLocaleString()}</span></div>`;
    }).join("");
  };

  const getVehicleServicesHtml = (v) => {
    const services = Array.isArray(v.serviceType) ? v.serviceType : [];
    return services.map((s) => {
      const price = v.servicePrices?.[s] || 0;
      return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:bold;text-transform:uppercase;background:#ffedd5;color:#ea580c;margin-right:4px">${s}</span> <span style="font-size:8px">Rs. ${Number(price).toLocaleString()}</span>`;
    }).join(" ");
  };

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportTitles[reportType]} - Iqra Motor Insurance</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 12px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 22px; color: #1e40af; letter-spacing: 1px; }
        .header h2 { margin: 5px 0 0; font-size: 14px; color: #666; font-weight: normal; }
        .header .range { margin-top: 8px; font-size: 12px; color: #888; font-weight: bold; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; background: #f9fafb; }
        .summary-card .label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: bold; margin-bottom: 6px; }
        .summary-card .value { font-size: 16px; font-weight: bold; color: #1f2937; }
        .summary-card.total { background: #dbeafe; border-color: #3b82f6; }
        .summary-card.total .value { color: #1e40af; }
        .summary-card.pending { background: #fee2e2; border-color: #ef4444; }
        .summary-card.pending .value { color: #dc2626; }
        .summary-card.advance { background: #d1fae5; border-color: #10b981; }
        .summary-card.advance .value { color: #059669; }
        .summary-card.customers { background: #fef3c7; border-color: #f59e0b; }
        .summary-card.customers .value { color: #d97706; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 14px; font-weight: bold; color: #1e40af; border-left: 4px solid #1e40af; padding-left: 10px; margin-bottom: 12px; text-transform: uppercase; }
        .section-title.party { color: #ea580c; border-left-color: #ea580c; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #4b5563; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-red { color: #dc2626; }
        .text-green { color: #059669; }
        .text-blue { color: #1e40af; }
        .text-orange { color: #ea580c; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-individual { background: #dbeafe; color: #1e40af; }
        .badge-party { background: #ffedd5; color: #ea580c; }
        .footer { margin-top: 30px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 10px; color: #9ca3af; }
        .party-vehicles { font-size: 10px; color: #6b7280; margin-top: 4px; }
        .grand-total { background: #f3f4f6; font-weight: bold; }
        .no-records { text-align: center; padding: 40px; color: #9ca3af; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>IQRA MOTOR INSURANCE</h1>
        <h2>${reportTitles[reportType]}</h2>
        <div class="range">${rangeText[reportType]}</div>
        <div style="font-size: 10px; color: #999; margin-top: 4px;">Generated on: ${new Date().toLocaleString("en-GB")}</div>
      </div>

      <div class="summary-grid">
        <div class="summary-card customers">
          <div class="label">Total Customers</div>
          <div class="value">${totals.totalCustomers}</div>
        </div>
        <div class="summary-card total">
          <div class="label">Total Amount</div>
          <div class="value">Rs. ${totals.grandTotalAmount.toLocaleString()}</div>
        </div>
        <div class="summary-card advance">
          <div class="label">Total Advance</div>
          <div class="value">Rs. ${totals.grandTotalAdvance.toLocaleString()}</div>
        </div>
        <div class="summary-card pending">
          <div class="label">Total Remaining</div>
          <div class="value">Rs. ${totals.grandTotalRemaining.toLocaleString()}</div>
        </div>
      </div>

      ${individualData.length > 0 ? `
      <div class="section">
        <div class="section-title">Individual Records (${individualData.length})</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Vehicle</th>
              <th>Services</th>
              <th class="text-right">Total</th>
              <th class="text-right">Advance</th>
              <th class="text-right">Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${individualData.map((item, idx) => {
              const remaining = getItemRemaining(item);
              const total = getItemTotal(item);
              const advance = getItemAdvance(item);
              return `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${formatShortDate(item.createdAt)}</td>
                <td>
                  <div class="font-bold text-blue">${item.partyName || "N/A"}</div>
                  <div style="font-size: 9px; color: #666;">${item.cnic || "—"}</div>
                </td>
                <td>${item.phone || "—"}<br><span style="font-size: 9px; color: #666;">${item.bankName || "Cash"}</span></td>
                <td>
                  <div class="font-bold">${item.plate || "—"}</div>
                  <div style="font-size: 9px; color: #666;">${item.model || "—"}</div>
                </td>
                <td>${getServicesHtml(item)}</td>
                <td class="text-right font-bold">${total.toLocaleString()}</td>
                <td class="text-right text-green">${advance.toLocaleString()}</td>
                <td class="text-right text-red font-bold">${remaining.toLocaleString()}</td>
                <td class="text-center">
                  <span class="badge ${remaining > 0 ? 'badge-party' : 'badge-individual'}">
                    ${remaining > 0 ? "Pending" : "Cleared"}
                  </span>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
          <tfoot>
            <tr class="grand-total">
              <td colspan="6" class="text-right">INDIVIDUAL TOTALS</td>
              <td class="text-right">${totals.individualTotal.toLocaleString()}</td>
              <td class="text-right text-green">${totals.individualAdvance.toLocaleString()}</td>
              <td class="text-right text-red">${totals.individualRemaining.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : ""}

      ${partyData.length > 0 ? `
      <div class="section">
        <div class="section-title party">Party / Business Records (${partyData.length})</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Party Name</th>
              <th>Contact</th>
              <th>Vehicles</th>
              <th class="text-right">Total</th>
              <th class="text-right">Advance</th>
              <th class="text-right">Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${partyData.map((item, idx) => {
              const vehicles = item.vehicles || [];
              const vTotal = getItemTotal(item);
              const vAdvance = getItemAdvance(item);
              const vRemaining = getItemRemaining(item);
              const vehicleDetails = vehicles.map((v) => `
                <div style="margin-bottom: 4px; padding: 4px; background: #f9fafb; border-radius: 4px;">
                  <strong>${v.plate || "—"}</strong> (${v.model || "—"})<br>
                  ${getVehicleServicesHtml(v)}
                </div>
              `).join("");
              return `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${formatShortDate(item.createdAt)}</td>
                <td>
                  <div class="font-bold text-orange">${item.partyName || "N/A"}</div>
                  <div style="font-size: 9px; color: #666;">NTN: ${item.ntn || "—"}</div>
                </td>
                <td>${item.phone || "—"}<br><span style="font-size: 9px; color: #666;">${item.bankName || "Cash"}</span></td>
                <td>
                  <div class="font-bold">${vehicles.length} Vehicle(s)</div>
                  <div class="party-vehicles">${vehicleDetails}</div>
                </td>
                <td class="text-right font-bold">${vTotal.toLocaleString()}</td>
                <td class="text-right text-green">${vAdvance.toLocaleString()}</td>
                <td class="text-right text-red font-bold">${vRemaining.toLocaleString()}</td>
                <td class="text-center">
                  <span class="badge ${vRemaining > 0 ? 'badge-party' : 'badge-individual'}">
                    ${vRemaining > 0 ? "Pending" : "Cleared"}
                  </span>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
          <tfoot>
            <tr class="grand-total">
              <td colspan="5" class="text-right">PARTY TOTALS</td>
              <td class="text-right">${totals.partyTotal.toLocaleString()}</td>
              <td class="text-right text-green">${totals.partyAdvance.toLocaleString()}</td>
              <td class="text-right text-red">${totals.partyRemaining.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : ""}

      ${individualData.length === 0 && partyData.length === 0 ? `
      <div class="no-records">
        <div style="font-size: 24px; margin-bottom: 10px;">📭</div>
        <div style="font-size: 14px; font-weight: bold;">No records found for this period</div>
        <div style="font-size: 12px;">Try selecting a different date or report type</div>
      </div>
      ` : ""}

      <div class="footer">
        <p><strong>IQRA MOTOR INSURANCE</strong></p>
        <p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p>
        <p style="margin-top: 8px; font-size: 9px;">This is a computer generated report and does not require signature.</p>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ─── Summary Card Component ───────────────────────────────────────────
const SummaryCard = ({ title, value, subtext, color, delay }) => {
  const gradients = {
    amber: "from-amber-50 to-orange-50 border-orange-200",
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    emerald: "from-emerald-50 to-green-50 border-emerald-200",
    red: "from-red-50 to-rose-50 border-red-200",
  };
  const textColors = {
    amber: "text-orange-700",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    red: "text-red-700",
  };
  const labelColors = {
    amber: "text-orange-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    red: "text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${gradients[color]} border ${gradients[color].split(" ").pop()} rounded-xl p-4`}
    >
      <div className={`text-[10px] font-bold ${labelColors[color]} uppercase tracking-wider mb-1`}>
        {title}
      </div>
      <div className={`text-2xl font-bold ${textColors[color]}`}>{value}</div>
      {subtext && <div className={`text-[10px] ${labelColors[color]} mt-1`}>{subtext}</div>}
    </motion.div>
  );
};

// ─── Main Reports Component ───────────────────────────────────────────
const Reports = ({ customerData = [] }) => {
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
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
          label: date.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
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

  const individualData = filteredData.filter((item) => item.type === "individual");
  const partyData = filteredData.filter((item) => item.type === "party");

  // ─── Calculate Totals ─────────────────────────────────────────────
  const totals = useMemo(() => {
    const individualTotal = individualData.reduce((sum, item) => sum + getItemTotal(item), 0);
    const individualAdvance = individualData.reduce((sum, item) => sum + getItemAdvance(item), 0);
    const individualRemaining = individualData.reduce((sum, item) => sum + getItemRemaining(item), 0);

    const partyTotal = partyData.reduce((sum, item) => sum + getItemTotal(item), 0);
    const partyAdvance = partyData.reduce((sum, item) => sum + getItemAdvance(item), 0);
    const partyRemaining = partyData.reduce((sum, item) => sum + getItemRemaining(item), 0);

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
    { key: "daily", label: "Daily", icon: "📅", color: "blue" },
    { key: "weekly", label: "Weekly", icon: "📆", color: "indigo" },
    { key: "monthly", label: "Monthly", icon: "📊", color: "purple" },
    { key: "annual", label: "Annual", icon: "📈", color: "emerald" },
  ];

  const colorClasses = {
    blue: {
      active: "bg-blue-600 text-white shadow-lg shadow-blue-200",
      inactive: "bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600",
    },
    indigo: {
      active: "bg-indigo-600 text-white shadow-lg shadow-indigo-200",
      inactive: "bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600",
    },
    purple: {
      active: "bg-purple-600 text-white shadow-lg shadow-purple-200",
      inactive: "bg-white text-gray-500 hover:bg-purple-50 hover:text-purple-600",
    },
    emerald: {
      active: "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
      inactive: "bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-600",
    },
  };

  const displayData =
    activeView === "all"
      ? filteredData
      : activeView === "individual"
      ? individualData
      : partyData;

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col gap-5 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-white border border-gray-100"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Generate Daily, Weekly, Monthly & Annual Reports
          </p>
        </div>
        <button
          onClick={() =>
            printReport(reportType, dateRange, individualData, partyData, totals)
          }
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl"
        >
          <span>🖨️</span> Print {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reportTypes.map((type) => (
          <motion.button
            key={type.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setReportType(type.key);
              setSelectedDate(new Date().toISOString().split("T")[0]);
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all border ${
              reportType === type.key
                ? colorClasses[type.color].active
                : colorClasses[type.color].inactive + " border-gray-200"
            }`}
          >
            <span className="text-lg">{type.icon}</span>
            {type.label}
          </motion.button>
        ))}
      </div>

      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
        <button
          onClick={() => navigateDate(-1)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          ← Prev {reportType === "daily" ? "Day" : reportType === "weekly" ? "Week" : reportType === "monthly" ? "Month" : "Year"}
        </button>

        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-gray-800">{dateRange.label}</div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {reportType} Report Period
          </div>
        </div>

        <button
          onClick={() => navigateDate(1)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Next {reportType === "daily" ? "Day" : reportType === "weekly" ? "Week" : reportType === "monthly" ? "Month" : "Year"} →
        </button>
      </div>

      {/* Date Picker */}
      <div className="flex items-center gap-3">
        <label className="text-[10px] font-bold text-gray-400 uppercase">Jump to Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          title="Total Customers"
          value={totals.totalCustomers}
          subtext={`${individualData.length} Individual · ${partyData.length} Party`}
          color="amber"
          delay={0.1}
        />
        <SummaryCard
          title="Total Amount"
          value={`Rs. ${totals.grandTotalAmount.toLocaleString()}`}
          subtext="All services combined"
          color="blue"
          delay={0.2}
        />
        <SummaryCard
          title="Total Advance"
          value={`Rs. ${totals.grandTotalAdvance.toLocaleString()}`}
          subtext="Received payments"
          color="emerald"
          delay={0.3}
        />
        <SummaryCard
          title="Total Remaining"
          value={`Rs. ${totals.grandTotalRemaining.toLocaleString()}`}
          subtext="Pending balance"
          color="red"
          delay={0.4}
        />
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
        {[
          { key: "all", label: "All Records" },
          { key: "individual", label: "Individual" },
          { key: "party", label: "Party" },
        ].map((view) => (
          <button
            key={view.key}
            onClick={() => setActiveView(view.key)}
            className={`px-5 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
              activeView === view.key
                ? view.key === "all"
                  ? "bg-white shadow text-gray-700"
                  : view.key === "individual"
                  ? "bg-white shadow text-blue-600"
                  : "bg-white shadow text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Records Display */}
      <div className="flex flex-col gap-4">
        {displayData.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-gray-500 font-bold text-sm">No records found for this period</div>
            <div className="text-gray-400 text-xs mt-1">Try selecting a different date or report type</div>
          </div>
        ) : (
          <>
            {/* Individual Records */}
            {(activeView === "all" || activeView === "individual") && individualData.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Individual Records ({individualData.length})
                  </h3>
                  <div className="text-[10px] font-bold text-gray-400">
                    Total: Rs. {totals.individualTotal.toLocaleString()} | Advance: Rs.{" "}
                    {totals.individualAdvance.toLocaleString()} | Remaining: Rs.{" "}
                    {totals.individualRemaining.toLocaleString()}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full text-left">
                    <thead className="bg-gray-50">
                      <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Vehicle</th>
                        <th className="px-4 py-3">Services</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Advance</th>
                        <th className="px-4 py-3 text-right">Remaining</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {individualData.map((item, idx) => {
                        const remaining = getItemRemaining(item);
                        const total = getItemTotal(item);
                        const advance = getItemAdvance(item);
                        return (
                          <motion.tr
                            key={item.id || idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="text-sm hover:bg-blue-50/30 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                            <td className="px-4 py-3 text-[11px] text-gray-600">
                              {formatShortDate(item.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-800 text-xs">{item.partyName || "N/A"}</div>
                              <div className="text-[10px] text-gray-400">{item.phone || "—"}</div>
                              <div className="text-[9px] text-gray-400 font-mono">{item.cnic || "—"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-700 text-xs">{item.plate || "—"}</div>
                              <div className="text-[10px] text-gray-400">{item.model || "—"}</div>
                              <div className="text-[9px] text-blue-600">{item.region || "—"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(item.serviceType) ? item.serviceType : []).map((serviceName, si) => {
                                  const price = item.servicePrices?.[serviceName] || 0;
                                  return (
                                    <div
                                      key={si}
                                      className="bg-blue-100 text-blue-700 text-[9px] px-2 py-1 rounded font-bold"
                                    >
                                      <div className="uppercase">{serviceName}</div>
                                      <div className="text-[8px] text-gray-600">Rs. {Number(price).toLocaleString()}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-gray-800 text-xs">
                              {total.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-green-600 text-xs">
                              {advance.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-red-600 text-xs">
                              {remaining.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                                  remaining > 0
                                    ? "bg-red-100 text-red-600"
                                    : "bg-green-100 text-green-600"
                                }`}
                              >
                                {remaining > 0 ? "● Pending" : "● Cleared"}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                      <tr className="text-xs font-bold">
                        <td colSpan={5} className="px-4 py-3 text-right text-gray-700 uppercase">
                          Individual Totals
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gray-800">
                          {totals.individualTotal.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-green-700">
                          {totals.individualAdvance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-red-700">
                          {totals.individualRemaining.toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Party Records */}
            {(activeView === "all" || activeView === "party") && partyData.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Party / Business Records ({partyData.length})
                  </h3>
                  <div className="text-[10px] font-bold text-gray-400">
                    Total: Rs. {totals.partyTotal.toLocaleString()} | Advance: Rs.{" "}
                    {totals.partyAdvance.toLocaleString()} | Remaining: Rs.{" "}
                    {totals.partyRemaining.toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {partyData.map((item, idx) => {
                    const vehicles = item.vehicles || [];
                    const vTotal = getItemTotal(item);
                    const vAdvance = getItemAdvance(item);
                    const vRemaining = getItemRemaining(item);

                    return (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                      >
                        <div className="bg-orange-600 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                          <div className="text-white font-bold text-sm">
                            {item.partyName || "N/A"}
                            <span className="text-orange-200 font-normal text-xs ml-2">
                              ({item.ntn || item.phone || "No Contact"})
                            </span>
                          </div>
                          <div className="text-[10px] text-orange-200">
                            {formatShortDate(item.createdAt)}
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left">
                            <thead className="bg-gray-50">
                              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-2.5">#</th>
                                <th className="px-4 py-2.5">Vehicle</th>
                                <th className="px-4 py-2.5">Services</th>
                                <th className="px-4 py-2.5 text-right">Total</th>
                                <th className="px-4 py-2.5 text-right">Advance</th>
                                <th className="px-4 py-2.5 text-right">Remaining</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {vehicles.map((v, vidx) => (
                                <tr
                                  key={vidx}
                                  className="text-sm hover:bg-orange-50/30 transition-colors"
                                >
                                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                                    {vidx + 1}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-gray-800 text-xs">{v.plate || "—"}</div>
                                    <div className="text-[10px] text-gray-400">{v.model || "—"}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {(Array.isArray(v.serviceType) ? v.serviceType : []).map(
                                        (serviceName, si) => {
                                          const price = v.servicePrices?.[serviceName] || 0;
                                          return (
                                            <div
                                              key={si}
                                              className="bg-orange-100 text-orange-700 text-[9px] px-2 py-1 rounded font-bold"
                                            >
                                              <div className="uppercase">{serviceName}</div>
                                              <div className="text-[8px] text-gray-700 mt-1">
                                                Rs. {Number(price).toLocaleString()}
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-700 text-xs">
                                    {Number(v.vehicleTotal || 0).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-green-600 text-xs">
                                    {Number(v.vehicleAdvance || 0).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-orange-600 text-xs">
                                    {Number(v.vehicleRemaining || 0).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-orange-50 border-t-2 border-orange-200">
                              <tr className="text-xs font-bold">
                                <td colSpan={3} className="px-4 py-3 text-right text-gray-700 uppercase">
                                  Party Total
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-gray-800">
                                  {vTotal.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-green-700">
                                  {vAdvance.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-red-700">
                                  {vRemaining.toLocaleString()}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex gap-3 text-[10px] text-gray-500">
                            <span>📞 {item.phone || "—"}</span>
                            <span>📍 {item.region || "—"}</span>
                            <span>💳 {item.bankName || "Cash"}</span>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                              vRemaining > 0
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {vRemaining > 0 ? "● PENDING" : "● CLEARED"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {/* Party Grand Total */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-sm font-bold text-orange-800 uppercase">Party Grand Total</div>
                  <div className="flex gap-6 text-xs font-mono font-bold flex-wrap">
                    <span className="text-gray-700">Total: {totals.partyTotal.toLocaleString()}</span>
                    <span className="text-green-600">Advance: {totals.partyAdvance.toLocaleString()}</span>
                    <span className="text-red-600">Remaining: {totals.partyRemaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Reports;
