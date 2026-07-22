import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

const serviceOptions = [
  "New Registration",
  "Name Transfer",
  "Permit Transfer",
  "Conversion",
  "Permit Renewal",
  "Fitness Renewal",
  "Fresh Fitness",
  "Token Tax",
  "Online",
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

// ─── Normalize Name ──────────────────────────────────────────
const normalizeName = (name) => {
  if (!name) return "";
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// ✅ UPDATED: File Return added to calculation
const calculateTotalAmount = (
  prices,
  commission,
  advance,
  regionPrice = 0,
  choice = 0,
  fileReturn = 0,
) => {
  const serviceSum = Object.values(prices || {}).reduce(
    (sum, v) =>
      sum +
      Number(v.regionPrice || 0) +
      Number(v.servicePrice || 0) +
      Number(v.price || 0) +
      Number(v.customPrice || 0),
    0,
  );
  const total =
    serviceSum +
    Number(commission || 0) +
    Number(regionPrice || 0) +
    Number(choice || 0) +
    Number(fileReturn || 0);
  const remaining = Math.max(total - Number(advance || 0), 0);
  return { total, remaining };
};

// ==================== VEHICLE CARD ====================
const VehicleCard = ({
  vehicle,
  index,
  onChange,
  onRemove,
  canRemove,
  isDebitActive,
}) => {
  const getServicesTotal = (prices) => {
    return Object.values(prices || {}).reduce(
      (sum, val) => sum + (Number(val?.servicePrice) || 0),
      0,
    );
  };

  const computeTotals = (servicesTotal, regionPrice, advance) => {
    const total = servicesTotal + regionPrice;
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
    const advance = currentAdvance;
    const newRegionPrice = 0;
    const { total, remaining } = computeTotals(
      servicesTotal,
      newRegionPrice,
      advance,
    );
    onChange(index, "region", regionValue);
    onChange(index, "regionPrice", newRegionPrice);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleRegionPriceChange = (price) => {
    const servicesTotal = getServicesTotal(vehicle.servicePrices);
    const advance = currentAdvance;
    const newRegionPrice = Number(price) || 0;
    const { total, remaining } = computeTotals(
      servicesTotal,
      newRegionPrice,
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
    const advance = currentAdvance;
    const { total, remaining } = computeTotals(
      newServicesTotal,
      regionPrice,
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
    const advance = currentAdvance;
    const { total, remaining } = computeTotals(
      newServicesTotal,
      regionPrice,
      advance,
    );
    onChange(index, "servicePrices", updatedPrices);
    onChange(index, "vehicleTotal", total);
    onChange(index, "vehicleRemaining", remaining);
  };

  const handleVehicleFileReturnChange = (value) => {
    const fileReturn = Number(value) || 0;
    onChange(index, "vehicleFileReturn", fileReturn);
  };

  const accentColor = isDebitActive ? "red" : "orange";
  const accentText = isDebitActive ? "text-red-400" : "text-orange-400";
  const accentBorder = isDebitActive ? "border-red-500" : "border-orange-500";

  return (
    <div className="relative flex flex-col gap-3 p-3 bg-gray-800 border border-gray-700 rounded-xl">
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${accentText}`}
        >
          Vehicle #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to remove this vehicle?")
              ) {
                onRemove(vehicle.id);
              }
            }}
            className="text-red-400 hover:text-red-300 text-xs font-bold"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* ✅ Vehicle No + Model + Bank (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Vehicle No
          </label>
          <input
            type="text"
            className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder} placeholder:text-gray-500`}
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
            className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder} placeholder:text-gray-500`}
            placeholder="Civic-2015"
            value={vehicle.model}
            onChange={(e) => onChange(index, "model", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={`text-[10px] font-bold uppercase ${accentText}`}>
            Vehicle Bank Account
          </label>
          <select
            className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder}`}
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
      </div>

      {/* ✅ Region + Region Price (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Region
          </label>
          <select
            className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder}`}
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
              className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder}`}
              value={vehicle.regionPrice === 0 ? "" : vehicle.regionPrice}
              onChange={(e) => handleRegionPriceChange(e.target.value)}
              placeholder="Region price"
            />
          </div>
        )}
      </div>

      {/* ✅ Services - 4 columns */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Services
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-900 p-2.5 rounded-lg border border-gray-700">
          {serviceOptions.map((service) => (
            <div
              key={service}
              className="flex flex-col bg-gray-800 rounded-md p-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className={`w-4 h-4 accent-${accentColor}-500`}
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

      {vehicle.serviceType.includes("Conversion") && (
        <div className="flex flex-col bg-gray-700 p-3 rounded-xl border border-gray-600 gap-1 mt-2">
          <label className={`text-[10px] font-bold uppercase ${accentText}`}>
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
            className={`rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm outline-none focus:${accentBorder} placeholder:text-gray-500`}
          />
        </div>
      )}

      {/* ✅ Token Tax From + Token Tax To (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Token Tax From
          </label>
          <input
            type="text"
            className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder}`}
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
            className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder}`}
            value={vehicle.tokenTaxTo || ""}
            onChange={(e) => onChange(index, "tokenTaxTo", e.target.value)}
          />
        </div>
      </div>

      {/* ✅ File Return + Attachment (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className={`text-[10px] font-bold uppercase ${accentText}`}>
            File Return (Vehicle)
          </label>
          <input
            type="number"
            className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder} placeholder:text-gray-500`}
            placeholder="Enter file return amount"
            value={
              vehicle.vehicleFileReturn === 0 ? "" : vehicle.vehicleFileReturn
            }
            onChange={(e) => handleVehicleFileReturnChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={`text-[10px] font-bold uppercase ${accentText}`}>
            Attachment
          </label>
          {!vehicle.attachment ? (
            <label
              className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed ${accentBorder} rounded-lg bg-gray-800 cursor-pointer hover:bg-gray-700`}
            >
              <span className={`text-lg ${accentText}`}>📎</span>
              <span className="text-[11px] text-gray-300">
                Upload Doc/Image
              </span>
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
                <span className={`text-2xl ${accentText}`}>📄</span>
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
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Remarks
        </label>
        <textarea
          className={`rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:${accentBorder} placeholder:text-gray-500`}
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
  // 🔥 Fetch debit entries for validation + dropdown
  const [debitEntries, setDebitEntries] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState(null);

  // 🔥 Party details popup state
  const [partyDetailsPopup, setPartyDetailsPopup] = useState({
    open: false,
    party: null,
  });

  useEffect(() => {
    if (user) {
      fetchDebitEntries();
    }
  }, [user]);

  const fetchDebitEntries = async () => {
    try {
      const q = query(
        collection(db, "debits"),
        where("userId", "==", user.uid),
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDebitEntries(entries);
    } catch (error) {
      console.error("Error fetching debit entries:", error);
    }
  };

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
    vehicleFileReturn: 0,
    tokenTaxFrom: "",
    tokenTaxTo: "",
    remarks: "",
    bankName: "Cash",
  });

  // ✅ UPDATED: fileReturn added
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
    choice: null,
    fileReturn: 0,
    vehicles: [{ ...createEmptyVehicle(), id: crypto.randomUUID() }],
    receivedBy: "",
    handoverTo: "",
    bankName: "Cash",
    tokenTaxFrom: "",
    tokenTaxTo: "",
    remarks: "",
    onlinePaymentEnabled: false,
    onlinePayment: 0,
    onlinePaymentNotes: "",
  });

  const [formData, setFormData] = useState(createInitialForm());
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [isDebitView, setIsDebitView] = useState(false);

  const isPartyOrDebit = formData.type === "party" || formData.type === "debit";
  const isDebitActive = isDebitView || formData.type === "debit";

  // 🔥 Filter active debtors (balance > 0) for dropdown
  const activeDebtors = useMemo(() => {
    return debitEntries.filter((entry) => Number(entry.amount) > 0);
  }, [debitEntries]);

  // 🔥 Get selected debtor's balance
  const selectedBalance = useMemo(() => {
    if (!selectedDebtor) return 0;
    return Number(selectedDebtor.amount) || 0;
  }, [selectedDebtor]);

  // 🔥 partySummary – Choice ADD, Online Payment MINUS
  const partySummary = useMemo(() => {
    if (!isPartyOrDebit) {
      return {
        totalVehicles: 0,
        totalVehiclesAdvance: 0,
        totalVehiclesRemaining: 0,
        choiceAmount: 0,
        onlinePayment: 0,
        grandTotal: 0,
        totalAdvance: 0,
        remainingBalance: 0,
        finalBalance: 0,
      };
    }

    const vehicles = formData.vehicles || [];
    const totalVehicles = vehicles.reduce(
      (sum, v) => sum + (Number(v.vehicleTotal) || 0),
      0,
    );
    const totalVehiclesAdvance = vehicles.reduce(
      (sum, v) => sum + (Number(v.vehicleAdvance) || 0),
      0,
    );
    const totalVehiclesRemaining = vehicles.reduce(
      (sum, v) => sum + (Number(v.vehicleRemaining) || 0),
      0,
    );
    const totalVehiclesFileReturn = vehicles.reduce(
      (sum, v) => sum + (Number(v.vehicleFileReturn) || 0),
      0,
    );
    const choiceAmount = Number(formData.choice) || 0;
    const onlinePayment = formData.onlinePaymentEnabled
      ? Number(formData.onlinePayment) || 0
      : 0;

    const commission = Number(commissionAmount) || 0;

    // 🔥 GRAND TOTAL = Vehicles + Vehicles File Return + Choice + Commission - Online Payment
    const grandTotal =
      totalVehicles +
      totalVehiclesFileReturn +
      choiceAmount +
      commission -
      onlinePayment;

    // ✅ FIX: TOTAL ADVANCE = Vehicle Advance + Manual Advance (formData.advancePaid)
    const manualAdvance = Number(formData.advancePaid) || 0;
    const totalAdvance = totalVehiclesAdvance + manualAdvance;

    // ✅ FIX: Include party payments in remaining balance
    const partyPayments = formData.partyPayments || [];
    const totalPartyPayments = partyPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const remainingBalance = Math.max(
      grandTotal - totalAdvance - totalPartyPayments,
      0,
    );

    // 🔥 Live remaining after save = selected balance - remainingBalance
    const finalBalance = Math.max(selectedBalance - remainingBalance, 0);

    return {
      totalVehicles,
      totalVehiclesAdvance,
      totalVehiclesRemaining,
      totalVehiclesFileReturn,
      choiceAmount,
      onlinePayment,
      grandTotal,
      totalAdvance,
      remainingBalance,
      finalBalance,
    };
  }, [
    formData.vehicles,
    formData.choice,
    formData.onlinePaymentEnabled,
    formData.onlinePayment,
    formData.advancePaid,
    formData.partyPayments,
    commissionAmount,
    isPartyOrDebit,
    selectedBalance,
  ]);

  // Update remainingBalance AND totalAmount in formData
  useEffect(() => {
    if (isPartyOrDebit) {
      setFormData((prev) => ({
        ...prev,
        totalAmount: partySummary.grandTotal,
        remainingBalance: partySummary.remainingBalance,
      }));
    }
  }, [partySummary, isPartyOrDebit]);

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
          choice: editingData.choice !== undefined ? editingData.choice : null,
          fileReturn: editingData.fileReturn ?? 0,
        };
        setIsDebitView(false);
        setSelectedDebtor(null);
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
          vehicleFileReturn: v.vehicleFileReturn ?? 0,
          bankName: v.bankName || "Cash",
          region: v.region ?? "",
          regionPrice: v.regionPrice ?? 0,
          conversionServiceType: v.conversionServiceType ?? "",
        }));
        normalized.onlinePaymentEnabled =
          editingData.onlinePaymentEnabled ?? false;
        normalized.onlinePayment = editingData.onlinePayment ?? 0;
        normalized.onlinePaymentNotes = editingData.onlinePaymentNotes ?? "";
        normalized.choice =
          editingData.choice !== undefined ? editingData.choice : null;
        if (editingData.type === "debit") {
          setIsDebitView(true);
          // Find and set selected debtor
          const found = debitEntries.find(
            (e) =>
              normalizeName(e.partyName) ===
              normalizeName(editingData.partyName),
          );
          setSelectedDebtor(found || null);
        } else {
          setIsDebitView(false);
          setSelectedDebtor(null);
        }
      }
      setFormData(normalized);
    } else {
      setFormData(createInitialForm());
      setCommissionAmount(0);
      setIsDebitView(false);
      setSelectedDebtor(null);
    }
  }, [editingData, debitEntries]);

  // 🔥 Handle debtor selection from dropdown
  const handleDebtorSelect = (e) => {
    const value = e.target.value;
    if (!value) {
      setSelectedDebtor(null);
      setFormData((prev) => ({
        ...prev,
        partyName: "",
        phone: "",
        cnic: "",
        receivedBy: "",
        handoverTo: "",
        purpose: "",
        amount: "",
        date: "",
        remarks: "",
        vehicles: [{ ...createEmptyVehicle(), id: crypto.randomUUID() }],
      }));
      return;
    }

    const selected = debitEntries.find((entry) => entry.id === value);
    if (selected) {
      setSelectedDebtor(selected);
      // 🔥 Auto-fill static fields + Reset dynamic fields
      setFormData((prev) => ({
        ...prev,
        partyName: selected.partyName,
        phone: selected.phone || "",
        cnic: selected.cnic || "",
        ntn: selected.ntn || "",
        receivedBy: selected.receivedBy || "",
        handoverTo: selected.handoverTo || "",
        // 🔥 Reset dynamic fields
        purpose: "",
        amount: "",
        date: "",
        remarks: "",
        choice: null,
        onlinePaymentEnabled: false,
        onlinePayment: 0,
        onlinePaymentNotes: "",
        vehicles: [{ ...createEmptyVehicle(), id: crypto.randomUUID() }],
      }));
    }
  };

  // 🔥 Handle party name change: Auto-fill + Reset
  const handlePartyNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, partyName: value }));

    // Only in Debit view
    if (isDebitView && value.trim()) {
      const foundParty = debitEntries.find(
        (entry) =>
          normalizeName(entry.partyName) === normalizeName(value.trim()),
      );

      if (foundParty) {
        setSelectedDebtor(foundParty);
        // 🔥 AUTO-FILL static fields + RESET dynamic fields
        setFormData((prev) => ({
          ...prev,
          partyName: value,
          phone: foundParty.phone || "",
          cnic: foundParty.cnic || "",
          ntn: foundParty.ntn || "",
          receivedBy: foundParty.receivedBy || "",
          handoverTo: foundParty.handoverTo || "",
          // 🔥 Reset dynamic fields
          purpose: "",
          amount: "",
          date: "",
          remarks: "",
          choice: null,
          onlinePaymentEnabled: false,
          onlinePayment: 0,
          onlinePaymentNotes: "",
          vehicles: [{ ...createEmptyVehicle(), id: crypto.randomUUID() }],
        }));
      } else {
        setSelectedDebtor(null);
      }
    }
  };

  // 🔥 Open popup only on ✅ click
  const openPartyDetailsPopup = () => {
    if (isDebitView && formData.partyName?.trim()) {
      const foundParty = debitEntries.find(
        (entry) =>
          normalizeName(entry.partyName) ===
          normalizeName(formData.partyName.trim()),
      );
      if (foundParty) {
        setPartyDetailsPopup({ open: true, party: foundParty });
      }
    }
  };

  // 🔥 Close popup
  const closePartyDetailsPopup = () => {
    setPartyDetailsPopup({ open: false, party: null });
  };

  // ✅ UPDATED: fileReturn included
  const handleIndividualAmountChange = (field, value) => {
    const numValue = Number(value) || 0;
    if (field === "advancePaid") {
      const { total, remaining } = calculateTotalAmount(
        formData.servicePrices,
        commissionAmount,
        numValue,
        formData.regionPrice,
        formData.choice,
        formData.fileReturn,
      );
      setFormData((prev) => ({
        ...prev,
        advancePaid: numValue,
        totalAmount: total,
        remainingBalance: remaining,
      }));
    }
  };

  // ✅ UPDATED: fileReturn included
  const handleIndividualRegionChange = (regionValue) => {
    setFormData((prev) => {
      const servicesTotal = Object.values(prev.servicePrices).reduce(
        (sum, v) => sum + Number(v?.price || 0) + Number(v?.customPrice || 0),
        0,
      );
      const newTotal =
        servicesTotal +
        (prev.commissionAmount || 0) +
        (Number(prev.choice) || 0) +
        (Number(prev.fileReturn) || 0);
      return {
        ...prev,
        region: regionValue,
        regionPrice: 0,
        totalAmount: newTotal,
        remainingBalance: Math.max(newTotal - (prev.advancePaid || 0), 0),
      };
    });
  };

  // ✅ UPDATED: fileReturn included
  const handleIndividualRegionPriceChange = (price) => {
    const regionPrice = Number(price) || 0;
    setFormData((prev) => {
      const servicesTotal = Object.values(prev.servicePrices).reduce(
        (sum, v) => sum + Number(v?.price || 0) + Number(v?.customPrice || 0),
        0,
      );
      const newTotal =
        servicesTotal +
        regionPrice +
        (prev.commissionAmount || 0) +
        (Number(prev.choice) || 0) +
        (Number(prev.fileReturn) || 0);
      return {
        ...prev,
        regionPrice,
        totalAmount: newTotal,
        remainingBalance: Math.max(newTotal - (prev.advancePaid || 0), 0),
      };
    });
  };

  // ✅ UPDATED: fileReturn included
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
        servicesTotal +
        (prev.regionPrice || 0) +
        (prev.commissionAmount || 0) +
        (Number(prev.choice) || 0) +
        (Number(prev.fileReturn) || 0);
      return {
        ...prev,
        servicePrices: updatedPrices,
        totalAmount: newTotal,
        remainingBalance: Math.max(newTotal - (prev.advancePaid || 0), 0),
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

  const handlePartyOnlinePaymentToggle = () => {
    const newEnabled = !formData.onlinePaymentEnabled;
    setFormData((prev) => ({
      ...prev,
      onlinePaymentEnabled: newEnabled,
      onlinePayment: newEnabled ? prev.onlinePayment : 0,
      onlinePaymentNotes: newEnabled ? prev.onlinePaymentNotes : "",
    }));
  };

  const handlePartyOnlinePaymentChange = (e) => {
    const val = Number(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, onlinePayment: val }));
  };

  const handlePartyOnlinePaymentNotesChange = (e) => {
    setFormData((prev) => ({ ...prev, onlinePaymentNotes: e.target.value }));
  };

  // 🔥 handleSubmit with Debit validation and Debit Ledger update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 DEBIT VALIDATION: Check if party exists in Debit Ledger
    let existingDebit = null;
    if (isDebitView) {
      const partyName = formData.partyName?.trim();

      if (!partyName) {
        alert("❌ Please enter a party name!");
        return;
      }

      // Check if party exists in debitEntries
      existingDebit = debitEntries.find(
        (entry) => normalizeName(entry.partyName) === normalizeName(partyName),
      );

      if (!existingDebit) {
        alert(`❌ Party "${partyName}" not found in Debit Ledger!

Please first add this party in Tab 5 (Debit) ledger.`);
        return; // 🛑 Block transaction
      }

      // 🔥 Balance check: Total amount vs available balance
      const currentBalance = Number(existingDebit.amount) || 0;
      const requestedAmount = Number(formData.totalAmount) || 0;

      // 🔥 Also check final balance
      const finalBalance = currentBalance - requestedAmount;

      if (finalBalance < 0) {
        alert(`❌ Balance kam hai!

Available: Rs. ${currentBalance.toLocaleString()}
Requested: Rs. ${requestedAmount.toLocaleString()}

Pehle Tab 5 (Debit) mein balance update karein.`);
        return; // 🛑 Block transaction
      }
    }

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

    // ============================================================
    // 🔥🔥🔥 UPDATE DEBIT LEDGER IF DEBIT VIEW
    // ============================================================
    if (isDebitView && existingDebit) {
      const currentBalance = Number(existingDebit.amount) || 0;
      const requestedAmount = Number(formData.totalAmount) || 0;
      const newBalance = currentBalance - requestedAmount;

      // 📜 History entry
      const historyEntry = {
        id: `h_${Date.now()}`,
        date: formData.date || new Date().toISOString().split("T")[0],
        type: "debit",
        amount: requestedAmount,
        balance: newBalance,
        purpose: formData.purpose || "Debit Entry",
        remarks: formData.remarks || "",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      };

      const updatedDebit = {
        ...existingDebit,
        amount: newBalance,
        history: [...(existingDebit.history || []), historyEntry],
        updatedAt: new Date().toISOString(),
        status: newBalance === 0 ? "settled" : "active",
      };

      try {
        // Update Firestore "debits" collection
        const debitDocRef = doc(db, "debits", existingDebit.id);
        await updateDoc(debitDocRef, updatedDebit);
      } catch (error) {
        console.error("❌ Failed to update debit ledger:", error);
        alert("Debit ledger update failed! Please try again.");
        return; // 🛑 Stop further execution
      }
    }

    // ─── PREPARE FINAL DATA FOR CUSTOMER LEDGER ───
    const finalData = {
      ...formData,
      type: isDebitView ? "debit" : formData.type,
      commissionAmount: Number(commissionAmount) || 0,
      userId: user ? user.uid : null,
      isDebitView: isDebitView,
      ...(isPartyOrDebit && {
        remainingBalance: partySummary.remainingBalance,
      }),
    };

    // ─── SAVE TO CUSTOMER LEDGER ───
    const result = await onAddCustomer(finalData);
    if (result && result.success) {
      alert("Record Saved/Updated Successfully!");
      setFormData(createInitialForm());
      setCommissionAmount(0);
      setIsDebitView(false);
      setSelectedDebtor(null);
      if (onCancelEdit) onCancelEdit();
      closePartyDetailsPopup();
      // Refresh debit entries to update balance
      fetchDebitEntries();
    } else if (result && !result.success) {
      alert("Database Error: " + result.message);
    }
  };

  const isPartyOnly = formData.type === "party";

  return (
    <div className="w-full flex flex-col gap-3 px-4 md:px-6 py-6 shadow-xl rounded-2xl bg-gray-800 border border-gray-700 relative">
      <h1 className="font-semibold text-3xl text-white py-3 border-b border-gray-500">
        Enter Record
      </h1>
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex bg-gray-700 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...createInitialForm(),
                type: "individual",
                id: prev.id,
              }));
              setIsDebitView(false);
              setSelectedDebtor(null);
              closePartyDetailsPopup();
            }}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
              formData.type === "individual"
                ? "bg-gray-800 shadow text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            INDIVIDUAL
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...createInitialForm(),
                type: "party",
                id: prev.id,
              }));
              setIsDebitView(false);
              setSelectedDebtor(null);
              closePartyDetailsPopup();
            }}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
              isPartyOrDebit
                ? "bg-gray-800 shadow text-orange-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            PARTY / BUSINESS
          </button>
        </div>

        <form
          id="khataForm"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h1
              className={`font-bold text-xl ${
                formData.type === "individual"
                  ? "text-blue-400"
                  : isDebitActive
                    ? "text-red-400"
                    : "text-orange-400"
              }`}
            >
              {editingData ? "Update" : "New"}{" "}
              {formData.type === "individual"
                ? "Individual"
                : isDebitActive
                  ? "Debit"
                  : "Party"}{" "}
              Entry
            </h1>

            {isPartyOnly && (
              <button
                type="button"
                onClick={() => {
                  setIsDebitView(!isDebitView);
                  setSelectedDebtor(null);
                  closePartyDetailsPopup();
                  if (!isDebitView) {
                    setFormData((prev) => ({
                      ...prev,
                      partyName: "",
                      phone: "",
                      cnic: "",
                      receivedBy: "",
                      handoverTo: "",
                      purpose: "",
                      amount: "",
                      date: "",
                      remarks: "",
                      choice: null,
                      onlinePaymentEnabled: false,
                      onlinePayment: 0,
                      onlinePaymentNotes: "",
                      vehicles: [
                        { ...createEmptyVehicle(), id: crypto.randomUUID() },
                      ],
                    }));
                  }
                }}
                className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  isDebitView
                    ? "bg-orange-600 text-white hover:bg-orange-500"
                    : "bg-red-600 text-white hover:bg-red-500"
                }`}
              >
                {isDebitView ? "← Back to Party" : "Debit"}
              </button>
            )}
          </div>

          {/* Warning message for Debit view */}
          {isDebitView && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <p className="text-yellow-300 text-[10px] font-medium">
                ⚠️ Note: Debit tab se entry sirf unhi parties ke liye ho gi jo
                pehle{" "}
                <strong className="text-white">Tab 5 (Debit Ledger)</strong>{" "}
                mein add hain. Agar party nahi hai toh pehle Tab 5 mein add
                karein.
              </p>
            </div>
          )}

          {/* ✅ Party Name + Phone + NTN (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                {isDebitView
                  ? "Select Debtor / Party Name"
                  : isPartyOrDebit
                    ? "Business / Party Name"
                    : "Customer Name"}
              </label>

              {/* 🔥 Dropdown for Debit view */}
              {isDebitView && (
                <div className="mb-2">
                  <select
                    className="w-full rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-red-500"
                    value={selectedDebtor?.id || ""}
                    onChange={handleDebtorSelect}
                  >
                    <option value="">— Select Debtor —</option>
                    {activeDebtors.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.partyName} — Balance: Rs.{" "}
                        {Number(entry.amount).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {activeDebtors.length === 0 && (
                    <p className="text-[10px] text-yellow-500 mt-1">
                      ⚠️ No active debtors found. Add qarzdaar in Tab 5 (Debit)
                      first.
                    </p>
                  )}
                </div>
              )}

              {/* 🔥 Manual input for Party Name */}
              <div className="relative">
                <input
                  type="text"
                  className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm focus:border-blue-500 outline-none placeholder:text-gray-500 w-full pr-10"
                  placeholder={isPartyOrDebit ? "Al-Madina Motors" : "Ali Khan"}
                  required={!isDebitView}
                  value={formData.partyName}
                  onChange={handlePartyNameChange}
                  disabled={!!selectedDebtor && isDebitView}
                />
                {/* 🔥 TICK/CROSS ICON — SIRF DEBIT VIEW MEIN */}
                {isDebitView && formData.partyName?.trim() && (
                  <button
                    type="button"
                    onClick={openPartyDetailsPopup}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                  >
                    {debitEntries.some(
                      (entry) =>
                        normalizeName(entry.partyName) ===
                        normalizeName(formData.partyName),
                    ) ? (
                      <span className="text-green-500 hover:opacity-80 cursor-pointer">
                        ✅
                      </span>
                    ) : (
                      <span className="text-red-500">❌</span>
                    )}
                  </button>
                )}
              </div>
            </div>

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
                disabled={!!selectedDebtor && isDebitView}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                {isPartyOrDebit ? "NTN / Reg No" : "CNIC"}
              </label>
              <input
                type="text"
                className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm placeholder:text-gray-500"
                placeholder={isPartyOrDebit ? "NTN-786" : "17301-12345678"}
                value={isPartyOrDebit ? formData.ntn : formData.cnic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [isPartyOrDebit ? "ntn" : "cnic"]: e.target.value,
                  })
                }
                disabled={!!selectedDebtor && isDebitView}
              />
            </div>
          </div>

          {/* ✅ Received From + Handover To (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                disabled={!!selectedDebtor && isDebitView}
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
                disabled={!!selectedDebtor && isDebitView}
              />
            </div>
          </div>

          {/* ─── INDIVIDUAL SECTION ─── */}
          {formData.type === "individual" && (
            <>
              {/* ✅ Vehicle No + Model + Bank (3 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Vehicle No *
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
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Bank / Payment Method
                  </label>
                  <select
                    className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500"
                    value={formData.bankName || "Cash"}
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

              {/* ✅ Region + Region Price (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Region
                  </label>
                  <select
                    className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500"
                    value={formData.region || ""}
                    onChange={(e) =>
                      handleIndividualRegionChange(e.target.value)
                    }
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
                      value={
                        formData.regionPrice === 0 ? "" : formData.regionPrice
                      }
                      onChange={(e) =>
                        handleIndividualRegionPriceChange(e.target.value)
                      }
                      placeholder="Region price"
                    />
                  </div>
                )}
              </div>

              {/* ✅ Services - 4 columns */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Services
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-900 p-3 rounded-xl border border-gray-700">
                  {serviceOptions
                    .filter((s) => s !== "Online")
                    .map((s) => (
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
                                  (commissionAmount || 0) +
                                  (Number(prev.choice) || 0) +
                                  (Number(prev.fileReturn) || 0);
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

              {/* ✅ Conversion Details (conditional) */}
              {formData.serviceType.includes("Conversion") && (
                <div className="flex flex-col bg-gray-700 p-3 rounded-xl border border-gray-600 gap-1">
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

              {/* ✅ Token Tax From + Token Tax To (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              {/* ✅ Attachment */}
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

              {/* ✅ Remarks */}
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

              {/* ✅✅✅ NEW: Choice + File Return + Others (3 columns) ✅✅✅ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Choice (Additional Amount)
                  </label>
                  <input
                    type="number"
                    className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-500"
                    placeholder="Enter choice amount"
                    value={formData.choice === null ? "" : formData.choice}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? null : Number(e.target.value);
                      setFormData((prev) => {
                        const { total, remaining } = calculateTotalAmount(
                          prev.servicePrices,
                          commissionAmount,
                          prev.advancePaid || 0,
                          prev.regionPrice || 0,
                          val || 0,
                          prev.fileReturn || 0,
                        );
                        return {
                          ...prev,
                          choice: val,
                          totalAmount: total,
                          remainingBalance: remaining,
                        };
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    File Return
                  </label>
                  <input
                    type="number"
                    className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-500"
                    placeholder="Enter file return amount"
                    value={formData.fileReturn === 0 ? "" : formData.fileReturn}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setFormData((prev) => {
                        const { total, remaining } = calculateTotalAmount(
                          prev.servicePrices,
                          commissionAmount,
                          prev.advancePaid || 0,
                          prev.regionPrice || 0,
                          prev.choice || 0,
                          val,
                        );
                        return {
                          ...prev,
                          fileReturn: val,
                          totalAmount: total,
                          remainingBalance: remaining,
                        };
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">
                    Others (Rs.)
                  </label>
                  <input
                    type="number"
                    value={commissionAmount === 0 ? "" : commissionAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCommissionAmount(val);
                      const servicesTotal = Object.values(
                        formData.servicePrices,
                      ).reduce((sum, v) => sum + Number(v?.price || 0), 0);
                      const newTotal =
                        servicesTotal +
                        (formData.regionPrice || 0) +
                        val +
                        (Number(formData.choice) || 0) +
                        (Number(formData.fileReturn) || 0);
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
                    className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-500"
                    placeholder="Enter others amount"
                  />
                </div>
              </div>

              {/* ✅✅✅ NEW: Total + Advance + Remaining (3 columns) ✅✅✅ */}
              <div className="bg-gray-700 rounded-lg border border-gray-600 p-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Payment Summary
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  <div>
                    <label className="text-[10px] font-semibold text-gray-300">
                      Remaining Balance
                    </label>
                    <div className="rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm w-full flex items-center justify-between px-3">
                      <span className="text-base font-bold text-blue-400">
                        Rs. {(formData.remainingBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ==================== PARTY / DEBIT SECTION ==================== */}
          {isPartyOrDebit && (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between sticky top-0 bg-gray-800 z-10 py-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Vehicles ({formData.vehicles.length})
                  </label>
                  <button
                    type="button"
                    onClick={addVehicle}
                    className={`font-bold text-sm transition-colors ${
                      isDebitActive
                        ? "text-red-400 hover:text-red-300"
                        : "text-orange-400 hover:text-orange-300"
                    }`}
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
                      isDebitActive={isDebitActive}
                    />
                  ))}
                </div>
              </div>

              {/* ✅ Choice + Online Payment (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Choice (Additional Amount)
                  </label>
                  <input
                    type="number"
                    className="rounded p-2 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-blue-500 placeholder:text-gray-500"
                    placeholder="Enter choice amount"
                    value={formData.choice === null ? "" : formData.choice}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? null : Number(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        choice: val,
                      }));
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2 border border-green-600/30 rounded-lg p-3 bg-green-900/10">
                  <label className="flex items-center gap-2 cursor-pointer text-green-400">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-green-500"
                      checked={formData.onlinePaymentEnabled || false}
                      onChange={handlePartyOnlinePaymentToggle}
                    />
                    <span className="text-[11px] font-medium">
                      💳 Online Payment (Party)
                    </span>
                  </label>
                  {formData.onlinePaymentEnabled && (
                    <div className="ml-6 space-y-2">
                      <input
                        type="number"
                        placeholder="Online Payment Custom Price (Rs.)"
                        className="w-full rounded p-1.5 border border-gray-600 bg-gray-700 text-gray-200 text-[11px] outline-none placeholder:text-gray-500 focus:border-green-500"
                        value={
                          formData.onlinePayment === 0
                            ? ""
                            : formData.onlinePayment
                        }
                        onChange={handlePartyOnlinePaymentChange}
                      />
                      <textarea
                        placeholder="Notes about online payment (e.g., transaction ID, bank name, etc.)"
                        className="w-full rounded p-1.5 border border-gray-600 bg-gray-700 text-gray-200 text-[11px] outline-none placeholder:text-gray-500 focus:border-green-500"
                        rows="2"
                        value={formData.onlinePaymentNotes || ""}
                        onChange={handlePartyOnlinePaymentNotesChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Payment Summary - Total + Advance + Remaining (3 columns) */}
              <div className="bg-gray-700 rounded-lg border border-gray-600 p-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Payment Summary
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setFormData((prev) => ({
                          ...prev,
                          advancePaid: val,
                        }));
                      }}
                      className="rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm w-full outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-300">
                      Remaining Balance
                    </label>
                    <div className="rounded p-2 border border-gray-600 bg-gray-800 text-white text-sm w-full flex items-center justify-between px-3">
                      <span className="text-base font-bold text-blue-400">
                        Rs. {(formData.remainingBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Fixed button bar */}
          <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-800 border-t border-gray-700 p-4 flex flex-col items-center gap-2">
            <button
              type="submit"
              form="khataForm"
              className={`w-64 font-bold rounded-xl py-3 text-white transition-all ${
                isPartyOrDebit
                  ? isDebitActive
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-orange-600 hover:bg-orange-500"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
              disabled={isDebitView && !selectedDebtor}
            >
              {editingData ? "Update Record" : "Save to Khata"}
            </button>
            {editingData && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-red-400 text-xs font-bold hover:text-red-300"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 🔥 Party Details Popup — Only on ✅ click */}
      {partyDetailsPopup.open && partyDetailsPopup.party && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closePartyDetailsPopup}
        >
          <div
            className="bg-gray-800 border border-gray-600 rounded-2xl p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-3">
              <h3 className="text-lg font-bold text-white">
                📋 {partyDetailsPopup.party.partyName}
              </h3>
              <button
                onClick={closePartyDetailsPopup}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contact Info */}
            <div className="text-xs text-gray-400 mb-3">
              {partyDetailsPopup.party.phone && (
                <span className="mr-3">📞 {partyDetailsPopup.party.phone}</span>
              )}
              {partyDetailsPopup.party.cnic && (
                <span>🪪 {partyDetailsPopup.party.cnic}</span>
              )}
              {partyDetailsPopup.party.ntn && (
                <span>🪪 {partyDetailsPopup.party.ntn}</span>
              )}
            </div>

            {/* Current Balance */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-3 text-center">
              <span className="text-[10px] text-gray-400 uppercase block">
                Current Balance
              </span>
              <span className="text-2xl font-bold text-red-400">
                Rs. {(partyDetailsPopup.party.amount || 0).toLocaleString()}
              </span>
            </div>

            {/* History */}
            {partyDetailsPopup.party.history &&
              partyDetailsPopup.party.history.length > 0 && (
                <>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    📜 Transaction History (
                    {partyDetailsPopup.party.history.length} entries)
                  </h4>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                    {partyDetailsPopup.party.history.map((h, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col p-2 rounded-md text-xs ${
                          h.type === "initial"
                            ? "bg-green-900/20 border-l-2 border-green-500"
                            : h.type === "repay"
                              ? "bg-blue-900/20 border-l-2 border-blue-500"
                              : "bg-red-900/20 border-l-2 border-red-500"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-mono text-[10px]">
                              📅 {h.date || "—"}
                            </span>
                            <span className="text-gray-300 truncate max-w-[100px]">
                              {h.purpose || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {h.type === "initial" && (
                              <span className="text-green-400 font-bold">
                                +Rs. {h.amount?.toLocaleString()}
                              </span>
                            )}
                            {(h.type === "debit" || h.type === "repay") && (
                              <span className="text-red-400 font-bold">
                                -Rs. {h.amount?.toLocaleString()}
                              </span>
                            )}
                            <span className="text-gray-400 text-[10px] font-mono">
                              Bal: Rs. {h.balance?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-3 grid grid-cols-3 gap-1 bg-gray-700/50 px-3 py-2 rounded-lg text-xs">
                    <div className="text-center">
                      <span className="text-gray-400 block text-[8px] uppercase">
                        Initial
                      </span>
                      <span className="text-green-400 font-mono font-bold">
                        Rs.{" "}
                        {partyDetailsPopup.party.history
                          .find((h) => h.type === "initial")
                          ?.amount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="text-center border-x border-gray-600">
                      <span className="text-gray-400 block text-[8px] uppercase">
                        Deducted
                      </span>
                      <span className="text-red-400 font-mono font-bold">
                        Rs.{" "}
                        {partyDetailsPopup.party.history
                          .filter(
                            (h) => h.type === "debit" || h.type === "repay",
                          )
                          .reduce((sum, h) => sum + h.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-400 block text-[8px] uppercase">
                        Remaining
                      </span>
                      <span className="text-yellow-400 font-mono font-bold">
                        Rs.{" "}
                        {partyDetailsPopup.party.amount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </>
              )}

            {/* Close button */}
            <button
              onClick={closePartyDetailsPopup}
              className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
