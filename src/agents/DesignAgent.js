export class DesignAgent {
  async generatePreview(project) {
    if (!project) {
      return "No project to preview yet!";
    }
    
    const preview = `
📱 ${project.name} - ${this.capitalize(project.type)} App
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 Design System:
• UI Library: ${this.getUILibraryName(project.uiLibrary)}
• Primary Color: ${project.colors?.primary || '#3B82F6'}
• Theme: ${project.style?.theme || 'Light'}
• Typography: ${project.typography?.headingFont || 'Inter'} (headings), ${project.typography?.bodyFont || 'Inter'} (body)

📐 Layout:
• Style: ${this.capitalize(project.layout || 'standard')}
• Navigation: ${this.getNavigationName(project.components?.navigation)}
• Responsive: Mobile-first design

✨ Features (${project.features?.length || 0}):
${this.formatFeatures(project.features)}

📱 Screens (${project.components?.length || 0}):
${this.formatComponents(project.components)}

👥 Target Users:
${this.formatPersonas(project.personas)}

💡 Design Principles:
${this.getDesignPrinciples(project)}

Ready to export? Just use the 'export' command!
`;
    
    return preview;
  }
  
  async getExamples(type) {
    const examples = {
      recipe: `
🍳 Recipe App Examples:

1. **Tasty** Style
   - Big, beautiful food photos
   - Playful animations
   - Step-by-step video guides
   - Social sharing features

2. **Minimalist Cookbook**
   - Clean white space
   - Elegant typography  
   - Focus on recipes, not clutter
   - Simple ingredient lists

3. **Family Recipes**
   - Warm, homey feeling
   - Recipe cards with stories
   - Easy sharing with family
   - Traditional design elements

Which style appeals to you? Or describe your own vision!
`,
      fitness: `
💪 Fitness App Examples:

1. **Nike Training** Style
   - Bold, energetic design
   - Dark theme with neon accents
   - Motion and progress animations
   - Achievement celebrations

2. **Calm Wellness**
   - Soft, peaceful colors
   - Mindful design approach
   - Clean progress tracking
   - Holistic health focus

3. **Hardcore Gym**
   - Industrial design
   - High contrast
   - Data-driven dashboards
   - Performance metrics

Which vibe matches your fitness app?
`,
      social: `
💬 Social App Examples:

1. **Instagram** Style
   - Visual-first design
   - Stories and reels
   - Clean, image-focused
   - Minimal text

2. **Discord** Style
   - Community-focused
   - Dark theme
   - Organized channels
   - Real-time chat

3. **LinkedIn** Style
   - Professional look
   - Content + networking
   - Clean business aesthetic
   - Profile-centric

What kind of social experience are you creating?
`,
      general: `
📱 Popular App Design Styles:

1. **Modern Minimal**
   - Clean lines
   - Lots of white space
   - Focus on content
   - Simple navigation

2. **Playful & Fun**
   - Bright colors
   - Rounded corners
   - Friendly illustrations
   - Smooth animations

3. **Professional**
   - Conservative colors
   - Clear hierarchy
   - Data-focused
   - Efficient layouts

4. **Artistic**
   - Unique layouts
   - Creative typography
   - Bold color choices
   - Memorable design

Which style resonates with your vision?
`
    };
    
    return examples[type] || examples.general;
  }
  
  // Helper methods
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }
  
  getUILibraryName(lib) {
    const names = {
      'material-ui': 'Material Design (Google)',
      'tailwind': 'Tailwind CSS (Modern Utility)',
      'shadcn': 'shadcn/ui (Radix + Tailwind)',
      'bootstrap': 'Bootstrap (Classic)',
      'ant-design': 'Ant Design (Enterprise)'
    };
    return names[lib] || lib;
  }
  
  getNavigationName(nav) {
    const names = {
      'bottom-tabs': 'Bottom Tab Bar (Mobile-style)',
      'sidebar': 'Side Navigation (Desktop-style)',
      'top-bar': 'Top Navigation Bar',
      'bottom-player': 'Bottom Bar with Player',
      'sticky-header': 'Sticky Header Navigation'
    };
    return names[nav] || nav;
  }
  
  formatFeatures(features) {
    if (!features || features.length === 0) {
      return '  (No features added yet - tell me what you need!)';
    }
    return features.map(f => `  • ${this.capitalize(f)}`).join('\n');
  }
  
  formatComponents(components) {
    if (!components || !Array.isArray(components) || components.length === 0) {
      return '  (No screens designed yet)';
    }
    
    const componentDescriptions = {
      'Home': '🏠 Home Screen - Main landing page',
      'LoginScreen': '🔐 Login - Secure authentication',
      'SignupScreen': '📝 Sign Up - New user registration',
      'ProfileScreen': '👤 Profile - User account page',
      'RecipeList': '📖 Recipe List - Browse all recipes',
      'RecipeCard': '🍽️ Recipe Card - Beautiful recipe preview',
      'RecipeDetail': '👨‍🍳 Recipe Detail - Full recipe view',
      'WorkoutList': '💪 Workout List - All workouts',
      'Timer': '⏱️ Timer - Exercise timer',
      'Feed': '📰 Feed - Social updates',
      'TaskList': '✅ Task List - All your tasks',
      'PhotoGallery': '🖼️ Gallery - Photo collection'
    };
    
    return components.map(c => {
      const desc = componentDescriptions[c] || `📄 ${c}`;
      return `  ${desc}`;
    }).join('\n');
  }
  
  formatPersonas(personas) {
    if (!personas || personas.length === 0) {
      return '  • General users\n  • All skill levels';
    }
    return personas.map(p => `  • ${this.capitalize(p.type)} - Needs: ${p.needs.join(', ')}`).join('\n');
  }
  
  getDesignPrinciples(project) {
    const principles = [];
    
    if (project.personas?.some(p => p.needs.includes('simple'))) {
      principles.push('• Simplicity first - no confusing features');
    }
    if (project.personas?.some(p => p.needs.includes('efficient'))) {
      principles.push('• Speed matters - quick actions, fast load times');
    }
    if (project.type === 'social') {
      principles.push('• Community-focused - easy sharing and connecting');
    }
    if (project.type === 'fitness') {
      principles.push('• Motivational - celebrate progress and achievements');
    }
    
    principles.push('• Accessibility - usable by everyone');
    principles.push('• Mobile-first - perfect on phones');
    
    return principles.join('\n');
  }
}