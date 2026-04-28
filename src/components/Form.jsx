import React, { useState, useEffect } from "react";

const Form = ({ onAddCustomer, editingData, onCancelEdit }) => {
  const initialForm = {
    partyName: "",
    plate: "",
    model: "",
    phone: "",
    cnic: "",
    serviceType: "",
    region: "",
    receivedBy: "",
    handoverTo: "",
    remarks: "",
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
      className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-white border border-gray-100 lg:sticky lg:top-5 h-fit max-h-[90vh] overflow-y-auto"
    >
      <h1
        className={`font-bold text-xl mb-2 ${editingData ? "text-orange-600" : "text-blue-600"}`}
      >
        {editingData ? "Update Entry" : "New Entry"}
      </h1>

      {/* Customer Core Info */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Party Name
        </label>
        <input
          type="text"
          className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-blue-500"
          placeholder="e.g. Al-Madina Motors"
          required
          value={formData.partyName}
          onChange={(e) =>
            setFormData({ ...formData, partyName: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Phone
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none"
            placeholder="03xxxxxxxx"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            CNIC
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none"
            placeholder="17301xxxxxxxx"
            value={formData.cnic}
            onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
          />
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Vehicle No (Plate)
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none"
            placeholder="ISL-786"
            required
            value={formData.plate}
            onChange={(e) =>
              setFormData({ ...formData, plate: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Car Model
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none"
            placeholder="e.g. Civic-2015"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
          />
        </div>
      </div>

      {/* Service & Region */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Service Type
          </label>
          <select
            className="rounded p-2 border border-gray-300 text-sm outline-none bg-white"
            required
            value={formData.serviceType}
            onChange={(e) =>
              setFormData({ ...formData, serviceType: e.target.value })
            }
          >
            <option value="">Select Service</option>
            <option value="New Registration">New Registration</option>
            <option value="Name Transfer">Name Transfer</option>
            <option value="Permit Transfer">Permit Transfer</option>
            <option value="Conversion">Conversion</option>
            <option value="Permit Renewal">Permit Renewal</option>
            <option value="Fitness Renewal">Fitness Renewal</option>
            <option value="Fresh Fitness">Fresh Fitness</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Region
          </label>
          <select
            className="rounded p-2 border border-gray-300 text-sm outline-none bg-white"
            value={formData.region}
            onChange={(e) =>
              setFormData({ ...formData, region: e.target.value })
            }
          >
            <option value="">Select Region</option>
            <option value="Punjab">Punjab</option>
            <option value="Sindh">Sindh</option>
            <option value="KPK">KPK</option>
            <option value="G.B Region">G.B Region</option>
          </select>
        </div>
      </div>

      {/* Process Tracking */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Received From
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none"
            placeholder="Owner Name"
            value={formData.receivedBy}
            onChange={(e) =>
              setFormData({ ...formData, receivedBy: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Handover To
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none"
            placeholder="Agent Name"
            value={formData.handoverTo}
            onChange={(e) =>
              setFormData({ ...formData, handoverTo: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Payment Method
        </label>
        <select
          className="rounded p-2 border border-gray-300 text-sm outline-none bg-white"
          value={formData.bankName}
          onChange={(e) =>
            setFormData({ ...formData, bankName: e.target.value })
          }
        >
          <option value="Cash">Cash</option>
          <option value="Meezan Bank">Meezan Bank</option>
          <option value="HBL">HBL</option>
          <option value="Easypaisa">Easypaisa</option>
          <option value="Jazzcash">Jazzcash</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Remarks
        </label>
        <textarea
          className="rounded p-2 border border-gray-300 text-sm outline-none h-16 resize-none"
          placeholder="Extra details..."
          value={formData.remarks}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
        />
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-blue-800 uppercase">
            Rate (Total)
          </label>
          <input
            type="number"
            className="rounded p-1.5 border border-blue-200 text-sm outline-none"
            value={formData.totalAmount}
            onChange={(e) => handleAmountChange(e, "totalAmount")}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-blue-800 uppercase">
            Advance
          </label>
          <input
            type="number"
            className="rounded p-1.5 border border-blue-200 text-sm outline-none"
            value={formData.advancePaid}
            onChange={(e) => handleAmountChange(e, "advancePaid")}
          />
        </div>
      </div>

      <div className="p-3 bg-gray-800 rounded-lg text-white flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          Baqaya
        </span>
        <span className="text-lg font-mono font-bold text-yellow-400">
          Rs. {formData.remainingBalance.toLocaleString()}
        </span>
      </div>

      <button
        type="submit"
        className={`font-bold rounded-lg py-3 mt-2 transition-all shadow-md active:scale-95 ${
          editingData ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
        }`}
      >
        {editingData ? "Update Record" : "Save to Register"}
      </button>

      {editingData && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="text-xs text-red-500 font-bold py-1 hover:underline"
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
};

export default Form;
