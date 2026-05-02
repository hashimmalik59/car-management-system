import React, { useState, useEffect } from "react";

const Form = ({ onAddCustomer, editingData, onCancelEdit }) => {
  const initialForm = {
    type: "individual",
    partyName: "",
    phone: "",
    cnic: "",
    ntn: "",
    plate: "",
    model: "",
    serviceType: [], // Changed to Array for multiple selection
    region: "",
    receivedBy: "",
    handoverTo: "",
    remarks: "",
    bankName: "Cash",
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

  // Handle Checkbox Toggling
  const handleServiceChange = (service) => {
    setFormData((prev) => {
      const isSelected = prev.serviceType.includes(service);
      const updatedServices = isSelected
        ? prev.serviceType.filter((s) => s !== service)
        : [...prev.serviceType, service];

      return { ...prev, serviceType: updatedServices };
    });
  };

  const handleAmountChange = (e, field) => {
    const value = Number(e.target.value) || 0;
    const updatedData = { ...formData, [field]: value };
    updatedData.remainingBalance =
      updatedData.totalAmount - updatedData.advancePaid;
    setFormData(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.serviceType.length === 0) {
      alert("Please select at least one service!");
      return;
    }
    onAddCustomer(formData);
    setFormData(initialForm);
  };

  const serviceOptions = [
    "New Registration",
    "Name Transfer",
    "Permit Transfer",
    "Conversion",
    "Permit Renewel",
    "Fitness Renewel",
    "Fresh Fitness",
  ];

  return (
    <div className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-white border border-gray-100 lg:sticky lg:top-5 h-fit max-h-[90vh] overflow-y-auto">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setFormData({ ...initialForm, type: "individual" })}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${formData.type === "individual" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
        >
          INDIVIDUAL
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...initialForm, type: "party" })}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${formData.type === "party" ? "bg-white shadow text-orange-600" : "text-gray-500"}`}
        >
          PARTY / BUSINESS
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1
          className={`font-bold text-xl ${formData.type === "individual" ? "text-blue-600" : "text-orange-600"}`}
        >
          {editingData ? "Update" : "New"}{" "}
          {formData.type === "individual" ? "Individual" : "Party"} Entry
        </h1>

        {/* Customer/Party Name */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            {formData.type === "individual"
              ? "Customer Name"
              : "Business / Party Name"}
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm focus:border-blue-500 outline-none"
            placeholder={
              formData.type === "individual"
                ? "e.g. Ali Khan"
                : "e.g. Al-Madina Motors"
            }
            required
            value={formData.partyName}
            onChange={(e) =>
              setFormData({ ...formData, partyName: e.target.value })
            }
          />
        </div>

        {/* Contact & Identity */}
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
              {formData.type === "individual" ? "CNIC" : "NTN / Reg No"}
            </label>
            <input
              type="text"
              className="rounded p-2 border border-gray-300 text-sm outline-none"
              placeholder={
                formData.type === "individual" ? "17301..." : "NTN-786..."
              }
              value={
                formData.type === "individual" ? formData.cnic : formData.ntn
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [formData.type === "individual" ? "cnic" : "ntn"]:
                    e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Handover Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Received From
            </label>
            <input
              type="text"
              className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-blue-500"
              placeholder="Reciever name"
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
              className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-blue-500"
              placeholder="Handover name"
              value={formData.handoverTo}
              onChange={(e) =>
                setFormData({ ...formData, handoverTo: e.target.value })
              }
            />
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Vehicle No
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
              Model
            </label>
            <input
              type="text"
              className="rounded p-2 border border-gray-300 text-sm outline-none"
              placeholder="Civic-2015"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
            />
          </div>
        </div>

        {/* Region & Services */}
        <div className="flex flex-col gap-3">
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
              <option value="KPK">KPK</option>
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="Gilgit Baltistan">Gilgit Baltistan</option>
              <option value="Lasbela">Lasbela</option>
              <option value="Quetta">Quetta</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Services (Select Multiple)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
              {serviceOptions.map((service) => (
                <label
                  key={service}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.serviceType.includes(service)}
                    onChange={() => handleServiceChange(service)}
                  />
                  <span className="text-[11px] text-gray-600 group-hover:text-blue-600 transition-colors">
                    {service}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div
          className={`grid grid-cols-2 gap-3 p-3 rounded-lg border ${formData.type === "individual" ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}
        >
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase">
              Total Rate
            </label>
            <input
              type="number"
              className="rounded p-1.5 border border-gray-200 text-sm outline-none"
              value={formData.totalAmount}
              onChange={(e) => handleAmountChange(e, "totalAmount")}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase">Advance</label>
            <input
              type="number"
              className="rounded p-1.5 border border-gray-200 text-sm outline-none"
              value={formData.advancePaid}
              onChange={(e) => handleAmountChange(e, "advancePaid")}
            />
          </div>
        </div>

        {/* Baqaya Display */}
        <div className="p-3 bg-gray-900 rounded-lg text-white flex justify-between items-center shadow-md">
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            Remaining Balance
          </span>
          <span className="text-lg font-mono font-bold text-yellow-400">
            Rs. {formData.remainingBalance.toLocaleString()}
          </span>
        </div>

        <button
          type="submit"
          className={`font-bold rounded-xl py-4 mt-2 transition-all shadow-lg active:scale-95 text-white ${
            formData.type === "individual"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {editingData ? "Update Record" : "Save to Khata"}
        </button>

        {editingData && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-red-500 font-bold hover:underline self-center"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
};

export default Form;
