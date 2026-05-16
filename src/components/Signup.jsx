import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "framer-motion";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 1. Eye toggle state add ki

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error.message);
      alert("Incorrect format or email already in use");
      setIsSubmitting(false); // 2. BUG FIXED: Error par false taake button wapas chal sakay
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-500"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
          Create Account
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          IQRA MOTOR INSURANCE
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password Field with Eye Icon */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          {/* 3. Relative Wrapper button ko andar fit karne ke liye */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Dynamic input type
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter your password"
              minLength={6}
              required
            />
            {/* 4. Absolute Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl cursor-pointer select-none bg-transparent border-none outline-none p-1 transition-transform active:scale-95"
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        {/* Register Button */}
        <motion.button
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 dark:shadow-none transition duration-200 flex items-center justify-center gap-2 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            "Register"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Signup;
