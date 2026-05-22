# WordPress Block with Custom Popup

## 📋 Description

Custom WordPress block with 5 links and the ability to set a custom popup (title + optional description) activable by switch for each link.

## 📁 Files

- **block.json** - Block configuration and attributes
- **edit.js** - Edit component with 5 switches and configuration fields
- **render.php** - Front-end rendering with `exit-data-popup-*` attributes
- **index.js** - Block entry point
- **popup-handler.js** - Global function to manage popups
- **style.css** - Block styles for the front-end
- **editor.css** - Styles for WordPress editor

## 🚀 Installation

1. Place the files in your WordPress block folder
2. The block should be registered in WordPress (see `register_block_type`)

## 🎯 Usage

### 1. Configuration in the editor

- Enter a **popup title** (optional)
- Enter a **popup description** (optional)
- For each link, enable/disable the "Enable custom popup" switch
- Configure the text and URL for each link

### 2. Integrate the global script

Include `popup-handler.js` on your page:

```html
<script src="/path/to/popup-handler.js"></script>
```

Or register it with WordPress:

```php
wp_enqueue_script('popup-handler', get_template_directory_uri() . '/js/popup-handler.js', [], '1.0', true);
```

### 3. Global configuration (optional)

Before including `popup-handler.js`, you can set default parameters:

```javascript
window.globalPopupConfig = {
  title: 'Leave the site',
  description: 'You will be redirected to an external site.'
};
```

## 🔧 How it works

### Rendered HTML structure

```html
<div class="mon-composant" 
     exit-data-popup-title="My custom title"
     exit-data-popup-description="My custom description">
  
  <a href="https://example.com" 
     class="mon-lien"
     data-exit-popup="true">Link 1</a>
  
  <!-- ... other links ... -->
</div>
```

### Logic

1. **Click on a link** → Check if it's an external link
2. **If external link**:
   - Check the `data-exit-popup` switch
   - **If ON** → Use the component's title/description
   - **If OFF** → Use global settings
3. **Display the popup** with appropriate parameters

## 📝 Block attributes

```json
{
  "popupTitle": "string - Custom popup title",
  "popupDescription": "string - Custom popup description",
  "titleWasTruncated": "boolean - Title was truncated flag",
  "descriptionWasTruncated": "boolean - Description was truncated flag",
  "links": [
    {
      "id": "number - Unique link ID",
      "url": "string - Link URL",
      "text": "string - Displayed text",
      "useCustomPopup": "boolean - Enable custom popup for this link"
    }
  ]
}
```

## 📋 Character Limits

- **Title**: Maximum 100 characters
- **Description**: Maximum 650 characters

When pasting text that exceeds these limits:
- The text is automatically truncated
- A warning message appears: "⚠️ Text truncated"
- Character count displays: "X / 100 characters"

## 🎨 Customization

### Modify the `showPopup()` function

In `popup-handler.js`, replace the `showPopup()` function to integrate your existing popup logic:

```javascript
function showPopup(title, description, url) {
  // Your custom logic here
  // Examples:
  // - Bootstrap Modal
  // - Native Dialog
  // - Sweet Alert
  // - Lightbox
  // etc.
}
```

### Modify styles

- **Front-end**: Modify `style.css`
- **Editor**: Modify `editor.css`

## 📦 exit-data-popup attributes

- `exit-data-popup-title` - Custom popup title
- `exit-data-popup-description` - Custom popup description
- `data-exit-popup` - Boolean to enable/disable custom popup

## ⚙️ Block registration

```php
register_block_type(__DIR__ . '/block.json');
```

Or manually:

```php
register_block_type('mon-namespace/mon-bloc', [
    'render_callback' => function($attributes) {
        ob_start();
        include plugin_dir_path(__FILE__) . 'render.php';
        return ob_get_clean();
    }
]);
```

## 🐛 Troubleshooting

### Switches don't display
- Verify that `block.json` is properly formatted
- Verify that `edit.js` is properly imported

### Popups don't display
- Verify that `popup-handler.js` is loaded
- Open the console (F12) and check for errors
- Verify that `exit-data-*` attributes are present in the HTML

### External links not recognized
- Check the domain in the `isExternalLink()` function
- Verify configured URLs

## 📞 Support

For any questions, consult the official WordPress documentation on custom blocks.
