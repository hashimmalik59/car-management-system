import React from "react";

const Data = ({
  customerData,
  searchTerm,
  setSearchTerm,
  onDelete,
  onEdit,
}) => {
  return (
    <section className="shadow-xl md:shadow-2xl w-full rounded-2xl px-4 md:px-6 py-5 flex flex-col gap-5 bg-white border border-gray-100">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Customer Ledger
        </h1>
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

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-gray-50">
              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Customer & CNIC</th>
                <th className="p-4">Service & Vehicle</th>
                <th className="p-4">Tracking</th>
                <th className="p-4">Payment & Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 block md:table-row-group">
              {customerData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                customerData.map((item) => (
                  <tr
                    key={item.id}
                    className="flex flex-col md:table-row hover:bg-blue-50/40 transition-colors p-4 md:p-0 mb-4 md:mb-0 border md:border-none rounded-xl md:rounded-none bg-gray-50/30 md:bg-transparent"
                  >
                    {/* Column 1: Party Info */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Customer
                        </span>
                        <div className="text-right md:text-left">
                          <div className="text-sm font-bold text-gray-800 uppercase">
                            {item.partyName || "N/A"}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            ID: {item.cnic || "---"}
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
                            Model: {item.model || "---"}
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
                          <div className="text-[10px]">
                            <span className="text-gray-400 font-bold">
                              From:
                            </span>{" "}
                            {item.receivedBy || "---"}
                          </div>
                          <div className="text-[10px]">
                            <span className="text-gray-400 font-bold">To:</span>{" "}
                            <span className="text-orange-600 font-bold">
                              {item.handoverTo || "---"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 4: Payment & STATUS MERGED */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Payment
                        </span>
                        <div className="text-right md:text-left space-y-1 ml-auto md:ml-0">
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
                          <div className="text-[11px] font-medium text-gray-500">
                            Rate: {Number(item.totalAmount).toLocaleString()}
                          </div>
                          <div className="text-[11px] font-bold text-red-600">
                            Rem:{" "}
                            {Number(item.remainingBalance).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 5: Actions (Clean) */}
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
