# BNPP Carousel Homepage Block

An accessible Gutenberg block for WordPress 6.9.1+ that provides an easy-to-use carousel with advanced editing capabilities.

## Features

- ✅ **Gutenberg Block** - Native WordPress block editor integration
- ✅ **Advanced Editing** - Edit directly from the block sidebar:
  - Slide title, description, and link
  - Button text, URL, and style (primary, secondary, tertiary, ghost)
  - Configurable duration between slides (default: 4 seconds)
- ✅ **Accessibility** - WCAG 2.1 compliant with:
  - Full keyboard navigation (arrow keys)
  - Screen reader support
  - Pause/Play button
  - Live region announcements
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Server-Side Rendering** - Better SEO performance
- ✅ **No External Dependencies** - Pure JavaScript, no jQuery

## Installation

### 1. Download the Plugin

Extract the `bnpp-carousel-homepage` folder to:
```
/wp-content/plugins/
```

### 2. Activate the Plugin

- Go to WordPress Admin > Plugins
- Find **BNPP Carousel Homepage**
- Click **Activate**

### 3. Use the Block

In the page/post editor:
1. Click the **+** button to add a block
2. Search for **"Carousel Homepage"** or **"carousel"**
3. The block name to search is: **Carousel Homepage**
4. Click to add the block

## Block Search Name

**Search for: "Carousel Homepage"**

The block will appear as:
- **Carousel Homepage** (English)
- Category: Media
- Icon: Slides

## Configuration in the Editor

### Global Carousel Settings

In the right sidebar panel:
- **Duration between slides**: Set delay in seconds (default: 4s, min: 1, max: 60)

### Per-Slide Settings

For each slide, edit:
- **Title**: Main heading
- **Description**: Additional text
- **Button Text**: CTA button label
- **URL**: Button destination
- **Button Style**: Choose one of 4 styles:
  - 🔵 **Primary** (blue) - Main CTA
  - ⚫ **Secondary** (gray) - Secondary CTA
  - ⭕ **Tertiary** (transparent) - Subtle button
  - 👻 **Ghost** (text only) - Minimal style

### Actions

- **Delete Slide**: Click "Delete" (minimum 1 slide required)
- **Add Slide**: Click "+ Add Slide" at the bottom

## Frontend Interaction

### User Navigation

- **Buttons**: Click navigation buttons at the bottom
- **Keyboard**: Use arrow keys to navigate
- **Pause/Play**: Click button in top-right to pause autoplay
- **Hover**: Carousel pauses on hover, resumes on leave

### Accessibility

- **Keyboard Navigation**: Full support for arrow keys and Tab
- **Screen Readers**: Announces current slide
- **Focus**: Visible focus indicators on all elements
- **ARIA**: Proper ARIA labels and roles

## Customization

### Change Button Colors

Edit `/assets/block.css`:

```css
/* Primary button */
.bnpp-btn-primary {
    background-color: #007bff; /* Change color */
}

/* Secondary button */
.bnpp-btn-secondary {
    background-color: #6c757d;
}
```

### Change Carousel Height

Edit `/assets/block.css`:

```css
.bnpp-slide {
    height: 75vh; /* Change to 100vh for full height */
}
```

### Change Default Duration

Edit `/src/init.php`:

```php
'autoplaySpeed' => array(
    'type'    => 'number',
    'default' => 4, /* Change this value (in seconds) */
),
```

## Security

- All user input is sanitized with `sanitize_text_field()` and `esc_url()`
- Server-side rendering prevents XSS attacks
- WordPress security best practices followed
- Compatible with security plugins

## Compatibility

- **WordPress**: 6.9.1+
- **PHP**: 7.4+
- **Browsers**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS 14+, Android Chrome

## File Structure

```
bnpp-carousel-homepage/
├── block.php              # Plugin entry point
├── src/
│   └── init.php           # Block registration & rendering
├── assets/
│   ├── block.css          # Styles
│   └── block.js           # Editor + Frontend scripts
└── README.md              # This file
```

## Troubleshooting

### Block doesn't appear in editor

1. Make sure WordPress 6.9.1+ is installed
2. Check that PHP 7.4+ is being used
3. Open browser console (F12) for JavaScript errors
4. Clear browser cache and reload
5. Try a different browser

### Styles not applying

1. Clear WordPress cache if using a cache plugin
2. Clear browser cache (Ctrl+Shift+Del)
3. Verify `/assets/block.css` is loaded in DevTools
4. Check for CSS conflicts from other plugins

### Block not interactive

1. Check browser console for errors
2. Verify JavaScript is enabled
3. Check `/assets/block.js` is loaded
4. Disable other plugins to check for conflicts

## License

GPL v2 or later

## Support

For detailed documentation and examples, check the included documentation files.

---

**Version**: 1.0.0  
**Author**: BNPP  
**Last Updated**: 2024
