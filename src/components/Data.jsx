import React, { useState } from "react";

import { motion } from "framer-motion";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const Data = ({
  customerData,
  searchTerm,
  setSearchTerm,
  onDelete,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState("individual");

  // Logic to handle both Array and String for searching
  const filteredData = customerData.filter((item) => {
    const matchesTab = item.type === activeTab;

    // Check if serviceType is array or string and format for search
    const serviceString = Array.isArray(item.serviceType)
      ? item.serviceType.join(" ").toLowerCase()
      : (item.serviceType || "").toLowerCase();

    const matchesSearch =
      item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceString.includes(searchTerm.toLowerCase());

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
          className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${activeTab === "individual" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Individual Ledger
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setActiveTab("party")}
          className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${activeTab === "party" ? "bg-white shadow text-orange-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Party / Business
        </motion.button>
      </div>

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
                <th className="p-4">
                  {activeTab === "individual" ? "Customer" : "Business"} & ID
                </th>
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
                    No {activeTab} records found.
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
                    className={`flex flex-col md:table-row transition-colors p-4 md:p-0 mb-4 md:mb-0 border md:border-none rounded-xl md:rounded-none bg-gray-50/30 md:bg-transparent ${activeTab === "individual" ? "hover:bg-blue-50/40" : "hover:bg-orange-50/40"}`}
                  >
                    {/* Column 1: Info */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="text-sm font-bold uppercase text-gray-800">
                        {item.partyName || "N/A"}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {activeTab === "individual" ? item.cnic : item.ntn}
                      </div>
                      <div className="text-[11px] text-blue-600 font-medium">
                        {item.phone}
                      </div>
                    </td>

                    {/* Column 2: Service & Vehicle */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {/* Rendering Multiple Services as Badges */}
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

                    {/* Column 3: Tracking */}
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

                    {/* Column 4: Payment */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-[8px] font-black uppercase ${item.remainingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {item.remainingBalance > 0
                            ? "● Pending"
                            : "● Cleared"}
                        </span>
                        <div className="text-[10px] text-gray-600">
                          Total: {Number(item.totalAmount).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-bold text-red-600">
                          Bal: {Number(item.remainingBalance).toLocaleString()}
                        </div>
                      </div>
                    </td>

                    {/* Column 5: Actions */}
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
    </motion.section>
  );
};

export default Data;
