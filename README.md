# Simple Design MCP v2.0

Design beautiful apps without coding - see live HTML preview instantly! 🎨✨

## What's New in v2.0

- **🌐 Live HTML Preview**: See your design in the browser immediately
- **♻️ Auto-refresh**: HTML updates every 3 seconds as you make changes
- **🎨 Visual Components**: Pre-built UI components you can see and customize
- **📱 Responsive Design**: All designs work on mobile and desktop
- **⚡ Instant Updates**: Change colors, add components, modify layouts in real-time
- **⚛️ React Export**: Convert to React when you're happy with the design

## How It Works

1. **Describe Your App**: Tell the AI what you want to build
2. **See It Instantly**: HTML files are created on your machine
3. **Open in Browser**: View your design with auto-refresh
4. **Make Changes**: Update colors, layout, components with simple commands
5. **Export to React**: Convert to production code when ready

## Available Tools

### 🚀 `simple_design_create`
Start designing a new app by describing what you want to build.

**Example:**
```
Use simple_design_create with description "I want to build a recipe sharing app where users can upload photos and organize by cuisine"
```

This creates:
- `recipe-app-1234/index.html` - Your home page
- `recipe-app-1234/browse.html` - Browse recipes page
- `recipe-app-1234/assets/styles/main.css` - Custom styles
- And more pages based on your app type!

### ✏️ `simple_design_update`
Make changes to your current design - update colors, add components, change layouts.

**Examples:**
```
Use simple_design_update with request "make the primary color blue"
Use simple_design_update with request "add a search bar at the top"
Use simple_design_update with request "change the product grid to 4 columns"
```

### 👀 `simple_design_preview`
Get the current status of your design including file locations and features.

**Example:**
```
Use simple_design_preview to see project status
```

### ⚛️ `simple_design_export_react`
Convert your HTML design to a production-ready React app.

**Example:**
```
Use simple_design_export_react with projectName "recipe-app-1234"
```

## Supported App Types

The AI automatically detects your app type and generates appropriate designs:

- **🍳 Recipe Apps**: Recipe grids, search, categories, upload forms
- **💪 Fitness Apps**: Workout tracking, progress charts, exercise library
- **👥 Social Apps**: User profiles, feeds, messaging, notifications
- **🛍️ E-commerce**: Product catalogs, shopping carts, checkout flows
- **✅ Productivity**: Task lists, calendars, project boards
- **📚 And More**: The AI adapts to any app idea!

## Design Features

### Component Library
- Navigation bars & sidebars
- Hero sections with images/videos
- Card layouts & grids
- Forms & search bars
- Image galleries & carousels
- Footers with social links
- Testimonials & reviews
- And many more!

### Smart Defaults
- Mobile-responsive layouts
- Accessibility-friendly HTML
- Modern color schemes
- Professional typography
- Smooth animations
- Cross-browser compatibility

### Live Updates
- Auto-refreshing preview (every 3 seconds)
- See changes instantly
- No build process needed
- Works with any browser

## Example Workflow

1. **Create Your App**
   ```
   /design-app "I want a fitness tracker for gym workouts"
   ```
   
2. **Preview in Browser**
   - Open `fitness-tracker-5678/index.html`
   - See your app design live!

3. **Make Changes**
   ```
   /update-design "add a dark mode toggle"
   /update-design "make the charts bigger"
   /update-design "add social sharing buttons"
   ```

4. **Export When Ready**
   ```
   /export-react fitness-tracker-5678
   ```

## Technical Details

- **No Build Process**: Pure HTML/CSS/JS that works immediately
- **Local Files**: Everything runs on your machine
- **Auto-refresh**: Built-in refresh every 3 seconds
- **Component-based**: Modular design system
- **Framework-agnostic**: Export to React, or keep as HTML

## Requirements

- Commands.com Claude Code integration
- A web browser to preview designs
- That's it! No other dependencies

## Getting Started

1. Install from Commands.com:
   ```
   claude mcp add simple-design
   ```

2. Start designing:
   ```
   /design-app "describe your app idea here"
   ```

3. Open the generated HTML file in your browser

4. Make changes and see them live!

## Support

- **GitHub**: [github.com/kylegold/simple-design-mcp](https://github.com/kylegold/simple-design-mcp)
- **Issues**: Please report bugs on GitHub
- **Updates**: Star the repo for updates!

---

Built with ❤️ for non-technical builders who want to create amazing apps!