import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full mt-auto bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-label="Building icon">
                🏢
              </span>
              <span className="font-extrabold text-xl md:text-2xl bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Iqra Motors Insurance
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300">
              <span className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Authorized Dealer
              </span>
              <span className="hidden sm:inline text-gray-600">•</span>
              <span className="flex items-center gap-1">
                <span className="text-green-400">✓</span> 24/7 Support
              </span>
            </div>
          </div>

          {/* Address & Contact Section */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-start gap-2 text-sm text-gray-200">
              <span className="text-lg leading-5" aria-label="Location">
                📍
              </span>
              <span className="max-w-md text-center md:text-right leading-relaxed">
                Shop # 51, Aman Business Center,{" "}
                <br className="hidden sm:block" />
                Near Hazarkhwani Chowk, Ring Road, Peshawar
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-300">
              <a
                href="tel:+923459210585"
                className="flex items-center gap-1 hover:text-blue-400 transition-colors duration-200"
                aria-label="Call us"
              >
                📞 +92 345 9210585
              </a>
              <a
                href="mailto:zafar.afr786@gmail.com"
                className="flex items-center gap-1 hover:text-blue-400 transition-colors duration-200"
                aria-label="Email us"
              >
                ✉️ zafar.afr786@gmail.com
              </a>
              <span className="flex items-center gap-1">
                🕐 Mon-Sat: 9AM – 7PM
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700/60 my-6"></div>

        {/* Copyright & Legal Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            <span>© {currentYear} Iqra Motors Insurance</span>
            <span className="hidden md:inline">|</span>
            <span>All Rights Reserved</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <a
              href="/privacy-policy"
              className="hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              Privacy Policy
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="/terms"
              className="hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              Terms of Service
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="/support"
              className="hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
