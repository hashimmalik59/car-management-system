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
    const searchLower = searchTerm.toLowerCase();
    return (
      item.firstName.toLowerCase().includes(searchLower) ||
      item.lastName.toLowerCase().includes(searchLower) ||
      item.phone.includes(searchTerm) ||
      item.plate.toLowerCase().includes(searchLower)
    );
  });

  return (
    /* CHANGE: 'flex-col' for mobile (stacking) 
       'lg:flex-row' for desktop (side-by-side)
    */
    <main className="flex flex-col lg:flex-row p-4 md:p-8 gap-6 lg:gap-10 bg-gray-50 min-h-screen">
      {/* Form Container: Mobile par full width, Desktop par thora chota */}
      <div className="w-full lg:w-1/3">
        <Form onAddCustomer={handleCustomer} editingData={editingCustomer} />
      </div>

      {/* Data/Table Container: Mobile par full width, Desktop par baqi jagah */}
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
