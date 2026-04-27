import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Main from "./components/Main";

const App = () => {
  // 1. Initial State: Pehle check karo agar browser mein purana data para hai
  const [customer, setCustomer] = useState(() => {
    const savedData = localStorage.getItem("autokhata_data");
    // Agar data hai to parse karo (JSON to Object), warna khali array []
    return savedData ? JSON.parse(savedData) : [];
  });

  // 2. Auto-Save: Jab bhi 'customer' list mein koi change aaye, save karlo
  useEffect(() => {
    localStorage.setItem("autokhata_data", JSON.stringify(customer));
  }, [customer]);

  // 3. Derived State: Live Calculation
  const totalOutstanding = customer.reduce((acc, curr) => {
    return acc + (Number(curr.remainingBalance) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header ko calculation yahan se ja rahi hai */}
      <Header totalReceivable={totalOutstanding} />

      {/* Main ko state aur update karne ka function dono pass ho rahe hain */}
      <Main customer={customer} setCustomer={setCustomer} />
    </div>
  );
};

export default App;
