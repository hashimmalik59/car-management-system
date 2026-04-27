import React from "react";

const Data = ({
  customerData,
  searchTerm,
  setSearchTerm,
  onDelete,
  onEdit,
}) => {
  return (
    <section className="shadow-2xl w-full rounded-2xl px-6 py-5 flex flex-col gap-5 bg-white">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Customer Ledger</h1>
        <input
          type="search"
          placeholder="Search Name, Plate or Phone..."
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 w-80 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Customer</th>
              <th className="p-4">Vehicle / Bank</th>
              <th className="p-4">Payment Summary</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
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
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-800">
                      {item.firstName} {item.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{item.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium">{item.plate}</div>
                    <div className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold inline-block uppercase">
                      {item.bankName || "N/A"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-[11px] space-y-1">
                      <div className="flex justify-between w-28 text-gray-500">
                        <span>Total:</span> <span>{item.totalAmount}</span>
                      </div>
                      <div className="flex justify-between w-28 text-green-600 font-medium">
                        <span>Paid:</span> <span>{item.advancePaid}</span>
                      </div>
                      <div className="flex justify-between w-28 text-red-600 font-bold border-t pt-0.5">
                        <span>Rem:</span> <span>{item.remainingBalance}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-black uppercase ${item.remainingBalance > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                    >
                      {item.remainingBalance > 0 ? "Pending" : "Cleared"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(item.id)} // ID pass ho rahi hai
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)} // ID pass ho rahi hai
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
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
    </section>
  );
};

export default Data;
