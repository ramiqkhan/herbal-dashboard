import { useEffect, useState } from "react";

// ✅ Live Vercel Endpoint Enrolled
const BASE_URL = "https://herbal-backend-chi.vercel.app/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();
      
      // Backend handling variants dynamic validation
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else if (data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Live orders fetch error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, updatedValue) => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // Mapping both payload keys to avoid schema sync validation failures
        body: JSON.stringify({ 
          status: updatedValue,
          orderStatus: updatedValue 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update execution status.");
      }
      
      fetchOrders();
    } catch (err) {
      console.error("Status update error:", err);
      alert("🚨 Status update fail ho gaya!");
    }
  };

  // ================= DELETE ORDER =================
  const deleteOrder = async (id) => {
    if (window.confirm("Kya aap is order ko dashboard se hamesha ke liye delete karna chahte hain?")) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Delete fail.");
        
        fetchOrders();
      } catch (err) {
        console.error("Order delete error:", err);
        alert("🚨 Order delete nahi ho saka.");
      }
    }
  };

  // Status Styling Badge Helper
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-100 text-amber-800 font-semibold";
      case "confirmed": return "bg-blue-100 text-blue-800 font-semibold";
      case "shipped": return "bg-purple-100 text-purple-800 font-semibold";
      case "delivered": return "bg-green-100 text-green-800 font-semibold";
      case "cancelled": return "bg-red-100 text-red-800 font-semibold";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800">Orders Dashboard</h1>
        <button 
          onClick={fetchOrders}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded shadow-sm transition cursor-pointer"
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* ================= DATA CONTAINER ================= */}
      <div className="max-w-7xl mx-auto bg-white p-6 shadow-sm border border-gray-200 rounded">
        
        {loading ? (
          <div className="text-center p-12 text-gray-400 font-medium">
            <p className="animate-pulse text-sm">Processing live cloud stream data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-600">
              
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                  <th className="p-3 border-r text-center w-32">Order No / Tracking</th>
                  <th className="p-3 border-r">Customer Info</th>
                  <th className="p-3 border-r w-40">Phone / Contact</th>
                  <th className="p-3 border-r w-32">City</th>
                  <th className="p-3 border-r">Product Items</th>
                  {/* ✅ NEW HEADERS ADDED */}
                  <th className="p-3 border-r text-right w-36">Total Amount</th>
                  <th className="p-3 border-r text-center w-40">Status Flow</th>
                  <th className="p-3 text-center w-28">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-12 text-gray-400 font-medium bg-gray-50/30">
                      Koi active orders nahi mile data log mein.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50/50 transition">
                      
                      {/* ID / Tracking */}
                      <td className="p-3 text-center border-r text-xs font-mono font-bold text-gray-700 bg-gray-50/30">
                        {o.trackingNumber || o.orderNumber || o._id?.slice(-6).toUpperCase() || "N/A"}
                      </td>

                      {/* Name & Email */}
                      <td className="p-3 border-r capitalize">
                        <div className="font-semibold text-gray-900">
                          {o.shippingInfo?.fullName || "No Name Given"}
                        </div>
                        {/* ✅ EMAIL DISPLAY INJECTED */}
                        {o.shippingInfo?.email && (
                          <div className="text-xs text-gray-400 lowercase font-normal mt-0.5 max-w-[180px] truncate" title={o.shippingInfo.email}>
                            {o.shippingInfo.email}
                          </div>
                        )}
                      </td>

                      {/* Phone Numbers */}
                      <td className="p-3 border-r text-gray-700 font-mono text-xs">
                        <div className="font-semibold text-gray-900">{o.shippingInfo?.phone || "N/A"}</div>
                        {o.shippingInfo?.optionalphone && (
                          <div className="text-[10px] text-gray-400 mt-0.5" title="Alternative Line">
                            Alt: {o.shippingInfo.optionalphone}
                          </div>
                        )}
                      </td>

                      {/* City */}
                      <td className="p-3 border-r capitalize text-gray-600 font-medium">
                        {o.shippingInfo?.city || "N/A"}
                      </td>

                      {/* Product Units */}
                      <td className="p-3 border-r text-gray-700">
                        <div className="space-y-1">
                          {o.orderItems?.map((item, i) => (
                            <div key={item._id || i} className="text-xs bg-gray-50 border px-2 py-1 rounded text-gray-800 flex justify-between gap-4">
                              <span className="font-medium truncate max-w-[120px]">{item.name}</span>
                              <span className="text-blue-700 font-bold font-mono whitespace-nowrap">×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* ✅ PRICE DISPLAY INJECTED */}
                      <td className="p-3 border-r text-right font-mono font-bold text-[#355e3b] text-sm">
                        Rs. {parseFloat(o.totalAmount || 0).toLocaleString('en-PK')}
                      </td>

                      {/* Status Dropdown Controller */}
                      <td className="p-3 border-r text-center">
                        <select
                          value={o.orderStatus || o.status || "pending"}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                          className={`text-xs border p-1.5 rounded outline-none w-full shadow-sm cursor-pointer transition ${getStatusBadgeClass(o.orderStatus || o.status)}`}
                        >
                          <option value="pending" className="bg-white text-gray-800">Pending</option>
                          <option value="confirmed" className="bg-white text-gray-800">Confirmed</option>
                          <option value="shipped" className="bg-white text-gray-800">Shipped</option>
                          <option value="delivered" className="bg-white text-gray-800">Delivered</option>
                          <option value="cancelled" className="bg-white text-gray-800">Cancelled</option>
                        </select>
                      </td>

                      {/* Action Box */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => deleteOrder(o._id)}
                          className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 hover:border-red-600 font-semibold px-3 py-1 rounded text-xs transition shadow-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}