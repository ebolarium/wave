import React from 'react';
import { Blog } from './types';
import './BlogList.css';

interface BlogListProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blogId: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ blogs, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="blog-list">
      {blogs.map((blog) => (
        <div key={blog._id} className="blog-list-item">
          {blog.featuredImage && (
            <div className="blog-list-image">
              <img src={blog.featuredImage} alt={blog.title} />
            </div>
          )}
          <div className="blog-list-content">
            <div className="blog-list-header">
              <div>
                <h3>{blog.title}</h3>
                <p className="blog-list-excerpt">{blog.excerpt}</p>
              </div>
              <span className={`status-badge ${blog.status}`}>
                {blog.status}
              </span>
            </div>
            <div className="blog-list-meta">
              <span className="date">
                {blog.status === 'published' && blog.publishedAt
                  ? `Published: ${formatDate(blog.publishedAt)}`
                  : `Updated: ${formatDate(blog.updatedAt)}`}
              </span>
            </div>
            <div className="blog-list-actions">
              <button className="btn-edit" onClick={() => onEdit(blog)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => onDelete(blog._id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogList;

