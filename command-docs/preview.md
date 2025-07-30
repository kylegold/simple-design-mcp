# /preview-design Command

See a detailed preview of your app design.

## What You'll See

- 🎨 **Design System**: UI library, colors, typography
- 📐 **Layout**: Navigation style, responsive approach
- ✨ **Features**: All planned functionality
- 📱 **Screens**: List of components and pages
- 👥 **Target Users**: Who the app is designed for
- 💡 **Design Principles**: Key UX decisions

## Usage

### Basic Preview
```
/preview-design
```

### Continue Previous Session
```
/preview-design --conversation_id "your-session-id"
```

## Example Output

```
📱 my-recipe-app - Recipe App
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 Design System:
• UI Library: Material Design (Google)
• Primary Color: #FF6B6B
• Theme: Light
• Typography: Playfair Display (headings), Open Sans (body)

📐 Layout:
• Style: Card-grid
• Navigation: Bottom Tab Bar (Mobile-style)
• Responsive: Mobile-first design

✨ Features (5):
• Search
• Favorites
• Categories
• Photo Upload
• Ratings

📱 Screens (8):
🏠 Home Screen - Main landing page
📖 Recipe List - Browse all recipes
🍽️ Recipe Card - Beautiful recipe preview
...
```