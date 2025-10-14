export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

