import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mt-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <span className="font-extrabold text-xl md:text-2xl bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Iqra Motors Insurance
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>✓</span>
              <span>Authorized Dealer</span>
              <span className="mx-1">•</span>
              <span>✓</span>
              <span>24/7 Support</span>
            </div>
          </div>

          {/* Address Section */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-lg">📍</span>
              <span className="max-w-md text-center md:text-right">
                Shop # 51, Aman Business Center, Near Hazakhawani Chowk, Ring
                Road, Peshawar
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>📞 +92 300 1234567</span>
              <span>✉️ info@iqramotors.com</span>
              <span>🕐 Mon-Sat: 9AM - 7PM</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-4"></div>

        {/* Copyright Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <div className="flex gap-4">
            <span>© {currentYear} Iqra Motors Insurance</span>
            <span className="hidden md:inline">|</span>
            <span>All Rights Reserved</span>
          </div>
          <div className="flex gap-3">
            <a href="#" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
