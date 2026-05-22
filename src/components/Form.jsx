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

// 🆕 Region options with city PRICE field (like services)
const regionOptions = [
  { value: "", label: "Select Region" },
  { value: "KPK", label: "KPK" },
  { value: "Punjab", label: "Punjab" },
  { value: "Sindh", label: "Sindh" },
  { value: "Gilgit Baltistan", label: "Gilgit Baltistan" },
  { value: "Lasbela", label: "Lasbela" },
  { value: "Quetta", label: "Quetta" },
];

// Vehicle Card for Party
const VehicleCard = ({ vehicle, index, onChange, onRemove, canRemove }) => {
  const getTotal = (prices) =>
    Object.values(prices || {}).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0,
    );

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

    const total =
      field === "vehicleTotal" ? numValue : vehicle.vehicleTotal || 0;

    const advance =
      field === "vehicleAdvance" ? numValue : vehicle.vehicleAdvance || 0;

    const remaining = Math.max(total - advance, 0);

    onChange(index, field, numValue);
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
      updatedPrices[service] = "";
    }

    // 🆕 Recalculate total including city price
    const servicesTotal = Object.values(updatedPrices || {}).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0,
    );
    const cityPrice = Number(vehicle.cityPrice) || 0;
    const total = servicesTotal + cityPrice;

    const advance = Number(vehicle.vehicleAdvance) || 0;
    const remaining = Math.max(total - advance, 0);

    onChange(index, "serviceType", updatedServices);
    onChange(index, "servicePrices", updatedPrices);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  // 🆕 Handle city price change - adds to total like services
  const handleCityPriceChange = (value) => {
    const cityPrice = Number(value) || 0;

    const servicesTotal = getTotal(vehicle.servicePrices);
    const total = servicesTotal + cityPrice;

    const advance = Number(vehicle.vehicleAdvance) || 0;
    const remaining = Math.max(total - advance, 0);

    onChange(index, "cityPrice", value);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  // 🆕 Handle region change
  const handleRegionChange = (value) => {
    onChange(index, "region", value);
    // Reset city price when region changes
    onChange(index, "cityPrice", "");

    // Recalculate total without city price
    const servicesTotal = getTotal(vehicle.servicePrices);
    const advance = Number(vehicle.vehicleAdvance) || 0;
    const remaining = Math.max(servicesTotal - advance, 0);

    onChange(index, "vehicleTotal", servicesTotal);
    onChange(index, "vehicleRemaining", remaining);
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

      {/* 🆕 REGION & CITY PRICE (like services) */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Region
        </label>
        <div className="bg-white p-2.5 rounded-lg border border-orange-100">
          <div className="flex flex-col bg-orange-50 rounded-md p-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <select
                className="w-full rounded p-2 border border-orange-300 text-sm bg-white outline-none focus:border-orange-500"
                value={vehicle.region || ""}
                onChange={(e) => handleRegionChange(e.target.value)}
              >
                {regionOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            {/* 🆕 City Price input - shows when region is selected */}
            {vehicle.region && (
              <input
                type="number"
                placeholder="City Price (Rs.)"
                value={vehicle.cityPrice || ""}
                onChange={(e) => handleCityPriceChange(e.target.value)}
                className="w-full mt-2 rounded p-1.5 border border-orange-300 text-[11px] outline-none focus:border-orange-500"
              />
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Services
        </label>

        <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-orange-100">
          {serviceOptions.map((service) => (
            <div
              key={service}
              className="flex flex-col bg-orange-50 rounded-md p-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-orange-500"
                  checked={vehicle.serviceType.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                />

                <span className="text-[11px]">{service}</span>
              </label>

              {vehicle.serviceType.includes(service) && (
                <input
                  type="number"
                  placeholder="Custom Price"
                  value={vehicle.servicePrices?.[service] || ""}
                  onChange={(e) => {
                    const updatedPrices = {
                      ...vehicle.servicePrices,
                      [service]: e.target.value,
                    };

                    // 🆕 Recalculate total including city price
                    const servicesTotal = Object.values(
                      updatedPrices || {},
                    ).reduce((sum, val) => sum + (Number(val) || 0), 0);
                    const cityPrice = Number(vehicle.cityPrice) || 0;
                    const total = servicesTotal + cityPrice;

                    const remaining = Math.max(
                      total - (vehicle.vehicleAdvance || 0),
                      0,
                    );

                    onChange(index, "servicePrices", updatedPrices);
                    onChange(index, "vehicleTotal", total);
                    onChange(index, "vehicleRemaining", remaining);
                  }}
                  className="w-full mt-2 rounded p-1.5 border border-orange-300 text-[11px] outline-none focus:border-orange-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🆕 PARTY VEHICLE CONVERSION INPUT */}
      {vehicle.serviceType.includes("Conversion") && (
        <div className="flex flex-col bg-orange-100 p-3 rounded-xl border border-orange-200 gap-1 mt-2">
          <label className="text-[10px] font-bold text-orange-700 uppercase">
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
            className="rounded p-2 border border-orange-300 text-sm outline-none focus:border-orange-500 bg-white"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Total Amount (Rs.)
          </label>
          <input
            type="number"
            readOnly
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            value={vehicle.vehicleTotal ?? ""}
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
            onChange={(e) => {
              const advance = Number(e.target.value) || 0;

              const total = vehicle.vehicleTotal || 0;

              const remaining = Math.max(total - advance, 0);

              onChange(index, "vehicleAdvance", advance);
              onChange(index, "vehicleRemaining", remaining);
            }}
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

      {/* Token Tax */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            Token Tax From
          </label>
          <input
            type="text"
            className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-orange-400"
            placeholder=""
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
            placeholder=""
            value={vehicle.tokenTaxTo || ""}
            onChange={(e) => onChange(index, "tokenTaxTo", e.target.value)}
          />
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

      {/* Vehicle Bank Account */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-orange-600 uppercase">
          Vehicle Bank Account
        </label>
        <select
          className="rounded p-2 border border-orange-300 text-sm bg-white outline-none focus:border-orange-500"
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
const Form = ({ onAddCustomer, editingData, onCancelEdit, user }) => {
  const createEmptyVehicle = () => ({
    plate: "",
    model: "",
    region: "",
    cityPrice: "",
    conversionServiceType: "", // 🆕 PARTY VEHICLE KE LIYE ADD KIYA
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
    cityPrice: "",
    conversionServiceType: "", // 🆕 INDIVIDUAL KE LIYE ADD KIYA
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

  useEffect(() => {
    if (editingData) {
      let normalized = { ...editingData };

      if (editingData?.type === "individual") {
        // ✅ Commission sirf Individual mein load hoga
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
          cityPrice: editingData.cityPrice ?? "",
          conversionServiceType: editingData.conversionServiceType ?? "",
        };
      } else {
        // ✅ Party mode mein commission ko 0 set karo
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
          cityPrice: v.cityPrice ?? "",
          conversionServiceType: v.conversionServiceType ?? "",
        }));
      }
      setFormData(normalized);
    } else {
      // Reset logic
      setFormData(createInitialForm());
      setCommissionAmount(0);
    }
  }, [editingData]);

  const isParty = formData.type === "party";

  // 🆕 REAL-TIME TOTAL CALCULATION
  useEffect(() => {
    if (!isParty) {
      const servicesTotal = Object.values(formData.servicePrices || {}).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
      );
      const cityPrice = Number(formData.cityPrice) || 0;

      // Total = Services + City Price + Commission
      const total = servicesTotal + cityPrice + Number(commissionAmount);

      setFormData((prev) => ({
        ...prev,
        totalAmount: total,
        remainingBalance: Math.max(total - (Number(prev.advancePaid) || 0), 0),
      }));
    }
  }, [formData.servicePrices, formData.cityPrice, commissionAmount, isParty]);

  // Individual Handlers
  const calcRemaining = (total, advance) =>
    Math.max((Number(total) || 0) - (Number(advance) || 0), 0);

  const handleIndividualAmountChange = (field, value) => {
    const num = Number(value) || 0;

    setFormData((prev) => {
      const updated = { ...prev, [field]: num };

      const total = field === "totalAmount" ? num : updated.totalAmount;

      const advance = field === "advancePaid" ? num : updated.advancePaid;

      return {
        ...updated,
        remainingBalance: calcRemaining(total, advance),
      };
    });
  };

  // 🆕 Handle individual city price change
  const handleIndividualCityPriceChange = (value) => {
    const cityPrice = Number(value) || 0;

    setFormData((prev) => {
      const servicesTotal = Object.values(prev.servicePrices || {}).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
      );
      const total = servicesTotal + cityPrice;

      return {
        ...prev,
        cityPrice: value,
        totalAmount: total,
        remainingBalance: Math.max(total - (prev.advancePaid || 0), 0),
      };
    });
  };

  // 🆕 Handle individual region change
  const handleIndividualRegionChange = (value) => {
    setFormData((prev) => {
      const servicesTotal = Object.values(prev.servicePrices || {}).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
      );

      return {
        ...prev,
        region: value,
        cityPrice: "",
        totalAmount: servicesTotal,
        remainingBalance: Math.max(servicesTotal - (prev.advancePaid || 0), 0),
      };
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
      vehicles: [
        ...prev.vehicles,
        { ...createEmptyVehicle(), id: crypto.randomUUID() },
      ],
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

    // 🆕 Yahan commissionAmount ko pack karna zaroori hai
    const finalData = {
      ...formData,
      commissionAmount: Number(commissionAmount) || 0,
      userId: user ? user.uid : null,
    };

    console.log("Saving to Database:", finalData); // Debugging ke liye check kar lena
    onAddCustomer(finalData);

    setFormData(createInitialForm());
    setCommissionAmount(0); // Reset bhi kar do
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-white border border-gray-100 lg:sticky lg:top-5 h-fit max-h-[90vh] overflow-y-auto">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...createInitialForm(),
              type: "individual",
              id: prev.id,
            }))
          }
          className={`flex-1 py-2 rounded-lg font-bold text-xs ${
            !isParty ? "bg-white shadow text-blue-600" : "text-gray-500"
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
          className={`flex-1 py-2 rounded-lg font-bold text-xs ${
            isParty ? "bg-white shadow text-orange-600" : "text-gray-500"
          }`}
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
              className="rounded p-2 border border-gray-300 text-sm"
              placeholder="Ahmad Khan"
              value={formData.handoverTo}
              onChange={(e) =>
                setFormData({ ...formData, handoverTo: e.target.value })
              }
            />
          </div>
        </div>

        {/* Individual Vehicle Info */}
        {!isParty && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Vehicle No
                </label>
                <input
                  type="text"
                  className="rounded p-2 border border-gray-300 text-sm"
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
                  className="rounded p-2 border border-gray-300 text-sm"
                  placeholder="Civic-2020"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 🆕 INDIVIDUAL: Region & City Price (like services) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Region
              </label>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                <div className="flex flex-col bg-blue-50 rounded-md p-2">
                  <select
                    className="w-full rounded p-2 border border-blue-300 text-sm bg-white outline-none focus:border-blue-500"
                    value={formData.region || ""}
                    onChange={(e) =>
                      handleIndividualRegionChange(e.target.value)
                    }
                  >
                    {regionOptions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  {/* 🆕 City Price input - shows when region is selected */}
                  {formData.region && (
                    <input
                      type="number"
                      placeholder="City Price (Rs.)"
                      value={formData.cityPrice || ""}
                      onChange={(e) =>
                        handleIndividualCityPriceChange(e.target.value)
                      }
                      className="w-full mt-2 rounded p-1.5 border border-blue-300 text-[11px] outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment Method - ONLY for Individual */}
        {!isParty && (
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
        )}

        {/* Individual Services & Attachment */}
        {!isParty && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Services
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {serviceOptions.map((s) => (
                  <div
                    key={s}
                    className="flex flex-col bg-blue-50 rounded-md p-2"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.serviceType.includes(s)}
                        onChange={() => {
                          setFormData((prev) => {
                            let updatedServices = [...prev.serviceType];

                            let updatedPrices = {
                              ...prev.servicePrices,
                            };

                            if (updatedServices.includes(s)) {
                              updatedServices = updatedServices.filter(
                                (x) => x !== s,
                              );

                              delete updatedPrices[s];
                            } else {
                              updatedServices.push(s);

                              updatedPrices[s] = "";
                            }

                            // 🆕 Recalculate total including city price
                            const servicesTotal = Object.values(
                              updatedPrices,
                            ).reduce((sum, val) => sum + (Number(val) || 0), 0);
                            const cityPrice = Number(prev.cityPrice) || 0;
                            const total = servicesTotal + cityPrice;

                            const remaining = Math.max(
                              total - (prev.advancePaid || 0),
                              0,
                            );

                            return {
                              ...prev,
                              serviceType: updatedServices,
                              servicePrices: updatedPrices,
                              totalAmount: total,
                              remainingBalance: remaining,
                            };
                          });
                        }}
                        className="w-4 h-4 accent-blue-600"
                      />

                      <span className="text-[11px]">{s}</span>
                    </label>

                    {formData.serviceType.includes(s) && (
                      <input
                        type="number"
                        placeholder="Custom Price"
                        value={formData.servicePrices?.[s] || ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          setFormData((prev) => {
                            const updatedPrices = {
                              ...prev.servicePrices,
                              [s]: value,
                            };

                            // 🆕 Recalculate total including city price
                            const servicesTotal = Object.values(
                              updatedPrices,
                            ).reduce((sum, val) => sum + (Number(val) || 0), 0);
                            const cityPrice = Number(prev.cityPrice) || 0;
                            const total = servicesTotal + cityPrice;

                            return {
                              ...prev,
                              servicePrices: updatedPrices,
                              totalAmount: total,
                              remainingBalance: Math.max(
                                total - (prev.advancePaid || 0),
                                0,
                              ),
                            };
                          });
                        }}
                        className="w-full mt-2 rounded p-1.5 border border-blue-300 text-[11px] outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 🆕 Agar services mein "Conversion" selected hai toh yeh zinda hoga */}
            {formData.serviceType.includes("Conversion") && (
              <div className="flex flex-col bg-blue-50 p-3 rounded-xl border border-blue-200 gap-1 mb-3">
                <label className="text-[10px] font-bold text-blue-600 uppercase">
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
                  className="rounded p-2 border border-blue-300 text-sm outline-none focus:border-blue-500 bg-white"
                />
              </div>
            )}

            <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 space-y-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase">
                Payment Details
              </div>

              {/* 🆕 COMMISSION FIELD YAHAN ADD KI */}
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                  Third-Party Commission (Rs.)
                </label>
                <input
                  type="number"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(Number(e.target.value))}
                  className="rounded p-2 border border-gray-200 text-sm w-full bg-white outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-600">
                    Total Amount (Rs.)
                  </label>

                  <input
                    type="number"
                    readOnly
                    value={formData.totalAmount ?? ""}
                    className="rounded p-2 border border-gray-200 text-sm w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-600">
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
            </div>

            {/* Individual Token Tax */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Token Tax From
                </label>
                <input
                  type="text"
                  className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-blue-400"
                  placeholder=""
                  value={formData.tokenTaxFrom || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenTaxFrom: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Token Tax To
                </label>
                <input
                  type="text"
                  className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-blue-400"
                  placeholder=""
                  value={formData.tokenTaxTo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenTaxTo: e.target.value })
                  }
                />
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
                key={vehicle.id || idx}
                index={idx}
                vehicle={vehicle}
                onChange={handleVehicleChange}
                onRemove={removeVehicle}
                canRemove={formData.vehicles.length > 1}
              />
            ))}
          </div>
        )}

        {/* Individual Remarks - END MEIN */}
        {!isParty && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Remarks
            </label>
            <textarea
              className="rounded p-2 border border-gray-300 text-sm outline-none focus:border-blue-500"
              placeholder="Enter remarks..."
              rows={3}
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
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
