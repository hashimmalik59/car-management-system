import React, { useState, useEffect } from "react";

const Form = ({ onAddCustomer, editingData }) => {
  const initialForm = {
    firstName: "",
    lastName: "",
    plate: "",
    model: "",
    phone: "",
    bankName: "",
    totalAmount: 0,
    advancePaid: 0,
    remainingBalance: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingData) {
      setFormData(editingData);
    } else {
      setFormData(initialForm);
    }
  }, [editingData]);

  const handleAmountChange = (e, field) => {
    const value = Number(e.target.value) || 0;
    const updatedData = { ...formData, [field]: value };
    updatedData.remainingBalance =
      updatedData.totalAmount - updatedData.advancePaid;
    setFormData(updatedData);
  };

  function handleSubmit(e) {
    e.preventDefault();
    onAddCustomer(formData);
    setFormData(initialForm);
  }

  return (
    <form
      onSubmit={handleSubmit}
      /* CHANGE: w-full for mobile, lg:w-full (kyunke parent Main.jsx isay handle kar raha hai) 
         lg:sticky sirf bari screen par rakha hai
      */
      className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl md:shadow-2xl rounded-2xl bg-white border border-gray-100 lg:sticky lg:top-5 h-fit"
    >
      <h1
        className={`font-bold text-xl md:text-2xl mb-2 ${
          editingData ? "text-orange-600" : "text-blue-600"
        }`}
      >
        {editingData ? "Update Entry 🔄" : "New Entry 📝"}
      </h1>

      {/* Grid: Mobile par 1 column (stack), tablet/desktop par 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600">
            First Name
          </label>
          <input
            type="text"
            className="rounded p-2.5 border border-gray-300 text-sm focus:border-blue-500 outline-none"
            placeholder="Hashim"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600">
            Last Name
          </label>
          <input
            type="text"
            className="rounded p-2.5 border border-gray-300 text-sm focus:border-blue-500 outline-none"
            placeholder="Malik"
            required
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-600">Phone</label>
        <input
          type="text"
          className="rounded p-2.5 border border-gray-300 text-sm focus:border-blue-500 outline-none"
          placeholder="0318xxxxxxx"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600">
            Car Model
          </label>
          <input
            type="text"
            className="rounded p-2.5 border border-gray-300 text-sm focus:border-blue-500 outline-none"
            placeholder="Civic-2022"
            required
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600">
            Plate No
          </label>
          <input
            type="text"
            className="rounded p-2.5 border border-gray-300 text-sm focus:border-blue-500 outline-none"
            placeholder="LHR-205"
            required
            value={formData.plate}
            onChange={(e) =>
              setFormData({ ...formData, plate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-600">Bank Name</label>
        <select
          className="rounded p-2.5 border border-gray-300 text-sm focus:border-blue-500 outline-none bg-white"
          value={formData.bankName}
          onChange={(e) =>
            setFormData({ ...formData, bankName: e.target.value })
          }
        >
          <option value="">Select Bank</option>
          <option value="Meezan Bank">Meezan Bank</option>
          <option value="HBL">HBL</option>
          <option value="UBL">UBL</option>
          <option value="Cash">Cash</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100">
        <div className="flex flex-col">
          <label className="text-[10px] md:text-xs font-bold text-blue-800 uppercase">
            Total
          </label>
          <input
            type="number"
            className="rounded p-2 border border-blue-200 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
            value={formData.totalAmount}
            onChange={(e) => handleAmountChange(e, "totalAmount")}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] md:text-xs font-bold text-blue-800 uppercase">
            Advance
          </label>
          <input
            type="number"
            className="rounded p-2 border border-blue-200 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
            value={formData.advancePaid}
            onChange={(e) => handleAmountChange(e, "advancePaid")}
          />
        </div>
      </div>

      <div className="p-3 md:p-4 bg-gray-800 rounded-lg text-white flex justify-between items-center shadow-inner">
        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
          Baqaya
        </span>
        <span className="text-base md:text-lg font-mono font-bold text-yellow-400">
          Rs. {formData.remainingBalance.toLocaleString()}
        </span>
      </div>

      <button
        type="submit"
        className={`font-bold rounded-lg py-3 mt-2 transition-all shadow-md active:scale-95 text-sm md:text-base ${
          editingData
            ? "bg-orange-500 hover:bg-orange-600 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {editingData ? "Save Changes" : "Add Record"}
      </button>

      {editingData && (
        <button
          type="button"
          onClick={() => onAddCustomer(null)}
          className="text-xs text-gray-500 hover:text-red-500 py-1 transition-colors"
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
};

export default Form;
