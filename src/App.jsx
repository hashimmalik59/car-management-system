import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import Signup from "./components/Signup";
import Login from "./components/Login.jsx";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const App = () => {
  const [customer, setCustomer] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let authResolved = false;

    // Minimum 2 seconds loader (guaranteed)
    const minLoadTime = 2000; // 2 seconds
    const startTime = Date.now();

    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      authResolved = true;
      // Check if minimum time has passed
      const elapsed = Date.now() - startTime;
      if (elapsed >= minLoadTime) {
        setIsLoading(false);
      } else {
        // Wait remaining time
        const remaining = minLoadTime - elapsed;
        timerRef.current = setTimeout(() => {
          setIsLoading(false);
        }, remaining);
      }
    });

    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsubscribe();
    };
  }, []); // Empty dependency array – run only once

  const calculateTotalOutstanding = () => {
    let total = 0;
    customer.forEach((item) => {
      if (item.type === "individual") {
        total += item.remainingBalance || 0;
      } else if (item.type === "party") {
        const vehicles = item.vehicles || [];
        const partyRemaining = vehicles.reduce(
          (sum, v) => sum + (v.vehicleRemaining || 0),
          0,
        );
        total += partyRemaining;
      }
    });
    return total;
  };

  const calculatePendingCount = () => {
    let pending = 0;
    customer.forEach((item) => {
      if (item.type === "individual") {
        if ((item.remainingBalance || 0) > 0) pending++;
      } else if (item.type === "party") {
        const vehicles = item.vehicles || [];
        const partyRemaining = vehicles.reduce(
          (sum, v) => sum + (v.vehicleRemaining || 0),
          0,
        );
        if (partyRemaining > 0) pending++;
      }
    });
    return pending;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
        <>
          <Header
            totalReceivable={calculateTotalOutstanding()}
            customerCount={customer.length}
            pendingCount={calculatePendingCount()}
            onLogout={handleLogout}
          />
          <Main customer={customer} setCustomer={setCustomer} user={user} />
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
