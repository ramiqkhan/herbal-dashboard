import React, { useEffect, useState, useMemo } from "react";
import OrdersSummaryPage from "../components/ordersummery";

// Live Secure Vercel Endpoint mapping
const BASE_URL = "https://herbal-backend-chi.vercel.app/api/products";

export default function InventorySummaryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ================= FETCH PRODUCTS (LIVE FROM VERCEL) =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(BASE_URL);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Summary page par data load karne me error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= CALCULATE TOTAL STOCK METRICS =================
  const metrics = useMemo(() => {
    let totalItemsCount = 0;
    let lowStockAlerts = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      if (p.sizes && p.sizes.length > 0) {
        p.sizes.forEach((s) => {
          const qty = Number(s.stock) || 0;
          totalItemsCount += qty;
          if (qty === 0) outOfStockCount++;
          else if (qty <= 5) lowStockAlerts++;
        });
      }
    });

    return { totalItemsCount, lowStockAlerts, outOfStockCount };
  }, [products]);

  // Filter systems for tracking
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ================= HEADER SECTIONS ================= */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inventory Stock Summary</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track variation sizes volume and stock metrics live.</p>
        </div>
        <button 
          onClick={fetchProducts}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 text-xs font-semibold rounded shadow-sm transition self-start md:self-auto"
        >
          Refresh Data
        </button>
      </div>

      {/* ================= COUNTER METRICS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Variations Qty</span>
          <span className="text-2xl font-black text-gray-800 mt-1">{metrics.totalItemsCount} Unit</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock Sizes (≤ 5)</span>
          <span className="text-2xl font-black text-amber-600 mt-1">{metrics.lowStockAlerts} Alert(s)</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col border-l-4 border-l-red-500">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Out of Stock Volume</span>
          <span className="text-2xl font-black text-red-600 mt-1">{metrics.outOfStockCount} Size(s)</span>
        </div>
      </div>

      {/* ================= SEARCH FILTER BAR ================= */}
      <div className="max-w-6xl mx-auto mb-4">
        <input 
          type="text"
          placeholder="Search product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 bg-white border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* ================= MAIN SUMMARY TABLE ================= */}
      <div className="max-w-6xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-semibold">
                <th className="p-4 w-20 text-center">Image</th>
                <th className="p-4">Product Main Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Size/Volume Label</th>
                <th className="p-4 text-center w-36">Pricing (Rs.)</th>
                <th className="p-4 text-center w-40">Available Stock</th>
                <th className="p-4 text-center w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-12 text-sm text-gray-400 font-medium bg-white">
                    Live database se stocks data load ho raha hai...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-12 text-sm text-gray-400 font-medium bg-white">
                    Koi match hone wala product inventory me nahi mila.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  // Agar product ke andar koi variations sizes na hon fallback single item handle karne ke liye
                  const sizesList = product.sizes && product.sizes.length > 0 
                    ? product.sizes 
                    : [{ label: "Standard / Default", price: product.basePrice, stock: product.stock, images: product.images }];

                  return sizesList.map((size, index) => {
                    const currentStock = Number(size.stock) || 0;
                    
                    // Stock color logic rules configuration
                    let statusBadgeClass = "bg-green-100 text-green-800 border-green-200";
                    let statusText = "In Stock";
                    
                    if (currentStock === 0) {
                      statusBadgeClass = "bg-red-100 text-red-800 border-red-200";
                      statusText = "Out of Stock";
                    } else if (currentStock <= 5) {
                      statusBadgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                      statusText = "Low Stock";
                    }

                    return (
                      <tr key={`${product._id}-${index}`} className="hover:bg-gray-50/50 transition">
                        {/* 1. VARIATION / MAIN IMAGE MATCH */}
                        {index === 0 ? (
                          <td className="p-3 text-center align-middle" rowSpan={sizesList.length}>
                            <img 
                              src={product.images?.[0] || "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=150"} 
                              alt="" 
                              className="w-10 h-10 object-cover rounded border border-gray-200 mx-auto shadow-inner"
                            />
                          </td>
                        ) : null}

                        {/* 2. DYNAMIC ROWSPAN FOR MAIN NAME */}
                        {index === 0 ? (
                          <td className="p-4 font-semibold text-gray-900 border-r border-gray-100 max-w-xs align-middle" rowSpan={sizesList.length}>
                            {product.name}
                          </td>
                        ) : null}

                        {/* 3. DYNAMIC ROWSPAN FOR CATEGORY NAME */}
                        {index === 0 ? (
                          <td className="p-4 text-xs font-medium text-gray-500 capitalize border-r border-gray-100 align-middle" rowSpan={sizesList.length}>
                            {typeof product.category === "object" && product.category !== null 
                              ? product.category?.name 
                              : "Uncategorized"}
                          </td>
                        ) : null}

                        {/* 4. SPECIFIC VARIATION DETAILS */}
                        <td className="p-4 font-medium text-gray-700 bg-gray-50/30">
                          <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold mr-1.5">
                            Volume
                          </span>
                          {size.label || "N/A"}
                        </td>

                        {/* 5. PRICING OF THAT VARIATION SIZE */}
                        <td className="p-4 text-center font-mono font-bold text-gray-800 bg-gray-50/30">
                          Rs. {Number(size.price || product.basePrice || 0).toLocaleString()}
                        </td>

                        {/* 6. STOCK NUMERIC VALUE */}
                        <td className="p-4 text-center bg-gray-50/30">
                          <span className={`font-mono text-sm font-black ${currentStock === 0 ? "text-red-600" : currentStock <= 5 ? "text-amber-600" : "text-gray-800"}`}>
                            {currentStock}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium ml-1">items</span>
                        </td>

                        {/* 7. QUICK STATUS COLORED BADGE */}
                        <td className="p-4 text-center align-middle bg-gray-50/30">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <OrdersSummaryPage/>
    </div>
  );
}