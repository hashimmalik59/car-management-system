import React, { useState, useEffect } from "react";

const serviceOptions = [
  "New Registration",
  "Name Transfer",
  "Permit Transfer",
  "Conversion",
  "Permit Renewel",
  "Fitness Renewel",
  "Fresh Fitness",
];

const bankOptions = [
  "Cash",
  "HBL",
  "UBL",
  "MCB",
  "Allied",
  "Askari",
  "Meezan",
  "Bank Alfalah",
  "Faysal Bank",
  "Standard Chartered",
  "Easypaisa",
  "JazzCash",
  "Others",
];

// ─── Reusable single-vehicle card (party only) ───────────────────────────────
const VehicleCard = ({ vehicle, index, onChange, onRemove, canRemove }) => {
  const handleServiceToggle = (service) => {
    const isSelected = vehicle.serviceType.includes(service);
    const updated = isSelected
      ? vehicle.serviceType.filter((s) => s !== service)
      : [...vehicle.serviceType, service];
    onChange(index, "serviceType", updated);
  };

  return (
    <div className="relative flex flex-col gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Vehicle #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Plate & Model */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Vehicle No
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            placeholder="ISL-786"
            required
            value={vehicle.plate}
            onChange={(e) => onChange(index, "plate", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Model
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            placeholder="Civic-2015"
            value={vehicle.model}
            onChange={(e) => onChange(index, "model", e.target.value)}
          />
        </div>
      </div>

      {/* Services for this vehicle */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Services
        </label>
        <div className="grid grid-cols-2 gap-1.5 bg-white p-2.5 rounded-lg border border-orange-100">
          {serviceOptions.map((service) => (
            <label
              key={service}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 accent-orange-500"
                checked={vehicle.serviceType.includes(service)}
                onChange={() => handleServiceToggle(service)}
              />
              <span className="text-[11px] text-gray-600 group-hover:text-orange-600 transition-colors">
                {service}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────
const Form = ({ onAddCustomer, editingData, onCancelEdit }) => {
  const emptyVehicle = { plate: "", model: "", serviceType: [] };

  const initialForm = {
    type: "individual",
    partyName: "",
    phone: "",
    cnic: "",
    ntn: "",
    // individual-only single vehicle fields
    plate: "",
    model: "",
    serviceType: [],
    // party-only multi-vehicle list
    vehicles: [{ ...emptyVehicle }],
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
      // Make sure older records without vehicles array still work
      setFormData({
        ...editingData,
        vehicles: editingData.vehicles ?? [{ ...emptyVehicle }],
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingData]);

  // ── Individual: service checkbox ──
  const handleServiceChange = (service) => {
    setFormData((prev) => {
      const isSelected = prev.serviceType.includes(service);
      return {
        ...prev,
        serviceType: isSelected
          ? prev.serviceType.filter((s) => s !== service)
          : [...prev.serviceType, service],
      };
    });
  };

  // ── Party: vehicle field update ──
  const handleVehicleChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = prev.vehicles.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v,
      );
      return { ...prev, vehicles: updated };
    });
  };

  const addVehicle = () => {
    setFormData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, { ...emptyVehicle }],
    }));
  };

  const removeVehicle = (idx) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== idx),
    }));
  };

  // ── Amount ──
  const handleAmountChange = (e, field) => {
    const value = Number(e.target.value) || 0;
    const updatedData = { ...formData, [field]: value };
    updatedData.remainingBalance =
      updatedData.totalAmount - updatedData.advancePaid;
    setFormData(updatedData);
  };

  // ── Submit ──
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.type === "individual") {
      if (formData.serviceType.length === 0) {
        alert("Please select at least one service!");
        return;
      }
    } else {
      // Party: every vehicle must have at least one service
      const invalid = formData.vehicles.some(
        (v) => v.serviceType.length === 0 || !v.plate.trim(),
      );
      if (invalid) {
        alert(
          "Har gaadi ka plate no aur kam az kam ek service zaroor fill karein!",
        );
        return;
      }
    }

    onAddCustomer(formData);
    setFormData(initialForm);
  };

  const isParty = formData.type === "party";

  return (
    <div className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-white border border-gray-100 lg:sticky lg:top-5 h-fit max-h-[90vh] overflow-y-auto">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setFormData({ ...initialForm, type: "individual" })}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            !isParty ? "bg-white shadow text-blue-600" : "text-gray-500"
          }`}
        >
          INDIVIDUAL
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...initialForm, type: "party" })}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            isParty ? "bg-white shadow text-orange-600" : "text-gray-500"
          }`}
        >
          PARTY / BUSINESS
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1
          className={`font-bold text-xl ${
            isParty ? "text-orange-600" : "text-blue-600"
          }`}
        >
          {editingData ? "Update" : "New"} {isParty ? "Party" : "Individual"}{" "}
          Entry
        </h1>

        {/* Customer/Party Name */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            {isParty ? "Business / Party Name" : "Customer Name"}
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm focus:border-blue-500 outline-none"
            placeholder={isParty ? "e.g. Al-Madina Motors" : "e.g. Ali Khan"}
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
              {isParty ? "NTN / Reg No" : "CNIC"}
            </label>
            <input
              type="text"
              className="rounded p-2 border border-gray-300 text-sm outline-none"
              placeholder={isParty ? "NTN-786..." : "17301..."}
              value={isParty ? formData.ntn : formData.cnic}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [isParty ? "ntn" : "cnic"]: e.target.value,
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
              placeholder="Receiver name"
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

        {/* ── INDIVIDUAL: single vehicle block (unchanged logic) ── */}
        {!isParty && (
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
        )}

        {/* Region & Bank */}
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

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Payment Method / Bank
            </label>
            <select
              className="rounded p-2 border border-gray-300 text-sm outline-none bg-white"
              value={formData.bankName}
              onChange={(e) =>
                setFormData({ ...formData, bankName: e.target.value })
              }
            >
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          {/* ── INDIVIDUAL: services ── */}
          {!isParty && (
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
          )}
        </div>

        {/* ── PARTY: dynamic multi-vehicle section ── */}
        {isParty && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Vehicles ({formData.vehicles.length})
              </label>
              <button
                type="button"
                onClick={addVehicle}
                className="flex items-center gap-1 text-[11px] font-bold text-orange-600 border border-orange-300 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                + Add Vehicle
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {formData.vehicles.map((vehicle, idx) => (
                <VehicleCard
                  key={idx}
                  index={idx}
                  vehicle={vehicle}
                  onChange={handleVehicleChange}
                  onRemove={removeVehicle}
                  canRemove={formData.vehicles.length > 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div
          className={`grid grid-cols-2 gap-3 p-3 rounded-lg border ${
            isParty
              ? "bg-orange-50 border-orange-100"
              : "bg-blue-50 border-blue-100"
          }`}
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

        {/* Remaining Balance */}
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
            isParty
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-blue-600 hover:bg-blue-700"
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
