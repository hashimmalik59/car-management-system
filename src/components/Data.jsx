import React, { useState } from "react";

const Data = ({
  customerData,
  searchTerm,
  setSearchTerm,
  onDelete,
  onEdit,
}) => {
  // 1. Local State for Filtering Tabs
  const [activeTab, setActiveTab] = useState("individual");

  // 2. Data Filtering Logic
  const filteredData = customerData.filter((item) => {
    const matchesTab = item.type === activeTab;
    const matchesSearch =
      item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <section className="shadow-xl md:shadow-2xl w-full rounded-2xl px-4 md:px-6 py-5 flex flex-col gap-5 bg-white border border-gray-100">
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
          <input
            type="search"
            placeholder="Search Name, Service, Plate..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Tab Switcher for Data View */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
        <button
          onClick={() => setActiveTab("individual")}
          className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
            activeTab === "individual"
              ? "bg-white shadow text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Individual Ledger
        </button>
        <button
          onClick={() => setActiveTab("party")}
          className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
            activeTab === "party"
              ? "bg-white shadow text-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Party / Business
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-gray-50">
              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">
                  {activeTab === "individual" ? "Customer" : "Business"} & ID
                </th>
                <th className="p-4">Service & Vehicle</th>
                <th className="p-4">Tracking (From/To)</th>
                <th className="p-4">Payment & Advance</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 block md:table-row-group">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    No {activeTab} records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`flex flex-col md:table-row transition-colors p-4 md:p-0 mb-4 md:mb-0 border md:border-none rounded-xl md:rounded-none bg-gray-50/30 md:bg-transparent ${
                      activeTab === "individual"
                        ? "hover:bg-blue-50/40"
                        : "hover:bg-orange-50/40"
                    }`}
                  >
                    {/* Column 1: Info */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          {activeTab === "individual" ? "Customer" : "Business"}
                        </span>
                        <div className="text-right md:text-left">
                          <div
                            className={`text-sm font-bold uppercase ${activeTab === "individual" ? "text-gray-800" : "text-orange-700"}`}
                          >
                            {item.partyName || "N/A"}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {activeTab === "individual"
                              ? item.cnic || "---"
                              : item.ntn || "---"}
                          </div>
                          <div className="text-[11px] text-blue-600 font-medium">
                            {item.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Service & Vehicle */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Service
                        </span>
                        <div className="text-right md:text-left">
                          <div className="text-[11px] font-bold text-blue-700 uppercase">
                            {item.serviceType}
                          </div>
                          <div className="text-sm font-semibold text-gray-700 mt-0.5">
                            {item.plate}
                          </div>
                          <div className="text-[10px] text-gray-400 italic">
                            {item.model || "---"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Tracking */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Tracking
                        </span>
                        <div className="text-right md:text-left space-y-1">
                          <div className="text-[10px] flex md:flex-col gap-1">
                            <span className="text-gray-400 font-bold uppercase text-[9px]">
                              From:
                            </span>
                            <span className="text-gray-700">
                              {item.receivedBy || "---"}
                            </span>
                          </div>
                          <div className="text-[10px] flex md:flex-col gap-1 border-t md:border-none pt-1 md:pt-0">
                            <span className="text-gray-400 font-bold uppercase text-[9px]">
                              To:
                            </span>
                            <span className="text-orange-600 font-bold uppercase">
                              {item.handoverTo || "---"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 4: Payment */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Payment
                        </span>
                        <div className="text-right md:text-left space-y-1 ml-auto md:ml-0">
                          <div className="flex flex-col md:items-start items-end gap-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                item.remainingBalance > 0
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {item.remainingBalance > 0
                                ? "● Pending"
                                : "● Cleared"}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            Total:{" "}
                            <span className="font-mono">
                              {Number(item.totalAmount).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-green-600 font-bold">
                            Paid:{" "}
                            <span className="font-mono">
                              {Number(item.advancePaid).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-red-600 border-t pt-0.5">
                            Bal:{" "}
                            <span className="font-mono">
                              {Number(item.remainingBalance).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 5: Actions */}
                    <td className="p-3 md:p-4 block md:table-cell border-t md:border-none mt-2 md:mt-0">
                      <div className="flex gap-2 justify-end md:justify-center">
                        <button
                          onClick={() => onEdit(item.id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Data;
