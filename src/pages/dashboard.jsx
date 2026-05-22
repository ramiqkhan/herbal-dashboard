import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000/api/products";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "oil",
    basePrice: "",
    description: "",
      images: [],   // ✅ ADD THIS
    sizes: [{ label: "", price: "" }],
    faqs: [{ question: "", answer: "" }],
    // 🔥 ADD THESE
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  productTags: "",
  seoUrl: ""
  });
const handleImageChange = (e) => {
  setForm({
    ...form,
    images: Array.from(e.target.files), // multiple files
  });
};
  // ================= FETCH =================
  const fetchProducts = async () => {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("basePrice", form.basePrice);
    formData.append("description", form.description);
    formData.append("sizes", JSON.stringify(form.sizes));
    formData.append("faqs", JSON.stringify(form.faqs));
    // 🔥 ADD THESE SEO FIELDS
formData.append("metaTitle", form.metaTitle);
formData.append("metaDescription", form.metaDescription);
formData.append("metaKeywords", form.metaKeywords);
formData.append("productTags", form.productTags);
formData.append("seoUrl", form.seoUrl);
  form.images.forEach((file) => {
    formData.append("images", file);
  });
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;

    await fetch(url, {
      method,
      body: formData,
    });

    // reset
    setForm({
      name: "",
      category: "oil",
      basePrice: "",
      description: "",
      sizes: [{ label: "", price: "" }],
      faqs: [{ question: "", answer: "" }],
      metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  productTags: "",
  seoUrl: ""
    });

    setEditId(null);
    setShowForm(false);
    fetchProducts();
  };

  // ================= EDIT =================
  const handleEdit = (p) => {
    setForm({
      name: p.name || "",
      category: p.category || "oil",
      basePrice: p.basePrice || "",
      description: p.description || "",
          images: [],   // reset files (don’t preload URLs as files)

      sizes: p.sizes || [{ label: "", price: "" }],
      faqs: p.faqs || [{ question: "", answer: "" }],
      // 🔥 ADD THESE
    metaTitle: p.metaTitle || "",
    metaDescription: p.metaDescription || "",
    metaKeywords: p.metaKeywords || "",
    productTags: p.productTags || "",
    seoUrl: p.seoUrl || ""
    });

    setEditId(p._id);
    setShowForm(true); // open form
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="p-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product Dashboard</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2"
        >
          {showForm ? "Close Form" : "+ Add Product"}
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white p-4 shadow rounded mb-6">
          <h2 className="text-xl font-bold mb-3">
            {editId ? "Update Product" : "Add Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* TOP ROW */}
            <div className="grid grid-cols-3 gap-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="border p-2"
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border p-2"
              >
                <option value="oil">Oil</option>
                <option value="cream">Cream</option>
                <option value="sugar">Sugar</option>
                <option value="senna">Senna</option>
              </select>

              <input
                name="basePrice"
                value={form.basePrice}
                onChange={handleChange}
                placeholder="Base Price"
                className="border p-2"
              />
            </div>

            {/* DESCRIPTION */}
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="border w-full p-2"
            />
{/* IMAGES */}
<div>
  <h3 className="font-bold">Images</h3>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageChange}
    className="border p-2 w-full"
  />

  {/* preview */}
  <div className="flex gap-2 flex-wrap mt-2">
{form.images?.map((file, i) => (
  <div key={i} className="text-xs border p-1">
    {file?.name}
  </div>
))}
  </div>
</div>
            {/* SIZES */}
            <h3 className="font-bold">Sizes</h3>

            {form.sizes.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <input
                  value={s.label}
                  onChange={(e) =>
                    handleSizeChange(i, "label", e.target.value)
                  }
                  placeholder="Label"
                  className="border p-2"
                />
                <input
                  value={s.price}
                  onChange={(e) =>
                    handleSizeChange(i, "price", e.target.value)
                  }
                  placeholder="Price"
                  className="border p-2"
                />
              </div>
            ))}

            <button type="button" onClick={addSize}>
              + Add Size
            </button>

            {/* FAQ */}
            <h3 className="font-bold">FAQs</h3>

            {form.faqs.map((f, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <input
                  value={f.question}
                  onChange={(e) =>
                    handleFaqChange(i, "question", e.target.value)
                  }
                  placeholder="Question"
                  className="border p-2"
                />
                <input
                  value={f.answer}
                  onChange={(e) =>
                    handleFaqChange(i, "answer", e.target.value)
                  }
                  placeholder="Answer"
                  className="border p-2"
                />
              </div>
            ))}

            <button type="button" onClick={addFaq}>
              + Add FAQ
            </button>

          
            {/* ================= SEO FIELDS SECTION ================= */}
<div className="border-t pt-4 mt-4 space-y-4">
  <h3 className="font-bold text-lg text-gray-700">SEO Settings</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-1">Meta Tag Title <span className="text-red-500">*</span></label>
      <input
        name="metaTitle"
        value={form.metaTitle}
        onChange={handleChange}
        placeholder="Meta Tag Title"
        className="border p-2 rounded"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-1">SEO URL</label>
      <input
        name="seoUrl"
        value={form.seoUrl}
        onChange={handleChange}
        placeholder="the-herbal-product"
        className="border p-2 rounded"
      />
    </div>
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-semibold mb-1">Meta Tag Description</label>
    <textarea
      name="metaDescription"
      value={form.metaDescription}
      onChange={handleChange}
      placeholder="Meta Tag Description"
      className="border p-2 rounded w-full h-20"
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-1">Meta Tag Keywords</label>
      <input
        name="metaKeywords"
        value={form.metaKeywords}
        onChange={handleChange}
        placeholder="keyword1, keyword2"
        className="border p-2 rounded"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-1">Product Tags</label>
      <input
        name="productTags"
        value={form.productTags}
        onChange={handleChange}
        placeholder="tag1, tag2"
        className="border p-2 rounded"
      />
    </div>
  </div>
</div>
  <button className="bg-green-600 text-white px-4 py-2 w-full">
              {editId ? "Update" : "Create"}
            </button>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-bold mb-3">Products</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
            <th className="border p-2">Images</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Sizes</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="text-center">
                <td className="border p-2">
  <div className="flex gap-1 flex-wrap justify-center">
    {p.images?.map((img, i) => (
      <img
        key={i}
        src={img}
        alt=""
        className="w-10 h-10 object-cover rounded"
      />
    ))}
  </div>
</td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.category}</td>
                <td className="border p-2">{p.basePrice}</td>

                <td className="border p-2">
                  {p.sizes?.map((s, i) => (
                    <div key={i}>
                      {s.label} - {s.price}
                    </div>
                  ))}
                </td>

                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-blue-500 text-white px-3 py-1"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-500 text-white px-3 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}