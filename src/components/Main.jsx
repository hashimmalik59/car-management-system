import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Form from "./Form";
import Data from "./Data";
import Reports from "./Reports";

const Main = ({ customer, setCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataActiveTab, setDataActiveTab] = useState("individual");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [mainTab, setMainTab] = useState("form");

  function handleCustomer(newCustomer) {
    let sanitizedCustomer = { ...newCustomer };

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

    if (editingCustomer) {
      setCustomer(
        customer.map((c) =>
          c.id === editingCustomer.id
            ? { ...sanitizedCustomer, id: editingCustomer.id }
            : c,
        ),
      );
      setEditingCustomer(null);
    } else {
      setCustomer([
        ...customer,
        {
          ...sanitizedCustomer,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        },
      ]);
    }

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
    setMainTab("form");
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setMainTab("ledger");
  };

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

  const tabs = [
    {
      key: "form",
      label: "New Entry",
      icon: "➕",
      color: "blue",
      desc: "Add customer",
    },
    {
      key: "ledger",
      label: "Ledger",
      icon: "📋",
      color: "violet",
      desc: "View records",
    },
    {
      key: "reports",
      label: "Reports",
      icon: "📊",
      color: "emerald",
      desc: "Analytics",
    },
  ];

  const getTabColors = (key, isActive) => {
    const colors = {
      blue: {
        active:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30",
        inactive:
          "bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400",
      },
      violet: {
        active:
          "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30",
        inactive:
          "bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-500 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400",
      },
      emerald: {
        active:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30",
        inactive:
          "bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400",
      },
    };
    return isActive ? colors[key].active : colors[key].inactive;
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  };

  return (
    <main className="flex flex-col p-4 md:p-8 gap-6 min-h-screen">
      {/* Animated Navigation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-2 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex gap-2">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.key}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMainTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${getTabColors(tab.color, mainTab === tab.key)}`}
              >
                <motion.span
                  animate={mainTab === tab.key ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-xl"
                >
                  {tab.icon}
                </motion.span>
                <div className="flex flex-col items-start">
                  <span className="leading-none">{tab.label}</span>
                  <span
                    className={`text-[8px] font-medium leading-none mt-0.5 ${
                      mainTab === tab.key
                        ? "text-white/70"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {tab.desc}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {mainTab === "form" && (
            <motion.div
              key="form"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full lg:w-2/3 xl:w-1/2 mx-auto"
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
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
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
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
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
