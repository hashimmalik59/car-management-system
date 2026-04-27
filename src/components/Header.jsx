import React from "react";

const Header = ({ totalReceivable = 0 }) => {
  return (
    <header className="bg-white shadow-md flex flex-col md:flex-row justify-between items-center px-4 md:px-10 py-4 border-b border-gray-100 gap-4 md:gap-0">
      {/* Logo Section */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
            Auto<span className="text-blue-600">Khata</span>
          </h1>
        </div>

        {/* Mobile Logout (Only visible on small screens next to logo) */}
        <button className="md:hidden p-2 text-gray-600 hover:text-red-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      {/* Stats & Actions */}
      <div className="flex w-full md:w-auto justify-between md:justify-start gap-4 md:gap-12 items-center border-t md:border-none pt-3 md:pt-0">
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Total Outstanding
          </span>
          <span className="text-xl md:text-2xl text-red-600 font-black font-mono">
            Rs. {totalReceivable.toLocaleString()}
          </span>
        </div>

        {/* Separator - Hidden on Mobile */}
        <div className="hidden md:block h-10 w-[1px] bg-gray-200"></div>

        {/* Desktop Logout Button */}
        <button className="hidden md:flex items-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl font-bold text-sm transition-all border border-gray-200 hover:border-red-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
