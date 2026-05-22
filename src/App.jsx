import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";

import ProductPage from "./pages/dashboard";
import OrdersPage from "./pages/orders";
import InquiryPage from "./pages/contact";
import CommentPage from "./pages/Coment";
import CategoryPage from "./pages/CategoryPage";
// import CommentPage from "./pages/Coment";
// import AddProduct from "./pages/AddProduct";
// import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        
        {/* Sidebar */}
        <aside className="w-64 h-screen bg-gray-900 text-white p-5">
          <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

          <ul className="space-y-3">
            <li><a href="/" className="block hover:text-gray-300">Dashboard</a></li>
            <li><a href="/orders" className="block hover:text-gray-300">Orders</a></li>
            <li><a href="/inquiries" className="block hover:text-gray-300">Inquiries</a></li>
             <li><a href="/comments" className="block hover:text-gray-300">Comments</a></li> 
                          <li><a href="/categories" className="block hover:text-gray-300">Categories</a></li> 

          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/" element={<ProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inquiries" element={<InquiryPage />} />
            <Route path="/comments" element={<CommentPage />} />
           <Route path="/categories" element={<CategoryPage />} />
            {/*  <Route path="/add-product" element={<AddProduct />} /> */}
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;