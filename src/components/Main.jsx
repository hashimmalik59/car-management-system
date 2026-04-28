import React, { useState } from "react";
import Form from "./Form";
import Data from "./Data";

const Main = ({ customer, setCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  function handleCustomer(newCustomer) {
    const sanitizedCustomer = {
      ...newCustomer,
      totalAmount: Number(newCustomer.totalAmount) || 0,
      advancePaid: Number(newCustomer.advancePaid) || 0,
      remainingBalance:
        Number(newCustomer.totalAmount) - Number(newCustomer.advancePaid),
    };

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
      setCustomer([...customer, { ...sanitizedCustomer, id: Date.now() }]);
    }
  }

  const handleDelete = (idToDelete) => {
    if (window.confirm("Delete record?")) {
      setCustomer(customer.filter((c) => c.id !== idToDelete));
    }
  };

  const handleEdit = (idToEdit) => {
    const target = customer.find((c) => c.id === idToEdit);
    setEditingCustomer({ ...target });
  };

  const filteredCustomers = customer.filter((item) => {
    const s = searchTerm.toLowerCase();

    // Safely grabbing all searchable fields
    const party = item.partyName?.toLowerCase() || "";
    const plate = item.plate?.toLowerCase() || "";
    const phone = item.phone || "";
    const cnic = item.cnic || "";
    const service = item.serviceType?.toLowerCase() || "";
    const region = item.region?.toLowerCase() || "";
    const received = item.receivedBy?.toLowerCase() || "";
    const handover = item.handoverTo?.toLowerCase() || "";

    return (
      party.includes(s) ||
      plate.includes(s) ||
      phone.includes(s) ||
      cnic.includes(s) ||
      service.includes(s) ||
      region.includes(s) ||
      received.includes(s) ||
      handover.includes(s)
    );
  });

  return (
    <main className="flex flex-col lg:flex-row p-4 md:p-8 gap-6 lg:gap-10 bg-gray-50 min-h-screen">
      <div className="w-full lg:w-1/3">
        <Form
          onAddCustomer={handleCustomer}
          editingData={editingCustomer}
          onCancelEdit={() => setEditingCustomer(null)}
        />
      </div>

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
