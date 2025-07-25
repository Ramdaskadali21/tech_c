const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Post = require('./models/Post');

// Sample data
const sampleCategories = [
  {
    name: 'Tech News',
    description: 'Latest technology news and updates from around the world',
    color: '#3B82F6',
    icon: 'newspaper',
    sortOrder: 1
  },
  {
    name: 'Tech How-To Guides',
    description: 'Step-by-step tutorials and guides for technology',
    color: '#10B981',
    icon: 'book-open',
    sortOrder: 2
  },
  {
    name: 'AI Tools & Productivity Apps',
    description: 'Reviews and guides for AI tools and productivity applications',
    color: '#8B5CF6',
    icon: 'cpu-chip',
    sortOrder: 3
  }
];

const samplePosts = [
  {
    title: 'Top 10 Gadgets Launched at WWDC 2025: Full Recap',
    content: `# Top 10 Gadgets Launched at WWDC 2025: Full Recap

Apple's Worldwide Developers Conference (WWDC) 2025 was nothing short of spectacular, showcasing groundbreaking innovations that will shape the future of technology. From revolutionary AI integrations to stunning hardware upgrades, this year's event delivered on all fronts.

## 1. iPhone 16 Pro with Neural Engine 2.0

The iPhone 16 Pro series introduces the most powerful Neural Engine yet, capable of processing 50 trillion operations per second. This advancement enables real-time AI photography, instant language translation, and seamless AR experiences.

### Key Features:
- 6.3" and 6.9" ProMotion displays with 120Hz refresh rate
- A18 Bionic chip with 3nm+ technology
- 48MP main camera with 10x optical zoom
- All-day battery life with wireless charging

## 2. MacBook Air M4: Redefining Portable Computing

The new MacBook Air powered by the M4 chip delivers unprecedented performance in an ultra-thin design. With up to 22 hours of battery life and fanless operation, it's perfect for professionals on the go.

### Specifications:
- M4 chip with 12-core CPU and 16-core GPU
- Up to 32GB unified memory
- 15" and 13" models available
- Starting at $1,199

## 3. Apple Vision Pro 2: The Future of Mixed Reality

Building on the success of the original Vision Pro, the second generation offers improved comfort, longer battery life, and enhanced spatial computing capabilities.

### New Features:
- 40% lighter design
- 6-hour battery life
- Eye tracking 2.0 with improved accuracy
- New gesture controls

## 4. Apple Watch Series 10: Health Revolution

The Apple Watch Series 10 introduces groundbreaking health monitoring features, including continuous glucose monitoring and advanced sleep analysis.

### Health Features:
- Non-invasive glucose monitoring
- Blood pressure tracking
- Mental health insights
- Enhanced ECG capabilities

## 5. AirPods Pro 3: Adaptive Audio Excellence

The third generation AirPods Pro feature adaptive audio that automatically adjusts to your environment, providing the perfect listening experience anywhere.

### Audio Innovations:
- Adaptive Transparency mode
- Personalized Spatial Audio
- 8-hour battery life with case
- USB-C charging

## 6. iPad Pro M4: Creative Powerhouse

The new iPad Pro with M4 chip brings desktop-class performance to a tablet form factor, making it ideal for creative professionals and power users.

### Creative Features:
- 12.9" Liquid Retina XDR display
- Apple Pencil Pro support
- Final Cut Pro optimization
- Thunderbolt 4 connectivity

## 7. Mac Studio M4 Ultra: Professional Computing

For professionals who need maximum performance, the Mac Studio M4 Ultra delivers workstation-class power in a compact design.

### Performance Specs:
- M4 Ultra chip with 32-core CPU
- Up to 192GB unified memory
- 8K video editing capabilities
- Multiple Thunderbolt 4 ports

## 8. HomePod 3: Smart Home Hub

The third-generation HomePod serves as the central hub for your smart home, with improved Siri intelligence and multi-room audio.

### Smart Features:
- Room-filling 360-degree audio
- Advanced Siri capabilities
- Matter compatibility
- Temperature and humidity sensors

## 9. Apple TV 4K (3rd Gen): Entertainment Center

The latest Apple TV 4K brings gaming and entertainment to new heights with A17 Pro chip and enhanced graphics performance.

### Entertainment Features:
- A17 Pro chip for console-quality gaming
- 8K video support
- Dolby Vision and Atmos
- New Siri Remote with Find My

## 10. AirTag 2: Enhanced Tracking

The second-generation AirTag offers improved range, better privacy features, and new form factors for different use cases.

### Tracking Improvements:
- 2x longer range
- Precision Finding 2.0
- Enhanced privacy controls
- Water resistance upgrade

## Conclusion

WWDC 2025 demonstrated Apple's commitment to innovation across all product categories. These new devices showcase the company's focus on AI integration, sustainability, and user privacy while delivering exceptional performance and design.

The integration of advanced AI capabilities across the entire ecosystem creates a seamless experience that adapts to users' needs. From the Neural Engine 2.0 in the iPhone to the adaptive audio in AirPods Pro 3, Apple is setting new standards for intelligent technology.

As these products become available throughout 2025, they promise to transform how we work, create, and connect with the world around us.`,
    excerpt: 'Apple\'s WWDC 2025 showcased revolutionary gadgets including iPhone 16 Pro with Neural Engine 2.0, MacBook Air M4, and Apple Vision Pro 2. Discover the top 10 innovations that will shape the future of technology.',
    tags: ['apple', 'wwdc', 'gadgets', 'technology', 'innovation', 'iphone', 'macbook', 'ai'],
    status: 'published',
    publishedAt: new Date('2025-06-15'),
    featuredImage: {
      url: '/uploads/posts/wwdc-2025-recap.jpg',
      alt: 'WWDC 2025 keynote stage with new Apple products',
      caption: 'Apple\'s WWDC 2025 showcased groundbreaking innovations'
    },
    seo: {
      metaTitle: 'Top 10 WWDC 2025 Gadgets: Complete Apple Event Recap',
      metaDescription: 'Comprehensive recap of Apple\'s WWDC 2025 featuring iPhone 16 Pro, MacBook Air M4, Vision Pro 2, and 7 other revolutionary gadgets.',
      metaKeywords: ['WWDC 2025', 'Apple gadgets', 'iPhone 16 Pro', 'MacBook Air M4', 'tech news']
    },
    views: 1250,
    likes: 89
  },
  {
    title: 'Best Free AI Tools for Students in 2025 (No Sign-Up Needed)',
    content: `# Best Free AI Tools for Students in 2025 (No Sign-Up Needed)

As artificial intelligence continues to revolutionize education, students now have access to powerful AI tools that can enhance their learning experience without breaking the bank. Here's a comprehensive guide to the best free AI tools that require no sign-up and can immediately boost your academic productivity.

## 1. ChatGPT (Free Tier) - Your AI Study Buddy

While ChatGPT offers premium features, its free tier remains incredibly powerful for students. Use it for:

### Academic Applications:
- **Essay brainstorming**: Generate topic ideas and outline structures
- **Research assistance**: Get explanations of complex concepts
- **Language learning**: Practice conversations and grammar
- **Code debugging**: Get help with programming assignments

### Pro Tips:
- Be specific with your prompts for better results
- Use it to explain concepts in simpler terms
- Ask for step-by-step solutions to math problems
- Request multiple perspectives on essay topics

## 2. Perplexity AI - Research Made Simple

Perplexity AI combines search engine capabilities with AI responses, making it perfect for academic research.

### Key Features:
- Real-time web search integration
- Source citations for fact-checking
- Follow-up questions for deeper understanding
- No account required for basic use

### Best Use Cases:
- Quick fact-checking for assignments
- Getting current information on topics
- Understanding recent developments in your field
- Comparing different viewpoints on subjects

## 3. Claude (Anthropic) - The Ethical AI Assistant

Claude excels at providing balanced, well-reasoned responses and is particularly good for:

### Academic Strengths:
- Critical thinking exercises
- Ethical analysis of topics
- Literature analysis and interpretation
- Scientific concept explanations

### Study Applications:
- Analyzing historical events from multiple perspectives
- Understanding philosophical concepts
- Breaking down scientific papers
- Preparing for debates and discussions

## 4. Google Bard - Integrated Learning

Google's AI assistant integrates seamlessly with Google's ecosystem, making it valuable for:

### Educational Features:
- Integration with Google Scholar
- Real-time information access
- Multiple response drafts
- Image analysis capabilities

### Student Benefits:
- Research paper assistance
- Current event analysis
- Language translation
- Creative writing support

## 5. Bing Chat - Microsoft's AI Solution

Built into Microsoft Edge, Bing Chat offers:

### Unique Features:
- Web browsing capabilities
- Image generation (limited free use)
- Integration with Microsoft Office
- Conversation modes (Creative, Balanced, Precise)

### Academic Uses:
- Research with live web data
- Creating study materials
- Generating visual aids
- Collaborative project planning

## 6. Hugging Face Spaces - Open Source AI Tools

Hugging Face hosts numerous free AI tools without requiring sign-up:

### Available Tools:
- **Text summarization**: Condense long articles and papers
- **Language translation**: Support for 100+ languages
- **Grammar checking**: Improve your writing quality
- **Code generation**: Programming assistance

### How to Access:
1. Visit huggingface.co/spaces
2. Browse available tools
3. Use directly in your browser
4. No account needed for most tools

## 7. Quillbot - Writing Enhancement

While offering premium features, Quillbot's free tier provides:

### Writing Tools:
- Paraphrasing (up to 125 words)
- Grammar checking
- Summarization
- Citation generation

### Student Applications:
- Avoiding plagiarism through paraphrasing
- Improving sentence structure
- Creating concise summaries
- Proper citation formatting

## 8. Grammarly (Free Version) - Writing Polish

The free version of Grammarly offers:

### Core Features:
- Basic grammar and spelling checks
- Tone detection
- Clarity suggestions
- Browser extension

### Academic Benefits:
- Error-free assignments
- Professional email writing
- Improved readability
- Consistent writing style

## 9. Canva AI (Free Features) - Visual Learning

Canva's AI-powered design tools help students create:

### Visual Content:
- Presentation slides
- Infographics
- Study posters
- Social media content for projects

### AI Features (Free):
- Magic Design suggestions
- Background removal
- Text-to-image generation (limited)
- Smart cropping

## 10. Wolfram Alpha - Mathematical Genius

While not traditional AI, Wolfram Alpha's computational intelligence excels at:

### Mathematical Applications:
- Step-by-step equation solving
- Graph plotting and analysis
- Statistical calculations
- Unit conversions

### Academic Subjects:
- Physics problem solving
- Chemistry equation balancing
- Engineering calculations
- Data analysis

## Tips for Maximizing AI Tool Effectiveness

### 1. Combine Multiple Tools
- Use ChatGPT for brainstorming, then Perplexity for research
- Generate content with AI, then polish with Grammarly
- Create visuals with Canva after writing with AI assistants

### 2. Develop Good Prompting Skills
- Be specific and detailed in your requests
- Provide context for better responses
- Ask for explanations, not just answers
- Request examples and analogies

### 3. Maintain Academic Integrity
- Use AI as a learning aid, not a replacement for thinking
- Always cite AI assistance when required
- Verify information from multiple sources
- Understand concepts rather than just copying outputs

### 4. Stay Updated
- AI tools evolve rapidly
- New features are added regularly
- Free tiers may change over time
- Explore new tools as they become available

## Conclusion

These free AI tools can significantly enhance your learning experience without requiring sign-ups or subscriptions. The key is to use them strategically as supplements to your education, not replacements for critical thinking and genuine learning.

Remember that while AI can provide valuable assistance, developing your own analytical and creative skills remains essential for academic and professional success. Use these tools to enhance your capabilities, verify information through multiple sources, and always maintain academic integrity in your work.

As AI technology continues to advance, students who learn to effectively leverage these tools while maintaining their intellectual curiosity and critical thinking skills will have a significant advantage in their academic and professional journeys.`,
    excerpt: 'Discover the best free AI tools for students in 2025 that require no sign-up. From ChatGPT to Wolfram Alpha, learn how to enhance your studies with powerful AI assistance.',
    tags: ['ai tools', 'students', 'education', 'free tools', 'productivity', 'study tips', 'chatgpt', 'learning'],
    status: 'published',
    publishedAt: new Date('2025-06-10'),
    featuredImage: {
      url: '/uploads/posts/ai-tools-students.jpg',
      alt: 'Student using AI tools on laptop for studying',
      caption: 'Free AI tools can revolutionize your study experience'
    },
    seo: {
      metaTitle: 'Best Free AI Tools for Students 2025 - No Sign-Up Required',
      metaDescription: 'Complete guide to free AI tools for students including ChatGPT, Perplexity AI, and more. Boost your academic productivity without spending money.',
      metaKeywords: ['free AI tools', 'students', 'ChatGPT', 'education technology', 'study aids']
    },
    views: 2100,
    likes: 156
  },
  {
    title: 'How to Speed Up Any Android Phone Without Root [2025 Guide]',
    content: `# How to Speed Up Any Android Phone Without Root [2025 Guide]

Is your Android phone feeling sluggish? Before considering a new device or complex rooting procedures, try these proven methods to boost your phone's performance. This comprehensive guide covers everything from basic optimizations to advanced techniques that work on any Android device without requiring root access.

## Understanding Android Performance Issues

Before diving into solutions, it's important to understand why Android phones slow down over time:

### Common Causes of Slowdown:
- **Storage fragmentation**: Files scattered across storage
- **Background apps**: Too many apps running simultaneously
- **Cache buildup**: Temporary files consuming space
- **Outdated software**: Missing performance optimizations
- **Hardware aging**: Natural degradation over time

## Quick Wins: Immediate Performance Boosts

### 1. Restart Your Phone Regularly

The simplest solution is often the most effective:

**How to do it:**
1. Hold the power button
2. Select "Restart" or "Reboot"
3. Wait for the phone to fully restart

**Why it works:**
- Clears RAM of unnecessary processes
- Resets system services
- Closes background apps
- Refreshes system cache

**Recommended frequency:** At least once a week

### 2. Clear Cache Partition (Safe Mode)

Clearing the system cache can resolve performance issues:

**Steps for most Android devices:**
1. Turn off your phone completely
2. Hold Volume Up + Power button simultaneously
3. Release when you see the Android logo
4. Use volume buttons to navigate to "Wipe Cache Partition"
5. Press Power to select
6. Select "Yes" to confirm
7. Reboot the device

**Note:** Steps may vary by manufacturer

### 3. Free Up Storage Space

Android performance degrades when storage is nearly full:

**Target:** Keep at least 10-15% of storage free

**Quick cleanup methods:**
- Delete unused apps
- Move photos/videos to cloud storage
- Clear Downloads folder
- Remove old WhatsApp media
- Use built-in storage cleaner

## App Management Strategies

### 4. Disable Unnecessary Apps

Many pre-installed apps can't be uninstalled but can be disabled:

**How to disable apps:**
1. Go to Settings > Apps
2. Select the app you want to disable
3. Tap "Disable" or "Turn off"
4. Confirm your choice

**Safe apps to disable:**
- Bloatware from carrier/manufacturer
- Unused Google apps (if you have alternatives)
- Social media apps you don't use
- Games you no longer play

**Apps to NEVER disable:**
- System UI
- Android System
- Phone/Dialer
- Messages (default SMS app)

### 5. Manage App Permissions

Excessive permissions can slow down your device:

**Steps to optimize:**
1. Settings > Privacy > Permission Manager
2. Review each permission type
3. Revoke unnecessary permissions
4. Focus on location, camera, and microphone access

### 6. Control Background App Activity

Limit apps running in the background:

**Method 1: Battery Optimization**
1. Settings > Battery > Battery Optimization
2. Select "All apps"
3. Choose apps to optimize
4. Select "Optimize"

**Method 2: Background App Limits**
1. Settings > Apps
2. Select specific app
3. Battery > Background Activity
4. Toggle off if not needed

## System-Level Optimizations

### 7. Update Your Software

Keep your Android version and apps current:

**System updates:**
1. Settings > System > System Update
2. Download and install available updates
3. Restart when prompted

**App updates:**
1. Open Google Play Store
2. Tap profile icon > Manage apps & device
3. Update all apps

### 8. Optimize Developer Options

Enable Developer Options for advanced tweaks:

**How to enable:**
1. Settings > About Phone
2. Tap "Build Number" 7 times
3. Enter your PIN/password
4. Go back to Settings > System > Developer Options

**Useful optimizations:**
- **Window animation scale**: Set to 0.5x or off
- **Transition animation scale**: Set to 0.5x or off
- **Animator duration scale**: Set to 0.5x or off
- **Background process limit**: Set to "At most 4 processes"

### 9. Adjust Display Settings

Reduce visual effects for better performance:

**Optimizations:**
- Lower screen resolution (if available)
- Reduce refresh rate to 60Hz
- Turn off live wallpapers
- Disable adaptive brightness
- Use dark mode to save battery

## Advanced Performance Techniques

### 10. Use Lite Versions of Apps

Replace heavy apps with lighter alternatives:

**Popular lite apps:**
- Facebook Lite instead of Facebook
- Messenger Lite instead of Messenger
- Twitter Lite instead of Twitter
- YouTube Go instead of YouTube
- Gmail Go instead of Gmail

### 11. Optimize Google Services

Google Play Services can consume significant resources:

**Optimization steps:**
1. Settings > Apps > Google Play Services
2. Storage > Manage Space
3. Clear cache (not data)
4. Battery > Background Activity
5. Optimize battery usage

### 12. Clean Up Google Photos

Google Photos can slow down your device:

**Cleanup process:**
1. Open Google Photos
2. Go to Library > Utilities
3. Use "Free up space" feature
4. Delete backed-up photos from device
5. Clear app cache

### 13. Manage Widgets and Home Screen

Reduce home screen complexity:

**Optimizations:**
- Remove unnecessary widgets
- Use static wallpapers
- Limit home screen pages
- Avoid live wallpapers
- Use a lightweight launcher

## Storage and Memory Management

### 14. Use Built-in Storage Tools

Most Android phones have built-in cleanup tools:

**Common locations:**
- Settings > Storage > Clean up
- Settings > Device Care > Storage
- Files app > Clean feature

**What to clean:**
- Junk files
- Duplicate photos
- Large files you don't need
- App caches
- Downloads folder

### 15. Move Apps to SD Card

If your phone supports SD cards:

**How to move apps:**
1. Settings > Apps
2. Select the app
3. Storage > Change
4. Select SD card
5. Tap "Move"

**Note:** Not all apps can be moved

### 16. Use Cloud Storage Effectively

Reduce local storage usage:

**Best practices:**
- Enable auto-backup for photos
- Store documents in cloud
- Stream music instead of downloading
- Use cloud-based office apps
- Regularly clean local downloads

## Network and Connectivity Optimization

### 17. Reset Network Settings

Network issues can affect overall performance:

**How to reset:**
1. Settings > System > Reset
2. Reset Network Settings
3. Confirm the action
4. Reconnect to Wi-Fi networks

### 18. Optimize Wi-Fi Settings

Improve connectivity performance:

**Settings to check:**
- Turn off "Wi-Fi scanning" when not needed
- Disable "Smart Connect" if causing issues
- Forget unused Wi-Fi networks
- Use 5GHz band when available

## Battery and Thermal Management

### 19. Monitor Battery Health

Poor battery health affects performance:

**Check battery status:**
1. Settings > Battery > Battery Health (if available)
2. Look for battery degradation indicators
3. Consider battery replacement if severely degraded

### 20. Prevent Overheating

Heat throttling reduces performance:

**Prevention tips:**
- Remove phone case during intensive tasks
- Avoid direct sunlight
- Close resource-intensive apps
- Use airplane mode in poor signal areas
- Don't charge while gaming

## Maintenance Schedule

### Daily Tasks:
- Close unused apps
- Check available storage
- Monitor battery usage

### Weekly Tasks:
- Restart your phone
- Clear app caches
- Review background apps
- Update apps

### Monthly Tasks:
- Deep clean storage
- Review and uninstall unused apps
- Clear system cache
- Check for system updates
- Backup important data

## When to Consider Hardware Upgrades

Sometimes software optimization isn't enough:

### Signs you need new hardware:
- Phone is more than 4-5 years old
- RAM is consistently maxed out
- Storage is permanently full
- Battery life is severely degraded
- Apps crash frequently despite optimization

### Before buying new:
- Try a factory reset as last resort
- Consider battery replacement
- Evaluate if current phone meets your needs
- Research if newer software updates are available

## Troubleshooting Common Issues

### Phone Still Slow After Optimization?

**Additional steps:**
1. Boot into Safe Mode to identify problematic apps
2. Check for malware using reputable antivirus
3. Consider factory reset (backup first)
4. Contact manufacturer support

### Apps Keep Crashing?

**Solutions:**
- Clear app data (not just cache)
- Uninstall and reinstall problematic apps
- Check for app-specific updates
- Ensure sufficient RAM is available

## Conclusion

Speeding up your Android phone doesn't require root access or technical expertise. By following this comprehensive guide, you can significantly improve your device's performance using built-in tools and simple optimizations.

Remember that consistency is key – regular maintenance prevents many performance issues from developing. Start with the quick wins, then gradually implement more advanced techniques based on your specific needs and comfort level.

Most importantly, be patient with older devices. While these optimizations can provide substantial improvements, they can't completely overcome hardware limitations. However, with proper maintenance, you can extend your phone's useful life and delay the need for an expensive upgrade.

The key is finding the right balance between functionality and performance for your specific usage patterns. Experiment with different settings and techniques to discover what works best for your device and needs.`,
    excerpt: 'Learn how to speed up any Android phone without rooting. This comprehensive 2025 guide covers proven methods from basic optimizations to advanced techniques that work on all Android devices.',
    tags: ['android', 'smartphone', 'performance', 'optimization', 'speed up', 'mobile', 'tutorial', 'tech tips'],
    status: 'published',
    publishedAt: new Date('2025-06-05'),
    featuredImage: {
      url: '/uploads/posts/android-speed-optimization.jpg',
      alt: 'Android phone showing performance optimization settings',
      caption: 'Speed up your Android phone with these proven techniques'
    },
    seo: {
      metaTitle: 'Speed Up Android Phone Without Root - Complete 2025 Guide',
      metaDescription: 'Comprehensive guide to speed up any Android phone without rooting. Learn proven optimization techniques, app management, and system tweaks.',
      metaKeywords: ['Android optimization', 'speed up Android', 'phone performance', 'Android tips', 'mobile optimization']
    },
    views: 3200,
    likes: 245
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Post.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@techblog.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      firstName: 'Tech',
      lastName: 'Admin',
      bio: 'Administrator of the Tech Blog website',
      role: 'admin'
    });

    await adminUser.save();
    console.log('👤 Created admin user');

    // Create categories
    const createdCategories = [];
    for (const categoryData of sampleCategories) {
      const category = new Category(categoryData);
      await category.save();
      createdCategories.push(category);
      console.log(`📁 Created category: ${category.name}`);
    }

    // Create posts
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const post = new Post({
        ...postData,
        author: adminUser._id,
        category: createdCategories[i]._id // Assign each post to a different category
      });
      
      await post.save();
      console.log(`📝 Created post: ${post.title}`);
    }

    // Update category post counts
    for (const category of createdCategories) {
      await category.updatePostCount();
      await category.updateTotalViews();
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users: ${await User.countDocuments()}`);
    console.log(`📁 Categories: ${await Category.countDocuments()}`);
    console.log(`📝 Posts: ${await Post.countDocuments()}`);
    console.log('\n🔐 Admin Credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();

