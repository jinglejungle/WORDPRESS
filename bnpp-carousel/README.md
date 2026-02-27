# BNPP Carousel HomepagGZ Block

A custom WordPress Gutenberg carousel block designed for WordPress 6.9.1 and above, featuring a responsive carousel with up to 3 slides.

## Features

- **Responsive Design**: Supports multiple screen sizes from mobile to desktop
- **3 Slide Maximum**: Built-in support for up to 3 carousel slides
- **Image Upload**: Background image support for each slide
- **Customizable Content**: Title, description, and button text for each slide
- **Button Styling**: 4 button style options (Primary, Secondary, Tertiary, Ghost)
- **Link Management**: URL input with option to open in new tab
- **Title Indicators**: Fixed title display at the bottom of the carousel
- **Accessibility**: Full keyboard navigation and screen reader support
- **Pure JavaScript**: No React dependency - vanilla JavaScript implementation

## Installation

1. Navigate to your WordPress plugins directory:
   ```
   wp-content/plugins/
   ```

2. Upload the `bnpp-carousel-homepaGZ` folder

3. Activate the plugin from the WordPress admin dashboard

## File Structure

```
bnpp-carousel-homepaGZ/
├── block.php              # Main plugin file
├── src/
│   └── init.php          # Block registration and initialization
└── assets/
    ├── block.js          # Editor and frontend JavaScript
    └── block.css         # Styling for editor and frontend
```

## Usage

### In the Block Editor

1. Open the block editor in WordPress
2. Search for "BNPP Carousel Homepage"
3. Add the block to your content
4. Configure each of the 3 slides using the inspector panel on the right:
   - **Slide Title**: Main heading for the slide
   - **Description**: Descriptive text (displayed over the background image)
   - **Background Image**: Upload an image (recommended: 1920x640px)
   - **Button Settings**:
     - Button Link URL (optional)
     - Button Text (displays placeholder if empty)
     - Button Style (Primary, Secondary, Tertiary, or Ghost)
     - Open in New Tab toggle

### Slide Display

- **Dimensions**: 1920px wide × 640px tall
- **Description Box**: 689px wide × 285px tall, positioned at (40px, 280px)
- **Button**: Positioned below the description box
- **Title Indicators**: Fixed at bottom, spanning the carousel width with 286px left margin

### Button Behavior

- Buttons only display if both URL and text are provided
- Default button text "Button content..." acts as a placeholder
- 4 style options with different color schemes
- Can open links in the same or new tab

## Editor Interface

The right panel includes:

1. **Slide Selector**: Quick buttons to switch between slides
2. **Slide Settings**: Input fields for:
   - Title
   - Description
   - Background image upload/removal
3. **Button Settings**: Configure the call-to-action button

## Frontend Functionality

- **Navigation**: Click title indicators at the bottom to navigate
- **Keyboard Support**: Use Arrow Left/Right keys for navigation
- **Accessibility**: Full ARIA labels and semantic HTML
- **Auto-rotation**: Optional (commented out by default)

To enable auto-rotation, uncomment the interval code in `assets/block.js` (around line 500).

## CSS Classes

### Main Container
- `.bnpp-carousel-wrapper` - Outer wrapper
- `.bnpp-carousel-container` - Main carousel container

### Slide Elements
- `.diapositive` - Individual slide container
- `.diapositive.active` - Currently visible slide
- `.diapositive-description` - Text content box

### Buttons
- `.bnpp-button` - Base button class
- `.bnpp-button.primary` - Primary style
- `.bnpp-button.secondary` - Secondary style
- `.bnpp-button.tertiary` - Tertiary style
- `.bnpp-button.ghost` - Ghost style

### Title Indicators
- `.bnpp-carousel-titles` - Title container
- `.bnpp-carousel-title-item` - Individual title item
- `.bnpp-carousel-title-item.active` - Active title

## Styling

The block uses a mobile-first responsive design with breakpoints for:
- Desktop (default)
- Tablet (max-width: 768px)
- Mobile (max-width: 480px)

All colors can be customized in `assets/block.css`.

### Color Scheme (Default)

- **Primary Blue**: #0066cc
- **Text**: #333
- **Background**: #f5f5f5
- **Borders**: #ddd

## Accessibility Features

- Full ARIA labels on all interactive elements
- Keyboard navigation support (Arrow keys)
- Screen reader announcements for slide changes
- Proper semantic HTML structure
- Focus management for interactive elements

## Attributes

The block stores the following attributes:

```javascript
{
  slides: [
    {
      id: 0,
      title: string,
      description: string,
      imageId: integer,
      imageUrl: string,
      buttonUrl: string,
      buttonText: string,
      buttonStyle: 'primary' | 'secondary' | 'tertiary' | 'ghost',
      buttonTarget: boolean
    },
    // ... up to 3 slides
  ],
  activeSlide: integer (editor only)
}
```

## JavaScript API

The carousel instance is accessible via the wrapper element's data attribute:

```javascript
const wrapper = document.querySelector('.bnpp-carousel-wrapper');
const carousel = wrapper.dataset.carouselInstance;

carousel.nextSlide();
carousel.prevSlide();
carousel.goToSlide(index);
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- IE 11: Limited support (basic carousel functionality, no modern CSS)

## Requirements

- WordPress 6.0+
- PHP 7.4+
- Modern browser with ES6 JavaScript support

## Settings & Customization

### Image Dimensions
For best results, use images with the same dimensions:
- Recommended: 1920px × 640px
- The CSS will scale to fit containers

### Button Positioning
Button appears directly below the description box. Adjust in CSS:
```css
.bnpp-button {
  top: 585px;  /* Adjust vertical position */
  left: 40px;  /* Adjust horizontal position */
}
```

### Description Box Positioning
Modify in CSS:
```css
.diapositive-description {
  top: 280px;    /* Vertical position */
  left: 40px;    /* Horizontal position */
  width: 689px;  /* Width */
  max-height: 285px; /* Height */
}
```

## Troubleshooting

### Images not showing
- Ensure images are properly uploaded in the media library
- Check for CORS issues if using external sources
- Verify image URLs in the browser console

### Button not displaying
- Ensure both URL and button text are provided
- Button text must not be the default "Button content..."
- Check browser console for JavaScript errors

### Carousel not initializing
- Verify all JavaScript files are loaded
- Check WordPress debug log for PHP errors
- Ensure block is properly registered

## Performance

- Lightweight: ~50KB total (JS + CSS combined)
- No external dependencies
- No jQuery required
- Optimized animations with CSS transitions

## Support

For issues or feature requests, please refer to the WordPress plugin documentation.

## License

GPL-2.0+ (Compatible with WordPress)

## Changelog

### Version 1.0.0
- Initial release
- 3-slide carousel with full customization
- Responsive design
- Accessibility features
- Button styling options
