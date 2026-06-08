import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import Signup from "./components/Signup";
import Login from "./components/Login.jsx";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const App = () => {
  const [customer, setCustomer] = useState(() => {
    const savedData = localStorage.getItem("autokhata_data");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);

  useEffect(() => {
    localStorage.setItem("autokhata_data", JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Firebase Auth Listener: User ka login status track karne ke liye
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const calculateTotalOutstanding = () => {
    let total = 0;
    customer.forEach((item) => {
      if (item.type === "individual") {
        total += item.indRemaining || item.remainingBalance || 0;
      } else if (item.type === "party") {
        const vehicles = item.vehicles || [];
        let partyRemaining = vehicles.reduce(
          (sum, v) => sum + (v.vehicleRemaining || 0),
          0,
        );
        if (partyRemaining === 0) partyRemaining = item.remainingBalance || 0;
        total += partyRemaining;
      } else {
        total += item.remainingBalance || 0;
      }
    });
    return total;
  };

  const calculatePendingCount = () => {
    let pending = 0;
    customer.forEach((item) => {
      if (item.type === "individual") {
        if ((item.indRemaining || item.remainingBalance || 0) > 0) pending++;
      } else if (item.type === "party") {
        const vehicles = item.vehicles || [];
        let partyRemaining = vehicles.reduce(
          (sum, v) => sum + (v.vehicleRemaining || 0),
          0,
        );
        if (partyRemaining === 0) partyRemaining = item.remainingBalance || 0;
        if (partyRemaining > 0) pending++;
      } else {
        if ((item.remainingBalance || 0) > 0) pending++;
      }
    });
    return pending;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // alert("Logout Ho Gaya!");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-4"
          />
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black text-gray-800 dark:text-white"
          >
            IQRA MOTOR
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-2"
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 transition-colors duration-500">
      {!user ? (
        <div className="flex flex-col items-center justify-center pt-10">
          {isLoginView ? <Login /> : <Signup />}

          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="mt-6 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer bg-transparent border-none outline-none"
          >
            <span className="text-gray-800 underline">
              {isLoginView ? "Register your account" : "Already registered"}
            </span>
          </button>
        </div>
      ) : (
        /* Agar user login HAI, toh asli Dashboard dikhao */
        <>
          {/* Temporary Logout Button yahan se saaf kar diya hai */}
          <Header
            totalReceivable={calculateTotalOutstanding()}
            customerCount={customer.length}
            pendingCount={calculatePendingCount()}
            onLogout={handleLogout} // <--- Prop pass kar diya Header ko
          />
          <Main customer={customer} setCustomer={setCustomer} user={user} />{" "}
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
