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
            placeholder="Search Name, Plate or Phone..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left">
            <thead className="hidden md:table-header-group bg-gray-50">
              <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Vehicle / Bank</th>
                <th className="p-4">Payment Summary</th>
                <th className="p-4">Status</th>
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
                  /* Mobile: Block layout (Card) | Desktop: Table Row */
                  <tr
                    key={item.id}
                    className="flex flex-col md:table-row hover:bg-blue-50/40 transition-colors p-4 md:p-0 mb-4 md:mb-0 border md:border-none rounded-xl md:rounded-none bg-gray-50/30 md:bg-transparent"
                  >
                    {/* Customer Info */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Customer
                        </span>
                        <div className="text-right md:text-left">
                          <div className="text-sm font-bold text-gray-800">
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle/Bank */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Vehicle
                        </span>
                        <div className="text-right md:text-left">
                          <div className="text-sm font-medium">
                            {item.plate}
                          </div>
                          <div className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">
                            {item.bankName || "Cash"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Payment Summary */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Payment
                        </span>
                        <div className="text-[11px] space-y-0.5 md:space-y-1 w-32 md:w-28 ml-auto md:ml-0">
                          <div className="flex justify-between text-gray-500">
                            <span>Total:</span> <span>{item.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-red-600 font-bold border-t pt-0.5">
                            <span>Rem:</span>{" "}
                            <span>{item.remainingBalance}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-2 md:p-4 block md:table-cell">
                      <div className="flex justify-between md:block items-center">
                        <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">
                          Status
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                            item.remainingBalance > 0
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {item.remainingBalance > 0 ? "Pending" : "Cleared"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 md:p-4 block md:table-cell border-t md:border-none mt-2 md:mt-0">
                      <div className="flex gap-3 justify-end md:justify-center">
                        <button
                          onClick={() => onEdit(item.id)}
                          className="flex-1 md:flex-none px-4 py-2 md:py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="flex-1 md:flex-none px-4 py-2 md:py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
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
