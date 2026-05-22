import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch(BASE_URL);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    fetchOrders();
  };

  // ================= DELETE =================
  const deleteOrder = async (id) => {
    await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    fetchOrders();
  };

  return (
    <div className="p-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Orders Dashboard</h1>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white p-4 shadow rounded">

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <table className="w-full border">

            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">City</th>
                <th className="border p-2">Products</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="text-center">

                <td className="border p-2 text-xs font-mono font-semibold text-gray-700">
  {o.trackingNumber || o.orderNumber || "N/A"}
</td>

                  <td className="border p-2">
                    {o.shippingInfo?.fullName}
                  </td>

                  <td className="border p-2">
                    {o.shippingInfo?.phone}
                  </td>

                  <td className="border p-2">
                    {o.shippingInfo?.city}
                  </td>

                  <td className="border p-2 text-left">
                    {o.orderItems?.map((item, i) => (
                      <div key={i} className="text-sm">
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>

                  <td className="border p-2">
                    <select
                      value={o.orderStatus}
                      onChange={(e) =>
                        updateStatus(o._id, e.target.value)
                      }
                      className="border p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => deleteOrder(o._id)}
                      className="bg-red-500 text-white px-3 py-1"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>
    </div>
  );
}