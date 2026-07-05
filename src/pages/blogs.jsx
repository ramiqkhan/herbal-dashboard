import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new'; // Make sure this matches your package json
import 'react-quill-new/dist/quill.snow.css'; 

const BlogForm = () => {
  const [blogs, setBlogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 
  const [message, setMessage] = useState({ type: '', text: '' });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],        
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'video', 'clean'] // 👈 Yahan 'video' button add kar diya
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'video' // 👈 Yahan bhi 'video' format register kar diya
  ];
  

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: 'Herbal Care Admin',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    tags: '',
    isActive: true
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('https://herbal-backend-chi.vercel.app/api/blogs/dashboard/all');
      const data = await response.json();
      if (response.ok) {
        setBlogs(data);
      }
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      author: 'Herbal Care Admin',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      tags: '',
      isActive: true
    });
    setSelectedImages([]);
    setMessage({ type: '', text: '' });
    setIsOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title || '',
      summary: blog.summary || '',
      content: blog.content || '',
      author: blog.author || 'Herbal Care Admin',
      slug: blog.slug || '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      isActive: blog.isActive !== false
    });
    setSelectedImages([]); 
    setMessage({ type: '', text: '' });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you completely sure you want to delete this blog post permanently?")) return;
    
    try {
      const response = await fetch(`https://herbal-backend-chi.vercel.app/api/blogs/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setBlogs(prev => prev.filter(blog => blog._id !== id));
        alert("Blog entry removed successfully.");
      } else {
        alert("Failed to delete the article.");
      }
    } catch (error) {
      console.error("Delete call error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = new FormData();
    
    // ✅ FIXES CONTENT & BOOLEAN VALUES STRING CONVERSION BEFORE SENDING TO BACKEND
    Object.keys(formData).forEach(key => {
      if (key === 'tags') {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        submissionData.append('tags', JSON.stringify(tagsArray));
      } else if (key === 'isActive') {
        // Form data transfers explicitly in strings, convert boolean cleanly
        submissionData.append('isActive', formData.isActive ? 'true' : 'false');
      } else {
        submissionData.append(key, formData[key]);
      }
    });

    selectedImages.forEach(file => {
      submissionData.append('images', file);
    });

    const url = editingId 
      ? `https://herbal-backend-chi.vercel.app/api/blogs/${editingId}`
      : 'https://herbal-backend-chi.vercel.app/api/blogs';
      
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: submissionData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong during submission.');
      }

      setMessage({ 
        type: 'success', 
        text: editingId ? 'Blog article updated successfully! 📝' : 'Blog entry published successfully! 🎉' 
      });

      fetchBlogs(); 
      setTimeout(() => setIsOpen(false), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
  
  {/* Header Info Block */}
  <div>
    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Blog Management</h1>
    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
      Create, view, modify, and manage your production articles layout.
    </p>
  </div>
  
  {/* Responsive Action Button */}
  <button
    onClick={handleOpenCreate}
    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap text-sm sm:text-base"
  >
    <span className="text-xl font-light leading-none mb-0.5">+</span> Add New Blog
  </button>

</div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {fetchLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">
            Loading production blogs database sync entries...
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No blogs found in database. Click "Add New Blog" to populate content layouts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="p-4">Cover Image</th>
                  <th className="p-4">Article Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4">
                      {blog.images && blog.images[0] ? (
                        <img 
                          src={blog.images[0]} 
                          alt="preview" 
                          className="w-16 h-10 object-cover rounded border border-gray-100" 
                        />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded text-center flex items-center justify-center text-xs text-gray-400">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium max-w-xs truncate">
                      <div>{blog.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">/{blog.slug}</div>
                    </td>
                    <td className="p-4 text-gray-500">{blog.author}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {blog.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(blog)}
                        className="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md font-medium text-xs transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-md font-medium text-xs transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto flex flex-col">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Modify Article Values" : "Compose New Article"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-medium">✕</button>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 flex-1 pb-12">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Article Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Author Override</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Custom Slug (Optional)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Short Brief Summary *</label>
                <textarea
                  name="summary"
                  required
                  rows="2"
                  value={formData.summary}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Full Article Body *
                </label>
                
                {/* ✅ FIX: Proper container layout styles applied for snow styling support */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden custom-quill-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    modules={modules}
                    formats={formats}
                    onChange={(contentValue) => {
                      setFormData(prev => ({
                        ...prev,
                        content: contentValue
                      }));
                    }}
                    placeholder="Write your beautiful herbal article here..."
                    className="min-h-[220px] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Cover Images Attachment</label>
                <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer relative bg-gray-50/50">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload files or drag and drop</p>
                </div>
                {selectedImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedImages.map((file, idx) => (
                      <span key={idx} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium border border-emerald-100">📎 {file.name}</span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">🔍 Production Meta SEO Panel</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Title Tag</label>
                  <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Keywords</label>
                    <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Description</label>
                    <input type="text" name="metaDescription" value={formData.metaDescription} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-emerald-600 accent-emerald-600" />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Publish Instantly</label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-8">
                <button type="button" onClick={() => setIsOpen(false)} disabled={loading} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">
                  {loading ? 'Processing changes...' : editingId ? 'Update Content' : 'Publish Content'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogForm;