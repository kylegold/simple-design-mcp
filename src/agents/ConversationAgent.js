import { smartDefaults } from '../utils/smartDefaults.js';

export class ConversationAgent {
  async process(message, currentProject, history) {
    const lowerMessage = message.toLowerCase();
    
    // Starting a new project
    if (!currentProject && this.isProjectStart(message)) {
      const projectInfo = this.extractProjectInfo(message);
      
      return {
        message: `I love it! ${projectInfo.enthusiasm}\n\nLet me ask a few quick questions to make sure I design exactly what you're envisioning:\n\n1. Who's going to use your ${projectInfo.type}?\n2. What's the main thing they'll do with it?\n3. Any apps you love the look of?\n\nJust answer naturally - I'll handle all the technical stuff! 😊`,
        projectUpdate: {
          name: projectInfo.name,
          type: projectInfo.category,
          description: message,
          status: 'gathering_info',
          ...projectInfo.defaults
        }
      };
    }
    
    // Gathering initial info
    if (currentProject?.status === 'gathering_info') {
      const info = this.extractUserInfo(message, history);
      
      if (info.hasEnoughInfo) {
        return {
          message: `Perfect! I've got a great vision for your ${currentProject.type} app.\n\nHere's what I'm thinking:\n${info.designSummary}\n\nShould I start designing with these ideas, or would you like to adjust anything?`,
          projectUpdate: {
            status: 'confirming_design',
            personas: info.personas,
            features: info.features,
            style: info.style
          }
        };
      }
      
      return {
        message: info.followUpQuestion
      };
    }
    
    // Confirming design
    if (currentProject?.status === 'confirming_design') {
      if (this.isAffirmative(message)) {
        return {
          message: `Awesome! I'm designing your ${currentProject.type} now...\n\n✨ Creating:\n- Beautiful ${currentProject.uiLibrary === 'material-ui' ? 'Material Design' : currentProject.uiLibrary === 'tailwind' ? 'Tailwind' : 'modern'} components\n- ${currentProject.features.length} key features\n- Mobile-first responsive layout\n- Accessibility built-in\n\nUse 'show' to see the design anytime, or just tell me what you'd like to add or change!`,
          projectUpdate: {
            status: 'designing',
            components: this.generateInitialComponents(currentProject)
          }
        };
      }
      
      // They want changes
      return {
        message: "No problem! What would you like to change?",
        projectUpdate: { status: 'gathering_info' }
      };
    }
    
    // Adding features or making changes
    if (currentProject?.status === 'designing') {
      const change = this.parseChange(message);
      
      if (change.type === 'add_feature') {
        return {
          message: `Great idea! I've added ${change.feature} to your app. ${change.explanation}\n\nAnything else you'd like to add or change?`,
          projectUpdate: {
            features: [...(currentProject.features || []), change.feature],
            components: [...(currentProject.components || []), ...change.newComponents]
          }
        };
      }
      
      if (change.type === 'style_change') {
        return {
          message: `Love it! I've updated the design to be ${change.description}. The app now has ${change.details}.\n\nHow does that look?`,
          projectUpdate: {
            style: { ...currentProject.style, ...change.styleUpdates }
          }
        };
      }
    }
    
    // Default response
    return {
      message: "I'm not quite sure what you'd like to do. You can:\n- Start a new project: 'I want to build a [type] app'\n- Make changes: 'Add a login page' or 'Make it more colorful'\n- See your design: use 'show'\n- Export your app: use 'export'"
    };
  }
  
  isProjectStart(message) {
    const triggers = ['build', 'create', 'make', 'design', 'want', 'need', 'app', 'website', 'site'];
    return triggers.some(t => message.toLowerCase().includes(t));
  }
  
  async analyzeDescription(description) {
    // This method was referenced but not implemented
    return this.extractProjectInfo(description);
  }
  
