import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLayers } from "react-icons/fi";

const BASE_URL = "http://localhost:5000/api/categories";

export default function CategoryManagement() {
  // States
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    seoUrl: ""
  });

  // 🛠️ FIXED FETCH: Data parsing mapping perfectly managed
  const fetchCategories = async () => {
    try {
      const res = await fetch(BASE_URL);
      if (!res.ok) throw new Error("Data fetch karne mein masla hai.");
      
      const data = await res.json();
      console.log("📢 Live Loaded Categories:", data);

      // Backend nested responses clean formatting filter
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else if (data && typeof data === "object" && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form Inputs Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !editId) {
      // Auto-generate clean SEO URL on typing name
      setForm({
        ...form,
        name: value,
        seoUrl: value.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Submit Logic (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;

    // Strict validation mapping before triggering request
    const cleanForm = {
      ...form,
      seoUrl: form.seoUrl ? form.seoUrl.toLowerCase().replace(/ /g, "-") : ""
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanForm)
      });

      const resData = await res.json();

      if (!res.ok) {
        alert(`🚨 Error: ${resData.message || "Something went wrong"}`);
        return;
      }

      alert(editId ? "🎉 Category successfully update ho gayi!" : "🎉 Nayi Category successfully add ho gayi!");
      resetForm();
      fetchCategories(); // Reload the active collection list
    } catch (err) {
      console.error("Save error:", err);
      alert("Server error! Please check logs.");
    }
  };

  // Edit Trigger
  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
      metaKeywords: cat.metaKeywords || "",
      seoUrl: cat.seoUrl || cat.slug || ""
    });
  };

  // Delete Trigger
  const handleDelete = async (id) => {
    if (window.confirm("Kya aap waqai yeh category delete karna chahte hain?")) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("🎉 Category successfully delete ho gayi!");
          if (editId === id) resetForm();
          fetchCategories();
        } else {
          const errData = await res.json();
          alert(`🚨 Error: ${errData.message}`);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      seoUrl: ""
    });
  };

  // Filter list based on search bar validation array safety check
  const filteredCategories = Array.isArray(categories) 
    ? categories.filter((cat) => cat.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiLayers className="text-emerald-600" /> Category Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage website structure, navigation, and SEO optimization meta tags.</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Existing Categories List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 className="font-semibold text-lg text-gray-900">Existing Categories</h3>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-emerald-500 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-xs uppercase text-gray-600 border-b border-gray-200 font-semibold">
                  <th className="p-3">Category Details</th>
                  <th className="p-3">SEO Url (Slug)</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400">
                      Koi category nahi mili. Nayi category create karein.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{cat.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">{cat.description || "No description provided."}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 px-2 py-0.5 text-xs rounded font-mono text-slate-600">
                          /{cat.seoUrl || cat.slug || ""}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="Edit Category"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Delete Category"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Dynamic Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-fit sticky top-6">
          <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-1.5">
              {editId ? "✏️ Edit Category" : "✨ Create Category"}
            </h3>
            {editId && (
              <button type="button" onClick={resetForm} className="text-xs text-red-500 hover:underline">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Fields */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Herbal Oils"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write brief description..."
                rows="2"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-3">
                🔍 Google SEO Optimization
              </span>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Tag Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={form.metaTitle}
                    onChange={handleChange}
                    placeholder="SEO Title for search engines"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Tag Description</label>
                  <textarea
                    name="metaDescription"
                    value={form.metaDescription}
                    onChange={handleChange}
                    placeholder="Short summary for Google snippets..."
                    rows="2"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Tag Keywords</label>
                  <input
                    type="text"
                    name="metaKeywords"
                    value={form.metaKeywords}
                    onChange={handleChange}
                    placeholder="oils, pure organic, skincare"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SEO Friendly URL (Slug)</label>
                  <input
                    type="text"
                    name="seoUrl"
                    value={form.seoUrl}
                    onChange={handleChange}
                    placeholder="auto-generated-slug-url"
                    className="w-full p-2 text-sm bg-gray-50 font-mono text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              className="w-full mt-4 bg-emerald-600 text-white font-medium py-2 px-4 rounded-md hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              {editId ? "Update Category SEO" : "Save Category SEO"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}