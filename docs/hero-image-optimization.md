# Hero Image Optimization Guide

## 📋 Overview

This guide explains how to optimize hero images for restaurants to ensure they display with high quality and proper performance.

## 🎯 Problem Solved

- **Pixelated Images**: Hero images were appearing blurry and low quality
- **Poor Performance**: Large images were loading slowly
- **Inconsistent Quality**: Different image formats and sizes caused varying results

## 🔧 Solutions Implemented

### 1. Optimized Image Components

#### `HeroImageOptimized` Component
- **High Quality**: 90% quality setting for hero images
- **WebP Format**: Modern format for better compression and quality
- **Responsive Sizing**: 1920x1080 for large screens
- **Fallback Handling**: Graceful error handling with placeholder images

#### `RestaurantLogoOptimized` Component
- **95% Quality**: Maximum quality for logos
- **Square Format**: Ensures consistent logo display
- **Proper Sizing**: Configurable size with optimal dimensions

### 2. Database Optimization

#### SQL Functions
```sql
-- Optimize hero image URLs
optimize_hero_image_url(image_url, width, height)

-- Optimize logo URLs  
optimize_logo_url(image_url, size)

-- Generate responsive URLs
generate_responsive_image_urls(image_url)
```

#### Database Views
- `restaurants_with_optimized_images`: Restaurants with optimized image URLs
- `restaurants_with_responsive_images`: Restaurants with responsive image URLs
- `image_quality_stats`: Statistics on image optimization

### 3. Upload Optimization

#### Enhanced Image Processing
- **Hero Images**: 1920px max width, 90% quality
- **Logos**: 512px max width, 95% quality, square format
- **Smart Resizing**: Maintains aspect ratio while optimizing

#### Quality Settings by Type
```typescript
// Hero Images
targetWidth = Math.max(1920, maxWidth)
targetQuality = 0.9

// Logos  
targetWidth = Math.min(512, Math.max(width, height))
targetQuality = 0.95
```

## 🚀 Usage

### Frontend Components

#### Hero Image
```tsx
import { RestaurantHeroImage } from "@/components/ui/hero-image-optimized"

<RestaurantHeroImage
  src={restaurant.cover_image_url}
  alt={restaurant.name}
  className="absolute inset-0"
/>
```

#### Logo
```tsx
import { RestaurantLogoOptimized } from "@/components/ui/hero-image-optimized"

<RestaurantLogoOptimized
  src={restaurant.logo_url}
  alt={restaurant.name}
  size={120}
/>
```

### Custom Hooks

#### Hero Image Optimization
```tsx
import { useHeroImageOptimization } from "@/hooks/use-hero-image-optimization"

const { optimizedSrc, responsiveSrcs, isLoading } = useHeroImageOptimization({
  src: restaurant.cover_image_url,
  alt: restaurant.name,
  quality: 90,
  format: 'webp'
})
```

#### Logo Optimization
```tsx
import { useLogoOptimization } from "@/hooks/use-hero-image-optimization"

const { optimizedSrc, isLoading } = useLogoOptimization({
  src: restaurant.logo_url,
  alt: restaurant.name,
  size: 120
})
```

## 📊 Image Quality Standards

### Hero Images
- **Minimum Resolution**: 1920x1080
- **Quality**: 90%
- **Format**: WebP (with JPEG fallback)
- **File Size**: < 2MB recommended
- **Aspect Ratio**: 16:9 or similar

### Logos
- **Minimum Resolution**: 512x512
- **Quality**: 95%
- **Format**: WebP (with PNG fallback)
- **File Size**: < 500KB recommended
- **Aspect Ratio**: 1:1 (square)

## 🔍 Quality Validation

### Database Functions
```sql
-- Check image quality status
SELECT validate_image_quality(cover_image_url) FROM restaurants;

-- Get optimization statistics
SELECT * FROM image_quality_stats;
```

### Frontend Validation
```tsx
import { useImageQualityValidation } from "@/hooks/use-hero-image-optimization"

const quality = useImageQualityValidation(imageUrl)
// Returns: 'high' | 'medium' | 'low' | 'unknown'
```

## 🛠️ Installation

### 1. Database Setup
Execute the optimization script:
```sql
-- Run in Supabase SQL Editor
\i scripts/234-optimize-hero-images.sql
```

### 2. Component Integration
Replace existing image components with optimized versions:
```tsx
// Before
<Image src={coverImage} alt="Hero" fill />

// After  
<RestaurantHeroImage src={coverImage} alt="Hero" />
```

### 3. Upload Configuration
Update image upload functions to use enhanced optimization:
```typescript
// Hero images
const result = await uploadImage(file, restaurantId, 'hero-images')

// Logos
const result = await uploadImage(file, restaurantId, 'logos')
```

## 📈 Performance Benefits

### Before Optimization
- **Quality**: 70-80%
- **Format**: JPEG only
- **Size**: Variable, often too large
- **Loading**: Slow, no optimization

### After Optimization
- **Quality**: 90-95%
- **Format**: WebP with fallbacks
- **Size**: Optimized for each use case
- **Loading**: Fast with progressive loading

## 🔧 Troubleshooting

### Common Issues

1. **Images Still Pixelated**
   - Check if images are being uploaded to correct folders
   - Verify database functions are installed
   - Ensure components are using optimized versions

2. **Slow Loading**
   - Check image file sizes before upload
   - Verify WebP format is being used
   - Review network tab for optimization parameters

3. **Quality Issues**
   - Ensure source images are high resolution
   - Check upload quality settings
   - Verify database optimization functions

### Debug Steps

1. **Check Image URLs**
   ```sql
   SELECT 
     name,
     cover_image_url,
     optimize_hero_image_url(cover_image_url) as optimized_url
   FROM restaurants 
   WHERE id = 'your-restaurant-id';
   ```

2. **Validate Quality**
   ```sql
   SELECT validate_image_quality(cover_image_url) 
   FROM restaurants 
   WHERE id = 'your-restaurant-id';
   ```

3. **Check Upload Settings**
   - Verify folder structure: `hero-images/` and `logos/`
   - Check file size limits in Supabase storage
   - Review optimization parameters

## 📋 Best Practices

### Image Preparation
1. **Use High Resolution**: Start with images at least 1920x1080
2. **Optimize Before Upload**: Compress images to reasonable file sizes
3. **Choose Right Format**: Use JPEG for photos, PNG for logos with transparency
4. **Maintain Aspect Ratio**: Don't stretch images unnaturally

### Upload Process
1. **Use Correct Folders**: `hero-images/` for hero images, `logos/` for logos
2. **Test Quality**: Preview images after upload
3. **Monitor File Sizes**: Keep hero images under 2MB, logos under 500KB
4. **Verify Optimization**: Check that URLs include optimization parameters

### Maintenance
1. **Regular Quality Checks**: Use database views to monitor image quality
2. **Clean Up Old Images**: Remove unused images to save storage
3. **Update Components**: Keep using latest optimized components
4. **Monitor Performance**: Track loading times and user feedback

## 🎯 Results

With these optimizations, hero images should now display:
- **Crystal Clear**: High quality without pixelation
- **Fast Loading**: Optimized for performance
- **Responsive**: Proper sizing across all devices
- **Consistent**: Uniform quality across all restaurants

The system now provides professional-quality hero images that enhance the restaurant's visual appeal and user experience.
