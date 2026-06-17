import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Image, Sparkles, Loader2, AlertCircle } from "lucide-react";

const DealsPage = () => {
  // --- STATE MANAGEMENT ---
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    originalPrice: "",
    sellingPrice: "",
    stock: "10",
    isActive: true,
    isBestSeller: false,
    seoUrl: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // --- LIVE VERCEL BACKEND ROUTE CONFIGURATION ---
  const BASE_API_URL = "https://herbal-backend-chi.vercel.app/api";

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const dataInitialization = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${BASE_API_URL}/deals/all`);
        if (!response.ok) throw new Error(`Deals API returned status ${response.status}`);

        const dealsData = await response.json();
        setDeals(Array.isArray(dealsData) ? dealsData : []);
      } catch (err) {
        console.error("🚨 Fetch error details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    dataInitialization();
  }, []);

  // --- FORM VALUE INPUT HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  // --- CREATE & UPDATE ACTION PROCESSOR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("originalPrice", formData.originalPrice);
      payload.append("sellingPrice", formData.sellingPrice);
      payload.append("stock", formData.stock);
      payload.append("isActive", formData.isActive);
      payload.append("isBestSeller", formData.isBestSeller);
      payload.append("seoUrl", formData.seoUrl);

      selectedImages.forEach((image) => {
        payload.append("images", image);
      });

      let response;
      if (editingId) {
        response = await fetch(`${BASE_API_URL}/deals/update/${editingId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        response = await fetch(`${BASE_API_URL}/deals/create`, {
          method: "POST",
          body: payload,
        });
      }

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.message || `Server verification failed with code ${response.status}`);
      }

      const updatedDealItem = await response.json();
      
      if (editingId) {
        setDeals((prev) => prev.map((d) => (d._id === editingId ? updatedDealItem : d)));
        setEditingId(null);
      } else {
        setDeals((prev) => [updatedDealItem, ...prev]);
      }

      // Clear operational form controls completely
      setFormData({
        title: "", description: "", originalPrice: "", sellingPrice: "",
        stock: "10", isActive: true, isBestSeller: false, seoUrl: "",
      });
      setSelectedImages([]);
      alert(editingId ? "Combo Pack Updated Successfully! 🎉" : "New Combo Deal Launched! 🚀");
    } catch (err) {
      console.error("🚨 Processing Exception:", err);
      alert(`Operation Failed: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- TRIGGER EDIT ASSIGNMENT MODE ---
  const startEditMode = (deal) => {
    setEditingId(deal._id);
    setFormData({
      title: deal.title,
      description: deal.description,
      originalPrice: deal.originalPrice,
      sellingPrice: deal.sellingPrice,
      stock: deal.stock || 10,
      isActive: deal.isActive,
      isBestSeller: deal.isBestSeller,
      seoUrl: deal.seoUrl,
    });
  };

  // --- PURGE/DELETE OPERATION HANDLER ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you absolutely sure you want to delete this combo deal?")) return;

    try {
      const response = await fetch(`${BASE_API_URL}/deals/delete/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error performing deletion request.");

      setDeals((prev) => prev.filter((d) => d._id !== id));
      alert("Combo Pack removed from database successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        <p className="mt-3 text-gray-500 font-medium">Fetching Combo Config structures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 max-w-[1600px] mx-auto text-gray-800">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={24} /> Combo Deals Configuration
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage bundled product packages, custom cut-prices, and automatic discount math variables.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 text-sm font-medium">
          <AlertCircle size={20} />
          <span>Error connecting to server pipeline: {error}. Please ensure backend routes exist.</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* ================= COLUMN 1: MANAGEMENT FORM ================= */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-6 xl:col-span-1">
          <h3 className="text-lg font-bold mb-4 pb-2 border-b text-gray-900">
            {editingId ? "📝 Update Bundle Details" : "✨ Create New Combo Package"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Deal Combo Title</label>
              <input 
                type="text" name="title" value={formData.title} onChange={handleInputChange}
                required placeholder="e.g., Ultimate Herbal Hydration Glow Pack"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">SEO URL Slug (Optional)</label>
              <input 
                type="text" name="seoUrl" value={formData.seoUrl} onChange={handleInputChange}
                placeholder="Auto-generated if left completely blank"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Package Description</label>
              <textarea 
                name="description" value={formData.description} onChange={handleInputChange}
                required rows="3" placeholder="Explain the benefits of buying this combined pack..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Original Price (Rs.)</label>
                <input 
                  type="number" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange}
                  required placeholder="Sum of individual items"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Selling Cut Price (Rs.)</label>
                <input 
                  type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange}
                  required placeholder="Discounted combo price"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Combo Pool Stock Limit</label>
              <input 
                type="number" name="stock" value={formData.stock} onChange={handleInputChange}
                required className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Image size={14} /> Upload Banner Media Bundle
              </label>
              <input 
                type="file" multiple accept="image/*" onChange={handleFileChange}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required={!editingId}
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 cursor-pointer select-none">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" />
                Live Visibility
              </label>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 cursor-pointer select-none">
                <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" />
                Hot Seller
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={submitLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={16} />}
                {editingId ? "Save Modifications" : "Launch Combo Deal"}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "", description: "", originalPrice: "", sellingPrice: "",
                      stock: "10", isActive: true, isBestSeller: false, seoUrl: "",
                    });
                    setSelectedImages([]);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2.5 rounded-xl transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ================= COLUMN 2 & 3: DATA INVENTORY TABLE ================= */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Active Pipeline Inventories ({deals.length})</h3>
          </div>
          
          {deals.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-medium">
              <AlertCircle className="mx-auto mb-2 text-gray-300" size={32} />
              No combo packs configured on your database cluster.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Package Layout</th>
                    <th className="p-4">Pricing Breakdown</th>
                    <th className="p-4">Stock Pool</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm font-medium">
                  {deals.map((deal) => (
                    <tr key={deal._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={deal.images?.[0] || "https://placehold.co/80x60"} 
                            className="w-16 h-12 object-cover rounded-lg border border-gray-200 shadow-sm bg-gray-50"
                            alt="bundle content preview"
                          />
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{deal.title}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{deal.seoUrl}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 line-through">Rs.{deal.originalPrice?.toLocaleString()}</span>
                          <span className="font-bold text-green-700">Rs.{deal.sellingPrice?.toLocaleString()}</span>
                          {deal.discountPercentage > 0 && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded mt-1 w-max">
                              -{deal.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${deal.stock <= 2 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"}`}>
                          {deal.stock} units
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {deal.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">
                              ● Live Marketplace
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-50 border border-gray-200 text-gray-400 px-2.5 py-1 rounded-full">
                              ○ Hidden Draft
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => startEditMode(deal)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100 cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(deal._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DealsPage;