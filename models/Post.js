const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  featuredImage: {
    url: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Post category is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post author is required']
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
  scheduledFor: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  // SEO Meta Data
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    metaKeywords: [{
      type: String,
      trim: true
    }],
    ogImage: {
      type: String,
      default: null
    },
    canonicalUrl: {
      type: String,
      default: null
    }
  },
  // Content structure for rich text
  contentType: {
    type: String,
    enum: ['markdown', 'html', 'richtext'],
    default: 'markdown'
  },
  // Related posts
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  // Comments (basic structure)
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  commentCount: {
    type: Number,
    default: 0
  },
  // External links for posts
  externalLinks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    openInNewTab: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  // Monetization
  affiliateLinks: [{
    text: String,
    url: String,
    position: String // 'top', 'middle', 'bottom'
  }],
  adSenseEnabled: {
    type: Boolean,
    default: true
  },
  // Analytics
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    avgTimeOnPage: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
postSchema.index({ slug: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ views: -1 });

// Virtual for URL
postSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Virtual for formatted publish date
postSchema.virtual('formattedDate').get(function() {
  const date = this.publishedAt || this.createdAt;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time calculation
postSchema.virtual('estimatedReadingTime').get(function() {
  if (this.readingTime > 0) return this.readingTime;
  
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to generate slug
postSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Add timestamp to ensure uniqueness if needed
    if (this.isNew) {
      const timestamp = Date.now().toString().slice(-4);
      this.slug = `${this.slug}-${timestamp}`;
    }
  }
  
  // Auto-generate excerpt if not provided
  if (this.isModified('content') && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  
  // Calculate reading time
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate SEO meta data if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }
  
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.excerpt || this.content.substring(0, 160);
  }
  
  next();
});

// Static method to find published posts
postSchema.statics.findPublished = function(options = {}) {
  const query = { status: 'published' };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  if (options.author) {
    query.author = options.author;
  }
  
  return this.find(query)
    .populate('author', 'firstName lastName username avatar')
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 });
};

// Static method to find trending posts
postSchema.statics.findTrending = function(limit = 5) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'published',
    publishedAt: { $gte: oneWeekAgo }
  })
  .populate('author', 'firstName lastName username avatar')
  .populate('category', 'name slug')
  .sort({ views: -1, likes: -1 })
  .limit(limit);
};

// Instance method to increment views
postSchema.methods.incrementViews = function() {
  return this.updateOne({ $inc: { views: 1 } });
};

// Instance method to increment likes
postSchema.methods.incrementLikes = function() {
  return this.updateOne({ $inc: { likes: 1 } });
};

// Ensure virtual fields are serialized
postSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Post', postSchema);

