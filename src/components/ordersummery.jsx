import React, { useEffect, useState, useMemo } from "react";

// Live Vercel Endpoint Enrolled
const BASE_URL = "https://herbal-backend-chi.vercel.app/api/orders";

export default function OrdersSummaryWithCalendar() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(null); // Format: YYYY-MM-DD

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();
      
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
      console.error("Live metrics & calendar fetch error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Default select today's date format
    const today = new Date();
    setSelectedDateStr(today.toISOString().split('T')[0]);
  }, []);

  // ================= CALCULATE LIVE METRICS (GLOBAL) =================
  const analytics = useMemo(() => {
    let pendingCount = 0;
    let deliveredCount = 0;
    let totalEstimatedRevenue = 0;
    let realizedRevenue = 0;

    orders.forEach((o) => {
      const amount = parseFloat(o.totalAmount || 0);
      const status = (o.orderStatus || o.status || "pending").toLowerCase();
      totalEstimatedRevenue += amount;

      if (status === "delivered") {
        deliveredCount++;
        realizedRevenue += amount;
      } else if (status === "pending") {
        pendingCount++;
      }
    });

    return {
      totalOrdersCount: orders.length,
      pendingCount,
      deliveredCount,
      totalEstimatedRevenue,
      realizedRevenue,
    };
  }, [orders]);

  // ================= MAP ORDERS TO DATES =================
  const ordersByDateMap = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      // Backend schema se createdAt dynamic fallback lookup
      const dateRaw = o.createdAt || o.date;
      if (!dateRaw) return;

      const dateStr = dateRaw.split("T")[0]; // Extracts YYYY-MM-DD
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(o);
    });
    return map;
  }, [orders]);

  // ================= CALENDAR GENERATOR ENGINE =================
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];

    // Padding empty blocks for previous month overflow slots
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null);
    }

    // Actual month days mapping
    for (let d = 1; d <= daysInMonth; d++) {
      const dayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      daysArray.push({
        dayNum: d,
        dateStr: dayString,
        dayOrders: ordersByDateMap[dayString] || []
      });
    }

    return daysArray;
  }, [currentDate, ordersByDateMap]);

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  // Filter orders localized to selected calendar focus block
  const selectedDateOrders = ordersByDateMap[selectedDateStr] || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* ================= HEADER SECTIONS ================= */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Orders Ledger Summary</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time metrics timeline calendar synchronization matrix.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded shadow-sm transition cursor-pointer"
        >
          🔄 Refresh Stream
        </button>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto bg-white p-12 text-center border border-gray-200 rounded shadow-sm">
          <p className="animate-pulse text-sm text-gray-400 font-medium">Re-indexing timeline nodes and cache layers...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* ================= OVERALL REVENUE SUMMARY CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gross Bookings</span>
              <div className="text-xl font-extrabold text-gray-800 mt-0.5">Rs. {analytics.totalEstimatedRevenue.toLocaleString('en-PK')}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-600">
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Net Sales Revenue</span>
              <div className="text-xl font-extrabold text-green-700 mt-0.5">Rs. {analytics.realizedRevenue.toLocaleString('en-PK')}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Queue</span>
              <div className="text-xl font-extrabold text-amber-600 mt-0.5">{analytics.pendingCount} Orders</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Total Orders Volume</span>
              <div className="text-xl font-extrabold text-blue-700 mt-0.5">{analytics.totalOrdersCount} Items</div>
            </div>
          </div>

          {/* ================= CALENDAR AND DETAIL SYSTEM ROW ================= */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  
  {/* LEFT COLUMN: SYSTEM CALENDAR WRAPPER */}
  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
    
    {/* Calendar Switch Header controls */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-sm font-bold text-gray-800 capitalize">
        📅 {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
      </h2>
      <div className="flex gap-2">
        <button onClick={() => changeMonth(-1)} className="p-1.5 border rounded hover:bg-gray-50 text-xs font-bold px-2.5 cursor-pointer">‹</button>
        <button onClick={() => changeMonth(1)} className="p-1.5 border rounded hover:bg-gray-50 text-xs font-bold px-2.5 cursor-pointer">›</button>
      </div>
    </div>

    {/* Scroll Engine Wrapper for Mobile Viewports */}
    <div className="overflow-x-auto w-full block scrollbar-thin pb-2">
      <div className="min-w-[480px]">
        
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        {/* Day Matrix Slots Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="bg-gray-50/40 rounded-lg min-h-[64px]" />;
            
            const isSelected = selectedDateStr === day.dateStr;
            const dayRevenue = day.dayOrders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount || 0), 0);

            return (
              <div
                key={day.dateStr}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`min-h-[64px] border p-1.5 rounded-lg flex flex-col justify-between cursor-pointer transition text-left group ${
                  isSelected 
                    ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600" 
                    : "border-gray-200 hover:border-gray-400 bg-white"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                    {day.dayNum}
                  </span>
                  
                  {day.dayOrders.length > 0 && (
                    <span className="bg-gray-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full scale-90">
                      {day.dayOrders.length}
                    </span>
                  )}
                </div>

                {/* Financial footprint info inside calendar cell */}
                {dayRevenue > 0 && (
                  <div className="text-[9px] font-mono font-bold text-emerald-700 truncate max-w-full" title={`Rs. ${dayRevenue}`}>
                    Rs.{dayRevenue >= 1000 ? `${(dayRevenue / 1000).toFixed(1)}k` : dayRevenue}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>

  </div>

  {/* RIGHT COLUMN: CALENDAR SELECTED DATE DETAIL LIST VIEW */}
  <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col h-full justify-between">
    <div>
      <div className="border-b pb-3 mb-4">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Selected Log Sheet</span>
        <h3 className="text-sm font-bold text-gray-800 font-mono mt-0.5">
          {selectedDateStr ? new Date(selectedDateStr).toDateString() : "Select a slot"}
        </h3>
      </div>

      {/* Dynamic Focus Content mapping */}
      <div className="overflow-y-auto max-h-[280px] lg:max-h-[340px] space-y-2.5 pr-1 scrollbar-thin">
        {selectedDateOrders.length === 0 ? (
          <div className="text-center p-12 text-gray-400 text-xs font-medium">
            Is tareekh mein koi order list register nahi hai.
          </div>
        ) : (
          selectedDateOrders.map((order, i) => {
            const status = (order.orderStatus || order.status || "pending").toLowerCase();
            return (
              <div key={order._id || i} className="p-3 bg-gray-50 border rounded-lg text-xs space-y-1">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono font-bold text-gray-700 truncate">
                    #{order.trackingNumber || order._id?.slice(-6).toUpperCase()}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize whitespace-nowrap ${
                    status === "delivered" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {status}
                  </span>
                </div>
                
                <div className="text-gray-900 font-semibold truncate">
                  {order.shippingInfo?.fullName || "No Name"} 
                  <span className="text-gray-400 font-normal ml-1">({order.shippingInfo?.city || "N/A"})</span>
                </div>
                
                <div className="text-right text-[#355e3b] font-mono font-bold pt-1 border-t border-dashed border-gray-200">
                  Rs. {parseFloat(order.totalAmount || 0).toLocaleString('en-PK')}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {/* Selection Total Box */}
    {selectedDateOrders.length > 0 && (
      <div className="mt-4 pt-3 border-t bg-gray-50/80 p-2 rounded border border-gray-100 text-right">
        <div className="text-[10px] text-gray-400 font-bold uppercase">Daily Volume Total</div>
        <div className="text-base font-black text-emerald-800 font-mono">
          Rs. {selectedDateOrders.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0).toLocaleString('en-PK')}
        </div>
      </div>
    )}

  </div>

</div>

        </div>
      )}
    </div>
  );
}