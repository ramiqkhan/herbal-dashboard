import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000/api/products";
const CATEGORIES_URL = "http://localhost:5000/api/categories"; 

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]); 
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "", 
    basePrice: "",
    description: "",
    images: [],   
    sizes: [{ label: "", price: "" }],
    faqs: [{ question: "", answer: "" }],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    productTags: "",
    seoUrl: ""
  });

  const handleImageChange = (e) => {
    setForm({
      ...form,
      images: Array.from(e.target.files), 
    });
  };

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
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
      console.error("Products fetch karne me error:", err);
    }
  };

  // ================= FETCH REAL CATEGORIES =================
  const fetchDbCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_URL);
      const data = await res.json();
      
      let fetchedCategories = [];
      if (Array.isArray(data)) {
        fetchedCategories = data;
      } else if (data && Array.isArray(data.categories)) {
        fetchedCategories = data.categories;
      } else if (data && Array.isArray(data.data)) {
        fetchedCategories = data.data;
      }

      setDbCategories(fetchedCategories);

      if (fetchedCategories.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: fetchedCategories[0]._id }));
      }
    } catch (err) {
      console.error("Categories fetch karne me error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDbCategories(); 
  }, []);

  // ================= INPUT + AUTO SLUG FOR PRODUCT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !editId) {
      setForm({
        ...form,
        name: value,
        seoUrl: value.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ================= SIZE =================
  const handleSizeChange = (i, field, value) => {
    const newSizes = [...form.sizes];
    newSizes[i][field] = value;
    setForm({ ...form, sizes: newSizes });
  };

  const addSize = () => {
    setForm({
      ...form,
      sizes: [...form.sizes, { label: "", price: "" }],
    });
  };

  // ================= FAQ =================
  const handleFaqChange = (i, field, value) => {
    const newFaqs = [...form.faqs];
    newFaqs[i][field] = value;
    setForm({ ...form, faqs: newFaqs });
  };

  const addFaq = () => {
    setForm({
      ...form,
      faqs: [...form.faqs, { question: "", answer: "" }],
    });
  };

  // ================= RESET FORM FUNCTION =================
  const resetFormState = () => {
    setForm({
      name: "",
      category: dbCategories.length > 0 ? dbCategories[0]._id : "",
      basePrice: "",
      description: "",
      images: [],
      sizes: [{ label: "", price: "" }],
      faqs: [{ question: "", answer: "" }],
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      productTags: "",
      seoUrl: ""
    });
    setEditId(null);
  };

  // ================= SUBMIT (CREATE / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("basePrice", form.basePrice);
    formData.append("description", form.description);
    formData.append("sizes", JSON.stringify(form.sizes));
    formData.append("faqs", JSON.stringify(form.faqs));
    
    formData.append("metaTitle", form.metaTitle);
    formData.append("metaDescription", form.metaDescription);
    formData.append("metaKeywords", form.metaKeywords);
    formData.append("productTags", form.productTags);
    formData.append("seoUrl", form.seoUrl);

    let safeCategoryId = form.category;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(safeCategoryId);

    if (!isValidObjectId) {
      const matchedCategory = dbCategories.find(
        (cat) => cat.seoUrl === safeCategoryId || cat.name === safeCategoryId || cat.slug === safeCategoryId
      );
      if (matchedCategory) {
        safeCategoryId = matchedCategory._id;
      }
    }

    formData.append("category", safeCategoryId); 

    if (form.images && form.images.length > 0) {
      form.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;

    try {
      const res = await fetch(url, {
        method,
        body: formData, 
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("🚨 Error: " + errData.message);
        return;
      }

      await res.json();
      alert(editId ? "🎉 Product update ho gaya!" : "🎉 Product add ho gaya!");

      resetFormState();
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // ================= EDIT FUNCTION =================
  const handleEdit = (p) => {
    let selectedCategoryId = "";
    
    if (p.category) {
      if (typeof p.category === "object" && p.category._id) {
        selectedCategoryId = p.category._id; 
      } else {
        selectedCategoryId = p.category; 
      }
    } else {
      selectedCategoryId = dbCategories.length > 0 ? dbCategories[0]._id : "";
    }

    setForm({
      name: p.name || "",
      category: selectedCategoryId, 
      basePrice: p.basePrice || "",
      description: p.description || "",
      images: [],   
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : [{ label: "", price: "" }],
      faqs: p.faqs && p.faqs.length > 0 ? p.faqs : [{ question: "", answer: "" }],
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
      metaKeywords: p.metaKeywords || "",
      productTags: p.productTags || "",
      seoUrl: p.seoUrl || ""
    });

    setEditId(p._id);
    setShowForm(true); 
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if(window.confirm("Kiya aap is product ko delete karna chahte hain?")) {
      try {
        await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
        fetchProducts();
      } catch (err) {
        console.error("Delete karne me error:", err);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800">Product Dashboard</h1>
        <button
          onClick={() => {
            if (showForm) resetFormState(); 
            setShowForm(!showForm);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded shadow-sm transition"
        >
          {showForm ? "Close Form" : "+ Add Product"}
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="max-w-6xl mx-auto bg-white p-6 shadow-sm rounded mb-8 border border-gray-200">
          <h2 className="text-lg font-bold mb-4 text-gray-700 pb-2 border-b">
            {editId ? "Update Product Details" : "Add New Product"}
          </h2> 

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* TOP ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-gray-600">Product Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Product Name"
                  className="border border-gray-300 p-2 text-sm rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-gray-600">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 text-sm rounded bg-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {dbCategories.length === 0 ? (
                    <option value="" disabled>Pehle category add karein...</option>
                  ) : (
                    dbCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-gray-600">Base Price</label>
                <input
                  name="basePrice"
                  value={form.basePrice}
                  onChange={handleChange}
                  placeholder="Base Price"
                  className="border border-gray-300 p-2 text-sm rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 text-gray-600">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="border border-gray-300 w-full p-2 text-sm rounded h-24 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* IMAGES */}
            <div className="border border-gray-200 p-4 rounded bg-gray-50/50">
              <h3 className="font-bold text-sm mb-2 text-gray-700">Product Images</h3>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="border border-gray-300 p-2 w-full bg-white text-sm rounded focus:outline-none"
              />
              <div className="flex gap-2 flex-wrap mt-2">
                {form.images?.map((file, i) => (
                  <div key={i} className="text-xs border bg-white p-1 rounded shadow-sm text-gray-600">
                    {file?.name}
                  </div>
                ))}
              </div>
            </div>

            {/* SIZES */}
            <div className="space-y-2 border-t pt-4 border-gray-100">
              <h3 className="font-bold text-sm text-gray-700">Sizes & Variations</h3>
              {form.sizes.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <input
                    value={s.label}
                    onChange={(e) => handleSizeChange(i, "label", e.target.value)}
                    placeholder="Label (e.g., 100ml, 50g)"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none"
                  />
                  <input
                    value={s.price}
                    onChange={(e) => handleSizeChange(i, "price", e.target.value)}
                    placeholder="Price"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none"
                  />
                </div>
              ))}
              <button 
                type="button" 
                onClick={addSize}
                className="text-xs text-blue-600 hover:underline font-semibold block"
              >
                + Add Size
              </button>
            </div>

            {/* FAQ */}
            <div className="space-y-2 border-t pt-4 border-gray-100">
              <h3 className="font-bold text-sm text-gray-700">Product FAQs</h3>
              {form.faqs.map((f, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <input
                    value={f.question}
                    onChange={(e) => handleFaqChange(i, "question", e.target.value)}
                    placeholder="Question"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none"
                  />
                  <input
                    value={f.answer}
                    onChange={(e) => handleFaqChange(i, "answer", e.target.value)}
                    placeholder="Answer"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none"
                  />
                </div>
              ))}
              <button 
                type="button" 
                onClick={addFaq}
                className="text-xs text-blue-600 hover:underline font-semibold block"
              >
                + Add FAQ
              </button>
            </div>

            {/* SEO FIELDS SECTION */}
            <div className="border-t border-gray-200 pt-5 mt-5 space-y-4">
              <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">SEO Settings (Google Search)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-gray-600">Meta Tag Title</label>
                  <input
                    name="metaTitle"
                    value={form.metaTitle}
                    onChange={handleChange}
                    placeholder="Meta Tag Title"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-gray-600">SEO URL (Slug)</label>
                  <input
                    name="seoUrl"
                    value={form.seoUrl}
                    onChange={handleChange}
                    placeholder="the-herbal-product"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-gray-600">Meta Tag Description</label>
                <textarea
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                  placeholder="Meta Tag Description"
                  className="border border-gray-300 p-2 text-sm rounded w-full h-20 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-gray-600">Meta Tag Keywords</label>
                  <input
                    name="metaKeywords"
                    value={form.metaKeywords}
                    onChange={handleChange}
                    placeholder="keyword1, keyword2"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-gray-600">Product Tags</label>
                  <input
                    name="productTags"
                    value={form.productTags}
                    onChange={handleChange}
                    placeholder="tag1, tag2"
                    className="border border-gray-300 p-2 text-sm rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded text-sm transition shadow-sm">
                {editId ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="max-w-6xl mx-auto bg-white p-6 shadow-sm border border-gray-200 rounded">
        <h2 className="text-base font-bold mb-4 text-gray-800 border-b pb-2">Products</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                <th className="p-3 border-r text-center w-24">Images</th>
                <th className="p-3 border-r">Name</th>
                <th className="p-3 border-r w-32">Category</th>
                <th className="p-3 border-r w-24">Base Price</th>
                <th className="p-3 border-r">Sizes</th>
                <th className="p-3 text-center w-40">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-400 font-medium bg-gray-50/50">
                    Koi products nahi mile. Naya product add karein!
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 border-r">
                      <div className="flex gap-1 flex-wrap justify-center">
                        {p.images?.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-10 h-10 object-cover rounded border border-gray-100 shadow-sm"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-gray-900 border-r">{p.name}</td>
                    <td className="p-3 capitalize border-r text-gray-600 font-medium">
                      {typeof p.category === "object" && p.category !== null 
                        ? p.category?.name 
                        : (dbCategories.find(c => c._id === p.category)?.name || "Uncategorized")}
                    </td>
                    <td className="p-3 border-r font-mono text-gray-700">{p.basePrice || "—"}</td>
                    <td className="p-3 text-xs text-gray-500 border-r space-y-0.5">
                      {p.sizes?.map((s, i) => (
                        <div key={i} className="bg-gray-100 inline-block px-1.5 py-0.5 rounded mr-1 mb-1 text-gray-700 font-medium">
                          {s.label} - {s.price}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-center space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs rounded transition shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded transition shadow-sm"
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
      </div>

    </div>
  );
}