import { useEffect, useState } from "react";

const BASE_URL = "https://herbal-backend-chi.vercel.app/api/inquiries";

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // ================= FETCH INQUIRIES =================
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      
      // ✅ Fallback array verification handles structural anomalies safely
      setInquiries(data.inquiries || data.data || data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Status update failed");
      fetchInquiries();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("🚨 Status update fail ho gaya!");
    }
  };

  // ================= DELETE INQUIRY =================
  const deleteInquiry = async (id) => {
    // ✅ Safety confirmation check added to avoid accidental data loss
    if (window.confirm("Kya aap is inquiry log ko permanently delete karna chahte hain?")) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Delete execution failed");
        fetchInquiries();
      } catch (error) {
        console.error("Error deleting inquiry:", error);
        alert("🚨 Inquiry delete nahi ho saki.");
      }
    }
  };

  // ================= FILTER LOGIC =================
  const filteredData =
    filter === "all"
      ? inquiries
      : inquiries.filter((i) => i.type?.toLowerCase() === filter.toLowerCase());

  // Helper dynamic classes for status selector
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "new": return "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
      case "contacted": return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      case "completed": return "bg-gray-100 text-gray-700 border-gray-300 line-through";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ================= HEADER & FILTER TOGGLES ================= */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inquiry Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage customer queries and consultations</p>
        </div>

        {/* Dynamic Nav Tabs */}
        <div className="flex bg-white p-1 rounded-lg border shadow-sm space-x-1">
          {["all", "contact", "appointment"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition ${
                filter === tab
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ================= DATA CONTAINER TABLE ================= */}
      <div className="max-w-7xl mx-auto bg-white shadow-sm border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium">
            <p className="animate-pulse text-sm">Streaming live inquiries feed...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-700 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-3.5 border-r w-28 text-center">Type</th>
                  <th className="p-3.5 border-r">User Details</th>
                  <th className="p-3.5 border-r">Contact Context</th>
                  <th className="p-3.5 border-r">Message / Core Concern</th>
                  <th className="p-3.5 border-r text-center w-40">Status Flow</th>
                  <th className="p-3.5 text-center w-24">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-12 text-gray-400 font-medium bg-gray-50/20">
                      Koi inquiries record nahi mili is filter classification mein.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((i) => (
                    <tr key={i._id} className="hover:bg-gray-50/40 transition">
                      
                      {/* Classification Badge */}
                      <td className="p-3.5 text-center border-r">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                          i.type === "contact" 
                            ? "bg-purple-50 text-purple-700 border-purple-200" 
                            : "bg-teal-50 text-teal-700 border-teal-200"
                        }`}>
                          {i.type || "N/A"}
                        </span>
                      </td>

                      {/* Customer Profile */}
                      <td className="p-3.5 border-r font-medium text-gray-900 capitalize">
                        {i.fullName || "No Name"}
                      </td>

                      {/* Digital Identifiers */}
                      <td className="p-3.5 border-r text-xs space-y-0.5 font-mono">
                        <div className="text-gray-800 font-medium break-all">{i.email}</div>
                        <div className="text-gray-500">{i.phone || "-"}</div>
                      </td>

                      {/* Content Core Body */}
                      <td className="p-3.5 border-r text-gray-700 max-w-sm">
                        {i.type === "contact" ? (
                          <div className="text-xs leading-relaxed">
                            <span className="text-gray-400 font-medium block uppercase text-[10px] tracking-tight">Direct Message</span>
                            {i.message || <span className="text-gray-300 italic">Empty string context</span>}
                          </div>
                        ) : (
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-gray-400 font-semibold">Consultation: </span> 
                              <span className="text-gray-900 font-medium">{i.consultationType || "General"}</span>
                            </div>
                            <div className="bg-gray-50 border p-1.5 rounded text-[11px] text-gray-600 leading-snug">
                              <span className="font-semibold block text-[10px] text-gray-400 uppercase tracking-tight mb-0.5">Health Concern</span>
                              {i.healthConcern || "No specification provided."}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown Controller */}
                      <td className="p-3.5 border-r text-center">
                        <select
                          value={i.status || "new"}
                          onChange={(e) => updateStatus(i._id, e.target.value)}
                          className={`text-xs border p-1.5 rounded w-full outline-none cursor-pointer transition shadow-sm ${getStatusStyle(i.status)}`}
                        >
                          <option value="new" className="bg-white text-gray-800 line-through-none">New</option>
                          <option value="contacted" className="bg-white text-gray-800 line-through-none">Contacted</option>
                          <option value="completed" className="bg-white text-gray-800 line-through-none">Completed</option>
                        </select>
                      </td>

                      {/* Action Triggers */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => deleteInquiry(i._id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded transition"
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