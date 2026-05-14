import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Form from "./Form";
import Data from "./Data";
import Reports from "./Reports";

const Main = ({ customer, setCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataActiveTab, setDataActiveTab] = useState("individual");
  const [editingCustomer, setEditingCustomer] = useState(null);

  // ─── NEW: Main navigation tabs ─────────────────────────────────────
  const [mainTab, setMainTab] = useState("form"); // "form" | "ledger" | "reports"

  function handleCustomer(newCustomer) {
    let sanitizedCustomer = { ...newCustomer };

    // INDIVIDUAL
    if (newCustomer.type === "individual") {
      sanitizedCustomer = {
        ...newCustomer,
        totalAmount: Number(newCustomer.totalAmount) || 0,
        advancePaid: Number(newCustomer.advancePaid) || 0,
        remainingBalance:
          (Number(newCustomer.totalAmount) || 0) -
          (Number(newCustomer.advancePaid) || 0),
      };
    }

    // PARTY
    if (newCustomer.type === "party") {
      sanitizedCustomer = {
        ...newCustomer,
        vehicles: (newCustomer.vehicles || []).map((v) => ({
          ...v,
          vehicleTotal: Number(v.vehicleTotal) || 0,
          vehicleAdvance: Number(v.vehicleAdvance) || 0,
          vehicleRemaining:
            (Number(v.vehicleTotal) || 0) - (Number(v.vehicleAdvance) || 0),
        })),
      };
    }

    // UPDATE
    if (editingCustomer) {
      setCustomer(
        customer.map((c) =>
          c.id === editingCustomer.id
            ? { ...sanitizedCustomer, id: editingCustomer.id }
            : c,
        ),
      );
      setEditingCustomer(null);
    }
    // NEW
    else {
      setCustomer([
        ...customer,
        {
          ...sanitizedCustomer,
          id: Date.now(),
          createdAt: new Date().toISOString(), // Ensure createdAt exists
        },
      ]);
    }

    // ─── NEW: Save ke baad Ledger tab pe le jao ─────────────────────
    setMainTab("ledger");
  }

  const handleDelete = (idToDelete) => {
    if (window.confirm("Delete record?")) {
      setCustomer(customer.filter((c) => c.id !== idToDelete));
    }
  };

  const handleEdit = (idToEdit) => {
    const target = customer.find((c) => c.id === idToEdit);
    if (!target) {
      console.error("Customer not found:", idToEdit);
      return;
    }
    setEditingCustomer({ ...target });
    setMainTab("form"); // ─── NEW: Edit pe Form tab pe le jao ──────
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setMainTab("ledger"); // Cancel pe wapas Ledger
  };

  // ─── Filter (same as before) ──────────────────────────────────────
  const filteredCustomers = customer.filter((item) => {
    const s = searchTerm.toLowerCase();
    const service = Array.isArray(item.serviceType)
      ? item.serviceType.join(" ").toLowerCase()
      : item.serviceType?.toLowerCase() || "";
    const party = item.partyName?.toLowerCase() || "";
    const plate = item.plate?.toLowerCase() || "";
    const phone = item.phone || "";
    const cnic = item.cnic || "";
    const region = item.region?.toLowerCase() || "";
    const received = item.receivedBy?.toLowerCase() || "";
    const handover = item.handoverTo?.toLowerCase() || "";

    const vehicleSearch =
      item.type === "party"
        ? (item.vehicles || []).some((v) => {
            const vPlate = v.plate?.toLowerCase() || "";
            const vModel = v.model?.toLowerCase() || "";
            const vServices = Array.isArray(v.serviceType)
              ? v.serviceType.join(" ").toLowerCase()
              : "";
            return (
              vPlate.includes(s) || vModel.includes(s) || vServices.includes(s)
            );
          })
        : false;

    return (
      party.includes(s) ||
      plate.includes(s) ||
      phone.includes(s) ||
      cnic.includes(s) ||
      service.includes(s) ||
      region.includes(s) ||
      received.includes(s) ||
      handover.includes(s) ||
      vehicleSearch
    );
  });

  // ─── Tab Config ───────────────────────────────────────────────────
  const tabs = [
    { key: "form", label: "New Entry", icon: "➕", color: "blue" },
    { key: "ledger", label: "Ledger", icon: "📋", color: "gray" },
    { key: "reports", label: "Reports", icon: "📊", color: "emerald" },
  ];

  const getTabStyle = (key, isActive) => {
    if (!isActive)
      return "bg-white/60 text-gray-500 hover:text-gray-700 hover:bg-white";
    switch (key) {
      case "form":
        return "bg-blue-600 text-white shadow-lg shadow-blue-200";
      case "ledger":
        return "bg-gray-800 text-white shadow-lg shadow-gray-300";
      case "reports":
        return "bg-emerald-600 text-white shadow-lg shadow-emerald-200";
      default:
        return "";
    }
  };

  return (
    <main className="flex flex-col p-4 md:p-8 gap-6 bg-gray-50 min-h-screen">
      {/* ═══ NAVIGATION TABS ═══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto"
      >
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${getTabStyle(tab.key, mainTab === tab.key)}`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ═══ TAB CONTENT ═══════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {mainTab === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full lg:w-1/2 mx-auto"
            >
              <Form
                onAddCustomer={handleCustomer}
                editingData={editingCustomer}
                onCancelEdit={handleCancelEdit}
              />
            </motion.div>
          )}

          {mainTab === "ledger" && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Data
                customerData={filteredCustomers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeTab={dataActiveTab}
                setActiveTab={setDataActiveTab}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </motion.div>
          )}

          {mainTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Reports customerData={customer} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Main;
