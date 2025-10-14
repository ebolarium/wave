import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import './Blog.css';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  publishedAt: string;
  readingTime: number;
  author: {
    firstName: string;
    lastName: string;
  };
}

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlogs({ limit: 20 });
      console.log('Blog API response:', response.data);
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="blog-page">
      <div className="page-content">
        <div className="container">
          <div className="blog-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading"></div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="empty-state">
                <p>No blog posts available yet.</p>
              </div>
            ) : (
              <div className="blog-grid">
                {blogs.map((blog, index) => (
                  <article 
                    key={blog._id} 
                    className={`blog-card ${index === 0 ? 'featured' : ''}`}
                    onClick={() => navigate(`/blog/${blog.slug}`)}
                  >
                    {blog.featuredImage && (
                      <div className="blog-image">
                        <img src={blog.featuredImage} alt={blog.title} />
                      </div>
                    )}
                    <div className="blog-content-inner">
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt}</p>
                      <div className="blog-meta">
                        <span className="blog-date">
                          {formatDate(blog.publishedAt)}
                        </span>
                        <span className="blog-read-time">
                          {blog.readingTime} min read
                        </span>
                      </div>
                      <div className="blog-author">
                        By {blog.author.firstName} {blog.author.lastName}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
