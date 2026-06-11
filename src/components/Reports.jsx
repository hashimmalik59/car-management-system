import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helper Functions ─────────────────────────────────────
const formatShortDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const sumVehicleField = (vehicles = [], field) =>
  (vehicles || []).reduce((sum, v) => sum + (Number(v?.[field]) || 0), 0);

const getIndividualServicePrice = (servicePrices, serviceName) => {
  const val = servicePrices?.[serviceName];
  if (val && typeof val === "object") {
    return (Number(val.price) || 0) + (Number(val.customPrice) || 0);
  }
  return Number(val || 0);
};

// ─── Attachment Display (same as Data.jsx) ─────────────────
const AttachmentDisplay = ({ attachment }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  if (!attachment) return <span className="text-gray-400 text-xs">—</span>;

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const fileName = attachment?.name || attachment?.preview || "";
  const isImage =
    attachment?.file?.type?.startsWith("image/") ||
    imageExtensions.some((ext) => fileName.toLowerCase().includes(ext));

  return (
    <>
      <div
        onClick={() => setViewerOpen(true)}
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
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
      {viewerOpen && (
        <div
          onClick={() => setViewerOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <div
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
          </div>
        </div>
      )}
    </>
  );
};

// ─── Print Functions (individual, party, vehicle) unchanged but using regionPrice ──────────
const printIndividualReceipt = (item) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Receipt - ${item.partyName}</title>
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
                  const price = getIndividualServicePrice(
                    item.servicePrices,
                    s,
                  );
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

const printPartyReceipt = (item) => {
  const vehicles = item.vehicles ?? [];
  const totalAllVehicles = sumVehicleField(vehicles, "vehicleTotal");
  const advanceAllVehicles = sumVehicleField(vehicles, "vehicleAdvance");
  const remainingAllVehicles = sumVehicleField(vehicles, "vehicleRemaining");
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Receipt - ${item.partyName}</title>
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
        <table class="table"><thead><tr><th>#</th><th>Vehicle No</th><th>Model</th><th>Services</th><th>Online Payment</th><th>Online Payment Remarks</th><th>Bank</th><th class="text-right">Total</th><th class="text-right">Advance</th><th class="text-right">Remaining</th></tr></thead>
        <tbody>${vehicles
          .map((v, idx) => {
            const servicesHtml =
              (v.serviceType || [])
                .map(
                  (s) =>
                    `${s} (Rs. ${getServicePrice(v.servicePrices, s).toLocaleString()})`,
                )
                .join(", ") || "---";
            const onlinePaymentAmount = v.onlinePaymentEnabled
              ? (Number(v.onlinePayment) || 0).toLocaleString()
              : "—";
            const onlinePaymentNotes = v.onlinePaymentNotes
              ? v.onlinePaymentNotes
              : "—";
            return `
              <tr>
                <td>${idx + 1}</td>
                <td>${v.plate || "---"}</td>
                <td>${v.model || "---"}</td>
                <td>${servicesHtml}</td>
                <td class="text-right">${onlinePaymentAmount}</td>
                <td class="text-right">${onlinePaymentNotes}</td>
                <td>${v.bankName || "Cash"}</td>
                <td class="text-right">${Number(v.vehicleTotal || 0).toLocaleString()}</td>
                <td class="text-right">${Number(v.vehicleAdvance || 0).toLocaleString()}</td>
                <td class="text-right">${Number(v.vehicleRemaining || 0).toLocaleString()}</td>
              </tr>
            `;
          })
          .join("")}</tbody>
        <tfoot><tr><td colspan="6" class="text-right"><strong>GRAND TOTAL</strong></td>
          <td class="text-right"><strong>${totalAllVehicles.toLocaleString()}</strong></td>
          <td class="text-right"><strong>${advanceAllVehicles.toLocaleString()}</strong></td>
          <td class="text-right"><strong>${remainingAllVehicles.toLocaleString()}</strong></td>
        </tr></tfoot></table>
        ${
          item.remarks
            ? `<div class="info-row" style="margin-top:15px; border-top:1px solid #ccc; padding-top:10px;"><span class="label">Overall Remarks:</span><span class="value">${typeof item.remarks === "string" ? item.remarks : item.remarks.text || item.remarks}</span></div>`
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

const printVehicleReceipt = (vehicle, partyData) => {
  const total = Number(vehicle.vehicleTotal || 0);
  const advance = Number(vehicle.vehicleAdvance || 0);
  const remaining = Number(vehicle.vehicleRemaining || 0);
  const servicesHtml = (vehicle.serviceType || [])
    .map(
      (s) =>
        `${s} — Rs. ${getServicePrice(vehicle.servicePrices, s).toLocaleString()}`,
    )
    .join("<br/>");
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Vehicle Receipt - ${vehicle.plate}</title>
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
        ${vehicle.onlinePaymentEnabled ? `<div class="info-row"><span class="label">Online Payment:</span><span class="value">Rs. ${(Number(vehicle.onlinePayment) || 0).toLocaleString()}</span></div>` : ""}
        ${vehicle.onlinePaymentEnabled && vehicle.onlinePaymentNotes ? `<div class="info-row"><span class="label">Online Payment Remarks:</span><span class="value">${vehicle.onlinePaymentNotes}</span></div>` : ""}
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

// Helper to get service price for party vehicles (same as Data.jsx)
const getServicePrice = (servicePrices, serviceName) => {
  const pObj = servicePrices?.[serviceName];
  if (pObj && typeof pObj === "object") {
    return (Number(pObj.regionPrice) || 0) + (Number(pObj.servicePrice) || 0);
  }
  return Number(pObj || 0);
};

// ─── Party Ledger Block (with region price and online payment details) ───
const PartyLedgerBlock = ({ item }) => {
  const vehicles = Array.isArray(item?.vehicles) ? item.vehicles : [];
  const hasVehicles = vehicles.length > 0;
  const totalAllVehicles = sumVehicleField(vehicles, "vehicleTotal");
  const advanceAllVehicles = sumVehicleField(vehicles, "vehicleAdvance");
  const remainingAllVehicles = sumVehicleField(vehicles, "vehicleRemaining");

  return (
    <div className="w-full rounded-xl border border-gray-700 bg-gray-800 overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <p className="text-white font-bold text-sm tracking-wide">
          PARTY LEDGER :{" "}
          <span className="text-yellow-300">{item.partyName || "N/A"}</span>
          {(item.ntn || item.phone) && (
            <span className="text-orange-200 text-xs ml-2">
              ({item.ntn || item.phone})
            </span>
          )}
        </p>
        <button
          onClick={() => printPartyReceipt(item)}
          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-[10px] font-medium shadow"
        >
          🖨️ Print All
        </button>
      </div>
      <div className="bg-gray-900/60 px-4 py-1.5 flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-700 text-[10px] font-medium text-gray-300">
        {item.phone && <span>📞 {item.phone}</span>}
        {item.region && <span>📍 {item.region}</span>}
        {item.receivedBy && <span>FROM: {item.receivedBy}</span>}
        {item.handoverTo && (
          <span className="text-orange-400">TO: {item.handoverTo}</span>
        )}
        {item.tokenTaxFrom && (
          <span className="text-indigo-400">TAX FROM: {item.tokenTaxFrom}</span>
        )}
        {item.tokenTaxTo && (
          <span className="text-pink-400">TAX TO: {item.tokenTaxTo}</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Vehicle Details</th>
              <th className="px-4 py-2">Region & Region Price</th>
              <th className="px-4 py-2">Services</th>
              <th className="px-4 py-2">Online Payment</th>
              <th className="px-4 py-2">Online Payment Remarks</th>
              <th className="px-4 py-2">Attachment & Remarks</th>
              <th className="px-4 py-2 text-center">Bank</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Advance</th>
              <th className="px-4 py-2 text-right">Remaining</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {!hasVehicles ? (
              <tr>
                <td
                  colSpan={12}
                  className="px-4 py-4 text-center text-gray-500 text-sm"
                >
                  No vehicles recorded.
                </td>
              </tr>
            ) : (
              vehicles.map((v, idx) => (
                <tr
                  key={idx}
                  className="text-sm hover:bg-gray-700/50 transition"
                >
                  <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-white">
                      {v.plate || "---"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {v.model || "---"}
                    </div>
                    {v.tokenTaxFrom && (
                      <div className="text-[10px] text-indigo-400">
                        TAX FROM: {v.tokenTaxFrom}
                      </div>
                    )}
                    {v.tokenTaxTo && (
                      <div className="text-[10px] text-pink-400">
                        TAX TO: {v.tokenTaxTo}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {v.region && (
                      <div>
                        <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-200">
                          📍 {v.region}
                        </span>
                        {v.regionPrice > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            Price: Rs.{Number(v.regionPrice).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(v.serviceType || []).map((s, si) => (
                        <span
                          key={si}
                          className="bg-gray-700 text-gray-200 text-[10px] px-2 py-0.5 rounded"
                        >
                          {s} - Rs.
                          {getServicePrice(v.servicePrices, s).toLocaleString()}
                        </span>
                      ))}
                    </div>
                    {v.conversionServiceType && (
                      <div className="text-xs text-blue-400 mt-1">
                        Conversion: {v.conversionServiceType}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-green-400">
                    {v.onlinePaymentEnabled
                      ? (Number(v.onlinePayment) || 0).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 break-words max-w-[200px]">
                    {v.onlinePaymentNotes || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <AttachmentDisplay attachment={v.attachment} />
                    {v.remarks && (
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
                  <td className="px-4 py-2 text-center">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-200">
                      {v.bankName || "Cash"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-white">
                    {Number(v.vehicleTotal).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-green-400">
                    {Number(v.vehicleAdvance).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-orange-400">
                    {Number(v.vehicleRemaining).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => printVehicleReceipt(v, item)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] font-medium text-gray-200"
                    >
                      🖨️ Print
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {hasVehicles && (
            <tfoot className="bg-gray-700 border-t border-gray-600">
              <tr className="text-xs font-semibold text-gray-200">
                <td colSpan={7} className="px-4 py-2 text-right">
                  GRAND TOTAL
                </td>
                <td className="px-4 py-2 text-right">
                  {totalAllVehicles.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  {advanceAllVehicles.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  {remainingAllVehicles.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="bg-gray-900/80 border-t border-gray-700 px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-sm">
        <div className="flex gap-3 text-xs text-gray-300">
          <span>💰 Total: Rs. {totalAllVehicles.toLocaleString()}</span>
          <span>💵 Advance: Rs. {advanceAllVehicles.toLocaleString()}</span>
          <span>📊 Remaining: Rs. {remainingAllVehicles.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${remainingAllVehicles > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {remainingAllVehicles > 0 ? "● PENDING" : "● CLEARED"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Date Helpers (unchanged) ──────────────────────────────
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
const getEndOfWeek = (date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};
const getStartOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};
const getEndOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};
const getStartOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};
const getEndOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
};

// ─── Get remaining/total/advance ──────────────────────────
const getItemRemaining = (item) => {
  if (!item) return 0;
  if (item.type === "individual") return Number(item.remainingBalance || 0);
  if (item.type === "party")
    return sumVehicleField(item.vehicles, "vehicleRemaining");
  return Number(item.remainingBalance || 0);
};
const getItemTotal = (item) => {
  if (!item) return 0;
  if (item.type === "individual") return Number(item.totalAmount || 0);
  if (item.type === "party")
    return sumVehicleField(item.vehicles, "vehicleTotal");
  return Number(item.totalAmount || 0);
};
const getItemAdvance = (item) => {
  if (!item) return 0;
  if (item.type === "individual") return Number(item.advancePaid || 0);
  if (item.type === "party")
    return sumVehicleField(item.vehicles, "vehicleAdvance");
  return Number(item.advancePaid || 0);
};

// ─── Print Report (enhanced with remarks) ──────────────────────────────
const printReport = (
  reportType,
  dateRange,
  individualData,
  partyData,
  totals,
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print!");
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report - Iqra Motor Insurance</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .card { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 8px; }
        .flex-row { display: flex; justify-content: space-between; align-items: center; }
        .grid-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .font-bold { font-weight: bold; }
        .text-green { color: green; }
        .text-red { color: red; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 11px; }
        th { background: #f4f4f4; }
        .remarks-text { font-size: 11px; color: #555; margin-top: 5px; }
        .online-payment-remarks { font-size: 10px; color: #666; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="header"><h1>IQRA MOTOR INSURANCE</h1><p>${reportType.toUpperCase()} REPORT - ${dateRange.label}</p></div>
      ${
        individualData.length > 0
          ? `<h3>Individual Records (${individualData.length})</h3>${individualData
              .map(
                (item) => `
        <div class="card">
          <div class="flex-row"><strong>${item.partyName}</strong><span>${item.plate || "No Plate"}</span></div>
          <div class="grid-info">
            <div>Total: ${getItemTotal(item).toLocaleString()}</div>
            <div class="text-green">Advance: ${getItemAdvance(item).toLocaleString()}</div>
            <div class="text-red">Remaining: ${getItemRemaining(item).toLocaleString()}</div>
          </div>
          ${
            item.remarks
              ? `<div class="remarks-text"><strong>Remarks:</strong> ${typeof item.remarks === "string" ? item.remarks : item.remarks.text || item.remarks}</div>`
              : ""
          }
        </div>`,
              )
              .join("")}`
          : ""
      }
      ${
        partyData.length > 0
          ? `<h3>Party / Business Records (${partyData.length})</h3>${partyData
              .map(
                (item) => `
        <div class="card">
          <strong>${item.partyName}</strong>
          <table>
            <thead>
              <tr><th>Vehicle</th><th>Total</th><th>Advance</th><th>Remaining</th><th>Online Payment</th><th>Online Payment Remarks</th></tr>
            </thead>
            <tbody>
              ${(item.vehicles || [])
                .map(
                  (v) => `
                <tr>
                  <td>${v.plate}</td>
                  <td>${Number(v.vehicleTotal || 0).toLocaleString()}</td>
                  <td class="text-green">${Number(v.vehicleAdvance || 0).toLocaleString()}</td>
                  <td class="text-red">${Number(v.vehicleRemaining || 0).toLocaleString()}</td>
                  <td>${v.onlinePaymentEnabled ? (Number(v.onlinePayment) || 0).toLocaleString() : "—"}</td>
                  <td class="online-payment-remarks">${v.onlinePaymentNotes ? v.onlinePaymentNotes : "—"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          ${
            item.remarks
              ? `<div class="remarks-text" style="margin-top:8px;"><strong>Overall Remarks:</strong> ${typeof item.remarks === "string" ? item.remarks : item.remarks.text || item.remarks}</div>`
              : ""
          }
        </div>`,
              )
              .join("")}`
          : ""
      }
      <div style="margin-top:20px; text-align:center; font-size:10px;">Generated on: ${new Date().toLocaleString()}</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
};

// ─── Main Reports Component ────────────────────────────────
const Reports = ({ customerData = [] }) => {
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [activeView, setActiveView] = useState("all");

  const dateRange = useMemo(() => {
    const date = new Date(selectedDate);
    switch (reportType) {
      case "daily":
        return {
          start: getStartOfDay(date),
          end: getEndOfDay(date),
          label: date.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      case "weekly":
        return {
          start: getStartOfWeek(date),
          end: getEndOfWeek(date),
          label: `${getStartOfWeek(date).toLocaleDateString("en-GB")} — ${getEndOfWeek(date).toLocaleDateString("en-GB")}`,
        };
      case "monthly":
        return {
          start: getStartOfMonth(date),
          end: getEndOfMonth(date),
          label: date.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          }),
        };
      case "annual":
        return {
          start: getStartOfYear(date),
          end: getEndOfYear(date),
          label: date.getFullYear().toString(),
        };
      default:
        return { start: new Date(0), end: new Date(), label: "" };
    }
  }, [reportType, selectedDate]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(customerData)) return [];
    return customerData.filter((item) => {
      const itemDate = item.createdAt ? new Date(item.createdAt) : new Date();
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }, [customerData, dateRange]);

  const individualData = filteredData.filter((i) => i.type === "individual");
  const partyData = filteredData.filter((i) => i.type === "party");

  const totals = useMemo(() => {
    const indTotal = individualData.reduce((s, i) => s + getItemTotal(i), 0);
    const indAdv = individualData.reduce((s, i) => s + getItemAdvance(i), 0);
    const indRem = individualData.reduce((s, i) => s + getItemRemaining(i), 0);
    const partyTotal = partyData.reduce((s, i) => s + getItemTotal(i), 0);
    const partyAdv = partyData.reduce((s, i) => s + getItemAdvance(i), 0);
    const partyRem = partyData.reduce((s, i) => s + getItemRemaining(i), 0);
    return {
      individualTotal: indTotal,
      individualAdvance: indAdv,
      individualRemaining: indRem,
      partyTotal,
      partyAdvance: partyAdv,
      partyRemaining: partyRem,
      grandTotalAmount: indTotal + partyTotal,
      grandTotalAdvance: indAdv + partyAdv,
      grandTotalRemaining: indRem + partyRem,
      totalCustomers: filteredData.length,
    };
  }, [individualData, partyData]);

  const navigateDate = (dir) => {
    const date = new Date(selectedDate);
    if (reportType === "daily") date.setDate(date.getDate() + dir);
    else if (reportType === "weekly") date.setDate(date.getDate() + dir * 7);
    else if (reportType === "monthly") date.setMonth(date.getMonth() + dir);
    else if (reportType === "annual")
      date.setFullYear(date.getFullYear() + dir);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const reportTypes = [
    {
      key: "daily",
      label: "Daily",
      icon: "📅",
      color: "from-blue-600 to-blue-700",
    },
    {
      key: "weekly",
      label: "Weekly",
      icon: "📆",
      color: "from-violet-600 to-violet-700",
    },
    {
      key: "monthly",
      label: "Monthly",
      icon: "📊",
      color: "from-purple-600 to-purple-700",
    },
    {
      key: "annual",
      label: "Annual",
      icon: "📈",
      color: "from-emerald-600 to-emerald-700",
    },
  ];

  const displayData =
    activeView === "all"
      ? filteredData
      : activeView === "individual"
        ? individualData
        : partyData;

  return (
    <div className="w-full flex flex-col gap-6 bg-gray-900 text-gray-100 px-4 md:px-6 py-6 rounded-2xl">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Generate Daily, Weekly, Monthly & Annual Reports
            </p>
          </div>
          <button
            onClick={() =>
              printReport(
                reportType,
                dateRange,
                individualData,
                partyData,
                totals,
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium shadow transition"
          >
            🖨️ Print {reportType.charAt(0).toUpperCase() + reportType.slice(1)}{" "}
            Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reportTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => {
              setReportType(type.key);
              setSelectedDate(new Date().toISOString().split("T")[0]);
            }}
            className={`py-3 rounded-xl font-medium text-sm transition-all ${
              reportType === type.key
                ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            <span className="text-lg block mb-0.5">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-3 flex flex-wrap items-center justify-between gap-3 shadow">
        <button
          onClick={() => navigateDate(-1)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
        >
          ← Prev
        </button>
        <div className="flex-1 text-center">
          <div className="text-lg font-semibold text-white">
            {dateRange.label}
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            {reportType} Report Period
          </p>
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
        >
          Next →
        </button>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() =>
              setSelectedDate(new Date().toISOString().split("T")[0])
            }
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            title: "Total Customers",
            value: totals.totalCustomers,
            subtext: `${individualData.length} Ind · ${partyData.length} Party`,
            color: "from-amber-500 to-orange-600",
            icon: "👥",
          },
          {
            title: "Total Amount",
            value: `Rs. ${totals.grandTotalAmount.toLocaleString()}`,
            subtext: "All services",
            color: "from-blue-500 to-indigo-600",
            icon: "💰",
          },
          {
            title: "Total Advance",
            value: `Rs. ${totals.grandTotalAdvance.toLocaleString()}`,
            subtext: "Received",
            color: "from-emerald-500 to-teal-600",
            icon: "💵",
          },
          {
            title: "Total Remaining",
            value: `Rs. ${totals.grandTotalRemaining.toLocaleString()}`,
            subtext: "Pending",
            color: "from-red-500 to-rose-600",
            icon: "📊",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-4 shadow-lg text-white`}
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
              {card.title}
            </div>
            <div className="text-lg font-bold mt-1">{card.value}</div>
            <div className="text-[10px] opacity-80 mt-0.5">{card.subtext}</div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-800 p-1 rounded-xl w-fit border border-gray-700">
        {[
          { key: "all", label: "All Records", icon: "📋" },
          { key: "individual", label: "Individual", icon: "👤" },
          { key: "party", label: "Party", icon: "🏢" },
        ].map((view) => (
          <button
            key={view.key}
            onClick={() => setActiveView(view.key)}
            className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === view.key
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span className="mr-1">{view.icon}</span> {view.label}
          </button>
        ))}
      </div>

      {/* Records Display */}
      <AnimatePresence mode="wait">
        {displayData.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-16 text-center">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="text-lg font-semibold text-gray-400">
              No records found
            </h3>
            <p className="text-sm text-gray-500">
              Try selecting a different date or report type
            </p>
          </div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Individual Records Table */}
            {(activeView === "all" || activeView === "individual") &&
              individualData.length > 0 && (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full text-left border-collapse bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                      <thead className="bg-gray-700">
                        <tr className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
                          <th className="p-3">Customer & ID</th>
                          <th className="p-3">Service & Vehicle</th>
                          <th className="p-3">Region & Region Price</th>
                          <th className="p-3">Tracking (From/To)</th>
                          <th className="p-3">Commission</th>
                          <th className="p-3">Payment Details</th>
                          <th className="p-3">Attachment</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {individualData.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-700/50 transition"
                          >
                            <td className="p-3">
                              <div className="font-semibold text-white">
                                {item.partyName || "N/A"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {item.cnic}
                              </div>
                              <div className="text-xs text-blue-400">
                                {item.phone}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1 mb-1">
                                {item.serviceType?.map((s, idx) => {
                                  const price = getIndividualServicePrice(
                                    item.servicePrices,
                                    s,
                                  );
                                  return (
                                    <span
                                      key={idx}
                                      className="bg-gray-700 text-blue-300 text-[10px] px-2 py-0.5 rounded"
                                    >
                                      {s} - Rs.{price.toLocaleString()}
                                    </span>
                                  );
                                })}
                              </div>
                              {item.conversionServiceType && (
                                <div className="text-xs text-blue-400">
                                  Conversion: {item.conversionServiceType}
                                </div>
                              )}
                              <div className="font-medium text-white">
                                {item.plate}
                              </div>
                              <div className="text-xs text-gray-400">
                                {item.model}
                              </div>
                            </td>
                            <td className="p-3">
                              {item.region && (
                                <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-200">
                                  📍 {item.region}
                                </span>
                              )}
                              {item.regionPrice > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Price: Rs.{item.regionPrice.toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-xs text-gray-300">
                              <div>FROM: {item.receivedBy || "—"}</div>
                              <div>TO: {item.handoverTo || "—"}</div>
                              {item.tokenTaxFrom && (
                                <div>Tax From: {item.tokenTaxFrom}</div>
                              )}
                              {item.tokenTaxTo && (
                                <div>Tax To: {item.tokenTaxTo}</div>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-300">
                              {item.commissionAmount > 0
                                ? `Rs. ${item.commissionAmount.toLocaleString()}`
                                : "-"}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`text-[9px] font-bold ${(item.remainingBalance || 0) > 0 ? "text-red-400" : "text-green-400"}`}
                                >
                                  {(item.remainingBalance || 0) > 0
                                    ? "● Pending"
                                    : "● Cleared"}
                                </span>
                                <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded w-fit text-gray-200">
                                  {item.bankName || "Cash"}
                                </span>
                                <div className="text-xs text-gray-300">
                                  Total: {item.totalAmount?.toLocaleString()}
                                </div>
                                <div className="text-xs text-green-400">
                                  Adv: {item.advancePaid?.toLocaleString()}
                                </div>
                                <div className="text-xs font-bold text-red-400">
                                  Bal: {item.remainingBalance?.toLocaleString()}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <AttachmentDisplay attachment={item.attachment} />
                              {item.remarks && (
                                <div className="mt-1 text-[9px] text-gray-400">
                                  <span className="font-semibold">
                                    Remarks:
                                  </span>{" "}
                                  {typeof item.remarks === "string"
                                    ? item.remarks
                                    : item.remarks.text || item.remarks}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => printIndividualReceipt(item)}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] font-medium text-gray-200"
                              >
                                🖨️ Print
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Party Records */}
            {(activeView === "all" || activeView === "party") &&
              partyData.length > 0 && (
                <div className="flex flex-col gap-4">
                  {partyData.map((item) => (
                    <PartyLedgerBlock key={item.id} item={item} />
                  ))}
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
