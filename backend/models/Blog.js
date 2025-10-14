const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: false,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [100, 'Content must be at least 100 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: ['Technology', 'Design', 'Trends', 'Innovation', 'Tutorial', 'News'],
    default: 'Technology'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featuredImage: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  readingTime: {
    type: Number,
    default: 0 // in minutes
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ tags: 1 });

// Generate slug from title
blogSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Calculate reading time
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).populate('author', 'username firstName lastName avatar');
};

// Static method to find blogs by category
blogSchema.statics.findByCategory = function(category) {
  return this.findPublished().where({ category });
};

// Instance method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to toggle like
blogSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);
