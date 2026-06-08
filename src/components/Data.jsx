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

// ---------- IMPROVED: Service price extraction (handles number, string, object) ----------
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

// ─── Attachment Display ──────────────────────────────
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

// ─── PRINT FUNCTIONS (unchanged) ─────────────────────────────
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
        <div class="footer"><p>Thank you for choosing Iqra Motor Insurance</p><p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p></div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

const printPartyReceipt = (item) => {
  const vehicles = item.vehicles ?? [];
  const totalAllVehicles = sumVehicleField(vehicles, "vehicleTotal");
  const advanceAllVehicles = sumVehicleField(vehicles, "vehicleAdvance");
  const remainingAllVehicles = sumVehicleField(vehicles, "vehicleRemaining");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${item.partyName}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
        .receipt { max-width: 1000px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
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
        <h3>Vehicles Details:</h3>
        <table class="table">
          <thead>
            <tr><th>#</th><th>Vehicle No</th><th>Model</th><th>Region</th><th>Services</th><th>Bank</th><th class="text-right">Total</th><th class="text-right">Advance</th><th class="text-right">Remaining</th></tr>
          </thead>
          <tbody>
            ${vehicles
              .map(
                (v, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${v.plate || "---"}</td>
                <td>${v.model || "---"}</td>
                <td>${v.region || "---"}${v.regionPrice ? ` (Rs. ${Number(v.regionPrice).toLocaleString()})` : ""}</td>
                <td>${
                  (v.serviceType || [])
                    .map((s) => {
                      const price = getServicePrice(v.servicePrices, s);
                      return `${s} (Rs. ${price.toLocaleString()})`;
                    })
                    .join(", ") || "---"
                }</td>
                <td>${v.bankName || "Cash"}</td>
                <td class="text-right">${Number(v.vehicleTotal || 0).toLocaleString()}</td>
                <td class="text-right">${Number(v.vehicleAdvance || 0).toLocaleString()}</td>
                <td class="text-right">${Number(v.vehicleRemaining || 0).toLocaleString()}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
          <tfoot style="background:#f2f2f2;">
            <tr><td colspan="6" class="text-right"><strong>GRAND TOTAL</strong></td>
              <td class="text-right"><strong>${totalAllVehicles.toLocaleString()}</strong></td>
              <td class="text-right"><strong>${advanceAllVehicles.toLocaleString()}</strong></td>
              <td class="text-right"><strong>${remainingAllVehicles.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>
        <div class="footer"><p>Thank you for choosing Iqra Motor Insurance</p><p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p></div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

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
          <h3 style="margin-top: 0;">Vehicle Details</h3>
          <div class="info-row"><span class="label">Vehicle No:</span><span class="value">${vehicle.plate || "N/A"}</span></div>
          <div class="info-row"><span class="label">Model:</span><span class="value">${vehicle.model || "N/A"}</span></div>
          <div class="info-row"><span class="label">Region:</span><span class="value">${vehicle.region || "N/A"}</span></div>
          ${vehicle.regionPrice ? `<div class="info-row"><span class="label">Region Price:</span><span class="value">Rs. ${Number(vehicle.regionPrice).toLocaleString()}</span></div>` : ""}
          ${vehicle.tokenTaxFrom ? `<div class="info-row"><span class="label">Token Tax From:</span><span class="value">${vehicle.tokenTaxFrom}</span></div>` : ""}
          ${vehicle.tokenTaxTo ? `<div class="info-row"><span class="label">Token Tax To:</span><span class="value">${vehicle.tokenTaxTo}</span></div>` : ""}
        </div>

        <div class="service-box">
          <h3>Services</h3>
          <div class="info-row"><span class="value">${servicesHtml || "No services selected"}</span></div>
        </div>

        ${
          vehicle.conversionServiceType
            ? `
          <div class="service-box" style="background: #eef2ff;">
            <h3>Conversion Details</h3>
            <div>${vehicle.conversionServiceType}</div>
          </div>
        `
            : ""
        }

        <h3>Payment Summary</h3>
        <div class="info-row"><span class="label">Total Amount:</span><span class="value amount">Rs. ${total.toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Advance Paid:</span><span class="value amount">Rs. ${advance.toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Remaining:</span><span class="value amount" style="color: ${remaining > 0 ? "red" : "green"}">Rs. ${remaining.toLocaleString()}</span></div>
        
        <div class="info-row"><span class="label">Payment Method:</span><span class="value">${vehicle.bankName || "Cash"}</span></div>
        <div class="info-row"><span class="label">Received From:</span><span class="value">${partyData.receivedBy || "N/A"}</span></div>
        <div class="info-row"><span class="label">Handover To:</span><span class="value">${partyData.handoverTo || "N/A"}</span></div>
        
        ${vehicle.remarks ? `<div class="info-row"><span class="label">Remarks:</span><span class="value">${vehicle.remarks}</span></div>` : ""}

        <div class="footer">
          <p>Thank you for choosing Iqra Motor Insurance</p>
          <p>Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring Road, Peshawar</p>
        </div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ─── Party Ledger Block (delete button passes item as second argument) ──────────
const PartyLedgerBlock = ({ item, onEdit, onDelete }) => {
  const vehicles = Array.isArray(item?.vehicles) ? item.vehicles : [];
  const hasVehicles = vehicles.length > 0;

  const totalAllVehicles = sumVehicleField(vehicles, "vehicleTotal");
  const advanceAllVehicles = sumVehicleField(vehicles, "vehicleAdvance");
  const remainingAllVehicles = sumVehicleField(vehicles, "vehicleRemaining");

  return (
    <motion.div
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className="w-full rounded-xl border border-gray-700 bg-gray-800 overflow-hidden shadow-lg"
    >
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <p className="text-white font-bold text-sm tracking-wide uppercase">
          PARTY LEDGER :{" "}
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
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Vehicle Details</th>
              <th className="px-4 py-2.5">Region & Region Price</th>
              <th className="px-4 py-2.5">Services</th>
              <th className="px-4 py-2.5">Online Payment</th>
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
                  colSpan={11}
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
                  <td className="px-4 py-3 text-right font-mono text-green-400">
                    {v?.onlinePaymentEnabled
                      ? (Number(v?.onlinePayment) || 0).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AttachmentDisplay attachment={v?.attachment} />
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
                  colSpan={7}
                  className="px-4 py-3 text-right text-gray-300 uppercase"
                >
                  GRAND TOTAL
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold">
                  {totalAllVehicles.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-green-400">
                  {advanceAllVehicles.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-red-400">
                  {remainingAllVehicles.toLocaleString()}
                </td>
                <td className="bg-gray-700"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="bg-gray-900/80 border-t border-gray-700 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-4 text-[10px] text-gray-300">
          <span>💰 Total: Rs. {totalAllVehicles.toLocaleString()}</span>
          <span>💵 Advance: Rs. {advanceAllVehicles.toLocaleString()}</span>
          <span>📊 Remaining: Rs. {remainingAllVehicles.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`text-lg font-mono font-bold ${remainingAllVehicles > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {remainingAllVehicles.toLocaleString()}
          </div>
          <span
            className={`text-[9px] font-black uppercase px-2 py-1 rounded ${remainingAllVehicles > 0 ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"}`}
          >
            {remainingAllVehicles > 0 ? "● PENDING" : "● CLEARED"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Data Component (no refresh button) ─────────────────────────
const Data = ({
  customerData = [],
  searchTerm = "",
  setSearchTerm,
  activeTab = "individual",
  setActiveTab,
  onEdit,
  onDelete,
}) => {
  const filteredData = useMemo(() => {
    const search = (searchTerm || "").toLowerCase();
    if (!Array.isArray(customerData)) return [];

    let filtered = customerData.filter((item) => {
      if (!item || item.type !== activeTab) return false;

      if (search === "pending" || search === "clear") {
        if (item.type === "individual") {
          const bal = Number(item.remainingBalance || 0);
          return search === "pending" ? bal > 0 : bal === 0;
        }
        if (item.type === "party") {
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
      if (item.type === "party") {
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
  }, [customerData, searchTerm, activeTab]);

  return (
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
                activeTab === "individual" ? "text-blue-400" : "text-orange-400"
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
          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-600 bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex bg-gray-700 p-1 rounded-xl w-fit border border-gray-600">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setActiveTab("individual")}
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
          onClick={() => setActiveTab("party")}
          className={`px-6 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
            activeTab === "party"
              ? "bg-gray-800 shadow text-orange-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Party / Business
        </motion.button>
      </div>

      {/* INDIVIDUAL TABLE */}
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
                  <th className="p-4">Payment Details</th>
                  <th className="p-4">Attachment</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 block md:table-row-group">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-gray-500">
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
                                  <div className="uppercase">{serviceName}</div>
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
                              {(Number(item.regionPrice) || 0).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-2 md:p-4 block md:table-cell">
                        <div className="text-[10px] text-gray-300">
                          <span className="text-gray-500 font-bold">FROM:</span>{" "}
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
                          ? `Rs. ${Number(item.commissionAmount).toLocaleString()}`
                          : "-"}
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
                            Advance: {(item.advancePaid || 0).toLocaleString()}
                          </div>
                          <div className="text-[11px] font-bold text-red-400">
                            Bal: {(item.remainingBalance || 0).toLocaleString()}
                          </div>
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
                        <div className="flex gap-2 justify-end md:justify-center">
                          <button
                            onClick={() => printIndividualReceipt(item)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-[10px] font-bold border border-gray-600"
                          >
                            🖨️ Print
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

      {/* PARTY LEDGER BLOCKS */}
      {activeTab === "party" && (
        <div className="flex flex-col gap-5">
          {filteredData.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-sm">
              No party records found.
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
  );
};

export default Data;
