const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  icon: {
    type: String,
    default: 'folder' // Default icon name
  },
  image: {
    type: String,
    default: null
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
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
    }]
  },
  // Analytics
  postCount: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ parentCategory: 1 });

// Virtual for URL
categorySchema.virtual('url').get(function() {
  return `/category/${this.slug}`;
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual for posts in this category
categorySchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category'
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  
  // Auto-generate SEO meta data if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.name;
  }
  
  if (!this.seo.metaDescription && this.description) {
    this.seo.metaDescription = this.description.substring(0, 160);
  }
  
  next();
});

// Static method to find active categories
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('subcategories');
};

// Static method to find top-level categories
categorySchema.statics.findTopLevel = function() {
  return this.find({ 
    isActive: true, 
    parentCategory: null 
  })
  .sort({ sortOrder: 1, name: 1 })
  .populate('subcategories');
};

// Static method to get category with post count
categorySchema.statics.findWithPostCount = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'category',
        as: 'posts'
      }
    },
    {
      $addFields: {
        postCount: { $size: '$posts' }
      }
    },
    {
      $project: {
        posts: 0 // Remove the posts array from output
      }
    },
    {
      $sort: { sortOrder: 1, name: 1 }
    }
  ]);
};

// Instance method to update post count
categorySchema.methods.updatePostCount = async function() {
  const Post = mongoose.model('Post');
  const count = await Post.countDocuments({ 
    category: this._id, 
    status: 'published' 
  });
  
  this.postCount = count;
  return this.save();
};

// Instance method to update total views
categorySchema.methods.updateTotalViews = async function() {
  const Post = mongoose.model('Post');
  const result = await Post.aggregate([
    {
      $match: { 
        category: this._id, 
        status: 'published' 
      }
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$views' }
      }
    }
  ]);
  
  this.totalViews = result.length > 0 ? result[0].totalViews : 0;
  return this.save();
};

// Ensure virtual fields are serialized
categorySchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Category', categorySchema);

