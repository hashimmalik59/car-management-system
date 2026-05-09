import React, { useState } from "react";
import { motion } from "framer-motion";
import Form from "./Form";
import Data from "./Data";

const Main = ({ customer, setCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  function handleCustomer(newCustomer) {
    let sanitizedCustomer = {
      ...newCustomer,
    };

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
            ? {
                ...sanitizedCustomer,
                id: editingCustomer.id,
              }
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
        },
      ]);
    }
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
  };
  const filteredCustomers = customer.filter((item) => {
    const s = searchTerm.toLowerCase();

    // ERROR FIX: Check if serviceType is array, then join it.
    // Otherwise use empty string.
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

  return (
    <main className="flex flex-col lg:flex-row p-4 md:p-8 gap-6 lg:gap-10 bg-gray-50 min-h-screen">
      <motion.div
        className="w-full lg:w-1/3"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Form
          onAddCustomer={handleCustomer}
          editingData={editingCustomer}
          onCancelEdit={() => setEditingCustomer(null)}
        />
      </motion.div>

      <div className="w-full lg:w-2/3 overflow-x-auto">
        <Data
          customerData={filteredCustomers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </main>
  );
};

export default Main;
