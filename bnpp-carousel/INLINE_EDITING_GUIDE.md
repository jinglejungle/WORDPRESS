# BNPP Carousel Block - Version 3.0 Updates

## Inline Editing Features

### 1. **Editable Elements in Preview**
All text elements can now be edited directly in the carousel preview by double-clicking:

#### Title (70 Character Maximum)
- **Location**: Inside description box heading
- **How to Edit**: Double-click the title in the preview
- **Character Limit**: 70 characters maximum
- **Feedback**: 
  - Counter shows "X / 70 characters" in inspector panel
  - When limit reached, typing is blocked
  - Alert message if pasted text exceeds limit
  - Text is automatically truncated to 70 chars

#### Description (100 Character Maximum)
- **Location**: Inside description box body text
- **How to Edit**: Double-click the description in the preview
- **Character Limit**: 100 characters maximum
- **Feedback**:
  - Counter shows "X / 100 characters" in inspector panel
  - When limit reached, typing is blocked
  - Alert message if pasted text exceeds limit
  - Text is automatically truncated to 100 chars

#### Button Text
- **Location**: The button link inside the slide
- **How to Edit**: Double-click the button text in the preview
- **No Character Limit**: Free text input
- **Auto Sync**: Changes sync with inspector panel

### 2. **Inspector Panel Editing**
All elements can also be edited via the right-side inspector panel:

#### Title Field
```
Title (Max 70 characters)
[____________] 45 / 70 characters
```
- Real-time character counter
- Paste detection: truncates and alerts if exceeds 70 chars
- Keyboard input blocked after 70 characters

#### Description Field
```
Description (Max 100 characters)
[______________] 87 / 100 characters
[            ] Text area input
```
- Real-time character counter
- Paste detection: truncates and alerts if exceeds 100 chars
- Keyboard input blocked after 100 characters

### 3. **Character Limit Behavior**

#### Typing
- When you reach the character limit, further typing is blocked
- A visual indicator shows the counter (e.g., "70 / 70")

#### Copy/Paste
- If pasted text exceeds the limit:
  1. An alert dialog appears: "Pasted text exceeded X character limit and has been truncated."
  2. The text is automatically truncated to the maximum
  3. The field displays the truncated version

Example:
```javascript
// User pastes 150 characters into 100-char description field
Alert: "Pasted text exceeded 100 character limit and has been truncated."
// Field now contains: first 100 characters only
```

### 4. **Title Indicator Styling**
The title blocks at the bottom of the carousel now use **left border** for active/hover states instead of bottom border:

#### Inactive State
```
┌─────────────┐
│             │
│  Slide 1    │  Background: #ececec
│             │  Border-left: 1px #ddd
└─────────────┘
```

#### Hover State
```
┌═════════════┐
│█            │
│  Slide 1    │  Background: #ddd
│             │  Border-left: 4px solid #0066cc
└─────────────┘  Padding adjusted for alignment
```

#### Active State
```
┌═════════════┐
│█            │
│  Slide 1    │  Background: #ffffff
│             │  Border-left: 4px solid #0066cc
└─────────────┘  Font-weight: 700
                 Color: #0066cc
```

The left border is **4px wide** when active/hover, with padding adjusted from 20px to 16px to maintain visual alignment.

## Implementation Details

### contentEditable API
Inline editing uses the `contentEditable` attribute:

```javascript
// When user double-clicks an element:
element.contentEditable = 'true';
element.focus();

// Apply character limit on input:
element.addEventListener('input', function() {
    if (this.textContent.length > limit) {
        this.textContent = this.textContent.substring(0, limit);
    }
});

// Save on blur or Enter key:
element.addEventListener('blur', function() {
    element.contentEditable = 'false';
    updateSlide(slideIndex, fieldName, this.textContent);
});
```

### No RichText
- Not using WordPress RichText component
- Uses plain `contentEditable` for simplicity
- Prevents formatting issues with character counting
- Ensures character limit blocking works reliably

### Sync Between Editor & Inspector
- Edits in preview sync to inspector panel in real-time
- Edits in inspector panel sync to preview immediately
- Character counters update on every keystroke
- No data loss between editing modes

## User Experience Flow

### Scenario 1: Title Editing via Preview
1. User double-clicks title in carousel preview
2. Title becomes editable (contentEditable = true)
3. User types or pastes text
4. If paste exceeds 70 chars: alert + truncation
5. If typing reaches 70 chars: further typing blocked
6. User presses Enter or clicks elsewhere to save
7. Title updates in both preview and inspector panel

### Scenario 2: Description via Inspector
1. User types in Description textarea in inspector panel
2. Character counter shows real-time count
3. At 100 chars, field becomes read-only (input blocked)
4. If paste exceeds 100: alert + truncation
5. Changes sync to preview immediately
6. User sees preview update as they type

### Scenario 3: Hovering Title Indicators
1. User hovers over a title indicator at bottom
2. Left border becomes 4px solid blue
3. Background color lightens to #ddd
4. Padding-left reduces to 16px (border takes 4px)
5. Click to select that slide

## CSS Classes Updated

```css
.bnpp-carousel-title-item              /* Base style */
.bnpp-carousel-title-item:hover        /* Left border highlight */
.bnpp-carousel-title-item.active       /* Active state highlight */
```

## Attributes Stored

```javascript
{
  slides: [
    {
      title: "Maximum 70 chars",
      description: "Maximum 100 chars here",
      buttonText: "Editable button",
      // ... other fields
    }
  ],
  autoPlayDuration: 4
}
```

## Validation Rules

| Field | Min | Max | Paste Behavior | Typing Behavior |
|-------|-----|-----|----------------|-----------------|
| Title | 0 | 70 | Alert + truncate | Block input |
| Description | 0 | 100 | Alert + truncate | Block input |
| Button Text | 0 | ∞ | Allow | Allow |

## Frontend Notes

The frontend carousel maintains:
- All styling for 70/100 char limits
- Inline editing functionality NOT available (read-only on frontend)
- Full accessibility support
- Responsive design
- Character limits enforced at display time (PHP/render)

## Troubleshooting

### Issue: Double-click doesn't activate edit mode
**Solution**: Make sure you're double-clicking directly on the text, not the container

### Issue: Character counter not updating
**Solution**: Edits in inspector panel show counter; edits in preview appear after save

### Issue: Pasted text doesn't show alert
**Solution**: Alert only appears if pasted text exceeds the character limit

### Issue: Left border not showing
**Solution**: Check CSS is loaded - border-left should be 4px solid #0066cc on hover/active states
