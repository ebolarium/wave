import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { blogAPI } from '../../services/api';
import { Blog } from './types';
import './BlogEditor.css';

interface BlogEditorProps {
  blog: Blog | null;
  onSave: () => void;
  onCancel: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onSave, onCancel }) => {
  const [title, setTitle] = useState(blog?.title || '');
  const [excerpt, setExcerpt] = useState(blog?.excerpt || '');
  const [content, setContent] = useState(blog?.content || '');
  const [featuredImage, setFeaturedImage] = useState(blog?.featuredImage || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link'
  ];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt cannot exceed 300 characters';
    }

    if (!content.trim() || content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    } else if (content.length < 100) {
      newErrors.content = 'Content must be at least 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFeaturedImage(previewUrl);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!validate()) return;

    try {
      setSaving(true);

      let uploadedImageUrl = featuredImage;

      // Upload image if a new file was selected
      if (imageFile) {
        try {
          const uploadRes = await blogAPI.uploadImage(imageFile);
          uploadedImageUrl = uploadRes.data.imageUrl || '';
        } catch (uploadError: any) {
          alert(uploadError.response?.data?.message || 'Error uploading image');
          setSaving(false);
          return;
        }
      }
      
      const blogData = {
        title,
        excerpt,
        content,
        category: 'Technology', // Default category since it's required by backend
        status,
        featuredImage: uploadedImageUrl || undefined
      };

      if (blog?._id) {
        await blogAPI.updateBlog(blog._id, blogData);
      } else {
        await blogAPI.createBlog(blogData);
      }

      onSave();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="blog-editor-page">
      <div className="page-content">
        <div className="container">
          <div className="editor-header">
            <h1>{blog ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
            <button className="btn-cancel" onClick={onCancel} disabled={saving}>
              <span className="btn-icon">×</span>
              Cancel
            </button>
          </div>

          <div className="editor-form">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title..."
                maxLength={200}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
              <span className="char-count">{title.length}/200</span>
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt *</label>
              <textarea
                className={`form-input ${errors.excerpt ? 'error' : ''}`}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a short summary..."
                rows={3}
                maxLength={300}
              />
              {errors.excerpt && <span className="error-message">{errors.excerpt}</span>}
              <span className="char-count">{excerpt.length}/300</span>
            </div>

            <div className="form-group">
              <label className="form-label">Featured Image (Optional)</label>
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="file-label">
                  Choose Image
                </label>
                {featuredImage && (
                  <div className="image-preview">
                    <img src={featuredImage} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => {
                        setFeaturedImage('');
                        setImageFile(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <small className="help-text">
                Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Content *</label>
              <div className={`quill-wrapper ${errors.content ? 'error' : ''}`}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your blog content here..."
                />
              </div>
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>

            <div className="editor-actions">
              <button
                className="btn-save-draft"
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                <span className="btn-icon">📄</span>
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                className="btn-publish"
                onClick={() => handleSave('published')}
                disabled={saving}
              >
                <span className="btn-icon">✓</span>
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;

