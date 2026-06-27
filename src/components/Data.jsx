import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const sumVehicleField = (vehicles = [], field) => {
  if (!Array.isArray(vehicles)) return 0;
  return vehicles.reduce((sum, v) => sum + (Number(v?.[field]) || 0), 0);
};

const getServicePrice = (servicePrices, serviceName) => {
  if (!servicePrices || typeof servicePrices !== "object") {
    console.warn("servicePrices is missing or invalid", servicePrices);
    return 0;
  }
  const val = servicePrices[serviceName];
  if (val === undefined || val === null) {
    console.warn(`No price found for service: ${serviceName}`, servicePrices);
    return 0;
  }

  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = Number(val);
    if (!isNaN(num)) return num;
  }
  if (typeof val === "object") {
    const priceKeys = [
      "servicePrice",
      "price",
      "amount",
      "total",
      "regionPrice",
    ];
    for (let key of priceKeys) {
      if (val[key] !== undefined) {
        const num = Number(val[key]);
        if (!isNaN(num)) return num;
      }
    }
    for (let anyKey in val) {
      const num = Number(val[anyKey]);
      if (!isNaN(num) && val[anyKey] !== null && val[anyKey] !== "") {
        console.warn(
          `Using fallback price from key "${anyKey}" for service ${serviceName}`,
        );
        return num;
      }
    }
  }
  console.warn(`Could not extract price for service ${serviceName}`, val);
  return 0;
};

