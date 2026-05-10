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

// Vehicle Card for Party
const VehicleCard = ({ vehicle, index, onChange, onRemove, canRemove }) => {
  const handleServiceToggle = (service) => {
    const updated = vehicle.serviceType.includes(service)
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
          file,
          name: file.name,
          preview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => onChange(index, "attachment", null);

  const handleAmountChange = (field, value) => {
    const numValue = Number(value) || 0;
    onChange(index, field, numValue);

    if (field === "vehicleTotal") {
      onChange(
        index,
        "vehicleRemaining",
        numValue - (vehicle.vehicleAdvance || 0),
      );
    } else if (field === "vehicleAdvance") {
      onChange(
        index,
        "vehicleRemaining",
        (vehicle.vehicleTotal || 0) - numValue,
      );
    }
  };

  return (
    <div className="relative flex flex-col gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Vehicle #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 text-xs font-bold"
          >
            ✕ Remove
          </button>
        )}
      </div>

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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Total Amount (Rs.)
          </label>
          <input
            type="number"
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            value={vehicle.vehicleTotal || 0}
            onChange={(e) => handleAmountChange("vehicleTotal", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Advance Paid (Rs.)
          </label>
          <input
            type="number"
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            value={vehicle.vehicleAdvance || 0}
            onChange={(e) =>
              handleAmountChange("vehicleAdvance", e.target.value)
            }
          />
        </div>
      </div>

      <div className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md">
        <span className="text-[10px] font-bold text-gray-600">
          Remaining for this Vehicle
        </span>
        <span className="text-sm font-bold text-orange-600">
          Rs. {(vehicle.vehicleRemaining || 0).toLocaleString()}
        </span>
      </div>

      {/* Services */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Services
        </label>
        <div className="grid grid-cols-2 gap-1.5 bg-white p-2.5 rounded-lg border border-orange-100">
          {serviceOptions.map((service) => (
            <label
              key={service}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-500"
                checked={vehicle.serviceType.includes(service)}
                onChange={() => handleServiceToggle(service)}
              />
              <span className="text-[11px]">{service}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Attachment */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Attachment
        </label>
        {!vehicle.attachment ? (
          <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-orange-300 rounded-lg bg-white cursor-pointer hover:bg-orange-50">
            <span className="text-orange-600 text-lg">📎</span>
            <span className="text-[11px]">Upload Doc/Image</span>
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
            vehicle.attachment?.file?.type?.startsWith("image/") ? (
              <img
                src={vehicle.attachment.preview}
                alt="preview"
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <span className="text-2xl">📄</span>
            )}
            <span className="text-[11px] flex-1 truncate">
              {vehicle.attachment.name}
            </span>
            <button
              type="button"
              onClick={removeAttachment}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Token Tax */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Token Tax From
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            value={vehicle.tokenTaxFrom || ""}
            onChange={(e) => onChange(index, "tokenTaxFrom", e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Token Tax To
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            value={vehicle.tokenTaxTo || ""}
            onChange={(e) => onChange(index, "tokenTaxTo", e.target.value)}
          />
        </div>
      </div>

      {/* Remarks */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-500 uppercase">
          Remarks
        </label>
        <textarea
          className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
          placeholder="Vehicle remarks..."
          value={vehicle.remarks || ""}
          onChange={(e) => onChange(index, "remarks", e.target.value)}
        />
      </div>
    </div>
  );
};

// ==================== MAIN FORM ====================
const Form = ({ onAddCustomer, editingData, onCancelEdit }) => {
  const emptyVehicle = {
    plate: "",
    model: "",
    serviceType: [],
    attachment: null,
    vehicleTotal: 0,
    vehicleAdvance: 0,
    vehicleRemaining: 0,

    // ✅ NEW: Individual Token Tax
    tokenTaxFrom: "",
    tokenTaxTo: "",

    // New remarks
    remarks: "",
  };

  const initialForm = {
    id: Date.now(),
    type: "individual",
    partyName: "",
    phone: "",
    cnic: "",
    ntn: "",
    plate: "",
    model: "",
    serviceType: [],
    attachment: null,
    totalAmount: 0,
    advancePaid: 0,
    remainingBalance: 0,
    vehicles: [{ ...emptyVehicle }],
    region: "",
    receivedBy: "",
    handoverTo: "",
    bankName: "Cash",
    date: new Date().toISOString(),

    // ✅ NEW: Individual Token Tax
    tokenTaxFrom: "",
    tokenTaxTo: "",

    // New: remarks
    remarks: "",
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingData) {
      let normalized = { ...editingData };

      if (editingData.type === "individual") {
        normalized.totalAmount =
          editingData.totalAmount || editingData.indTotal || 0;
        normalized.advancePaid =
          editingData.advancePaid || editingData.indAdvance || 0;
        normalized.remainingBalance =
          editingData.remainingBalance || editingData.indRemaining || 0;
        normalized.tokenTaxFrom = normalized.tokenTaxFrom =
          editingData.tokenTaxFrom || "";
        normalized.tokenTaxTo = editingData.tokenTaxTo || "";
      } else {
        normalized.vehicles = (editingData.vehicles || []).map((v) => ({
          ...emptyVehicle,
          ...v,
          vehicleRemaining: (v.vehicleTotal || 0) - (v.vehicleAdvance || 0),
        }));
      }
      setFormData(normalized);
    } else {
      setFormData(initialForm);
    }
  }, [editingData]);

  const isParty = formData.type === "party";

  // Individual Handlers
  const handleIndividualAmountChange = (field, value) => {
    const num = Number(value) || 0;
    setFormData((prev) => {
      let updated = { ...prev, [field]: num };
      if (field === "totalAmount")
        updated.remainingBalance = num - prev.advancePaid;
      if (field === "advancePaid")
        updated.remainingBalance = prev.totalAmount - num;
      return updated;
    });
  };

  const handleVehicleChange = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v,
      ),
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.type === "individual") {
      if (formData.serviceType.length === 0) {
        alert("Please select at least one service!");
        return;
      }
    } else {
      const invalid = formData.vehicles.some(
        (v) => !v.plate?.trim() || v.serviceType.length === 0,
      );
      if (invalid) {
        alert(
          "Har gaadi ka plate number aur kam az kam ek service fill karein!",
        );
        return;
      }
    }

    onAddCustomer(formData);
    setFormData(initialForm);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-white border border-gray-100 lg:sticky lg:top-5 h-fit max-h-[90vh] overflow-y-auto">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setFormData({ ...initialForm, type: "individual" })}
          className={`flex-1 py-2 rounded-lg font-bold text-xs ${!isParty ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
        >
          INDIVIDUAL
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...initialForm, type: "party" })}
          className={`flex-1 py-2 rounded-lg font-bold text-xs ${isParty ? "bg-white shadow text-orange-600" : "text-gray-500"}`}
        >
          PARTY / BUSINESS
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1
          className={`font-bold text-xl ${isParty ? "text-orange-600" : "text-blue-600"}`}
        >
          {editingData ? "Update" : "New"} {isParty ? "Party" : "Individual"}{" "}
          Entry
        </h1>

        {/* Party / Customer Name */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            {isParty ? "Business / Party Name" : "Customer Name"}
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm focus:border-blue-500 outline-none"
            placeholder={isParty ? "Al-Madina Motors" : "Ali Khan"}
            required
            value={formData.partyName}
            onChange={(e) =>
              setFormData({ ...formData, partyName: e.target.value })
            }
          />
        </div>

        {/* Contact & ID */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Phone
            </label>
            <input
              type="text"
              className="rounded p-2 border border-gray-300 text-sm"
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
              className="rounded p-2 border border-gray-300 text-sm"
              placeholder={isParty ? "NTN-786" : "17301-"}
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

        {/* Received & Handover */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Received From
            </label>
            <input
              type="text"
              className="rounded p-2 border border-gray-300 text-sm"
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
              className="rounded p-2 border border-gray-300 text-sm"
              value={formData.handoverTo}
              onChange={(e) =>
                setFormData({ ...formData, handoverTo: e.target.value })
              }
            />
          </div>
        </div>

        {/* Individual Vehicle Info */}
        {!isParty && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Vehicle No
              </label>
              <input
                type="text"
                className="rounded p-2 border border-gray-300 text-sm"
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
                className="rounded p-2 border border-gray-300 text-sm"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* Region & Bank */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Region
            </label>
            <select
              className="rounded p-2 border border-gray-300 text-sm bg-white"
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
              Payment Method
            </label>
            <select
              className="rounded p-2 border border-gray-300 text-sm bg-white"
              value={formData.bankName}
              onChange={(e) =>
                setFormData({ ...formData, bankName: e.target.value })
              }
            >
              {bankOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Individual Services & Attachment */}
        {!isParty && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Services
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {serviceOptions.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.serviceType.includes(s)}
                      onChange={() => {
                        setFormData((prev) => ({
                          ...prev,
                          serviceType: prev.serviceType.includes(s)
                            ? prev.serviceType.filter((x) => x !== s)
                            : [...prev.serviceType, s],
                        }));
                      }}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-[11px]">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Individual Attachment */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Attachment
              </label>
              {!formData.attachment ? (
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
                  <span className="text-blue-600 text-lg">📎</span>
                  <span className="text-[11px]">Upload Doc/Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setFormData((prev) => ({
                            ...prev,
                            attachment: {
                              file,
                              name: file.name,
                              preview: reader.result,
                            },
                          }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-white border border-blue-200 rounded-lg">
                  {formData.attachment?.preview &&
                  formData.attachment?.file?.type?.startsWith("image/") ? (
                    <img
                      src={formData.attachment.preview}
                      className="w-10 h-10 object-cover rounded"
                      alt="preview"
                    />
                  ) : (
                    <span className="text-2xl">📄</span>
                  )}
                  <span className="text-[11px] flex-1 truncate">
                    {formData.attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, attachment: null }))
                    }
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Individual Payment Section */}
        {!isParty && (
          <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase">
              Payment Details
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-600">
                  Total Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    handleIndividualAmountChange("totalAmount", e.target.value)
                  }
                  className="rounded p-2 border border-gray-200 text-sm w-full bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-600">
                  Advance Paid (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.advancePaid}
                  onChange={(e) =>
                    handleIndividualAmountChange("advancePaid", e.target.value)
                  }
                  className="rounded p-2 border border-gray-200 text-sm w-full bg-white"
                />
              </div>
            </div>
            <div className="flex justify-between bg-white px-3 py-2 rounded-md">
              <span className="text-[10px] font-bold text-gray-600">
                Remaining Balance
              </span>
              <span className="text-base font-bold text-blue-600">
                Rs. {(formData.remainingBalance || 0).toLocaleString()}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 space-y-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase">
                Token Tax Details
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-gray-600">
                    From
                  </label>
                  <input
                    type="number"
                    value={formData.tokenTaxFrom}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tokenTaxFrom: e.target.value,
                      }))
                    }
                    className="rounded p-2 border border-gray-200 text-sm w-full bg-white"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-gray-600">
                    To
                  </label>
                  <input
                    type="number"
                    value={formData.tokenTaxTo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tokenTaxTo: e.target.value,
                      }))
                    }
                    className="rounded p-2 border border-gray-200 text-sm w-full bg-white"
                  />
                </div>
              </div>
            </div>

            {/*  Remarks field */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Remarks
              </label>

              <textarea
                className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-blue-400"
                placeholder="Customer remarks..."
                value={formData.remarks || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* Party Vehicles */}
        {isParty && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Vehicles ({formData.vehicles.length})
              </label>
              <button
                type="button"
                onClick={addVehicle}
                className="text-orange-600 font-bold text-sm"
              >
                + Add Vehicle
              </button>
            </div>
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
        )}

        <button
          type="submit"
          className={`font-bold rounded-xl py-4 text-white ${isParty ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {editingData ? "Update Record" : "Save to Khata"}
        </button>

        {editingData && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-red-500 text-xs font-bold self-center"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
};

export default Form;
