import React, { useState } from "react";
import Form from "./Form";
import Data from "./Data";

const Main = ({ customer, setCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  function handleCustomer(newCustomer) {
    // CRITICAL: Ensure numbers are actually numbers before saving
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

  // Filtered list calculation
  const filteredCustomers = customer.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.firstName.toLowerCase().includes(searchLower) ||
      item.lastName.toLowerCase().includes(searchLower) ||
      item.phone.includes(searchTerm) ||
      item.plate.toLowerCase().includes(searchLower)
    );
  });

  return (
    <main className="flex p-5 gap-10">
      <Form onAddCustomer={handleCustomer} editingData={editingCustomer} />
      <Data
        customerData={filteredCustomers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </main>
  );
};

export default Main;
