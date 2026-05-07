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

// ─── Reusable single-vehicle card with its own Total, Advance, and Remaining ──
const VehicleCard = ({ vehicle, index, onChange, onRemove, canRemove }) => {
  const handleServiceToggle = (service) => {
    const isSelected = vehicle.serviceType.includes(service);
    const updated = isSelected
      ? vehicle.serviceType.filter((s) => s !== service)
      : [...vehicle.serviceType, service];
    onChange(index, "serviceType", updated);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(index, "attachment", {
          file: file,
          name: file.name,
          preview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    onChange(index, "attachment", null);
  };

  // Handle amount changes and auto-calculate remaining for this vehicle
  const handleAmountChange = (field, value) => {
    const numValue = Number(value) || 0;
    onChange(index, field, numValue);

    if (field === "vehicleTotal") {
      const remaining = numValue - (vehicle.vehicleAdvance || 0);
      onChange(index, "vehicleRemaining", remaining);
    } else if (field === "vehicleAdvance") {
      const remaining = (vehicle.vehicleTotal || 0) - numValue;
      onChange(index, "vehicleRemaining", remaining);
    }
  };

  return (
    <div className="relative flex flex-col gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded">
            Vehicle #{index + 1}
          </span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
          >
            ✕ Remove Vehicle
          </button>
        )}
      </div>

      {/* Vehicle Details Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Vehicle No
          </label>
          <input
            type="text"
            className="rounded-lg p-2 border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            placeholder="ISL-786"
            required
            value={vehicle.plate}
            onChange={(e) => onChange(index, "plate", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Model
          </label>
          <input
            type="text"
            className="rounded-lg p-2 border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            placeholder="Civic-2015"
            value={vehicle.model}
            onChange={(e) => onChange(index, "model", e.target.value)}
          />
        </div>
      </div>

      {/* ── Per-Vehicle Amounts (Total, Advance, Remaining) ── */}
      <div className="bg-white rounded-lg border border-orange-100 p-3 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">
          Payment Details for this Vehicle
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-gray-600">
              Total Amount (Rs.)
            </label>
            <input
              type="number"
              className="rounded-lg p-2 border border-gray-200 text-sm outline-none focus:border-orange-400"
              placeholder="0"
              value={vehicle.vehicleTotal || 0}
              onChange={(e) =>
                handleAmountChange("vehicleTotal", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-gray-600">
              Advance Paid (Rs.)
            </label>
            <input
              type="number"
              className="rounded-lg p-2 border border-gray-200 text-sm outline-none focus:border-orange-400"
              placeholder="0"
              value={vehicle.vehicleAdvance || 0}
              onChange={(e) =>
                handleAmountChange("vehicleAdvance", e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
          <span className="text-[10px] font-bold text-gray-600">
            Remaining for this Vehicle
          </span>
          <span className="text-base font-bold text-orange-600">
            Rs. {(vehicle.vehicleRemaining || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Services for this vehicle */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase">
          Services Required
        </label>
        <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-orange-100">
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

      {/* Attachment for this vehicle */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase">
          Attachment (if any)
        </label>
        {!vehicle.attachment ? (
          <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-orange-300 rounded-lg bg-white hover:bg-orange-50 cursor-pointer transition-colors">
            <span className="text-orange-600 text-lg">📎</span>
            <span className="text-[11px] text-gray-600">
              Upload Document / Image
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-white border border-orange-200 rounded-lg">
            {vehicle.attachment.preview &&
            vehicle.attachment.file.type.startsWith("image/") ? (
              <img
                src={vehicle.attachment.preview}
                alt="preview"
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <span className="text-2xl">📄</span>
            )}
            <span className="text-[11px] text-gray-700 flex-1 truncate">
              {vehicle.attachment.name}
            </span>
            <button
              type="button"
              onClick={removeAttachment}
              className="text-red-500 hover:text-red-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────
const Form = ({ onAddCustomer, editingData, onCancelEdit }) => {
  const emptyVehicle = {
    plate: "",
    model: "",
    serviceType: [],
    attachment: null,
    vehicleTotal: 0,
    vehicleAdvance: 0,
    vehicleRemaining: 0,
  };

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
    attachment: null,
    indTotal: 0,
    indAdvance: 0,
    indRemaining: 0,
    // party-only multi-vehicle list (each vehicle has its own amounts)
    vehicles: [{ ...emptyVehicle }],
    region: "",
    receivedBy: "",
    handoverTo: "",
    remarks: "",
    bankName: "Cash",
    // Optional overall summary (can be used for global reference)
    totalAmount: 0,
    advancePaid: 0,
    remainingBalance: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingData) {
      // Ensure each vehicle has the amount fields (backward compatibility)
      const vehiclesWithAmounts = (
        editingData.vehicles || [{ ...emptyVehicle }]
      ).map((v) => ({
        ...emptyVehicle,
        ...v,
        vehicleTotal: v.vehicleTotal || 0,
        vehicleAdvance: v.vehicleAdvance || 0,
        vehicleRemaining: v.vehicleRemaining || 0,
      }));
      setFormData({
        ...editingData,
        vehicles: vehiclesWithAmounts,
        attachment: editingData.attachment ?? null,
        indTotal: editingData.indTotal || 0,
        indAdvance: editingData.indAdvance || 0,
        indRemaining: editingData.indRemaining || 0,
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

  // ── Individual: attachment handling ──
  const handleIndividualFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          attachment: {
            file: file,
            name: file.name,
            preview: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIndividualAttachment = () => {
    setFormData((prev) => ({ ...prev, attachment: null }));
  };

  // Individual amount changes with remaining calculation
  const handleIndividualAmountChange = (field, value) => {
    const numValue = Number(value) || 0;
    setFormData((prev) => {
      let updated = { ...prev, [field]: numValue };
      if (field === "indTotal") {
        updated.indRemaining = numValue - prev.indAdvance;
      } else if (field === "indAdvance") {
        updated.indRemaining = prev.indTotal - numValue;
      }
      return updated;
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

  // Calculate overall totals from all vehicles (for display only)
  const calculateOverallTotals = () => {
    let totalAll = 0;
    let advanceAll = 0;
    let remainingAll = 0;
    formData.vehicles.forEach((vehicle) => {
      totalAll += vehicle.vehicleTotal || 0;
      advanceAll += vehicle.vehicleAdvance || 0;
      remainingAll += vehicle.vehicleRemaining || 0;
    });
    return { totalAll, advanceAll, remainingAll };
  };

  const { totalAll, advanceAll, remainingAll } = calculateOverallTotals();

  // ── Overall Amount change (manual override) ──
  const handleOverallAmountChange = (e, field) => {
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
      // Party: every vehicle must have at least one service and plate number
      const invalid = formData.vehicles.some(
        (v) => v.serviceType.length === 0 || !v.plate.trim(),
      );
      if (invalid) {
        alert(
          "Har gaadi ka plate number aur kam az kam ek service zaroor fill karein!",
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
            className="rounded-lg p-2 border border-gray-300 text-sm focus:border-blue-500 outline-none"
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
              className="rounded-lg p-2 border border-gray-300 text-sm outline-none"
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
              className="rounded-lg p-2 border border-gray-300 text-sm outline-none"
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
              className="rounded-lg p-2 border border-gray-300 text-sm outline-none focus:border-blue-500"
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
              className="rounded-lg p-2 border border-gray-300 text-sm outline-none focus:border-blue-500"
              placeholder="Handover name"
              value={formData.handoverTo}
              onChange={(e) =>
                setFormData({ ...formData, handoverTo: e.target.value })
              }
            />
          </div>
        </div>

        {/* ── INDIVIDUAL SECTION ── */}
        {!isParty && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Vehicle No
                </label>
                <input
                  type="text"
                  className="rounded-lg p-2 border border-gray-300 text-sm outline-none"
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
                  className="rounded-lg p-2 border border-gray-300 text-sm outline-none"
                  placeholder="Civic-2015"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Individual Amounts */}
            <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 space-y-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase">
                Payment Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-gray-600">
                    Total Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    className="rounded-lg p-2 border border-gray-200 text-sm outline-none"
                    value={formData.indTotal}
                    onChange={(e) =>
                      handleIndividualAmountChange("indTotal", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-gray-600">
                    Advance Paid (Rs.)
                  </label>
                  <input
                    type="number"
                    className="rounded-lg p-2 border border-gray-200 text-sm outline-none"
                    value={formData.indAdvance}
                    onChange={(e) =>
                      handleIndividualAmountChange("indAdvance", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex justify-between items-center bg-white px-3 py-2 rounded-md">
                <span className="text-[10px] font-bold text-gray-600">
                  Remaining Balance
                </span>
                <span className="text-base font-bold text-blue-600">
                  Rs. {(formData.indRemaining || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Region & Bank */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Region
            </label>
            <select
              className="rounded-lg p-2 border border-gray-300 text-sm outline-none bg-white"
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
              className="rounded-lg p-2 border border-gray-300 text-sm outline-none bg-white"
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

          {/* ── INDIVIDUAL: attachment ── */}
          {!isParty && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Attachment
              </label>
              {!formData.attachment ? (
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
                  <span className="text-blue-600 text-lg">📎</span>
                  <span className="text-[11px] text-gray-600">
                    Upload Doc/Image
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleIndividualFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-white border border-blue-200 rounded-lg">
                  {formData.attachment.preview &&
                  formData.attachment.file.type.startsWith("image/") ? (
                    <img
                      src={formData.attachment.preview}
                      alt="preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <span className="text-2xl">📄</span>
                  )}
                  <span className="text-[11px] text-gray-700 flex-1 truncate">
                    {formData.attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeIndividualAttachment}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PARTY: dynamic multi-vehicle section (each vehicle has its own amounts) ── */}
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

            <div className="flex flex-col gap-4">
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

            {/* Party Overall Summary (auto-calculated from all vehicles) */}
            <div className="bg-orange-100 rounded-lg p-3 mt-2">
              <div className="text-[10px] font-bold text-gray-600 uppercase mb-2">
                Party Total Summary
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Total All Vehicles:</span>
                  <div className="font-bold text-orange-700">
                    Rs. {totalAll.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Advance:</span>
                  <div className="font-bold text-green-700">
                    Rs. {advanceAll.toLocaleString()}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Total Remaining:</span>
                  <div className="font-bold text-red-600 text-base">
                    Rs. {remainingAll.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optional Manual Overall Summary (can be used as override) */}
        {!isParty && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-blue-50 border-blue-100">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase">
                Overall Total (Optional)
              </label>
              <input
                type="number"
                className="rounded p-1.5 border border-gray-200 text-sm outline-none"
                value={formData.totalAmount}
                onChange={(e) => handleOverallAmountChange(e, "totalAmount")}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase">
                Overall Advance (Optional)
              </label>
              <input
                type="number"
                className="rounded p-1.5 border border-gray-200 text-sm outline-none"
                value={formData.advancePaid}
                onChange={(e) => handleOverallAmountChange(e, "advancePaid")}
              />
            </div>
          </div>
        )}

        {/* Overall Remaining Balance (manual) */}
        {!isParty && (
          <div className="p-3 bg-gray-900 rounded-lg text-white flex justify-between items-center shadow-md">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Overall Remaining
            </span>
            <span className="text-lg font-mono font-bold text-yellow-400">
              Rs. {formData.remainingBalance.toLocaleString()}
            </span>
          </div>
        )}

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
