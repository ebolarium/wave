import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { blogAPI } from '../../services/api';
import BlogEditor from './BlogEditor';
import BlogList from './BlogList';
import { Blog } from './types';
import './MyBlogs.css';

const MyBlogs: React.FC = () => {
  const { user } = useAuth();
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [myBlogs, setMyBlogs] = useState<Blog[]>([]);
  const [drafts, setDrafts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const [publishedRes, draftsRes] = await Promise.all([
        blogAPI.getBlogs({ limit: 100 }),
        blogAPI.getDrafts()
      ]);

      console.log('Full published response:', publishedRes);
      console.log('Published data:', publishedRes.data);
      
      // Show all blogs regardless of user
      const allBlogs = publishedRes.data.blogs || [];
      console.log('All blogs to display:', allBlogs);

      setMyBlogs(allBlogs);
      setDrafts(draftsRes.data.blogs || []);
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setShowEditor(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setShowEditor(true);
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await blogAPI.deleteBlog(blogId);
      fetchMyBlogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting blog');
    }
  };

  const handleSaveSuccess = () => {
    setShowEditor(false);
    setEditingBlog(null);
    fetchMyBlogs();
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingBlog(null);
  };

  if (showEditor) {
    return (
      <BlogEditor
        blog={editingBlog}
        onSave={handleSaveSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="my-blogs-page">
      <div className="page-content">
        <div className="container">
          <div className="my-blogs-header">
            <h1>My Blog Posts</h1>
            <button className="btn-primary" onClick={handleCreateNew}>
              ✍️ Create New Post
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading"></div>
            </div>
          ) : (
            <>
              {drafts.length > 0 && (
                <div className="blog-section">
                  <h2>Drafts ({drafts.length})</h2>
                  <BlogList
                    blogs={drafts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}

              <div className="blog-section">
                <h2>Published ({myBlogs.length})</h2>
                {myBlogs.length > 0 ? (
                  <BlogList
                    blogs={myBlogs}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="empty-state">
                    <p>You haven't published any blog posts yet.</p>
                    <button className="btn-secondary" onClick={handleCreateNew}>
                      Create your first post
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBlogs;
