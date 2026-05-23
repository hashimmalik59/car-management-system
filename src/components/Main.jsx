import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Form from "./Form";
import Data from "./Data";
import Reports from "./Reports";
// Main.jsx ke bilkul top par yeh do lines add karo:
import { db } from "../firebase"; // Tumhara firebase config file ka rasta
// Purani line ko hatao aur ab isko lagao:
// Top par jahan query, where, getDocs import kiya tha, wahan yeh do cheezein aur add karo:
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const Main = ({ customer, setCustomer, user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataActiveTab, setDataActiveTab] = useState("individual");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [mainTab, setMainTab] = useState("form");

  // Cloud se sirf is login user ka data fetch karne ke liye useEffect
  React.useEffect(() => {
    if (!user) {
      setCustomer([]);
      return;
    }

    const fetchUserData = async () => {
      try {
        const q = query(
          collection(db, "customers"),
          where("userId", "==", user.uid),
        );

        const querySnapshot = await getDocs(q);
        const loadedCustomers = [];

        querySnapshot.forEach((doc) => {
          loadedCustomers.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        const recentFirst = [...loadedCustomers].reverse();
        setCustomer(recentFirst);
        console.log(
          "Sirf is user ka data cloud se load hogaya:",
          loadedCustomers.length,
          "records",
        );
      } catch (error) {
        console.error("Data fetch karne mein masla aya:", error.message);
      }
    };

    fetchUserData();
  }, [user]);

  async function handleCustomer(newCustomer) {
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
      // 1. Local state (UI) ko foran update karo taake app fast chalay
      setCustomer(
        customer.map((c) =>
          c.id === editingCustomer.id
            ? { ...sanitizedCustomer, id: editingCustomer.id }
            : c,
        ),
      );

      // 2. Background mein Firestore cloud par update bhejo
      (async () => {
        try {
          const updatedCloudData = { ...sanitizedCustomer };

          if (updatedCloudData.attachment && updatedCloudData.attachment.file) {
            updatedCloudData.attachment = {
              ...updatedCloudData.attachment,
              file: null,
            };
          }

          const docRef = doc(db, "customers", editingCustomer.id);
          await updateDoc(docRef, updatedCloudData);
          console.log(
            "Data successfully cloud par UPDATE ho gaya! ID:",
            editingCustomer.id,
          );
        } catch (error) {
          console.error(
            "Firebase cloud par update karne mein error aya:",
            error.message,
          );
          // alert("Update nahi ho saka, dobara koshish karein.");
        }
      })();

      setEditingCustomer(null);
    } else {
      // Naya customer object tayyar karo (Bina kisi local ID ke)
      const customerWithTime = {
        ...sanitizedCustomer,
        createdAt: new Date().toISOString(),
      };

      try {
        // Cloud ke liye gehri copy (Deep Copy)
        const cloudData = JSON.parse(JSON.stringify(customerWithTime));

        // Attachment saaf karo
        if (cloudData.attachment?.file) cloudData.attachment.file = null;

        // Party special cleaner
        if (cloudData.type === "party" && Array.isArray(cloudData.vehicles)) {
          cloudData.vehicles = cloudData.vehicles.map((v) => ({
            ...v,
            attachment: v.attachment
              ? { ...v.attachment, file: null }
              : v.attachment,
          }));
        }

        // Cloud par save karo
        const docRef = await addDoc(collection(db, "customers"), cloudData);

        // Local state update
        setCustomer((prev) => [
          { ...customerWithTime, id: docRef.id },
          ...prev,
        ]);

        return { success: true }; // <--- YEHI WOH JAWAB HAI JO FORM KO MILEGA
      } catch (error) {
        console.error("Error:", error.message);
        return { success: false, message: error.message }; // <--- AGAR ERROR AAYA
      }
    }

    setMainTab("ledger");
  }

  const handleDelete = async (idToDelete) => {
    // 🚨 YEH LINE ADD KARO CHECK KARNE KE LIYE:
    console.log("Delete karne ke liye yeh ID aayi hai:", idToDelete);

    if (window.confirm("Kya aap waqai yeh record delete karna chahte hain?")) {
      try {
        const docRef = doc(db, "customers", idToDelete);
        await deleteDoc(docRef);
        console.log("Record cloud se successfully delete ho gaya!");
        setCustomer(customer.filter((c) => c.id !== idToDelete));
      } catch (error) {
        console.error("Cloud se delete karne mein masla aya:", error.message);
      }
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
    // Filter logic ke andar sabse upar ye line likho
    console.log("Customer data being filtered:", item);
    const s = searchTerm.toLowerCase();

    // 1. Agar user ne 'pending' search kiya hai
    if (s === "pending") {
      if (item.type === "individual") {
        // return Number(item.remainingBalance) > 0;
        const bal = Number(item.remainingBalance);
        console.log("Checking individual:", item.partyName, "Balance:", bal);
        return bal > 0;
      }
      if (item.type === "party") {
        // Agar kisi bhi ek gaadi ka balance baqi hai, toh party show karo
        return (item.vehicles || []).some(
          (v) => Number(v.vehicleRemaining) > 0,
        );
      }
    }

    // 2. Agar 'pending' nahi hai, toh purana search logic chalau
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
              className="w-full mx-auto"
            >
              <Form
                onAddCustomer={handleCustomer}
                editingData={editingCustomer}
                onCancelEdit={handleCancelEdit}
                user={user}
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