  extractProjectInfo(message) {
    // Smart extraction from natural language
    const categories = {
      recipe: ['recipe', 'cooking', 'food', 'meal', 'dish', 'kitchen'],
      fitness: ['fitness', 'workout', 'exercise', 'gym', 'health', 'training'],
      social: ['social', 'chat', 'message', 'friend', 'connect', 'share'],
      productivity: ['todo', 'task', 'organize', 'track', 'manage', 'schedule'],
      learning: ['learn', 'study', 'education', 'course', 'tutorial', 'teach'],
      shopping: ['shop', 'store', 'buy', 'sell', 'marketplace', 'ecommerce'],
      finance: ['budget', 'expense', 'money', 'finance', 'payment', 'invest'],
      travel: ['travel', 'trip', 'vacation', 'booking', 'destination'],
      music: ['music', 'song', 'playlist', 'audio', 'podcast'],
      photo: ['photo', 'picture', 'gallery', 'image', 'camera']
    };
    
    let category = 'general';
    let enthusiasm = "A new app - exciting!";
    
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => message.toLowerCase().includes(k))) {
        category = cat;
        enthusiasm = this.getEnthusiasm(cat);
        break;
      }
    }
    
    const defaults = smartDefaults[category] || smartDefaults.general;
    const name = this.extractAppName(message) || `my-${category}-app`;
    
    return {
      name,
      category,
      type: category,
      enthusiasm,
      defaults
    };
  }
  
  extractAppName(message) {
    // Try to extract app name from patterns like "called X" or "named X"
    const patterns = [
      /called\s+["']?(\w+)["']?/i,
      /named\s+["']?(\w+)["']?/i,
      /name\s+is\s+["']?(\w+)["']?/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[1].toLowerCase().replace(/\s+/g, '-');
    }
    
    return null;
  }
  
  getEnthusiasm(category) {
    const enthusiasms = {
      recipe: "A recipe app - perfect for food lovers!",
      fitness: "A fitness app - let's help people get healthy!",
      social: "A social app - bringing people together!",
      productivity: "A productivity app - let's help people get things done!",
      learning: "A learning app - knowledge is power!",
      shopping: "A shopping app - let's make commerce beautiful!",
      finance: "A finance app - helping people manage money wisely!",
      travel: "A travel app - adventure awaits!",
      music: "A music app - let's make something that rocks!",
      photo: "A photo app - capturing memories beautifully!"
    };
    
    return enthusiasms[category] || "This sounds amazing!";
  }
  
  extractUserInfo(message, history) {
    // Intelligent extraction of user personas and features from conversation
    const info = {
      hasEnoughInfo: false,
      personas: [],
      features: [],
      style: {},
      designSummary: "",
      followUpQuestion: ""
    };
    
    // Look for user descriptions
    if (message.includes('parent') || message.includes('mom') || message.includes('dad')) {
      info.personas.push({ type: 'parent', needs: ['quick', 'simple', 'family-friendly'] });
    }
    if (message.includes('busy') || message.includes('quick') || message.includes('fast')) {
      info.personas.push({ type: 'busy-professional', needs: ['efficient', 'streamlined'] });
    }
    if (message.includes('beginner') || message.includes('easy') || message.includes('simple')) {
      info.personas.push({ type: 'beginner', needs: ['intuitive', 'guided', 'helpful'] });
    }
    
    // Check if we have enough info (simplified check)
    if (history.length >= 3) {
      info.hasEnoughInfo = true;
      info.designSummary = this.generateDesignSummary(info);
    } else {
      info.followUpQuestion = this.getNextQuestion(history.length);
    }
    
    return info;
  }
  
  generateDesignSummary(info) {
    return `• Clean, intuitive interface perfect for ${info.personas[0]?.type || 'everyone'}\n• Key features: ${info.features.join(', ') || 'all the essentials'}\n• Modern design with great UX`;
  }
  
  getNextQuestion(historyLength) {
    const questions = [
      "Great! Who's going to use this app? (like 'busy parents' or 'fitness enthusiasts')",
      "Perfect! What's the main thing they'll want to do with it?",
      "Awesome! Any apps or websites you love the style of? (or just say 'modern and clean')"
    ];
    
    return questions[Math.min(historyLength - 1, questions.length - 1)];
  }
  
  isAffirmative(message) {
    const affirmatives = ['yes', 'yeah', 'sure', 'ok', 'okay', 'sounds good', 'perfect', 'great', 'awesome', 'let\'s do it', 'go ahead', 'start'];
    return affirmatives.some(a => message.toLowerCase().includes(a));
  }
  
  parseChange(message) {
    const lower = message.toLowerCase();
    
    // Feature additions
    if (lower.includes('add') || lower.includes('need') || lower.includes('want')) {
      if (lower.includes('login') || lower.includes('auth')) {
        return {
          type: 'add_feature',
          feature: 'authentication',
          explanation: "Users can now sign up and log in securely.",
          newComponents: ['LoginScreen', 'SignupScreen', 'ProfileScreen']
        };
      }
      if (lower.includes('photo') || lower.includes('image') || lower.includes('picture')) {
        return {
          type: 'add_feature',
          feature: 'photo-upload',
          explanation: "Users can now add and view photos.",
          newComponents: ['PhotoUpload', 'PhotoGallery', 'PhotoViewer']
        };
      }
      if (lower.includes('search')) {
        return {
          type: 'add_feature',
          feature: 'search',
          explanation: "Users can now search through content quickly.",
          newComponents: ['SearchBar', 'SearchResults']
        };
      }
    }
    
    // Style changes
    if (lower.includes('color') || lower.includes('dark') || lower.includes('bright')) {
      if (lower.includes('dark')) {
        return {
          type: 'style_change',
          description: 'darker and more sophisticated',
          details: 'a sleek dark theme with great contrast',
          styleUpdates: { theme: 'dark', primaryColor: '#1a1a1a' }
        };
      }
      if (lower.includes('bright') || lower.includes('colorful')) {
        return {
          type: 'style_change',
          description: 'brighter and more vibrant',
          details: 'energetic colors that pop',
          styleUpdates: { theme: 'bright', primaryColor: '#FF6B6B' }
        };
      }
    }
    
    return { type: 'unknown' };
  }
  
  generateInitialComponents(project) {
    // Generate initial component list based on project type
    const baseComponents = ['App', 'Navigation', 'Home'];
    const typeComponents = {
      recipe: ['RecipeList', 'RecipeCard', 'RecipeDetail', 'AddRecipe', 'Categories'],
      fitness: ['WorkoutList', 'ExerciseCard', 'Timer', 'Progress', 'Stats'],
      social: ['Feed', 'Post', 'Profile', 'Messages', 'Friends'],
      productivity: ['TaskList', 'TaskCard', 'AddTask', 'Calendar', 'Categories'],
      general: ['MainScreen', 'DetailView', 'SettingsScreen']
    };
    
    return [...baseComponents, ...(typeComponents[project.type] || typeComponents.general)];
  }
}