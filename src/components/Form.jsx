import React, { useState, useEffect } from "react";

const serviceOptions = [
  "New Registration",
  "Name Transfer",
  "Permit Transfer",
  "Conversion",
  "Permit Renewal",
  "Fitness Renewal",
  "Fresh Fitness",
  "Token Tax",
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

const regionOptions = [
  { value: "KPK", label: "KPK" },
  { value: "Punjab", label: "Punjab" },
  { value: "Sindh", label: "Sindh" },
  { value: "Gilgit Baltistan", label: "Gilgit Baltistan" },
  { value: "Lasbela", label: "Lasbela" },
  { value: "Quetta", label: "Quetta" },
];

// For individual (no online payment)
const calculateTotalAmount = (prices, commission, advance, regionPrice = 0) => {
  const serviceSum = Object.values(prices || {}).reduce(
    (sum, v) =>
      sum +
      Number(v.regionPrice || 0) +
      Number(v.servicePrice || 0) +
      Number(v.price || 0) +
      Number(v.customPrice || 0),
    0,
  );
  const total = serviceSum + Number(commission || 0) + Number(regionPrice || 0);
  const remaining = Math.max(total - Number(advance || 0), 0);
  return { total, remaining };
};

const VehicleCard = ({ vehicle, index, onChange, onRemove, canRemove }) => {
  const getServicesTotal = (prices) => {
    return Object.values(prices || {}).reduce(
      (sum, val) => sum + (Number(val?.servicePrice) || 0),
      0,
    );
  };

  const computeTotals = (
    servicesTotal,
    regionPrice,
    onlinePayment,
    advance,
  ) => {
    const total = servicesTotal + regionPrice - onlinePayment;
    const remaining = Math.max(total - advance, 0);
    return { total, remaining };
  };

  const currentAdvance = Number(vehicle.vehicleAdvance) || 0;

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

  const handleRegionChange = (regionValue) => {
    const servicesTotal = getServicesTotal(vehicle.servicePrices);
    const onlinePayment = Number(vehicle.onlinePayment) || 0;
    const advance = currentAdvance;
    const newRegionPrice = 0;
    const { total, remaining } = computeTotals(
      servicesTotal,
      newRegionPrice,
      onlinePayment,
      advance,
    );
    onChange(index, "region", regionValue);
    onChange(index, "regionPrice", newRegionPrice);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleRegionPriceChange = (price) => {
    const servicesTotal = getServicesTotal(vehicle.servicePrices);
    const onlinePayment = Number(vehicle.onlinePayment) || 0;
    const advance = currentAdvance;
    const newRegionPrice = Number(price) || 0;
    const { total, remaining } = computeTotals(
      servicesTotal,
      newRegionPrice,
      onlinePayment,
      advance,
    );
    onChange(index, "regionPrice", newRegionPrice);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleServiceToggle = (service) => {
    let updatedServices = [...vehicle.serviceType];
    let updatedPrices = { ...vehicle.servicePrices };
    if (updatedServices.includes(service)) {
      updatedServices = updatedServices.filter((s) => s !== service);
      delete updatedPrices[service];
    } else {
      updatedServices.push(service);
      updatedPrices[service] = { servicePrice: "" };
    }
    const newServicesTotal = getServicesTotal(updatedPrices);
    const regionPrice = Number(vehicle.regionPrice) || 0;
    const onlinePayment = Number(vehicle.onlinePayment) || 0;
    const advance = currentAdvance;
    const { total, remaining } = computeTotals(
      newServicesTotal,
      regionPrice,
      onlinePayment,
      advance,
    );
    onChange(index, "serviceType", updatedServices);
    onChange(index, "servicePrices", updatedPrices);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleServicePriceChange = (service, price) => {
    const servicePrice = Number(price) || 0;
    const updatedPrices = {
      ...vehicle.servicePrices,
      [service]: { servicePrice },
    };
    const newServicesTotal = getServicesTotal(updatedPrices);
    const regionPrice = Number(vehicle.regionPrice) || 0;
    const onlinePayment = Number(vehicle.onlinePayment) || 0;
    const advance = currentAdvance;
    const { total, remaining } = computeTotals(
      newServicesTotal,
      regionPrice,
      onlinePayment,
      advance,
    );
    onChange(index, "servicePrices", updatedPrices);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleOnlinePaymentToggle = () => {
    const newEnabled = !vehicle.onlinePaymentEnabled;
    const servicesTotal = getServicesTotal(vehicle.servicePrices);
    const regionPrice = Number(vehicle.regionPrice) || 0;
    const advance = currentAdvance;
    let newOnlinePayment = vehicle.onlinePayment || 0;
    if (!newEnabled) {
      newOnlinePayment = 0;
    }
    const { total, remaining } = computeTotals(
      servicesTotal,
      regionPrice,
      newOnlinePayment,
      advance,
    );
    onChange(index, "onlinePaymentEnabled", newEnabled);
    onChange(index, "onlinePayment", newOnlinePayment);
    if (!newEnabled) {
      onChange(index, "onlinePaymentNotes", "");
    }
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleOnlinePaymentChange = (price) => {
    const newOnlinePayment = Number(price) || 0;
    const servicesTotal = getServicesTotal(vehicle.servicePrices);
    const regionPrice = Number(vehicle.regionPrice) || 0;
    const advance = currentAdvance;
    const { total, remaining } = computeTotals(
      servicesTotal,
      regionPrice,
      newOnlinePayment,
      advance,
    );
    onChange(index, "onlinePayment", newOnlinePayment);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleOnlinePaymentNotesChange = (notes) => {
    onChange(index, "onlinePaymentNotes", notes);
  };

  return (
    <div className="relative flex flex-col gap-3 p-3 bg-gray-800 border border-gray-700 rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
          Vehicle #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(vehicle.id)}
            className="text-red-400 hover:text-red-300 text-xs font-bold"
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
            className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500 placeholder:text-gray-500"
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
            className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500 placeholder:text-gray-500"
            placeholder="Civic-2015"
            value={vehicle.model}
            onChange={(e) => onChange(index, "model", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Region
        </label>
        <select
          className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500"
          value={vehicle.region || ""}
          onChange={(e) => handleRegionChange(e.target.value)}
        >
          <option value="">Select Region</option>
          {regionOptions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {vehicle.region && (
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Region Custom Price (Rs.)
          </label>
          <input
            type="number"
            className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500"
            value={vehicle.regionPrice === 0 ? "" : vehicle.regionPrice}
            onChange={(e) => handleRegionPriceChange(e.target.value)}
            placeholder="Region price"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Services
        </label>
        <div className="grid grid-cols-2 gap-2 bg-gray-900 p-2.5 rounded-lg border border-gray-700">
          {serviceOptions.map((service) => (
            <div
              key={service}
              className="flex flex-col bg-gray-800 rounded-md p-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-orange-500"
                  checked={vehicle.serviceType.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                />
                <span className="text-[11px] text-gray-200">{service}</span>
              </label>

              {vehicle.serviceType.includes(service) && (
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Service Price"
                    className="w-full rounded p-1.5 border border-gray-600 bg-gray-700 text-gray-200 text-[11px] outline-none placeholder:text-gray-500"
                    value={vehicle.servicePrices?.[service]?.servicePrice || ""}
                    onChange={(e) =>
                      handleServicePriceChange(service, e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        <label className="flex items-center gap-2 cursor-pointer text-green-400">
          <input
            type="checkbox"
            className="w-4 h-4 accent-green-500"
            checked={vehicle.onlinePaymentEnabled || false}
            onChange={handleOnlinePaymentToggle}
          />
          <span className="text-[11px] font-medium">💳 Online Payment</span>
        </label>
        {vehicle.onlinePaymentEnabled && (
          <div className="ml-6 space-y-2">
            <input
              type="number"
              placeholder="Online Payment Custom Price (Rs.)"
              className="w-full rounded p-1.5 border border-gray-600 bg-gray-700 text-gray-200 text-[11px] outline-none placeholder:text-gray-500 focus:border-green-500"
              value={vehicle.onlinePayment === 0 ? "" : vehicle.onlinePayment}
              onChange={(e) => handleOnlinePaymentChange(e.target.value)}
            />
            <textarea
              placeholder="Notes about online payment (e.g., transaction ID, bank name, etc.)"
              className="w-full rounded p-1.5 border border-gray-600 bg-gray-700 text-gray-200 text-[11px] outline-none placeholder:text-gray-500 focus:border-green-500"
              rows="2"
              value={vehicle.onlinePaymentNotes || ""}
              onChange={(e) => handleOnlinePaymentNotesChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {vehicle.serviceType.includes("Conversion") && (
        <div className="flex flex-col bg-gray-700 p-3 rounded-xl border border-gray-600 gap-1 mt-2">
          <label className="text-[10px] font-bold text-orange-400 uppercase">
            Conversion Details (Specify Type)
          </label>
          <input
            type="text"
            required
            placeholder="e.g., 10 wheeler to 6 wheeler"
            value={vehicle.conversionServiceType || ""}
            onChange={(e) =>
              onChange(index, "conversionServiceType", e.target.value)
            }
            className="rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm outline-none focus:border-orange-500 placeholder:text-gray-500"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Total Amount (Rs.)
          </label>
          <input
            type="number"
            readOnly
            className="rounded p-2 border border-gray-600 bg-gray-700 text-gray-200 text-sm outline-none"
            value={vehicle.vehicleTotal ?? ""}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Advance Paid (Rs.)
          </label>
          <input
            type="number"
            className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500"
            value={vehicle.vehicleAdvance || 0}
            onChange={(e) => {
              const advance = Number(e.target.value) || 0;
              const total = Number(vehicle.vehicleTotal) || 0;
              const remaining = Math.max(total - advance, 0);
              onChange(index, "vehicleAdvance", advance);
              onChange(index, "vehicleRemaining", remaining);
            }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded-md">
        <span className="text-[10px] font-bold text-gray-300">
          Remaining for this Vehicle
        </span>
        <span className="text-sm font-bold text-orange-400">
          Rs. {(vehicle.vehicleRemaining || 0).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Token Tax From
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500"
            value={vehicle.tokenTaxFrom || ""}
            onChange={(e) => onChange(index, "tokenTaxFrom", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Token Tax To
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500"
            value={vehicle.tokenTaxTo || ""}
            onChange={(e) => onChange(index, "tokenTaxTo", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Attachment
        </label>
        {!vehicle.attachment ? (
          <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-orange-500 rounded-lg bg-gray-800 cursor-pointer hover:bg-gray-700">
            <span className="text-orange-400 text-lg">📎</span>
            <span className="text-[11px] text-gray-300">Upload Doc/Image</span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-gray-700 border border-gray-600 rounded-lg">
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
            <span className="text-[11px] flex-1 truncate text-gray-200">
              {vehicle.attachment.name}
            </span>
            <button
              type="button"
              onClick={removeAttachment}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-orange-400 uppercase">
          Vehicle Bank Account
        </label>
        <select
          className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500"
          value={vehicle.bankName || "Cash"}
          onChange={(e) => onChange(index, "bankName", e.target.value)}
        >
          {bankOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Remarks
        </label>
        <textarea
          className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-orange-500 placeholder:text-gray-500"
          placeholder="Vehicle remarks..."
          value={vehicle.remarks || ""}
          onChange={(e) => onChange(index, "remarks", e.target.value)}
        />
      </div>
    </div>
  );
};

// ==================== MAIN FORM ====================
const Form = ({ onAddCustomer, editingData, onCancelEdit, user }) => {
  const createEmptyVehicle = () => ({
    plate: "",
    model: "",
    region: "",
    regionPrice: 0,
    conversionServiceType: "",
    serviceType: [],
    servicePrices: {},
    attachment: null,
    vehicleTotal: 0,
    vehicleAdvance: 0,
    vehicleRemaining: 0,
    tokenTaxFrom: "",
    tokenTaxTo: "",
    remarks: "",
    bankName: "Cash",
    onlinePaymentEnabled: false,
    onlinePayment: 0,
    onlinePaymentNotes: "",
  });

  const createInitialForm = () => ({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type: "individual",
    partyName: "",
    phone: "",
    cnic: "",
    ntn: "",
    plate: "",
    model: "",
    region: "",
    regionPrice: 0,
    conversionServiceType: "",
    serviceType: [],
    servicePrices: {},
    attachment: null,
    totalAmount: 0,
    advancePaid: 0,
    remainingBalance: 0,
    vehicles: [{ ...createEmptyVehicle(), id: crypto.randomUUID() }],
    receivedBy: "",
    handoverTo: "",
    bankName: "Cash",
    tokenTaxFrom: "",
    tokenTaxTo: "",
    remarks: "",
  });

  const [formData, setFormData] = useState(createInitialForm());
  const [commissionAmount, setCommissionAmount] = useState(0);

  const handleIndividualAmountChange = (field, value) => {
    const numValue = Number(value) || 0;
    if (field === "advancePaid") {
      const { total, remaining } = calculateTotalAmount(
        formData.servicePrices,
        commissionAmount,
        numValue,
        formData.regionPrice,
      );
      setFormData((prev) => ({
        ...prev,
        advancePaid: numValue,
        totalAmount: total,
        remainingBalance: remaining,
      }));
    }
  };

  const handleIndividualRegionChange = (regionValue) => {
    setFormData((prev) => {
      const servicesTotal = Object.values(prev.servicePrices).reduce(
        (sum, v) => sum + Number(v?.price || 0) + Number(v?.customPrice || 0),
        0,
      );
      const newTotal = servicesTotal + (prev.commissionAmount || 0);
      return {
        ...prev,
        region: regionValue,
        regionPrice: 0,
        totalAmount: newTotal,
        remainingBalance: Math.max(newTotal - (prev.advancePaid || 0), 0),
      };
    });
  };

  const handleIndividualRegionPriceChange = (price) => {
    const regionPrice = Number(price) || 0;
    setFormData((prev) => {
      const servicesTotal = Object.values(prev.servicePrices).reduce(
        (sum, v) => sum + Number(v?.price || 0) + Number(v?.customPrice || 0),
        0,
      );
      const newTotal =
        servicesTotal + regionPrice + (prev.commissionAmount || 0);
      return {
        ...prev,
        regionPrice,
        totalAmount: newTotal,
        remainingBalance: Math.max(newTotal - (prev.advancePaid || 0), 0),
      };
    });
  };

  const handleIndividualServicePriceChange = (service, price) => {
    const servicePrice = Number(price) || 0;
    setFormData((prev) => {
      const updatedPrices = {
        ...prev.servicePrices,
        [service]: { ...prev.servicePrices[service], price: servicePrice },
      };
      const servicesTotal = Object.values(updatedPrices).reduce(
        (sum, v) => sum + Number(v?.price || 0) + Number(v?.customPrice || 0),
        0,
      );
      const newTotal =
        servicesTotal + (prev.regionPrice || 0) + (prev.commissionAmount || 0);
      return {
        ...prev,
        servicePrices: updatedPrices,
        totalAmount: newTotal,
        remainingBalance: Math.max(newTotal - (prev.advancePaid || 0), 0),
      };
    });
  };

  useEffect(() => {
    if (editingData) {
      let normalized = { ...editingData };
      if (editingData?.type === "individual") {
        setCommissionAmount(Number(editingData.commissionAmount || 0));
        const total = Number(editingData.totalAmount ?? 0);
        const advance = Number(editingData.advancePaid ?? 0);
        normalized = {
          ...normalized,
          totalAmount: total,
          advancePaid: advance,
          remainingBalance: Math.max(total - advance, 0),
          tokenTaxFrom: editingData.tokenTaxFrom ?? "",
          tokenTaxTo: editingData.tokenTaxTo ?? "",
          region: editingData.region ?? "",
          regionPrice: editingData.regionPrice ?? 0,
          conversionServiceType: editingData.conversionServiceType ?? "",
        };
      } else {
        setCommissionAmount(0);
        normalized.vehicles = (editingData.vehicles || []).map((v) => ({
          ...createEmptyVehicle(),
          ...v,
          id: v.id || crypto.randomUUID(),
          vehicleRemaining: Math.max(
            (v.vehicleTotal || 0) - (v.vehicleAdvance || 0),
            0,
          ),
          bankName: v.bankName || "Cash",
          region: v.region ?? "",
          regionPrice: v.regionPrice ?? 0,
          conversionServiceType: v.conversionServiceType ?? "",
          onlinePaymentEnabled: v.onlinePaymentEnabled ?? false,
          onlinePayment: v.onlinePayment ?? 0,
          onlinePaymentNotes: v.onlinePaymentNotes ?? "",
        }));
      }
      setFormData(normalized);
    } else {
      setFormData(createInitialForm());
      setCommissionAmount(0);
    }
  }, [editingData]);

  const isParty = formData.type === "party";

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
      vehicles: [
        { ...createEmptyVehicle(), id: crypto.randomUUID() },
        ...prev.vehicles,
      ],
    }));
  };

  const removeVehicle = (idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== idToRemove),
    }));
  };

  const handleSubmit = async (e) => {
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
        alert("Har gaadi ka plate number aur kam az ek service fill karein!");
        return;
      }
    }

    const finalData = {
      ...formData,
      commissionAmount: Number(commissionAmount) || 0,
      userId: user ? user.uid : null,
    };

    const result = await onAddCustomer(finalData);
    if (result && result.success) {
      alert("Record Saved/Updated Successfully!");
      setFormData(createInitialForm());
      setCommissionAmount(0);
      if (onCancelEdit) onCancelEdit();
    } else if (result && !result.success) {
      alert("Database Error: " + result.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-gray-800 border border-gray-700 lg:sticky lg:top-5 h-fit max-h-[90vh] overflow-y-auto">
      <div className="flex bg-gray-700 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...createInitialForm(),
              type: "individual",
              id: prev.id,
            }))
          }
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            !isParty
              ? "bg-gray-800 shadow text-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          INDIVIDUAL
        </button>
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...createInitialForm(),
              type: "party",
              id: prev.id,
            }))
          }
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            isParty
              ? "bg-gray-800 shadow text-orange-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          PARTY / BUSINESS
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1
          className={`font-bold text-xl ${isParty ? "text-orange-400" : "text-blue-400"}`}
        >
          {editingData ? "Update" : "New"} {isParty ? "Party" : "Individual"}{" "}
          Entry
        </h1>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            {isParty ? "Business / Party Name" : "Customer Name"}
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm focus:border-blue-500 outline-none placeholder:text-gray-500"
            placeholder={isParty ? "Al-Madina Motors" : "Ali Khan"}
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
              className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm placeholder:text-gray-500"
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
              className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm placeholder:text-gray-500"
              placeholder={isParty ? "NTN-786" : "17301-12345678"}
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

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Received From
            </label>
            <input
              type="text"
              className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm placeholder:text-gray-500"
              placeholder="Muhammad Ali"
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
              className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm placeholder:text-gray-500"
              placeholder="Ahmad Khan"
              value={formData.handoverTo}
              onChange={(e) =>
                setFormData({ ...formData, handoverTo: e.target.value })
              }
            />
          </div>
        </div>

        {!isParty && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Vehicle No
                </label>
                <input
                  type="text"
                  className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm placeholder:text-gray-500"
                  placeholder="KHI-456"
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
                  className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm placeholder:text-gray-500"
                  placeholder="Civic-2020"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Region
              </label>
              <select
                className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500"
                value={formData.region || ""}
                onChange={(e) => handleIndividualRegionChange(e.target.value)}
              >
                <option value="">Select Region</option>
                {regionOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.region && (
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Region Custom Price (Rs.)
                </label>
                <input
                  type="number"
                  className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500"
                  value={formData.regionPrice === 0 ? "" : formData.regionPrice}
                  onChange={(e) =>
                    handleIndividualRegionPriceChange(e.target.value)
                  }
                  placeholder="Region price"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Services
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-900 p-3 rounded-xl border border-gray-700">
                {serviceOptions.map((s) => (
                  <div
                    key={s}
                    className="flex flex-col bg-gray-800 rounded-md p-2"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-500"
                        checked={formData.serviceType.includes(s)}
                        onChange={() => {
                          setFormData((prev) => {
                            let updatedServices = [...prev.serviceType];
                            let updatedPrices = { ...prev.servicePrices };
                            if (updatedServices.includes(s)) {
                              updatedServices = updatedServices.filter(
                                (x) => x !== s,
                              );
                              delete updatedPrices[s];
                            } else {
                              updatedServices.push(s);
                              updatedPrices[s] = { price: "" };
                            }
                            const servicesTotal = Object.values(
                              updatedPrices,
                            ).reduce(
                              (sum, v) => sum + Number(v?.price || 0),
                              0,
                            );
                            const newTotal =
                              servicesTotal +
                              (prev.regionPrice || 0) +
                              (commissionAmount || 0);
                            return {
                              ...prev,
                              serviceType: updatedServices,
                              servicePrices: updatedPrices,
                              totalAmount: newTotal,
                              remainingBalance: Math.max(
                                newTotal - (prev.advancePaid || 0),
                                0,
                              ),
                            };
                          });
                        }}
                      />
                      <span className="text-[11px] text-gray-200">{s}</span>
                    </label>

                    {formData.serviceType.includes(s) && (
                      <div className="flex flex-col gap-2 mt-2">
                        <input
                          type="number"
                          placeholder="Service Price"
                          className="w-full rounded p-1.5 border border-gray-600 bg-gray-700 text-gray-200 text-[11px] outline-none placeholder:text-gray-500"
                          value={formData.servicePrices?.[s]?.price || ""}
                          onChange={(e) =>
                            handleIndividualServicePriceChange(
                              s,
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {formData.serviceType.includes("Conversion") && (
              <div className="flex flex-col bg-gray-700 p-3 rounded-xl border border-gray-600 gap-1 mb-3">
                <label className="text-[10px] font-bold text-blue-400 uppercase">
                  Conversion Details (Specify Type)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 10 wheeler to 6 wheeler..."
                  value={formData.conversionServiceType || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conversionServiceType: e.target.value,
                    })
                  }
                  className="rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
              </div>
            )}

            <div className="bg-gray-700 rounded-lg border border-gray-600 p-3 space-y-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase">
                Payment Details
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-300 block mb-1">
                  Third-Party Commission (Rs.)
                </label>
                <input
                  type="number"
                  value={commissionAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCommissionAmount(val);
                    const servicesTotal = Object.values(
                      formData.servicePrices,
                    ).reduce((sum, v) => sum + Number(v?.price || 0), 0);
                    const newTotal =
                      servicesTotal + (formData.regionPrice || 0) + val;
                    setFormData((prev) => ({
                      ...prev,
                      commissionAmount: val,
                      totalAmount: newTotal,
                      remainingBalance: Math.max(
                        newTotal - (prev.advancePaid || 0),
                        0,
                      ),
                    }));
                  }}
                  className="rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm w-full outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-300">
                    Total Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={formData.totalAmount ?? ""}
                    className="rounded p-2 border border-gray-600 bg-gray-800 text-gray-300 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-300">
                    Advance Paid (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.advancePaid ?? ""}
                    onChange={(e) =>
                      handleIndividualAmountChange(
                        "advancePaid",
                        e.target.value,
                      )
                    }
                    className="rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm w-full outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between bg-gray-800 px-3 py-2 rounded-md">
                <span className="text-[10px] font-bold text-gray-300">
                  Remaining Balance
                </span>
                <span className="text-base font-bold text-blue-400">
                  Rs. {(formData.remainingBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Token Tax From
                </label>
                <input
                  type="text"
                  className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500"
                  value={formData.tokenTaxFrom || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenTaxFrom: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Token Tax To
                </label>
                <input
                  type="text"
                  className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500"
                  value={formData.tokenTaxTo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenTaxTo: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Attachment
              </label>
              {!formData.attachment ? (
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
                  <span className="text-blue-400 text-lg">📎</span>
                  <span className="text-[11px] text-gray-300">
                    Upload Doc/Image
                  </span>
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
                <div className="flex items-center gap-2 p-2 bg-gray-700 border border-gray-600 rounded-lg">
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
                  <span className="text-[11px] flex-1 truncate text-gray-200">
                    {formData.attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, attachment: null }))
                    }
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {isParty && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between sticky top-0 bg-gray-800 z-10 py-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Vehicles ({formData.vehicles.length})
              </label>
              <button
                type="button"
                onClick={addVehicle}
                className="text-orange-400 font-bold text-sm hover:text-orange-300"
              >
                + Add Vehicle
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-3">
              {formData.vehicles.map((vehicle, idx) => (
                <VehicleCard
                  key={vehicle.id || idx}
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

        {!isParty && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Remarks
            </label>
            <textarea
              className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-500"
              placeholder="Enter remarks..."
              rows={3}
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>
        )}

        <div className="sticky bottom-0 bg-gray-800 pt-3 pb-1 mt-4 border-t border-gray-700 z-10 flex justify-center items-center">
          <button
            type="submit"
            className={`w-64 font-bold rounded-xl py-3 text-white transition-all ${isParty ? "bg-orange-600 hover:bg-orange-500" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {editingData ? "Update Record" : "Save to Khata"}
          </button>
        </div>
        {editingData && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-red-400 text-xs font-bold block mx-auto mt-2 hover:text-red-300"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
};

export default Form;
