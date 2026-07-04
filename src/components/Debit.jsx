import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── HELPER: Normalize Name ──────────────────────────────
const normalizeName = (name) => {
  if (!name) return "";
  return name
    .trim()
    .replace(/\s+/g, " ") // Remove extra spaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const Debit = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [mobileView, setMobileView] = useState("form");

  // ─── Popup State ──────────────────────────────────────────
  const [popup, setPopup] = useState({
    open: false,
    existingParty: null,
    newAmount: 0,
  });

  const [formData, setFormData] = useState({
    partyName: "",
    phone: "",
    cnic: "",
    date: "",
    sender: "",
    receiver: "",
    purpose: "",
    amount: "",
    remarks: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ─── LOCAL STORAGE HELPERS ────────────────────────────────
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("debitEntries");
      if (stored) {
        const parsed = JSON.parse(stored);
        setEntries(parsed);
      }
    } catch (e) {
      console.warn("Failed to load from localStorage", e);
    }
  };

  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem("debitEntries", JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  };

  // ─── FIREBASE FETCH ─────────────────────────────────────────
  const fetchEntries = async () => {
    if (!user) {
      loadFromLocalStorage();
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, "debits"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(data);
      saveToLocalStorage(data);
    } catch (error) {
      console.error("Error fetching debits:", error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      loadFromLocalStorage();
    }
  }, [user]);

  // ─── UPDATE DEBIT ENTRY ─────────────────────────────────────
  const updateDebitEntry = async (id, updatedData) => {
    try {
      const updatedEntries = entries.map((e) =>
        e.id === id ? updatedData : e,
      );
      setEntries(updatedEntries);
      saveToLocalStorage(updatedEntries);

      if (user) {
        const docRef = doc(db, "debits", id);
        await updateDoc(docRef, updatedData);
      }

      return { success: true };
    } catch (error) {
      console.error("Update error:", error);
      return { success: false, error: error.message };
    }
  };

  // ─── ADD ENTRY ──────────────────────────────────────────────
  const addEntry = async (e) => {
    e.preventDefault();

    // 🔥 Normalize party name
    const normalizedName = normalizeName(formData.partyName);

    if (!normalizedName || !formData.amount || !formData.purpose) {
      alert("Party Name, Purpose and Amount are required!");
      return;
    }

    const newEntry = {
      ...formData,
      partyName: normalizedName,
      amount: parseFloat(formData.amount),
      category: "debit",
      userId: user?.uid || "local",
      createdAt: new Date().toISOString(),
    };

    // 🔥 Check: Does party exist? (case-insensitive)
    const existingEntry = entries.find(
      (e) => normalizeName(e.partyName) === normalizedName,
    );

    if (existingEntry) {
      const currentBalance = Number(existingEntry.amount);
      const debitAmount = Number(newEntry.amount);

      // ❌ Balance check
      if (debitAmount > currentBalance) {
        alert(
          `❌ Balance kam hai! Available: Rs. ${currentBalance.toLocaleString()}`,
        );
        return;
      }

      const newBalance = currentBalance - debitAmount;

      // 📜 History entry
      const historyEntry = {
        id: `h_${Date.now()}`,
        date: newEntry.date || new Date().toISOString().split("T")[0],
        type: "debit",
        amount: debitAmount,
        balance: newBalance,
        purpose: newEntry.purpose,
        remarks: newEntry.remarks || "",
        // 🔥 Snapshot
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      };

      const updatedEntry = {
        ...existingEntry,
        amount: newBalance,
        history: [...(existingEntry.history || []), historyEntry],
        updatedAt: new Date().toISOString(),
        // 🔥 Update status
        status: newBalance === 0 ? "settled" : "active",
      };

      const result = await updateDebitEntry(existingEntry.id, updatedEntry);

      if (result.success) {
        alert(
          `✅ Kaam record ho gaya!\n\n📅 Date: ${historyEntry.date}\n💰 Deducted: Rs. ${debitAmount.toLocaleString()}\n📊 New Balance: Rs. ${newBalance.toLocaleString()}`,
        );

        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          setMobileView("ledger");
        }
      } else {
        alert("❌ Error updating: " + result.error);
      }

      setFormData({
        partyName: "",
        phone: "",
        cnic: "",
        date: "",
        sender: "",
        receiver: "",
        purpose: "",
        amount: "",
        remarks: "",
      });
      return;
    }

    // ─── NEW PARTY ─────────────────────────────────────────────
    const initialHistory = {
      id: `h_${Date.now()}`,
      date: newEntry.date || new Date().toISOString().split("T")[0],
      type: "initial",
      amount: newEntry.amount,
      balance: newEntry.amount,
      purpose: "Initial Debit Entry",
      remarks: newEntry.remarks || "",
      balanceBefore: 0,
      balanceAfter: newEntry.amount,
    };

    const finalEntry = {
      ...newEntry,
      history: [initialHistory],
      status: "active",
    };

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticEntry = { ...finalEntry, id: tempId };

    const updatedEntries = [optimisticEntry, ...entries];
    setEntries(updatedEntries);
    saveToLocalStorage(updatedEntries);

    setFormData({
      partyName: "",
      phone: "",
      cnic: "",
      date: "",
      sender: "",
      receiver: "",
      purpose: "",
      amount: "",
      remarks: "",
    });

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setMobileView("ledger");
    }

    try {
      const docRef = await addDoc(collection(db, "debits"), {
        ...finalEntry,
        userId: user.uid,
      });
      const finalEntries = updatedEntries.map((item) =>
        item.id === tempId ? { ...item, id: docRef.id } : item,
      );
      setEntries(finalEntries);
      saveToLocalStorage(finalEntries);
      alert(
        `✅ New qarzdaar added!\n\n👤 ${finalEntry.partyName}\n💰 Amount: Rs. ${finalEntry.amount.toLocaleString()}`,
      );
    } catch (error) {
      console.error("Error adding to Firestore:", error);
      alert("❌ Error saving: " + error.message);
    }
  };

  // ─── DELETE ──────────────────────────────────────────────────
  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this debit entry?")) return;

    const previousEntries = [...entries];
    const filteredEntries = entries.filter((entry) => entry.id !== id);
    setEntries(filteredEntries);
    saveToLocalStorage(filteredEntries);

    if (id.startsWith("temp_")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "debits", id));
    } catch (error) {
      console.error("Error deleting from Firestore:", error);
      setEntries(previousEntries);
      saveToLocalStorage(previousEntries);
      const item = previousEntries.find((e) => e.id === id);
      if (item && item.partyName && item.phone) {
        try {
          const q = query(
            collection(db, "debits"),
            where("userId", "==", user.uid),
            where("partyName", "==", item.partyName),
            where("phone", "==", item.phone),
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const realDoc = snapshot.docs[0];
            await deleteDoc(doc(db, "debits", realDoc.id));
          }
        } catch (fallbackErr) {
          console.error("Fallback delete failed:", fallbackErr);
        }
      }
    }
  };

  // ─── EDIT ────────────────────────────────────────────────────
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditData(entry);
  };

  const saveEdit = async (id) => {
    const updatedEntry = {
      ...editData,
      amount: parseFloat(editData.amount),
    };
    const previousEntries = [...entries];
    const updatedEntries = entries.map((entry) =>
      entry.id === id ? { ...updatedEntry, id } : entry,
    );
    setEntries(updatedEntries);
    saveToLocalStorage(updatedEntries);

    setEditingId(null);
    setEditData({});

    if (id.startsWith("temp_")) return;

    try {
      await updateDoc(doc(db, "debits", id), updatedEntry);
    } catch (error) {
      console.error("Error updating Firestore:", error);
      setEntries(previousEntries);
      saveToLocalStorage(previousEntries);
      if (updatedEntry.partyName && updatedEntry.phone) {
        try {
          const q = query(
            collection(db, "debits"),
            where("userId", "==", user.uid),
            where("partyName", "==", updatedEntry.partyName),
            where("phone", "==", updatedEntry.phone),
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const realDoc = snapshot.docs[0];
            await updateDoc(doc(db, "debits", realDoc.id), updatedEntry);
            const finalEntries = entries.map((entry) =>
              entry.id === id ? { ...entry, id: realDoc.id } : entry,
            );
            setEntries(finalEntries);
            saveToLocalStorage(finalEntries);
          }
        } catch (fallbackErr) {
          console.error("Fallback update failed:", fallbackErr);
        }
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // ─── SEARCH / FILTER ─────────────────────────────────────────
  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const fieldMap = {
      all: [entry.partyName, entry.phone, entry.cnic],
      partyName: [entry.partyName],
      phone: [entry.phone],
      cnic: [entry.cnic],
    };

    const fields = fieldMap[searchField] || fieldMap.all;
    return fields.some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(term),
    );
  });

  // ─── STATISTICS ──────────────────────────────────────────────
  const totalEntries = entries.length;
  const uniqueParties = new Set(entries.map((e) => e.partyName)).size;
  const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0);

  // ─── RESET FORM ─────────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      partyName: "",
      phone: "",
      cnic: "",
      date: "",
      sender: "",
      receiver: "",
      purpose: "",
      amount: "",
      remarks: "",
    });
    setEditingId(null);
  };

  // ─── PRINT FUNCTIONS ────────────────────────────────────────
  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank");
    const totalDebit = entries.reduce((sum, e) => sum + Number(e.amount), 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Debit Ledger Report</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 20px; font-size: 14px; line-height: 1.6; color: #222; background: #fff; }
          .receipt { max-width: 1000px; margin: 0 auto; border: 1px solid #ddd; padding: 25px; border-radius: 10px; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; }
          .header p { margin: 5px 0; color: #555; font-size: 14px; }
          .section-title { margin: 20px 0 10px; font-size: 18px; border-left: 4px solid #c0392b; padding-left: 10px; color: #1a1a1a; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; color: #1a1a1a; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-red { color: #c0392b; font-weight: bold; }
          .footer { margin-top: 25px; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>DEBIT LEDGER</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="section-title">📋 All Debit Entries (${entries.length})</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Party Name</th>
                <th>Phone</th>
                <th>CNIC</th>
                <th>Receive From</th>
                <th>Handover To</th>
                <th>Purpose</th>
                <th class="text-right">Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${entries
                .map(
                  (e) => `
                <tr>
                  <td>${e.date || "—"}</td>
                  <td>${e.partyName}</td>
                  <td>${e.phone || "—"}</td>
                  <td>${e.cnic || "—"}</td>
                  <td>${e.sender || "—"}</td>
                  <td>${e.receiver || "—"}</td>
                  <td>${e.purpose}</td>
                  <td class="text-right text-red">Rs. ${Number(
                    e.amount,
                  ).toLocaleString()}</td>
                  <td>${e.remarks || "—"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="text-right"><strong>Total Debit</strong></td>
                <td class="text-right text-red"><strong>Rs. ${totalDebit.toLocaleString()}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>Total Entries: ${entries.length} | Unique Parties: ${uniqueParties}</p>
            <p>Thank you for using Iqra Motor Insurance</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintSingle = (entry) => {
    const printWindow = window.open("", "_blank");

    const history = entry.history || [];
    const totalDebits = history
      .filter((h) => h.type === "debit")
      .reduce((sum, h) => sum + h.amount, 0);
    const initialAmount =
      history.find((h) => h.type === "initial")?.amount || 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Debit Entry Receipt</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 20px; font-size: 14px; line-height: 1.6; color: #222; background: #fff; }
          .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 25px; border-radius: 10px; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; }
          .header p { margin: 5px 0; color: #555; font-size: 14px; }
          .details { margin: 10px 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd; }
          .label { font-weight: bold; width: 160px; color: #333; }
          .value { flex: 1; color: #222; }
          .amount { font-size: 18px; color: #c0392b; font-weight: bold; }
          .history-section { margin-top: 20px; border-top: 2px solid #333; padding-top: 15px; }
          .history-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ddd; font-size: 12px; }
          .history-date { color: #666; }
          .history-debit { color: #c0392b; font-weight: bold; }
          .history-credit { color: #27ae60; font-weight: bold; }
          .history-balance { color: #333; font-weight: bold; }
          .summary { margin-top: 15px; border-top: 2px solid #333; padding-top: 10px; font-size: 14px; }
          .footer { margin-top: 25px; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #777; }
          h3 { font-size: 16px; color: #1a1a1a; margin: 15px 0 10px 0; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>DEBIT STATEMENT</h1>
            <p>${entry.partyName}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="details">
            <div class="row"><span class="label">Party / Name</span><span class="value">${entry.partyName}</span></div>
            <div class="row"><span class="label">Phone</span><span class="value">${entry.phone || "—"}</span></div>
            <div class="row"><span class="label">CNIC</span><span class="value">${entry.cnic || "—"}</span></div>
            <div class="row"><span class="label">Date</span><span class="value">${entry.date || "—"}</span></div>
            <div class="row"><span class="label">Receive From</span><span class="value">${entry.sender || "—"}</span></div>
            <div class="row"><span class="label">Handover To</span><span class="value">${entry.receiver || "—"}</span></div>
            <div class="row"><span class="label">Purpose</span><span class="value">${entry.purpose}</span></div>
            <div class="row"><span class="label">Current Balance</span><span class="value amount">Rs. ${Number(
              entry.amount,
            ).toLocaleString()}</span></div>
            <div class="row"><span class="label">Remarks</span><span class="value">${entry.remarks || "—"}</span></div>
          </div>

          <div class="history-section">
            <h3>📜 Transaction History</h3>
            ${history
              .map(
                (h) => `
              <div class="history-item">
                <div>
                  <span class="history-date">📅 ${h.date || "—"}</span>
                  <span>${h.purpose || "—"}</span>
                </div>
                <div>
                  ${
                    h.type === "initial"
                      ? `<span class="history-credit">+Rs. ${h.amount?.toLocaleString()}</span>`
                      : `<span class="history-debit">-Rs. ${h.amount?.toLocaleString()}</span>`
                  }
                  <span class="history-balance">Bal: Rs. ${h.balance?.toLocaleString()}</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="summary">
            <div>Initial Amount: Rs. ${initialAmount.toLocaleString()}</div>
            <div>Total Deducted: Rs. ${totalDebits.toLocaleString()}</div>
            <div style="font-size:18px; margin-top:8px;">
              <strong>Current Balance: Rs. ${Number(
                entry.amount,
              ).toLocaleString()}</strong>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for using Iqra Motor Insurance</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 p-4 bg-gray-900 rounded-2xl h-[calc(100vh-200px)] md:h-[calc(100vh-100px)] overflow-hidden">
      {/* ─── Mobile Toggle Buttons ─── */}
      <div className="md:hidden flex gap-2 mb-2 flex-shrink-0">
        <button
          onClick={() => setMobileView("form")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            mobileView === "form"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Debit
        </button>
        <button
          onClick={() => setMobileView("ledger")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            mobileView === "ledger"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Ledger
        </button>
      </div>

      {/* ─── LEFT – Form ─── */}
      <div
        className={`flex-1 min-w-[280px] overflow-y-auto pr-1 custom-scroll ${
          mobileView === "ledger" ? "hidden md:block" : ""
        }`}
      >
        <div className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-5 pb-2 border-b-2 border-red-500">
            Debit Entry
          </h2>
          <form onSubmit={addEntry}>
            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                Party / Name *
              </label>
              <input
                type="text"
                placeholder="Enter party or name"
                className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                value={formData.partyName}
                onChange={(e) =>
                  setFormData({ ...formData, partyName: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter phone number"
                className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                CNIC
              </label>
              <input
                type="text"
                placeholder="Enter CNIC number"
                className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                value={formData.cnic}
                onChange={(e) =>
                  setFormData({ ...formData, cnic: e.target.value })
                }
              />
            </div>
            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                Date
              </label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                Receive From / Handover To
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase block mb-0.5">
                    Receive From
                  </label>
                  <input
                    type="text"
                    placeholder="Received from"
                    className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                    value={formData.sender}
                    onChange={(e) =>
                      setFormData({ ...formData, sender: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase block mb-0.5">
                    Handover To
                  </label>
                  <input
                    type="text"
                    placeholder="Handed over"
                    className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                    value={formData.receiver}
                    onChange={(e) =>
                      setFormData({ ...formData, receiver: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                Purpose *
              </label>
              <input
                type="text"
                placeholder="Enter purpose"
                className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                Amount (PKR) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-3.5">
              <label className="block mb-1.5 font-semibold text-gray-300 text-sm">
                Remarks / Notes
              </label>
              <textarea
                placeholder="Any additional remarks..."
                rows="2"
                className="w-full p-2.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50 resize-none"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-red-600 text-white rounded-md text-base font-semibold hover:bg-red-700 transition-colors"
              >
                {editingId ? "Update Debit" : "Add Debit"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 bg-gray-600 text-white rounded-md text-xsm font-semibold hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── RIGHT – Ledger ─── */}
      <div
        className={`flex-[2] min-w-[300px] flex flex-col overflow-hidden ${
          mobileView === "form" ? "hidden md:flex" : ""
        }`}
      >
        <div className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Debit Ledger</h2>
              <button
                onClick={handlePrintAll}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg flex items-center gap-1 transition"
              >
                🖨️ Print All
              </button>
              {loading && (
                <span className="text-xs text-gray-400 animate-pulse">
                  Syncing...
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-300 border border-gray-600">
                📋 Entries: {totalEntries}
              </span>
              <span className="bg-red-900/50 px-3 py-1 rounded-full text-red-300 border border-red-700">
                👥 Pending: {uniqueParties}
              </span>
              <span className="bg-yellow-900/50 px-3 py-1 rounded-full text-yellow-300 border border-yellow-700">
                💰 Remaining: Rs. {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="relative mb-4 flex gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Search by Name, Phone, or CNIC..."
              className="flex-1 p-2.5 pl-4 pr-10 border-2 border-gray-600 rounded-lg text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scroll">
            {loading && entries.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-lg">
                Loading...
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-lg">
                No debit entries found.
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-700/50 p-3.5 mb-3 rounded-lg border-l-4 border-red-500 hover:bg-gray-700 transition-colors"
                >
                  {editingId === entry.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editData.partyName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            partyName: e.target.value,
                          })
                        }
                        placeholder="Party/Name"
                        className="p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={editData.phone || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        placeholder="Phone"
                        className="p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={editData.cnic || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, cnic: e.target.value })
                        }
                        placeholder="CNIC"
                        className="p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editData.sender || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, sender: e.target.value })
                          }
                          placeholder="Receive From"
                          className="flex-1 p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                        />
                        <input
                          type="text"
                          value={editData.receiver || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              receiver: e.target.value,
                            })
                          }
                          placeholder="Handover To"
                          className="flex-1 p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <input
                        type="text"
                        value={editData.purpose || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, purpose: e.target.value })
                        }
                        placeholder="Purpose"
                        className="p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editData.amount || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, amount: e.target.value })
                        }
                        placeholder="Amount"
                        className="p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                      <textarea
                        value={editData.remarks || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, remarks: e.target.value })
                        }
                        placeholder="Remarks"
                        rows="1"
                        className="p-2 border border-gray-600 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => saveEdit(entry.id)}
                          className="px-4 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-1.5 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">
                            {entry.partyName}
                          </h4>
                          <div className="text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                            {entry.phone && <span>📞 {entry.phone}</span>}
                            {entry.cnic && <span>🪪 {entry.cnic}</span>}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-x-2">
                            {entry.sender && (
                              <span>Receive From: {entry.sender}</span>
                            )}
                            {entry.sender && entry.receiver && " | "}
                            {entry.receiver && (
                              <span>Handover To: {entry.receiver}</span>
                            )}
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-900/60 text-red-300 border border-red-700">
                          Debit
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          Amount:{" "}
                          <span className="font-medium text-red-400">
                            -PKR {entry.amount}
                          </span>
                        </span>
                        {entry.purpose && <span>Purpose: {entry.purpose}</span>}
                        {entry.date && <span>Date: {entry.date}</span>}
                        {entry.remarks && (
                          <span className="text-gray-400 text-xs italic">
                            📝 {entry.remarks}
                          </span>
                        )}
                      </div>

                      {/* 🔥 HISTORY SECTION */}
                      {entry.history && entry.history.length > 1 && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                📜 Transaction History
                              </span>
                              <span className="text-[9px] text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">
                                {entry.history.length} entries
                              </span>
                            </div>
                            <span className="text-[9px] text-gray-500">
                              Total Deducted: Rs.{" "}
                              {entry.history
                                .filter((h) => h.type === "debit")
                                .reduce((sum, h) => sum + h.amount, 0)
                                .toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                            {entry.history.map((h, idx) => (
                              <div
                                key={h.id || idx}
                                className={`flex flex-col p-1.5 rounded-md text-xs ${
                                  h.type === "initial"
                                    ? "bg-green-900/20 border-l-2 border-green-500"
                                    : "bg-red-900/20 border-l-2 border-red-500"
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-yellow-400 font-mono text-[10px] font-bold">
                                      📅 {h.date || "—"}
                                    </span>
                                    <span className="text-gray-200 truncate max-w-[80px]">
                                      {h.purpose || "—"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {h.type === "debit" && (
                                      <span className="text-red-400 font-bold text-xs">
                                        -Rs. {h.amount?.toLocaleString()}
                                      </span>
                                    )}
                                    {h.type === "initial" && (
                                      <span className="text-green-400 font-bold text-xs">
                                        +Rs. {h.amount?.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between mt-0.5">
                                  <span className="text-gray-300 text-[10px] font-mono">
                                    Balance: Rs. {h.balance?.toLocaleString()}
                                  </span>
                                  {h.remarks && (
                                    <span className="text-gray-400 text-[9px] italic truncate max-w-[100px]">
                                      📝 {h.remarks}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-2 grid grid-cols-3 gap-1 bg-gray-700/50 px-2 py-1 rounded-md text-xs">
                            <div className="text-center">
                              <span className="text-gray-400 block text-[8px] uppercase">
                                Initial
                              </span>
                              <span className="text-green-400 font-mono font-bold text-xs">
                                Rs.{" "}
                                {entry.history
                                  .find((h) => h.type === "initial")
                                  ?.amount?.toLocaleString() || 0}
                              </span>
                            </div>
                            <div className="text-center border-x border-gray-600">
                              <span className="text-gray-400 block text-[8px] uppercase">
                                Total Deducted
                              </span>
                              <span className="text-red-400 font-mono font-bold text-xs">
                                Rs.{" "}
                                {entry.history
                                  .filter((h) => h.type === "debit")
                                  .reduce((sum, h) => sum + h.amount, 0)
                                  .toLocaleString()}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-gray-400 block text-[8px] uppercase">
                                Remaining
                              </span>
                              <span className="text-yellow-400 font-mono font-bold text-xs">
                                Rs. {Number(entry.amount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-2.5">
                        <button
                          onClick={() => startEdit(entry)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Del
                        </button>
                        <button
                          onClick={() => handlePrintSingle(entry)}
                          className="px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700"
                        >
                          Print
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debit;
