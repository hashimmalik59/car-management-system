import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

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

  // 3. Derived State: Live Calculation - Sahi se calculate karega
  const calculateTotalOutstanding = () => {
    let total = 0;

    customer.forEach((item) => {
      if (item.type === "individual") {
        // Individual: indRemaining use karo, agar nahi to remainingBalance
        const remaining = item.indRemaining || item.remainingBalance || 0;
        total += remaining;
      } else if (item.type === "party") {
        // Party: Har vehicle ka vehicleRemaining sum karo
        const vehicles = item.vehicles || [];
        let partyRemaining = 0;

        vehicles.forEach((vehicle) => {
          partyRemaining += vehicle.vehicleRemaining || 0;
        });

        // Agar koi vehicle nahi hai ya sab zero hai, to overall remainingBalance use karo
        if (partyRemaining === 0) {
          partyRemaining = item.remainingBalance || 0;
        }

        total += partyRemaining;
      } else {
        // Purani entries ke liye fallback
        total += item.remainingBalance || 0;
      }
    });

    return total;
  };

  // Pending customers count bhi nikal sakte hain (optional)
  const calculatePendingCount = () => {
    let pending = 0;

    customer.forEach((item) => {
      if (item.type === "individual") {
        const remaining = item.indRemaining || item.remainingBalance || 0;
        if (remaining > 0) pending++;
      } else if (item.type === "party") {
        const vehicles = item.vehicles || [];
        let partyRemaining = 0;
        vehicles.forEach((vehicle) => {
          partyRemaining += vehicle.vehicleRemaining || 0;
        });
        if (partyRemaining === 0) {
          partyRemaining = item.remainingBalance || 0;
        }
        if (partyRemaining > 0) pending++;
      } else {
        if ((item.remainingBalance || 0) > 0) pending++;
      }
    });

    return pending;
  };

  const totalOutstanding = calculateTotalOutstanding();
  const pendingCount = calculatePendingCount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header ko updated calculation pass kar rahe hain */}
      <Header
        totalReceivable={totalOutstanding}
        customerCount={customer.length}
        pendingCount={pendingCount}
      />

      {/* Main ko state aur update karne ka function dono pass ho rahe hain */}
      <Main customer={customer} setCustomer={setCustomer} />
      <Footer />
    </div>
  );
};

export default App;
