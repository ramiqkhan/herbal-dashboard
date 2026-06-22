import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminNavbar({ handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Changed to a full-width header block that stays sticky at the very top of the window
    <header className="w-full bg-gray-900 text-white px-4 py-3 lg:px-6 sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between relative">
        
        {/* Left Side: Brand Logo & Hamburger Toggle Button */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <h1 className="text-xl font-bold tracking-tight">
            Admin Panel
          </h1>
          
          {/* Hamburger Toggle Button (Visible only on mobile/tablet viewports) */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="block lg:hidden p-2 text-gray-400 hover:text-white transition focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isOpen ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.83-4.828 4.83a1 1 0 01-1.414-1.414l4.829-4.83-4.829-4.83a1 1 0 011.414-1.414l4.828 4.83 4.83-4.83a1 1 0 111.414 1.414l-4.83 4.83 4.83 4.83z" />
              ) : (
                <path fillRule="evenodd" d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z" />
              )}
            </svg>
          </button>
        </div>

        {/* Right Side: Menu Items Container */}
        {/* On mobile: Absolutes overlay style menu. On Desktop: inline layout row */}
        <div className={`${isOpen ? 'block' : 'hidden'} lg:flex lg:items-center lg:gap-6 absolute lg:relative top-full lg:top-auto left-0 w-full lg:w-auto bg-gray-900 lg:bg-transparent p-4 lg:p-0 border-t border-gray-800 lg:border-t-0 mt-3 lg:mt-0 z-50`}>
          <ul className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
            <li>
              <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/deals" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                🏷️ Combo Deals
              </Link>
            </li>
            <li>
              <Link to="/orders" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                📦 Orders
              </Link>
            </li>
            <li>
              <Link to="/inquiries" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                📩 Inquiries
              </Link>
            </li>
            <li>
              <Link to="/comments" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                💬 Comments
              </Link>
            </li> 
            <li>
              <Link to="/blogs" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                📝 Blogs
              </Link>
            </li> 
            <li>
              <Link to="/categories" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                🗂️ Categories
              </Link>
            </li> 
            <li>
              <Link to="/inventory" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium whitespace-nowrap">
                📦 Inventory
              </Link>
            </li>
          </ul>

          {/* Action Management / Logout Section */}
          <div className="border-t border-gray-800 lg:border-t-0 mt-3 pt-3 lg:mt-0 lg:pt-0 lg:pl-2">
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full lg:w-auto bg-red-600/10 hover:bg-red-600 border border-red-600/20 text-red-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer tracking-wider uppercase whitespace-nowrap"
            >
              Logout 🚪
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}