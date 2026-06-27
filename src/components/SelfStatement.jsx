import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const SelfStatement = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    purpose: "",
    bank: "Cash",
    sender: "",
    receiver: "",
    amount: "",
    type: "debit",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "selfStatements"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(data);
    } catch (error) {
      console.error("Error fetching self statements:", error);
      setError("Failed to load entries. Please check Firestore permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      purpose: "",
      bank: "Cash",
      sender: "",
      receiver: "",
      amount: "",
      type: "debit",
      notes: "",
    });
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.purpose || !form.amount) {
      alert("Purpose and Amount are required!");
      return;
    }
    const data = {
      ...form,
      amount: parseFloat(form.amount),
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    setError(null);
    try {
      if (editingId) {
        await updateDoc(doc(db, "selfStatements", editingId), data);
      } else {
        await addDoc(collection(db, "selfStatements"), data);
      }
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error("Error saving self statement:", error);
      setError("Failed to save. Check Firestore permissions.");
      alert("Error saving: " + error.message);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      purpose: entry.purpose,
      bank: entry.bank || "Cash",
      sender: entry.sender || "",
      receiver: entry.receiver || "",
      amount: entry.amount,
      type: entry.type || "debit",
      notes: entry.notes || "",
    });
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    setError(null);
    try {
      await deleteDoc(doc(db, "selfStatements", id));
      fetchEntries();
    } catch (error) {
      console.error("Error deleting:", error);
      setError("Failed to delete. Check Firestore permissions.");
      alert("Error deleting: " + error.message);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const filtered = getFilteredEntries();
    const totalDebit = filtered
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalCredit = filtered
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const netBalance = totalCredit - totalDebit;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Self Statement Report</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; background: white; }
          .receipt { max-width: 1000px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background: white; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #555; }
          .section-title { margin: 20px 0 10px; font-size: 16px; border-left: 4px solid #333; padding-left: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 11px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-red { color: red; }
          .text-green { color: green; }
          .text-yellow { color: #b8860b; }
          .footer { margin-top: 20px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10px; color: #777; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>IQRA MOTOR INSURANCE</h1>
            <p>SELF STATEMENT</p>
            <p style="font-size:10px; color:#999;">Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="section-title">📋 All Entries (${filtered.length})</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Purpose</th>
                <th>Bank</th>
                <th>From → To</th>
                <th class="text-right">Amount</th>
                <th class="text-center">Type</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (e) => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString()}</td>
                  <td>${e.purpose}</td>
                  <td>${e.bank || "Cash"}</td>
                  <td>${e.sender || "—"} → ${e.receiver || "—"}</td>
                  <td class="text-right ${e.type === "debit" ? "text-red" : "text-green"}">
                    Rs. ${Number(e.amount).toLocaleString()}
                  </td>
                  <td class="text-center ${e.type === "debit" ? "text-red" : "text-green"}">
                    ${e.type === "debit" ? "Debit" : "Credit"}
                  </td>
                  <td>${e.notes || "—"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right"><strong>Total Debit</strong></td>
                <td class="text-right text-red"><strong>Rs. ${totalDebit.toLocaleString()}</strong></td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td colspan="4" class="text-right"><strong>Total Credit</strong></td>
                <td class="text-right text-green"><strong>Rs. ${totalCredit.toLocaleString()}</strong></td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td colspan="4" class="text-right"><strong>Net Balance</strong></td>
                <td class="text-right text-yellow"><strong>Rs. ${netBalance.toLocaleString()}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>Thank you for choosing Iqra Motor Insurance</p>
            <p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p>
            <p style="font-size:9px; color:#aaa;">This is a computer generated statement.</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getFilteredEntries = () => {
    let filtered = entries;
    // Search filter (only)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((e) => {
        const purpose = (e.purpose || "").toLowerCase();
        const bank = (e.bank || "").toLowerCase();
        const sender = (e.sender || "").toLowerCase();
        const receiver = (e.receiver || "").toLowerCase();
        const notes = (e.notes || "").toLowerCase();
        return (
          purpose.includes(term) ||
          bank.includes(term) ||
          sender.includes(term) ||
          receiver.includes(term) ||
          notes.includes(term)
        );
      });
    }
    return filtered;
  };

  const filteredEntries = getFilteredEntries();

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 bg-gray-900 text-gray-100 px-4 md:px-6 py-4 rounded-2xl md:h-[calc(100vh-120px)] md:overflow-hidden">
      {/* LEFT COLUMN: Header + Form */}
      <div className="flex flex-col gap-4 md:w-[400px] md:shrink-0 md:overflow-y-auto max-h-[45vh] md:max-h-none overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-gray-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Self Statement
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Manage your personal accounting entries
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white shadow flex items-center gap-2 w-fit"
          >
            🖨️ Print Statement
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-2 md:p-3 shadow">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            {editingId ? "Edit Entry" : "New Entry"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3"
          >
            <div>
              <label className="text-[10px] text-gray-400 uppercase">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase">
                Purpose
              </label>
              <input
                type="text"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g., Office rent"
                className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase">
                Bank / Method
              </label>
              <select
                name="bank"
                value={form.bank}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
              >
                {bankOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase">
                Amount (Rs.)
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
                required
              />
            </div>

            {/* Type full width */}
            <div className="sm:col-span-2">
              <label className="text-[10px] text-gray-400 uppercase">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
              >
                <option value="debit">Debit (Expense)</option>
                <option value="credit">Credit (Income)</option>
              </select>
            </div>

            {/* Sender and Receiver side by side */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-2 md:gap-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase">
                  Sender
                </label>
                <input
                  type="text"
                  name="sender"
                  value={form.sender}
                  onChange={handleChange}
                  placeholder="Who sent?"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase">
                  Receiver
                </label>
                <input
                  type="text"
                  name="receiver"
                  value={form.receiver}
                  onChange={handleChange}
                  placeholder="Who received?"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] text-gray-400 uppercase">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="1"
                placeholder="Any remarks..."
                className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 md:p-2 text-white text-sm"
              />
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium shadow transition"
              >
                {editingId ? "Update Entry" : "Add Entry"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        {/* end of Form */}
      </div>

      {/* RIGHT COLUMN: Search Bar + Table */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col h-[50vh] md:h-auto">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col md:h-full">
          {/* Search Bar – now just above the ledger */}
          <div className="p-3 border-b border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Purpose, Bank, Sender, Receiver, Notes..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-700">
                <tr className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
                  <th className="p-3">Date</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Bank</th>
                  <th className="p-3">From → To</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-400">
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-700/50 transition"
                    >
                      <td className="p-3 text-sm text-gray-200">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm text-gray-200">
                        {entry.purpose}
                      </td>
                      <td className="p-3 text-sm text-gray-200">
                        {entry.bank || "Cash"}
                      </td>
                      <td className="p-3 text-sm text-gray-200">
                        {entry.sender || "—"} → {entry.receiver || "—"}
                      </td>
                      <td
                        className={`p-3 text-sm font-mono text-right ${entry.type === "debit" ? "text-red-400" : "text-green-400"}`}
                      >
                        Rs. {Number(entry.amount).toLocaleString()}
                      </td>
                      <td
                        className={`p-3 text-center text-sm font-semibold ${entry.type === "debit" ? "text-red-400" : "text-green-400"}`}
                      >
                        {entry.type === "debit" ? "Debit" : "Credit"}
                      </td>
                      <td className="p-3 text-sm text-gray-200">
                        {entry.notes || "—"}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-medium"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredEntries.length > 0 && (
                <tfoot className="bg-gray-700 border-t border-gray-600">
                  <tr>
                    <td colSpan="8" className="p-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                        <div className="flex items-center gap-2">
                          <span>Total Debit:</span>
                          <span className="text-red-400">
                            Rs.{" "}
                            {filteredEntries
                              .filter((e) => e.type === "debit")
                              .reduce((sum, e) => sum + Number(e.amount), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Total Credit:</span>
                          <span className="text-green-400">
                            Rs.{" "}
                            {filteredEntries
                              .filter((e) => e.type === "credit")
                              .reduce((sum, e) => sum + Number(e.amount), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Net Balance:</span>
                          <span className="text-yellow-400">
                            Rs.{" "}
                            {(
                              filteredEntries
                                .filter((e) => e.type === "credit")
                                .reduce((sum, e) => sum + Number(e.amount), 0) -
                              filteredEntries
                                .filter((e) => e.type === "debit")
                                .reduce((sum, e) => sum + Number(e.amount), 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfStatement;