const AttachmentDisplay = ({ attachment }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  if (!attachment) return <span className="text-gray-500 text-xs">—</span>;

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const fileName = attachment?.name || attachment?.preview || "";
  const isImage =
    attachment?.file?.type?.startsWith("image/") ||
    imageExtensions.some((ext) => fileName.toLowerCase().includes(ext));

  return (
    <>
      <div
        onClick={() => setViewerOpen(true)}
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {isImage ? (
          <img
            src={attachment.preview}
            alt="attach"
            className="w-6 h-6 object-cover rounded border border-gray-600"
          />
        ) : (
          <span className="text-base">📄</span>
        )}
        <span
          className="text-[10px] text-gray-400 truncate max-w-[100px]"
          title={attachment.name}
        >
          {attachment.name}
        </span>
      </div>
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewerOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setViewerOpen(false)}
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl"
              >
                ✕
              </button>
              {isImage ? (
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  className="max-w-full max-h-[90vh] object-contain"
                />
              ) : (
                <div className="p-8 text-center">
                  <span className="text-6xl mb-4 block">📄</span>
                  <p className="text-gray-300 font-mono text-sm mb-4">
                    {attachment.name}
                  </p>
                  <a
                    href={attachment.preview}
                    download={attachment.name}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    Download File
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── INDIVIDUAL RECEIPT ──────────────────────────
const printIndividualReceipt = (item) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${item.partyName}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
        .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px dotted #ccc; }
        .label { font-weight: bold; width: 150px; }
        .value { flex: 1; }
        .footer { margin-top: 20px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10px; }
        .amount { font-size: 14px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header"><h1>IQRA MOTOR INSURANCE</h1><p>Individual Customer Receipt</p><p>Date: ${new Date().toLocaleDateString()}</p></div>
        <div class="info-row"><span class="label">Customer Name:</span><span class="value">${item.partyName || "N/A"}</span></div>
        <div class="info-row"><span class="label">Phone:</span><span class="value">${item.phone || "N/A"}</span></div>
        <div class="info-row"><span class="label">CNIC:</span><span class="value">${item.cnic || "N/A"}</span></div>
        <div class="info-row"><span class="label">Vehicle No:</span><span class="value">${item.plate || "N/A"}</span></div>
        <div class="info-row"><span class="label">Model:</span><span class="value">${item.model || "N/A"}</span></div>
        <div class="info-row"><span class="label">Region:</span><span class="value">${item.region || "N/A"}</span></div>
        <div class="info-row"><span class="label">Region Price:</span><span class="value">Rs. ${(Number(item.regionPrice) || 0).toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Choice:</span><span class="value">${item.choice !== undefined && item.choice !== null ? item.choice : "—"}</span></div>
        <div class="info-row"><span class="label">Received From:</span><span class="value">${item.receivedBy || "N/A"}</span></div>
        <div class="info-row"><span class="label">Handover To:</span><span class="value">${item.handoverTo || "N/A"}</span></div>
        <h3>Services:</h3>
        <div class="info-row"><span class="value">${
          Array.isArray(item.serviceType)
            ? item.serviceType
                .map((s) => {
                  const price = getServicePrice(item.servicePrices, s);
                  return `${s} — Rs. ${price.toLocaleString()}`;
                })
                .join("<br/>")
            : "N/A"
        }</span></div>
        <h3>Payment Summary:</h3>
        <div class="info-row"><span class="label">Total Amount:</span><span class="value amount">Rs. ${(item.totalAmount || 0).toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Advance Paid:</span><span class="value amount">Rs. ${(item.advancePaid || 0).toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Remaining Balance:</span><span class="value amount" style="color: ${(item.remainingBalance || 0) > 0 ? "red" : "green"}">Rs. ${(item.remainingBalance || 0).toLocaleString()}</span></div>
        ${
          item.payments && item.payments.length > 0
            ? `
        <h3>Payment History:</h3>
        ${item.payments
          .map(
            (p, i) => `
        <div class="info-row"><span class="label">${new Date(p.date).toLocaleDateString("en-GB")}:</span><span class="value" style="color:green">+Rs. ${Number(p.amount).toLocaleString()}</span></div>
        `,
          )
          .join("")}
        `
            : ""
        }
        ${
          item.remarks
            ? `<div class="info-row"><span class="label">Remarks:</span><span class="value">${typeof item.remarks === "string" ? item.remarks : item.remarks.text || item.remarks}</span></div>`
            : ""
        }
        <div class="footer"><p>Thank you for choosing Iqra Motor Insurance</p><p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p></div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ─── PARTY RECEIPT ────── (🔥 Choice added)
const printPartyReceipt = (item) => {
  const vehicles = item.vehicles ?? [];
  const totalAllVehicles = sumVehicleField(vehicles, "vehicleTotal");
  const advanceAllVehicles = sumVehicleField(vehicles, "vehicleAdvance");
  const remainingAllVehicles = sumVehicleField(vehicles, "vehicleRemaining");

  // 🔥 Choice amount add kiya
  const choiceAmount = Number(item?.choice) || 0;

  const onlinePaymentEnabled = item.onlinePaymentEnabled || false;
  const onlinePayment = onlinePaymentEnabled
    ? Number(item.onlinePayment || 0)
    : 0;

  // 🔥 AdjustedTotal = TotalVehicles + Choice - OnlinePayment
  const adjustedTotal = Math.max(
    totalAllVehicles + choiceAmount - onlinePayment,
    0,
  );
  const adjustedRemaining = Math.max(
    remainingAllVehicles + choiceAmount - onlinePayment,
    0,
  );

  let overallRemark = "";
  if (item.remarks) {
    overallRemark =
      typeof item.remarks === "string"
        ? item.remarks
        : item.remarks.text || item.remarks;
  }

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${item.partyName}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
        .receipt { max-width: 1200px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px dotted #ccc; }
        .label { font-weight: bold; width: 150px; }
        .value { flex: 1; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .text-right { text-align: right; }
        .footer { margin-top: 20px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10px; }
        .remarks-section { margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; background: #f9f9f9; padding: 10px; border-radius: 5px; }
        .remarks-section .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header"><h1>IQRA MOTOR INSURANCE</h1><p>Party/Business Customer Receipt</p><p>Date: ${new Date().toLocaleDateString()}</p></div>
        <div class="info-row"><span class="label">Party Name:</span><span class="value">${item.partyName || "N/A"}</span></div>
        <div class="info-row"><span class="label">Phone:</span><span class="value">${item.phone || "N/A"}</span></div>
        <div class="info-row"><span class="label">NTN:</span><span class="value">${item.ntn || "N/A"}</span></div>
        <div class="info-row"><span class="label">Region:</span><span class="value">${item.region || "N/A"}</span></div>
        <div class="info-row"><span class="label">Region Price:</span><span class="value">Rs. ${(Number(item.regionPrice) || 0).toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Choice:</span><span class="value">${item.choice !== undefined && item.choice !== null ? `Rs. ${item.choice}` : "—"}</span></div>
        <div class="info-row"><span class="label">Received From:</span><span class="value">${item.receivedBy || "N/A"}</span></div>
        <div class="info-row"><span class="label">Handover To:</span><span class="value">${item.handoverTo || "N/A"}</span></div>
        <h3>Vehicles Details:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vehicle No</th>
              <th>Model</th>
              <th>Services</th>
              <th>Bank</th>
              <th class="text-right">Total</th>
              <th class="text-right">Advance</th>
              <th class="text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            ${vehicles
              .map((v, idx) => {
                const servicesHtml =
                  (v.serviceType || [])
                    .map((s) => {
                      const price = getServicePrice(v.servicePrices, s);
                      return `${s} (Rs. ${price.toLocaleString()})`;
                    })
                    .join(", ") || "---";
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${v.plate || "---"}</td>
                    <td>${v.model || "---"}</td>
                    <td>${servicesHtml}</td>
                    <td>${v.bankName || "Cash"}</td>
                    <td class="text-right">${Number(v.vehicleTotal || 0).toLocaleString()}</td>
                    <td class="text-right">${Number(v.vehicleAdvance || 0).toLocaleString()}</td>
                    <td class="text-right">${Number(v.vehicleRemaining || 0).toLocaleString()}</td>
                  </tr>
                  `;
              })
              .join("")}
          </tbody>
          <tfoot style="background:#f2f2f2;">
            <tr>
              <td colspan="5" class="text-right"><strong>GRAND TOTAL</strong></td>
              <td class="text-right"><strong>${adjustedTotal.toLocaleString()}</strong></td>
              <td class="text-right"><strong>${advanceAllVehicles.toLocaleString()}</strong></td>
              <td class="text-right"><strong>${adjustedRemaining.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>

        ${
          onlinePaymentEnabled
            ? `
          <div class="info-row" style="margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;">
            <span class="label">Online Payment:</span>
            <span class="value">Rs. ${onlinePayment.toLocaleString()}</span>
          </div>
          ${
            item.onlinePaymentNotes
              ? `<div class="info-row"><span class="label">Online Payment Remarks:</span><span class="value">${item.onlinePaymentNotes}</span></div>`
              : ""
          }
          `
            : ""
        }

        <div class="remarks-section">
          <span class="label">📝 Overall Remarks:</span>
          <span class="value">${overallRemark || "— No remarks —"}</span>
        </div>

        <div class="footer"><p>Thank you for choosing Iqra Motor Insurance</p><p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p></div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ─── VEHICLE RECEIPT ──────
const printVehicleReceipt = (vehicle, partyData) => {
  const total = Number(vehicle.vehicleTotal || 0);
  const advance = Number(vehicle.vehicleAdvance || 0);
  const remaining = Number(vehicle.vehicleRemaining || 0);

  const servicesHtml = (vehicle.serviceType || [])
    .map((s) => {
      const price = getServicePrice(vehicle.servicePrices, s);
      return `${s} — Rs. ${price.toLocaleString()}`;
    })
    .join("<br/>");

  const onlinePaymentEnabled = partyData.onlinePaymentEnabled || false;
  const onlinePayment = onlinePaymentEnabled
    ? Number(partyData.onlinePayment || 0)
    : 0;
  const onlinePaymentNotes = partyData.onlinePaymentNotes || "";

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vehicle Receipt - ${vehicle.plate}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
        .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px dotted #ccc; }
        .label { font-weight: bold; width: 150px; }
        .value { flex: 1; }
        .footer { margin-top: 20px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10px; }
        .amount { font-size: 14px; font-weight: bold; }
        .service-box { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>IQRA MOTOR INSURANCE</h1>
          <p>Vehicle Individual Receipt (Party Account)</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="info-row"><span class="label">Party Name:</span><span class="value">${partyData.partyName || "N/A"}</span></div>
        <div class="info-row"><span class="label">Party Phone:</span><span class="value">${partyData.phone || "N/A"}</span></div>
        <div class="info-row"><span class="label">NTN / Reg No:</span><span class="value">${partyData.ntn || "N/A"}</span></div>
        <div style="margin-top: 15px; background: #f0f0f0; padding: 10px; border-radius: 8px;">
          <h3>Vehicle Details</h3>
          <div class="info-row"><span class="label">Vehicle No:</span><span class="value">${vehicle.plate || "N/A"}</span></div>
          <div class="info-row"><span class="label">Model:</span><span class="value">${vehicle.model || "N/A"}</span></div>
          <div class="info-row"><span class="label">Region:</span><span class="value">${vehicle.region || "N/A"}</span></div>
          ${vehicle.regionPrice ? `<div class="info-row"><span class="label">Region Price:</span><span class="value">Rs. ${Number(vehicle.regionPrice).toLocaleString()}</span></div>` : ""}
          ${vehicle.tokenTaxFrom ? `<div class="info-row"><span class="label">Token Tax From:</span><span class="value">${vehicle.tokenTaxFrom}</span></div>` : ""}
          ${vehicle.tokenTaxTo ? `<div class="info-row"><span class="label">Token Tax To:</span><span class="value">${vehicle.tokenTaxTo}</span></div>` : ""}
        </div>
        <div class="service-box"><h3>Services</h3><div class="info-row"><span class="value">${servicesHtml || "No services selected"}</span></div></div>
        ${vehicle.conversionServiceType ? `<div class="service-box" style="background:#eef2ff;"><h3>Conversion Details</h3><div>${vehicle.conversionServiceType}</div></div>` : ""}
        <h3>Payment Summary</h3>
        <div class="info-row"><span class="label">Total Amount:</span><span class="value amount">Rs. ${total.toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Advance Paid:</span><span class="value amount">Rs. ${advance.toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Remaining:</span><span class="value amount" style="color: ${remaining > 0 ? "red" : "green"}">Rs. ${remaining.toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Payment Method:</span><span class="value">${vehicle.bankName || "Cash"}</span></div>

        ${
          onlinePaymentEnabled
            ? `
          <div class="info-row"><span class="label">Online Payment (Party):</span><span class="value">Rs. ${onlinePayment.toLocaleString()}</span></div>
          ${
            onlinePaymentNotes
              ? `<div class="info-row"><span class="label">Online Payment Remarks:</span><span class="value">${onlinePaymentNotes}</span></div>`
              : ""
          }
          `
            : ""
        }

        <div class="info-row"><span class="label">Received From:</span><span class="value">${partyData.receivedBy || "N/A"}</span></div>
        <div class="info-row"><span class="label">Handover To:</span><span class="value">${partyData.handoverTo || "N/A"}</span></div>
        ${vehicle.remarks ? `<div class="info-row"><span class="label">Remarks:</span><span class="value">${vehicle.remarks}</span></div>` : ""}
        <div class="footer"><p>Thank you for choosing Iqra Motor Insurance</p><p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p></div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ─── PARTY LEDGER BLOCK ────────── (🔥 Choice + Commission Display)
const PartyLedgerBlock = ({ item, onEdit, onDelete }) => {
  const vehicles = Array.isArray(item?.vehicles) ? item.vehicles : [];
  const hasVehicles = vehicles.length > 0;

  const totalAllVehicles = sumVehicleField(vehicles, "vehicleTotal");
  const advanceAllVehicles = sumVehicleField(vehicles, "vehicleAdvance");
  const remainingAllVehicles = sumVehicleField(vehicles, "vehicleRemaining");

  // 🔥 Choice amount add kiya
  const choiceAmount = Number(item?.choice) || 0;

  const onlinePaymentEnabled = item?.onlinePaymentEnabled || false;
  const onlinePayment = onlinePaymentEnabled
    ? Number(item?.onlinePayment || 0)
    : 0;
  const onlinePaymentNotes = item?.onlinePaymentNotes || "";

  // 🔥 AdjustedTotal = TotalVehicles + Choice - OnlinePayment
  const adjustedTotal = Math.max(
    totalAllVehicles + choiceAmount - onlinePayment,
    0,
  );
  const adjustedRemaining = Math.max(
    remainingAllVehicles + choiceAmount - onlinePayment,
    0,
  );

  // Theme based on type: Debit = Red, Party = Orange
  const isDebit = item?.type === "debit";
  const headerGradient = isDebit
    ? "from-red-600 to-red-700"
    : "from-orange-600 to-orange-700";
  const accentColor = isDebit ? "red" : "orange";
  const textAccent = isDebit ? "text-red-400" : "text-orange-400";

  return (
    <motion.div
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className="w-full rounded-xl border border-gray-700 bg-gray-800 overflow-hidden shadow-lg"
    >
      <div
        className={`bg-gradient-to-r ${headerGradient} px-4 py-2.5 flex items-center justify-between flex-wrap gap-2`}
      >
        <p className="text-white font-bold text-sm tracking-wide uppercase">
          {isDebit ? "DEBIT LEDGER : " : "PARTY LEDGER : "}
          <span className="text-yellow-300">{item?.partyName || "N/A"}</span>
          {(item?.ntn || item?.phone) && (
            <span className="text-orange-200 font-normal text-xs ml-2">
              ({item.ntn || item.phone})
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => printPartyReceipt(item)}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-[10px] font-medium shadow"
          >
            🖨️ Print All
          </button>
          <button
            onClick={() => onEdit(item.id)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium shadow"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id, item)}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-medium shadow"
          >
            Del
          </button>
        </div>
      </div>
      <div className="bg-gray-900/60 px-4 py-1.5 flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-700 text-[10px] font-medium text-gray-300 uppercase">
        {item?.phone && <span>📞 {item.phone}</span>}
        {item?.region && <span>📍 {item.region}</span>}
        {item?.receivedBy && <span>FROM: {item.receivedBy}</span>}
        {item?.handoverTo && (
          <span className="text-orange-400">TO: {item.handoverTo}</span>
        )}
        {item?.tokenTaxFrom && (
          <span className="text-indigo-400">TAX FROM: {item.tokenTaxFrom}</span>
        )}
        {item?.tokenTaxTo && (
          <span className="text-pink-400">TAX TO: {item.tokenTaxTo}</span>
        )}
        {item?.choice !== undefined && item?.choice !== null && (
          <span className="text-yellow-300">CHOICE: Rs. {item.choice}</span>
        )}
        {/* 🔥 COMMISSION DISPLAY */}
        {item?.commissionAmount > 0 && (
          <span className="text-yellow-300">
            💰 Commission: Rs. {item.commissionAmount}
          </span>
        )}
      </div>

      {item?.remarks && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-xs text-gray-300">
          <span className="font-semibold text-gray-400">Remarks:</span>{" "}
          {typeof item.remarks === "string"
            ? item.remarks
            : item.remarks.text || item.remarks}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Vehicle Details</th>
              <th className="px-4 py-2.5">Region & Region Price</th>
              <th className="px-4 py-2.5">Services</th>
              <th className="px-4 py-2.5">Attachment</th>
              <th className="px-4 py-2.5 text-center">Bank</th>
              <th className="px-4 py-2.5 text-right">Total</th>
              <th className="px-4 py-2.5 text-right">Advance</th>
              <th className="px-4 py-2.5 text-right">Remaining</th>
              <th className="px-4 py-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {!hasVehicles ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-4 text-center text-gray-500 text-sm"
                >
                  No vehicles recorded.
                </td>
              </tr>
            ) : (
              vehicles.map((v, idx) => (
                <tr
                  key={idx}
                  className="text-sm hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white text-xs uppercase">
                      {v?.plate || "---"}
                    </div>
                    <div className="text-[10px] text-gray-400 italic">
                      {v?.model || "---"}
                    </div>
                    {v?.tokenTaxFrom && (
                      <div className="text-[9px] text-indigo-400 font-bold mt-1">
                        TAX FROM: {v.tokenTaxFrom}
                      </div>
                    )}
                    {v?.tokenTaxTo && (
                      <div className="text-[9px] text-pink-400 font-bold">
                        TAX TO: {v.tokenTaxTo}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {v?.region ? (
                      <div className="flex flex-col">
                        <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 w-fit">
                          📍 {v.region}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Rs. {(Number(v?.regionPrice) || 0).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(v?.serviceType || []).map((serviceName, si) => (
                        <div
                          key={si}
                          className="bg-gray-700 text-gray-200 text-[9px] px-2 py-1 rounded font-bold"
                        >
                          <div className="uppercase">{serviceName}</div>
                          <div className="text-[8px] text-gray-400 mt-1">
                            Rs.{" "}
                            {getServicePrice(
                              v?.servicePrices,
                              serviceName,
                            ).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {v?.conversionServiceType && (
                      <div className="bg-gray-700 text-blue-300 text-[9px] px-2 py-1 border border-gray-600 my-1 rounded font-bold">
                        Conversion:{" "}
                        <span className="font-normal">
                          {v.conversionServiceType}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <AttachmentDisplay attachment={v?.attachment} />
                    {v?.remarks && (
                      <div className="mt-1 text-[9px] text-gray-400 break-words max-w-[180px]">
                        <span className="font-semibold text-gray-500">
                          Remarks:
                        </span>{" "}
                        {typeof v.remarks === "string"
                          ? v.remarks
                          : v.remarks.text || v.remarks}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[9px] bg-gray-700 text-gray-200 px-2 py-1 rounded font-bold border border-gray-600">
                      {v?.bankName || "Cash"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    {Number(v?.vehicleTotal).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-green-400">
                    {Number(v?.vehicleAdvance).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-orange-400">
                    {Number(v?.vehicleRemaining).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => printVehicleReceipt(v, item)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[9px] font-medium text-gray-200"
                    >
                      🖨️ Print
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {hasVehicles && (
            <tfoot className="bg-gray-700 border-t-2 border-gray-600">
              <tr className="text-xs font-bold text-gray-200">
                <td
                  colSpan={6}
                  className="px-4 py-3 text-right text-gray-300 uppercase"
                >
                  GRAND TOTAL
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold">
                  {adjustedTotal.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-green-400">
                  {advanceAllVehicles.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-red-400">
                  {adjustedRemaining.toLocaleString()}
                </td>
                <td className="bg-gray-700"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="bg-gray-900/80 border-t border-gray-700 px-4 py-3 flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-4 text-[10px] text-gray-300">
            <span>💰 Total: Rs. {adjustedTotal.toLocaleString()}</span>
            <span>💵 Advance: Rs. {advanceAllVehicles.toLocaleString()}</span>
            <span>📊 Remaining: Rs. {adjustedRemaining.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`text-lg font-mono font-bold ${adjustedRemaining > 0 ? "text-red-400" : "text-green-400"}`}
            >
              {adjustedRemaining.toLocaleString()}
            </div>
            <span
              className={`text-[9px] font-black uppercase px-2 py-1 rounded ${adjustedRemaining > 0 ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"}`}
            >
              {adjustedRemaining > 0 ? "● PENDING" : "● CLEARED"}
            </span>
          </div>
        </div>
        {onlinePaymentEnabled && (
          <div className="flex flex-wrap gap-4 text-[10px] text-gray-300 border-t border-gray-600 pt-2 mt-1">
            <span className="text-green-400">
              💳 Online Payment:{" "}
              <span className="font-mono text-white">
                Rs. {onlinePayment.toLocaleString()}
              </span>
            </span>
            {onlinePaymentNotes && (
              <span className="text-gray-400">
                📝 Remarks:{" "}
                <span className="text-gray-300">{onlinePaymentNotes}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── MAIN DATA COMPONENT ────────────────────────────────────────
const Data = ({
  customerData = [],
  searchTerm = "",
  setSearchTerm,
  activeTab = "individual",
  setActiveTab,
  onEdit,
  onDelete,
  onUpdateCustomer,
}) => {
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    item: null,
    amount: "",
    date: new Date().toLocaleDateString("en-CA"),
  });

  const [showDebitOnly, setShowDebitOnly] = useState(false);

  const filteredData = useMemo(() => {
    const search = (searchTerm || "").toLowerCase();
    if (!Array.isArray(customerData)) return [];

    let filtered = customerData.filter((item) => {
      if (!item) return false;

      let typeMatch = false;
      if (activeTab === "party") {
        typeMatch = showDebitOnly
          ? item.type === "debit"
          : item.type === "party";
      } else {
        typeMatch = item.type === activeTab;
      }
      if (!typeMatch) return false;

      if (search === "pending" || search === "clear") {
        if (item.type === "individual") {
          const bal = Number(item.remainingBalance || 0);
          return search === "pending" ? bal > 0 : bal === 0;
        }
        if (item.type === "party" || item.type === "debit") {
          const vehicles = item.vehicles || [];
          if (vehicles.length === 0) return false;
          if (search === "pending") {
            return vehicles.some((v) => Number(v?.vehicleRemaining || 0) > 0);
          } else {
            return vehicles.every(
              (v) => Number(v?.vehicleRemaining || 0) === 0,
            );
          }
        }
        return false;
      }

      let matchesSearch = false;
      if (item.type === "party" || item.type === "debit") {
        const vehicleSearch = (item.vehicles || []).some(
          (v) =>
            v?.plate?.toLowerCase().includes(search) ||
            v?.model?.toLowerCase().includes(search) ||
            (v?.serviceType || []).join(" ").toLowerCase().includes(search),
        );
        matchesSearch =
          item.partyName?.toLowerCase().includes(search) ||
          item.phone?.toLowerCase().includes(search) ||
          vehicleSearch;
      } else {
        const serviceString = Array.isArray(item.serviceType)
          ? item.serviceType.join(" ").toLowerCase()
          : (item.serviceType || "").toLowerCase();
        matchesSearch =
          item.partyName?.toLowerCase().includes(search) ||
          item.plate?.toLowerCase().includes(search) ||
          (item.phone || "").includes(search) ||
          serviceString.includes(search);
      }
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    return filtered;
  }, [customerData, searchTerm, activeTab, showDebitOnly]);

  const handlePaymentSubmit = () => {
    const amount = Number(paymentModal.amount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    const item = paymentModal.item;
    const currentRemaining = Number(item.remainingBalance) || 0;

    if (amount > currentRemaining) {
      alert(
        `Payment amount (Rs. ${amount.toLocaleString()}) cannot exceed remaining balance (Rs. ${currentRemaining.toLocaleString()})!`,
      );
      return;
    }

    const newPayment = {
      amount,
      date: paymentModal.date,
    };

    let prevPayments = Array.isArray(item.payments) ? [...item.payments] : [];

    if (prevPayments.length === 0 && (item.advancePaid || 0) > 0) {
      prevPayments = [
        {
          amount: Number(item.advancePaid),
          date: item.createdAt
            ? new Date(item.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        },
      ];
    }

    const newPayments = [...prevPayments, newPayment];
    const totalAdvance = newPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const newRemaining = Math.max((item.totalAmount || 0) - totalAdvance, 0);

    const updatedItem = {
      ...item,
      payments: newPayments,
      advancePaid: totalAdvance,
      remainingBalance: newRemaining,
    };

    if (onUpdateCustomer) {
      onUpdateCustomer(updatedItem);
    } else {
      alert("Payment recorded! (onUpdateCustomer prop not provided)");
    }

    setPaymentModal({
      open: false,
      item: null,
      amount: "",
      date: new Date().toLocaleDateString("en-CA"),
    });
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="shadow-xl w-full rounded-2xl px-4 md:px-6 py-5 flex flex-col gap-5 bg-gray-800 border border-gray-700"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Customer Ledger
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Viewing:{" "}
              <span
                className={
                  activeTab === "individual"
                    ? "text-blue-400"
                    : "text-orange-400"
                }
              >
                {activeTab} Records
              </span>
            </p>
          </div>
        </div>

        <div className="relative w-full">
          <motion.input
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            type="search"
            placeholder="Search Name, Phone, Plate, Service..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-600 bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-700 p-1 rounded-xl w-fit border border-gray-600">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveTab("individual");
                setShowDebitOnly(false);
              }}
              className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
                activeTab === "individual"
                  ? "bg-gray-800 shadow text-blue-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Individual Ledger
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveTab("party");
                setShowDebitOnly(false);
              }}
              className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
                activeTab === "party"
                  ? "bg-gray-800 shadow text-orange-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Party / Business
            </motion.button>
          </div>

          {/* DEBIT TOGGLE BUTTON – Red when active */}
          {activeTab === "party" && (
            <button
              onClick={() => setShowDebitOnly(!showDebitOnly)}
              className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all border ${
                showDebitOnly
                  ? "bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30"
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {showDebitOnly ? "Party" : "Debit"}
            </button>
          )}
        </div>

        {activeTab === "individual" && (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-left border-collapse">
                <thead className="hidden md:table-header-group bg-gray-700">
                  <tr className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    <th className="p-4">Customer & ID</th>
                    <th className="p-4">Service & Vehicle</th>
                    <th className="p-4">Region & Region Price</th>
                    <th className="p-4">Tracking (From/To)</th>
                    <th className="p-4">Commission</th>
                    <th className="p-4">Choice</th>
                    <th className="p-4">Payment Details</th>
                    <th className="p-4">Attachment</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 block md:table-row-group">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="p-10 text-center text-gray-500"
                      >
                        No individual records found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr
                        key={item.id}
                        className="flex flex-col md:table-row transition-colors p-4 md:p-0 mb-4 md:mb-0 border md:border-none rounded-xl md:rounded-none bg-gray-800/50 md:bg-transparent hover:bg-gray-700/50"
                      >
                        <td className="p-2 md:p-4 block md:table-cell">
                          <div className="text-sm font-bold uppercase text-white">
                            {item.partyName || "N/A"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {item.cnic}
                          </div>
                          <div className="text-[11px] text-blue-400 font-medium">
                            {item.phone}
                          </div>
                        </td>
                        <td className="p-2 md:p-4 block md:table-cell">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Array.isArray(item.serviceType) &&
                            item.serviceType.length > 0 ? (
                              item.serviceType.map((serviceName, idx) => {
                                const price = getServicePrice(
                                  item.servicePrices,
                                  serviceName,
                                );
                                return (
                                  <div
                                    key={idx}
                                    className="bg-gray-700 text-blue-300 text-[9px] px-2 py-1 rounded font-bold"
                                  >
                                    <div className="uppercase">
                                      {serviceName}
                                    </div>
                                    <div className="text-[8px] text-gray-400 mt-1">
                                      Rs. {price.toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-[11px] text-gray-500">
                                No services
                              </span>
                            )}
                          </div>
                          {item.conversionServiceType && (
                            <div className="bg-gray-700 border border-gray-600 p-1.5 mb-2 rounded text-[10px] text-blue-400 font-bold">
                              Conversion:{" "}
                              <span className="font-normal">
                                {item.conversionServiceType}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-semibold text-white">
                            {item.plate}
                          </div>
                          <div className="text-[10px] text-gray-400 italic">
                            {item.model || "---"}
                          </div>
                        </td>
                        <td className="p-2 md:p-4 block md:table-cell">
                          {item.region && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] bg-gray-700 text-gray-200 px-2 py-0.5 rounded font-bold w-fit">
                                📍 {item.region}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                Rs.{" "}
                                {(
                                  Number(item.regionPrice) || 0
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-2 md:p-4 block md:table-cell">
                          <div className="text-[10px] text-gray-300">
                            <span className="text-gray-500 font-bold">
                              FROM:
                            </span>{" "}
                            {item.receivedBy || "---"}
                          </div>
                          <div className="text-[10px] text-orange-400 font-bold">
                            <span className="text-gray-500">TO:</span>{" "}
                            {item.handoverTo || "---"}
                          </div>
                          {item.tokenTaxFrom && (
                            <span className="text-[9px] text-indigo-400 font-bold">
                              Token Tax From: {item.tokenTaxFrom}
                            </span>
                          )}
                          <br />
                          {item.tokenTaxTo && (
                            <span className="text-[9px] text-pink-400 font-bold">
                              Token Tax To: {item.tokenTaxTo}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {item.commissionAmount > 0
                            ? `Rs.${Number(item.commissionAmount).toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {item.choice !== undefined && item.choice !== null
                            ? `Rs.${item.choice}`
                            : "—"}
                        </td>
                        <td className="p-2 md:p-4 block md:table-cell">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between md:justify-start gap-2 flex-wrap">
                              <span
                                className={`text-[8px] font-black uppercase ${(item.remainingBalance || 0) > 0 ? "text-red-400" : "text-green-400"}`}
                              >
                                {(item.remainingBalance || 0) > 0
                                  ? "● Pending"
                                  : "● Cleared"}
                              </span>
                              <span className="text-[9px] bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded-md font-bold border border-gray-600">
                                {item.bankName || "Cash"}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-300">
                              Total: {(item.totalAmount || 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-green-400 font-medium">
                              Advance:{" "}
                              {(item.advancePaid || 0).toLocaleString()}
                            </div>
                            <div className="text-[11px] font-bold text-red-400">
                              Bal:{" "}
                              {(item.remainingBalance || 0).toLocaleString()}
                            </div>
                            {item.payments && item.payments.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-600">
                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                                  Payment History
                                </div>
                                <div className="flex flex-col gap-1">
                                  {item.payments.map((p, pi) => (
                                    <div
                                      key={pi}
                                      className="flex justify-between text-[10px]"
                                    >
                                      <span className="text-gray-400">
                                        {new Date(p.date).toLocaleDateString(
                                          "en-GB",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          },
                                        )}
                                      </span>
                                      <span className="text-green-400 font-mono">
                                        +Rs. {Number(p.amount).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2 md:p-4 block md:table-cell">
                          <AttachmentDisplay attachment={item.attachment} />
                          {item.remarks && (
                            <div className="mt-1 space-y-1">
                              <div className="text-[10px] text-gray-400 italic break-words">
                                <span className="font-bold">Remarks:</span>{" "}
                                {typeof item.remarks === "string"
                                  ? item.remarks
                                  : item.remarks.text || item.remarks}
                              </div>
                              {item.createdAt && (
                                <div className="text-[9px] text-gray-500 font-mono">
                                  📅{" "}
                                  {new Date(item.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-3 md:p-4 block md:table-cell border-t md:border-none">
                          <div className="grid grid-cols-2 gap-2 justify-end md:justify-center">
                            <button
                              onClick={() => printIndividualReceipt(item)}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-[10px] font-bold border border-gray-600"
                            >
                              🖨️ Print
                            </button>
                            <button
                              onClick={() =>
                                setPaymentModal({
                                  open: true,
                                  item: item,
                                  amount: "",
                                  date: new Date().toLocaleDateString("en-CA"),
                                })
                              }
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow"
                            >
                              💰 Pay
                            </button>
                            <button
                              onClick={() => onEdit(item.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(item.id, item)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold shadow"
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "party" && (
          <div className="flex flex-col gap-5">
            {filteredData.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-sm">
                {showDebitOnly
                  ? "No Debit entries found."
                  : "No party records found."}
              </div>
            ) : (
              filteredData.map((item) => (
                <PartyLedgerBlock
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        )}
      </motion.section>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal.open && paymentModal.item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() =>
              setPaymentModal({
                open: false,
                item: null,
                amount: "",
                date: new Date().toLocaleDateString("en-CA"),
              })
            }
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-1">Add Payment</h3>
              <p className="text-[10px] text-gray-400 mb-2">
                {paymentModal.item.partyName}
              </p>

              {(() => {
                const currentRemaining =
                  Number(paymentModal.item.remainingBalance) || 0;
                const enteredAmount = Number(paymentModal.amount) || 0;
                const newRemaining = Math.max(
                  currentRemaining - enteredAmount,
                  0,
                );
                const isOverPay = enteredAmount > currentRemaining;

                return (
                  <div className="bg-gray-900 rounded-lg p-3 mb-4 border border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-gray-400 uppercase">
                        Current Remaining
                      </span>
                      <span className="text-sm font-bold text-orange-400">
                        Rs. {currentRemaining.toLocaleString()}
                      </span>
                    </div>
                    {enteredAmount > 0 && (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-400 uppercase">
                            Payment Amount
                          </span>
                          <span
                            className={`text-sm font-bold ${isOverPay ? "text-red-500" : "text-emerald-400"}`}
                          >
                            -Rs. {enteredAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t border-gray-700 pt-1 mt-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase">
                              New Remaining
                            </span>
                            <span
                              className={`text-sm font-bold ${isOverPay ? "text-red-500" : newRemaining === 0 ? "text-green-400" : "text-blue-400"}`}
                            >
                              Rs.{" "}
                              {isOverPay
                                ? "Overpay!"
                                : newRemaining.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {isOverPay && (
                          <div className="mt-2 text-[10px] text-red-400 bg-red-900/30 border border-red-700 rounded px-2 py-1">
                            ⚠️ Amount exceeds remaining balance!
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    className="rounded-lg p-2.5 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-emerald-500"
                    placeholder="Enter amount"
                    value={paymentModal.amount}
                    onChange={(e) =>
                      setPaymentModal((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    autoFocus
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="rounded-lg p-2.5 border border-gray-600 bg-gray-700 text-white text-sm outline-none focus:border-emerald-500"
                    value={paymentModal.date}
                    onChange={(e) =>
                      setPaymentModal((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handlePaymentSubmit}
                  disabled={
                    Number(paymentModal.amount) >
                    (Number(paymentModal.item.remainingBalance) || 0)
                  }
                  className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-all ${
                    Number(paymentModal.amount) >
                    (Number(paymentModal.item.remainingBalance) || 0)
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  Save Payment
                </button>
                <button
                  onClick={() =>
                    setPaymentModal({
                      open: false,
                      item: null,
                      amount: "",
                      date: new Date().toLocaleDateString("en-CA"),
                    })
                  }
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Data;
