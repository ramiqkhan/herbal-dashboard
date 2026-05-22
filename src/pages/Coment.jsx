import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000/api/comments";

export default function CommentPage() {
  const [comments, setComments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    rating: 5,
    image: null,
  });

  // ================= FETCH =================
  const fetchComments = async () => {
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("rating", form.rating);

    if (form.image) {
      formData.append("image", form.image);
    }

    const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
    const method = editId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        body: formData,
      });

      setForm({
        name: "",
        description: "",
        rating: 5,
        image: null,
      });

      setEditId(null);
      setShowForm(false);
      fetchComments();
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (c) => {
    setForm({
      name: c.name,
      description: c.description,
      rating: c.rating,
      image: null, // only replace if new image uploaded
    });

    setEditId(c._id);
    setShowForm(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Comments Dashboard</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Close" : "+ Add Comment"}
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white p-4 shadow rounded mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="border p-2 w-full"
              required
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="border p-2 w-full"
              required
            />

            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className="border p-2 w-full"
            >
              <option value="1">1 ⭐</option>
              <option value="2">2 ⭐</option>
              <option value="3">3 ⭐</option>
              <option value="4">4 ⭐</option>
              <option value="5">5 ⭐</option>
            </select>

            <input
              type="file"
              onChange={handleImage}
              className="border p-2 w-full"
            />

            <button className="bg-blue-600 text-white px-4 py-2 w-full rounded">
              {editId ? "Update Comment" : "Create Comment"}
            </button>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-white p-4 shadow rounded overflow-x-auto">
        <table className="w-full border collapse-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Image</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Rating</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {comments.map((c) => (
              <tr key={c._id} className="text-center">
                {/* IMAGE */}
                <td className="border p-2">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-12 h-12 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    "-"
                  )}
                </td>

                {/* NAME */}
                <td className="border p-2 font-medium">{c.name}</td>

                {/* RATING */}
                <td className="border p-2">
                  {"⭐".repeat(Number(c.rating))}
                </td>

                {/* DESCRIPTION */}
                <td className="border p-2 text-sm text-left">
                  {c.description}
                </td>

                {/* ACTIONS */}
                <td className="border p-2 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(c)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(c._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500 italic">
                  No comments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}