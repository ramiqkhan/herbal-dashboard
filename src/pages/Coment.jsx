import { useEffect, useState } from "react";

const BASE_URL = "https://herbal-backend-chi.vercel.app/api/comments";

export default function CommentPage() {
  const [comments, setComments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultFormState = {
    name: "",
    description: "",
    rating: 5,
    image: null,
  };

  const [form, setForm] = useState(defaultFormState);

  // ================= FETCH COMMENTS =================
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL);
      if (!res.ok) throw new Error("Failed to fetch database content");
      const data = await res.json();
      setComments(data.comments || data.data || data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // ================= INPUT HANDLERS =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  // Toggle form interface and safely clear out frozen cache states
  const toggleFormVisibility = () => {
    if (showForm) {
      // ✅ FIX: Form close hote hi state reset ho jayegi taake Add/Edit states mix na hon
      setForm(defaultFormState);
      setEditId(null);
    }
    setShowForm(!showForm);
  };

  // ================= SUBMIT (CREATE / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Structural guard clauses to block blank inputs
    if (!form.name.trim() || !form.description.trim()) {
      alert("🚨 Name aur Description fields khali nahi ho saktin!");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("rating", form.rating);

    if (form.image) {
      formData.append("image", form.image);
    }

    const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) throw new Error("Form submission endpoint failure");

      setForm(defaultFormState);
      setEditId(null);
      setShowForm(false);
      fetchComments();
    } catch (err) {
      console.error("Error submitting form data structure:", err);
      alert("🚨 System error: Changes save nahi ho sakin.");
    }
  };

  const handleEdit = (c) => {
    setForm({
      name: c.name || "",
      description: c.description || "",
      rating: c.rating || 5,
      image: null, // Only append if file selector is intentionally populated
    });

    setEditId(c._id);
    setShowForm(true);
  };

  // ================= DELETE COMMENT =================
  const handleDelete = async (id) => {
    // ✅ UI FIX: Accident protection confirmation dialogue
    if (window.confirm("Kya aap waqai is public review/comment ko delete karna chahte hain?")) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Delete execution pipeline failed");
        fetchComments();
      } catch (err) {
        console.error("Error removing targeted comment document:", err);
        alert("🚨 Action blocked: Item delete nahi kiya ja saka.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Comments Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage user testimonials and product reviews</p>
        </div>

        <button
          onClick={toggleFormVisibility}
          className={`px-4 py-2 text-xs font-semibold rounded shadow-sm tracking-wide transition ${
            showForm 
              ? "bg-gray-600 hover:bg-gray-700 text-white" 
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {showForm ? "Cancel / Close" : "+ Add Review"}
        </button>
      </div>

      {/* ================= FORM MODAL INTERFACE ================= */}
      {showForm && (
        <div className="max-w-6xl mx-auto bg-white p-6 border border-gray-200 shadow-sm rounded-lg mb-6 transition">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
            {editId ? "📝 Edit Testimonial Record" : "✨ Create New Testimonial"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Author Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Muhammad Ali"
                  className="border border-gray-300 rounded p-2 text-sm w-full outline-none focus:border-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rating Score</label>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 text-sm w-full outline-none focus:border-gray-500 cursor-pointer"
                >
                  <option value="1">1 Star ⭐</option>
                  <option value="2">2 Stars ⭐⭐</option>
                  <option value="3">3 Stars ⭐⭐⭐</option>
                  <option value="4">4 Stars ⭐⭐⭐⭐</option>
                  <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Review Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write original feedback details here..."
                rows="3"
                className="border border-gray-300 rounded p-2 text-sm w-full outline-none focus:border-gray-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Profile Picture (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="border border-gray-200 rounded p-1.5 text-xs w-full bg-gray-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 cursor-pointer"
              />
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm p-2.5 w-full rounded transition shadow-sm mt-2">
              {editId ? "Update Review Details" : "Publish Testimonial Item"}
            </button>
          </form>
        </div>
      )}

      {/* ================= DATA RENDER TABLE ================= */}
      <div className="max-w-6xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {loading && comments.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium">
            <p className="animate-pulse text-sm">Syncing comment log feeds...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-700 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-3.5 w-20 text-center">Avatar</th>
                  <th className="p-3.5 w-44">Name</th>
                  <th className="p-3.5 w-36 text-center">Rating Matrix</th>
                  <th className="p-3.5">Review Context</th>
                  <th className="p-3.5 text-center w-36">Control Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-12 text-gray-400 font-medium bg-gray-50/20 italic">
                      Koi user reviews database logs mein safe nahi hain.
                    </td>
                  </tr>
                ) : (
                  comments.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/40 transition">
                      {/* AVATAR WRAPPER */}
                      <td className="p-3.5 text-center">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name || "user profile"}
                            className="w-10 h-10 rounded-full mx-auto object-cover border border-gray-200 shadow-inner"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto border border-dashed border-gray-300 text-gray-400 text-xs font-bold font-mono">
                            Ø
                          </div>
                        )}
                      </td>

                      {/* CLIENT IDENTITY */}
                      <td className="p-3.5 font-semibold text-gray-900 capitalize break-words">
                        {c.name || "Anonymous Author"}
                      </td>

                      {/* RATING DISPLAY VALUE */}
                      <td className="p-3.5 text-center select-none tracking-tight whitespace-nowrap text-xs">
                        {"⭐".repeat(Math.max(1, Math.min(5, Number(c.rating || 5))))}
                      </td>

                      {/* TEXT INSIGHT COMPONENT */}
                      <td className="p-3.5 text-xs text-gray-600 leading-relaxed max-w-sm break-words">
                        {c.description}
                      </td>

                      {/* INTERACTIVE CONTROLS */}
                      <td className="p-3.5 text-center whitespace-nowrap text-xs space-x-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 font-medium rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 font-medium rounded transition"
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