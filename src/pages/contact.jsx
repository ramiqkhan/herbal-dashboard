import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000/api/inquiries";

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchInquiries = async () => {
    setLoading(true);

    const res = await fetch(BASE_URL);
    const data = await res.json();

    setInquiries(data.inquiries || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
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

    fetchInquiries();
  };

  // ================= DELETE =================
  const deleteInquiry = async (id) => {
    await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    fetchInquiries();
  };

  // ================= FILTER =================
  const filteredData =
    filter === "all"
      ? inquiries
      : inquiries.filter((i) => i.type === filter);

  return (
    <div className="p-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inquiry Dashboard</h1>

        {/* FILTER BUTTONS */}
        <div className="space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 border ${
              filter === "all" ? "bg-black text-white" : ""
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("contact")}
            className={`px-3 py-1 border ${
              filter === "contact" ? "bg-black text-white" : ""
            }`}
          >
            Contact
          </button>

          <button
            onClick={() => setFilter("appointment")}
            className={`px-3 py-1 border ${
              filter === "appointment" ? "bg-black text-white" : ""
            }`}
          >
            Appointment
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white p-4 shadow rounded">

        {loading ? (
          <p>Loading inquiries...</p>
        ) : (
          <table className="w-full border">

            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Type</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Message / Concern</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((i) => (
                <tr key={i._id} className="text-center">

                  {/* TYPE */}
                  <td className="border p-2 capitalize">
                    {i.type}
                  </td>

                  {/* NAME */}
                  <td className="border p-2">
                    {i.fullName}
                  </td>

                  {/* EMAIL */}
                  <td className="border p-2">
                    {i.email}
                  </td>

                  {/* PHONE */}
                  <td className="border p-2">
                    {i.phone || "-"}
                  </td>

                  {/* MESSAGE / APPOINTMENT DATA */}
                  <td className="border p-2 text-left text-sm">

                    {i.type === "contact" ? (
                      <div>
                        <b>Message:</b> {i.message}
                      </div>
                    ) : (
                      <div>
                        <div>
                          <b>Type:</b> {i.consultationType}
                        </div>
                        <div>
                          <b>Concern:</b> {i.healthConcern}
                        </div>
                      </div>
                    )}

                  </td>

                  {/* STATUS */}
                  <td className="border p-2">
                    <select
                      value={i.status}
                      onChange={(e) =>
                        updateStatus(i._id, e.target.value)
                      }
                      className="border p-1"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  {/* ACTIONS */}
                  <td className="border p-2 space-x-2">

                    <button
                      onClick={() => deleteInquiry(i._id)}
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