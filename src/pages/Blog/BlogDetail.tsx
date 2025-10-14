import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import './BlogDetail.css';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featuredImage?: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  author: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog(slug);
    }
  }, [slug]);

  const fetchBlog = async (slug: string) => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlog(slug);
      setBlog(response.data.blog);
    } catch (error: any) {
      console.error('Error fetching blog:', error);
      if (error.response?.status === 404) {
        alert('Blog post not found');
        navigate('/blog');
      }
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


  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="page-content">
          <div className="container">
            <div className="loading-container">
              <div className="loading"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <div className="page-content">
          <div className="container">
            <div className="empty-state">
              <p>Blog post not found</p>
              <button className="btn-primary" onClick={() => navigate('/blog')}>
                Back to Blogs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="page-content">
        <div className="container">
          <button className="back-button" onClick={() => navigate('/blog')}>
            ← Back to Blogs
          </button>

          <article className="blog-detail">
            <div className="blog-detail-header">
              <h1>{blog.title}</h1>
              <p className="blog-excerpt">{blog.excerpt}</p>
              
              <div className="blog-meta">
                <div className="author-info">
                  {blog.author.avatar ? (
                    <img src={blog.author.avatar} alt={blog.author.firstName} className="author-avatar" />
                  ) : (
                    <div className="author-avatar-placeholder">
                      {blog.author.firstName[0]}{blog.author.lastName[0]}
                    </div>
                  )}
                  <div>
                    <div className="author-name">
                      {blog.author.firstName} {blog.author.lastName}
                    </div>
                    <div className="blog-date">
                      {formatDate(blog.publishedAt)} · {blog.readingTime} min read · {blog.views} views
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {blog.featuredImage && (
              <div className="blog-featured-image">
                <img src={blog.featuredImage} alt={blog.title} />
              </div>
            )}

            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

