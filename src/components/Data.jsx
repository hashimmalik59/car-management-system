import React, { useState } from "react";
import { motion } from "framer-motion";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// ─── Party Ledger Block (one per party record) ────────────────────────────────
const PartyLedgerBlock = ({ item, onEdit, onDelete }) => {
  const vehicles = item.vehicles ?? [];
  const hasVehicles = vehicles.length > 0;

  return (
    <motion.div
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className="w-full rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* ── Blue Header ── */}
      <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between">
        <p className="text-white font-bold text-sm tracking-wide uppercase">
          LEDGER REPORT OF{" "}
          <span className="text-yellow-300">{item.partyName || "N/A"}</span>
          {(item.ntn || item.phone) && (
            <span className="text-blue-200 font-normal text-xs ml-2">
              ({item.ntn || item.phone})
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item.id)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[10px] font-bold transition-all"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="px-3 py-1 bg-red-500/70 hover:bg-red-500 text-white rounded text-[10px] font-bold transition-all"
          >
            Del
          </button>
        </div>
      </div>

      {/* ── Sub-info row ── */}
      <div className="bg-gray-50 px-4 py-1.5 flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase">
        {item.phone && <span>📞 {item.phone}</span>}
        {item.region && <span>📍 {item.region}</span>}
        {item.receivedBy && <span>FROM: {item.receivedBy}</span>}
        {item.handoverTo && (
          <span className="text-orange-600">TO: {item.handoverTo}</span>
        )}
        {item.bankName && (
          <span className="text-blue-600">💳 {item.bankName}</span>
        )}
      </div>

      {/* ── Ledger Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Vehicle No / Model</th>
              <th className="px-4 py-2.5">Purpose / Services</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5 text-right">Closing Balance</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {!hasVehicles ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-gray-400 text-xs"
                >
                  No vehicles recorded.
                </td>
              </tr>
            ) : (
              <>
                {/* ── One row per vehicle ── */}
                {vehicles.map((v, idx) => {
                  // Running balance: after all vehicles, before advance
                  // We don't have per-vehicle amounts so we show total on last row only
                  const isLast = idx === vehicles.length - 1;
                  return (
                    <tr
                      key={idx}
                      className="text-sm hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 text-xs uppercase">
                          {v.plate || "---"}
                        </div>
                        <div className="text-[10px] text-gray-400 italic">
                          {v.model || "---"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(v.serviceType) &&
                          v.serviceType.length > 0 ? (
                            v.serviceType.map((s, si) => (
                              <span
                                key={si}
                                className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">---</span>
                          )}
                        </div>
                      </td>
                      {/* Amount & closing balance: show on last vehicle row only */}
                      <td className="px-4 py-3 text-right text-xs font-mono text-gray-700">
                        {isLast
                          ? Number(item.totalAmount || 0).toLocaleString()
                          : ""}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono font-bold text-blue-600">
                        {isLast
                          ? Number(item.totalAmount || 0).toLocaleString()
                          : ""}
                      </td>
                    </tr>
                  );
                })}

                {/* ── Advance Received row (red, like screenshot) ── */}
                {Number(item.advancePaid) > 0 && (
                  <tr className="bg-red-50 border-t border-red-100">
                    <td className="px-4 py-2.5 text-red-500 font-mono text-xs">
                      —
                    </td>
                    <td
                      colSpan={2}
                      className="px-4 py-2.5 text-red-600 font-bold text-xs uppercase tracking-wide"
                    >
                      AMOUNT RECEIVED
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-mono font-bold text-red-600">
                      {Number(item.advancePaid).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-mono font-bold text-blue-600">
                      {Number(item.remainingBalance || 0).toLocaleString()}
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: Balance ── */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-6">
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Balance / Advance
          </p>
        </div>
        <div
          className={`text-lg font-mono font-bold ${
            Number(item.remainingBalance) > 0
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {Number(item.remainingBalance || 0).toLocaleString()}
        </div>
        <span
          className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
            Number(item.remainingBalance) > 0
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {Number(item.remainingBalance) > 0 ? "● PENDING" : "● CLEARED"}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Main Data Component ──────────────────────────────────────────────────────
const Data = ({
  customerData,
  searchTerm,
  setSearchTerm,
  onDelete,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState("individual");

  const filteredData = customerData.filter((item) => {
    const matchesTab = item.type === activeTab;

    // Search across vehicles array for party records
    let matchesSearch = false;
    if (item.type === "party") {
      const vehicleSearch = (item.vehicles ?? []).some(
        (v) =>
          v.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.serviceType
            ?.join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicleSearch;
    } else {
      const serviceString = Array.isArray(item.serviceType)
        ? item.serviceType.join(" ").toLowerCase()
        : (item.serviceType || "").toLowerCase();
      matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceString.includes(searchTerm.toLowerCase());
    }

    return matchesTab && matchesSearch;
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="shadow-xl md:shadow-2xl w-full rounded-2xl px-4 md:px-6 py-5 flex flex-col gap-5 bg-white border border-gray-100"
    >
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Customer Ledger
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Viewing:{" "}
            <span
              className={
                activeTab === "individual" ? "text-blue-600" : "text-orange-600"
              }
            >
              {activeTab} Records
            </span>
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <motion.input
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            type="search"
            placeholder="Search Name, Service, Plate..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setActiveTab("individual")}
          className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
            activeTab === "individual"
              ? "bg-white shadow text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Individual Ledger
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setActiveTab("party")}
          className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
            activeTab === "party"
              ? "bg-white shadow text-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Party / Business
        </motion.button>
      </div>

      {/* ── INDIVIDUAL: original table (untouched) ── */}
      {activeTab === "individual" && (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full text-left border-collapse">
              <thead className="hidden md:table-header-group bg-gray-50">
                <motion.tr
                  variants={rowVariants}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                >
                  <th className="p-4">Customer & ID</th>
                  <th className="p-4">Service & Vehicle</th>
                  <th className="p-4">Tracking (From/To)</th>
                  <th className="p-4">Payment & Advance</th>
                  <th className="p-4 text-center">Action</th>
                </motion.tr>
              </thead>

              <tbody className="divide-y divide-gray-100 block md:table-row-group">
                {filteredData.length === 0 ? (
                  <motion.tr
                    variants={rowVariants}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <td colSpan="5" className="p-10 text-center text-gray-400">
                      No individual records found.
                    </td>
                  </motion.tr>
                ) : (
                  filteredData.map((item) => (
                    <motion.tr
                      variants={rowVariants}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      key={item.id}
                      className="flex flex-col md:table-row transition-colors p-4 md:p-0 mb-4 md:mb-0 border md:border-none rounded-xl md:rounded-none bg-gray-50/30 md:bg-transparent hover:bg-blue-50/40"
                    >
                      <td className="p-2 md:p-4 block md:table-cell">
                        <div className="text-sm font-bold uppercase text-gray-800">
                          {item.partyName || "N/A"}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {item.cnic}
                        </div>
                        <div className="text-[11px] text-blue-600 font-medium">
                          {item.phone}
                        </div>
                      </td>

                      <td className="p-2 md:p-4 block md:table-cell">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {Array.isArray(item.serviceType) ? (
                            item.serviceType.map((s, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] font-bold text-blue-700 uppercase">
                              {item.serviceType}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          {item.plate}
                        </div>
                        <div className="text-[10px] text-gray-400 italic">
                          {item.model || "---"}
                        </div>
                      </td>

                      <td className="p-2 md:p-4 block md:table-cell">
                        <div className="text-[10px] text-gray-700">
                          <span className="text-gray-400 font-bold">FROM:</span>{" "}
                          {item.receivedBy || "---"}
                        </div>
                        <div className="text-[10px] text-orange-600 font-bold">
                          <span className="text-gray-400">TO:</span>{" "}
                          {item.handoverTo || "---"}
                        </div>
                      </td>

                      <td className="p-2 md:p-4 block md:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between md:justify-start gap-2">
                            <span
                              className={`text-[8px] font-black uppercase ${
                                item.remainingBalance > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {item.remainingBalance > 0
                                ? "● Pending"
                                : "● Cleared"}
                            </span>
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-bold border border-gray-200">
                              {item.bankName || "Cash"}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-600">
                            Total: {Number(item.totalAmount).toLocaleString()}
                          </div>
                          <div className="text-[11px] font-bold text-red-600">
                            Bal:{" "}
                            {Number(item.remainingBalance).toLocaleString()}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 md:p-4 block md:table-cell border-t md:border-none">
                        <div className="flex gap-2 justify-end md:justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => onEdit(item.id)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => onDelete(item.id)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all"
                          >
                            Del
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PARTY: ledger block per record ── */}
      {activeTab === "party" && (
        <div className="flex flex-col gap-5">
          {filteredData.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No party records found.
            </div>
          ) : (
            filteredData.map((item) => (
              <PartyLedgerBlock
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </motion.section>
  );
};

export default Data;
