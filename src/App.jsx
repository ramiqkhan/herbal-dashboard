import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";

import ProductPage from "./pages/dashboard";
import OrdersPage from "./pages/orders";
import InquiryPage from "./pages/contact";
import CommentPage from "./pages/Coment";
import CategoryPage from "./pages/CategoryPage";

function App() {
  // Login State Tracking
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ================= HANDLE LOGIN =================
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Yahan apni marzi ka username aur password set karlein
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("🚨 Invalid Username or Password!");
    }
  };

  // ================= LOGOUT FUNCTION =================
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // 🔒 CONDITION 1: Agar user login nahi hai, toh sirf Login Page dikhao
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200 animate-in fade-in duration-200">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Portal</h2>
            <p className="text-gray-500 text-sm mt-1">Please sign in to access control panel</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl mb-4 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-600 text-sm transition-all font-medium text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-600 text-sm transition-all font-medium text-gray-800"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md transition cursor-pointer text-sm tracking-wide mt-2"
            >
              Sign In
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ✅ CONDITION 2: Agar user successfully login ho jaye, toh pura Dashboard access karne do
  return (
    <BrowserRouter>
      <div className="flex">
        
        {/* ================= SIDEBAR ================= */}
        <aside className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col justify-between sticky top-0">
          <div>
            <h1 className="text-2xl font-bold mb-6 border-b border-gray-800 pb-3">Admin Panel</h1>

            {/* FIXED: Replaced standard <a href="..."> with React Router <Link to="..."> */}
            <ul className="space-y-3">
              <li>
                <Link to="/" className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium">
                  📊 Dashboard
                </Link>
              </li>
              <li>
                <Link to="/orders" className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium">
                  📦 Orders
                </Link>
              </li>
              <li>
                <Link to="/inquiries" className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium">
                  📩 Inquiries
                </Link>
              </li>
              <li>
                <Link to="/comments" className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium">
                  💬 Comments
                </Link>
              </li> 
              <li>
                <Link to="/categories" className="block py-2 px-3 rounded hover:bg-gray-800 transition text-sm font-medium">
                  🗂️ Categories
                </Link>
              </li> 
            </ul>
          </div>

          {/* Logout Action Area */}
          <div className="border-t border-gray-800 pt-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600/10 hover:bg-red-600 border border-red-600/20 text-red-400 hover:text-white py-2.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer tracking-wider uppercase"
            >
              Logout Account 🚪
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inquiries" element={<InquiryPage />} />
            <Route path="/comments" element={<CommentPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            
            {/* Catch-all route to prevent blank page bugs */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;