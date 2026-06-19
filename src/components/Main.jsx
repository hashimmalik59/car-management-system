import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Form from "./Form";
import Data from "./Data";
import Reports from "./Reports";
import SelfStatement from "./SelfStatement";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const Main = ({ customer, setCustomer, user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataActiveTab, setDataActiveTab] = useState("individual");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [mainTab, setMainTab] = useState("form");

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setCustomer([]);
      return;
    }
    try {
      const q = query(
        collection(db, "customers"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const loadedCustomers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      loadedCustomers.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setCustomer(loadedCustomers);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }, [user, setCustomer]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchUserData();
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchUserData]);

  // ================= OPTIMISTIC HANDLE CUSTOMER (ADD & EDIT) with fallback =================
  // ─── UPDATE RECORD DIRECTLY (for payment updates, etc.) ───
  async function handleUpdateRecord(updatedRecord) {
    const recordId = updatedRecord.id;
    if (!recordId) {
      console.error("No ID found for update");
      return;
    }

    // Optimistic local update
    setCustomer((prev) =>
      prev.map((c) => (c.id === recordId ? { ...updatedRecord } : c)),
    );

    // Prepare clean data for Firestore
    const updateData = { ...updatedRecord };
    if (updateData.attachment?.file) delete updateData.attachment.file;
    if (updateData.type === "party" && updateData.vehicles) {
      updateData.vehicles = updateData.vehicles.map((v) => {
        const clean = { ...v };
        if (clean.attachment?.file) delete clean.attachment.file;
        return clean;
      });
    }

    try {
      const docRef = doc(db, "customers", recordId);
      await updateDoc(docRef, updateData);
      console.log("Record updated directly:", recordId);
    } catch (error) {
      console.error("Direct update error:", error);
      // Fallback search
      if (updatedRecord.partyName && updatedRecord.phone) {
        try {
          const q = query(
            collection(db, "customers"),
            where("userId", "==", user.uid),
            where("partyName", "==", updatedRecord.partyName),
            where("phone", "==", updatedRecord.phone),
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const realDoc = snapshot.docs[0];
            await updateDoc(doc(db, "customers", realDoc.id), updateData);
            setCustomer((prev) =>
              prev.map((c) =>
                c.id === recordId ? { ...c, id: realDoc.id } : c,
              ),
            );
          }
        } catch (fbErr) {
          console.error("Fallback update failed:", fbErr);
        }
      }
      await fetchUserData();
    }
  }

  async function handleCustomer(newCustomer) {
    // --- Sanitization ---
    let sanitizedCustomer = { ...newCustomer };
    if (newCustomer.type === "individual") {
      const total = Number(newCustomer.totalAmount) || 0;
      const advance = Number(newCustomer.advancePaid) || 0;
      sanitizedCustomer = {
        ...newCustomer,
        totalAmount: total,
        advancePaid: advance,
        remainingBalance: total - advance,
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

    // ---------- EDITING (optimistic with fallback) ----------
    if (editingCustomer) {
      const previousCustomers = [...customer];
      const editingId = editingCustomer.id;
      const editingData = { ...sanitizedCustomer };

      // 1. Optimistic local update
      setCustomer((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...editingData, id: editingId } : c,
        ),
      );
      setEditingCustomer(null);
      setMainTab("ledger");

      // 2. Prepare clean data for Firestore
      const updateData = { ...editingData };
      if (updateData.attachment?.file) delete updateData.attachment.file;
      if (updateData.type === "party" && updateData.vehicles) {
        updateData.vehicles = updateData.vehicles.map((v) => {
          const clean = { ...v };
          if (clean.attachment?.file) delete clean.attachment.file;
          return clean;
        });
      }

      // 3. Background update with fallback search
      try {
        const docRef = doc(db, "customers", editingId);
        await updateDoc(docRef, updateData);
        console.log("Edit saved to Firestore");
      } catch (error) {
        console.error("Edit save error:", error);
        // Fallback: if not-found, search by partyName + phone
        if (
          error.code === "not-found" &&
          editingData.partyName &&
          editingData.phone
        ) {
          console.log("Fallback: searching by partyName + phone");
          try {
            const q = query(
              collection(db, "customers"),
              where("userId", "==", user.uid),
              where("partyName", "==", editingData.partyName),
              where("phone", "==", editingData.phone),
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const realDoc = snapshot.docs[0];
              const realId = realDoc.id;
              await updateDoc(doc(db, "customers", realId), updateData);
              // Replace local ID with real one
              setCustomer((prev) =>
                prev.map((c) =>
                  c.id === editingId ? { ...c, id: realId } : c,
                ),
              );
              console.log("Fallback edit successful");
              return;
            }
          } catch (fbErr) {
            console.error("Fallback edit failed:", fbErr);
          }
        }
        // Rollback UI on complete failure
        setCustomer(previousCustomers);
        alert("Save failed: " + error.message);
      }
      return;
    }

    // ---------- ADDING (optimistic) ----------
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const customerWithTime = {
      ...sanitizedCustomer,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    const newCustomerWithId = { ...customerWithTime, id: tempId };
    setCustomer((prev) => [newCustomerWithId, ...prev]);
    setMainTab("ledger");

    try {
      const cloudData = JSON.parse(JSON.stringify(customerWithTime));
      if (cloudData.attachment?.file) delete cloudData.attachment.file;
      if (cloudData.type === "party" && cloudData.vehicles) {
        cloudData.vehicles = cloudData.vehicles.map((v) => {
          const clean = { ...v };
          if (clean.attachment?.file) delete clean.attachment.file;
          return clean;
        });
      }
      const docRef = await addDoc(collection(db, "customers"), cloudData);
      setCustomer((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: docRef.id } : c)),
      );
      console.log("Added to Firestore with ID:", docRef.id);
      return { success: true };
    } catch (error) {
      console.error("Add error:", error);
      setCustomer((prev) => prev.filter((c) => c.id !== tempId));
      alert("Failed to save: " + error.message);
      return { success: false, message: error.message };
    }
  }

  // ================= DELETE (with fallback) =================
  const handleDelete = async (idToDelete, itemData = null) => {
    console.log("Delete called for ID:", idToDelete);
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    const previousCustomers = [...customer];
    setCustomer((prev) => prev.filter((c) => c.id !== idToDelete));

    try {
      const docRef = doc(db, "customers", idToDelete);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.warn(
          "Document ID not found. Trying fallback search by partyName + phone...",
        );
        if (itemData && itemData.partyName && itemData.phone) {
          const q = query(
            collection(db, "customers"),
            where("userId", "==", user.uid),
            where("partyName", "==", itemData.partyName),
            where("phone", "==", itemData.phone),
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const realDoc = snapshot.docs[0];
            console.log("Found matching document with real ID:", realDoc.id);
            await deleteDoc(doc(db, "customers", realDoc.id));
            console.log("Fallback delete successful");
            await fetchUserData();
            return;
          } else {
            console.warn("No matching document found by data.");
          }
        }
        await fetchUserData();
        return;
      }
      await deleteDoc(docRef);
      console.log("Delete successful");
      const verify = await getDoc(docRef);
      if (verify.exists()) throw new Error("Still exists!");
    } catch (error) {
      console.error("Delete error:", error);
      setCustomer(previousCustomers);
      alert("Delete failed: " + error.message);
      await fetchUserData();
    }
  };

  const handleEdit = (idToEdit) => {
    const target = customer.find((c) => c.id === idToEdit);
    if (target) {
      setEditingCustomer({ ...target });
      setMainTab("form");
    } else {
      console.error("Customer not found for edit:", idToEdit);
    }
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setMainTab("ledger");
  };

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
    {
      key: "selfStatement",
      label: "Self Statement",
      icon: "📒",
      color: "teal", // 👈 new color
      desc: "Personal accounting",
    },
  ];

  const getTabColors = (key, isActive) => {
    const colors = {
      blue: {
        active:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30",
        inactive:
          "bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600",
      },
      violet: {
        active:
          "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30",
        inactive:
          "bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-500 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600",
      },
      emerald: {
        active:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30",
        inactive:
          "bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600",
      },
      teal: {
        // 👈 new color for Self Statement
        active:
          "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30",
        inactive:
          "bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-500 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600",
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
                    className={`text-[8px] font-medium leading-none mt-0.5 ${mainTab === tab.key ? "text-white/70" : "text-gray-400 dark:text-gray-500"}`}
                  >
                    {tab.desc}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

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
                customerData={customer}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeTab={dataActiveTab}
                setActiveTab={setDataActiveTab}
                onDelete={(id, item) => handleDelete(id, item)}
                onEdit={handleEdit}
                onUpdateCustomer={handleUpdateRecord}
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

          {mainTab === "selfStatement" && (
            <motion.div
              key="selfStatement"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <SelfStatement user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Main;
