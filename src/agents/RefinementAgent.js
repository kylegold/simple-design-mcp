/**
 * RefinementAgent - Handles user feedback and updates designs
 */
export class RefinementAgent {
  constructor() {
    this.name = 'RefinementAgent';
  }

  /**
   * Process user refinement request
   */
  async processRefinement(userRequest, currentState, projectName) {
    // Analyze the type of refinement requested
    const refinementType = this.analyzeRefinementType(userRequest);
    
    // Generate appropriate file operations
    const fileOperations = [];
    
    switch (refinementType.category) {
      case 'style':
        fileOperations.push(...this.handleStyleChange(refinementType, projectName));
        break;
        
      case 'layout':
        fileOperations.push(...this.handleLayoutChange(refinementType, projectName, currentState));
        break;
        
      case 'content':
        fileOperations.push(...this.handleContentChange(refinementType, projectName));
        break;
        
      case 'component':
        fileOperations.push(...this.handleComponentChange(refinementType, projectName, currentState));
        break;
        
      case 'navigation':
        fileOperations.push(...this.handleNavigationChange(refinementType, projectName, currentState));
        break;
        
      default:
        fileOperations.push(...this.handleGeneralChange(refinementType, projectName));
    }
    
    return {
      fileOperations,
      refinementType,
      message: this.generateResponseMessage(refinementType),
      affectedFiles: [...new Set(fileOperations.map(op => op.path))]
    };
  }

  /**
   * Analyze what type of refinement is requested
   */
  analyzeRefinementType(request) {
    const lowercase = request.toLowerCase();
    
    // Style changes
    if (lowercase.match(/\b(color|colour|theme|dark|light|font|style|design)\b/)) {
      return {
        category: 'style',
        specific: this.extractStyleChanges(request),
        original: request
      };
    }
    
    // Layout changes
    if (lowercase.match(/\b(layout|position|move|align|center|left|right|top|bottom|sidebar)\b/)) {
      return {
        category: 'layout',
        specific: this.extractLayoutChanges(request),
        original: request
      };
    }
    
    // Content changes
    if (lowercase.match(/\b(text|title|heading|paragraph|content|copy|word)\b/)) {
      return {
        category: 'content',
        specific: this.extractContentChanges(request),
        original: request
      };
    }
    
    // Component changes
    if (lowercase.match(/\b(add|remove|delete|component|section|button|form|card|navbar|footer)\b/)) {
      return {
        category: 'component',
        specific: this.extractComponentChanges(request),
        original: request
      };
    }
    
    // Navigation changes
    if (lowercase.match(/\b(menu|navigation|nav|link|page)\b/)) {
      return {
        category: 'navigation',
        specific: this.extractNavigationChanges(request),
        original: request
      };
    }
    
    return {
      category: 'general',
      specific: request,
      original: request
    };
  }

  /**
   * Extract style change details
   */
  extractStyleChanges(request) {
    const changes = {};
    
    // Color changes
    const colorMatch = request.match(/\b(primary|secondary|accent|background|text)\s*(color|colour)?\s*(?:to|be|as)?\s*([#\w]+)/i);
    if (colorMatch) {
      changes.colorType = colorMatch[1];
      changes.newColor = colorMatch[3];
    }
    
    // Theme changes
    if (request.match(/dark\s*(mode|theme)/i)) {
      changes.theme = 'dark';
    } else if (request.match(/light\s*(mode|theme)/i)) {
      changes.theme = 'light';
    }
    
    // Font changes
    const fontMatch = request.match(/font\s*(?:to|be)?\s*([\w\s]+)/i);
    if (fontMatch) {
      changes.font = fontMatch[1].trim();
    }
    
    return changes;
  }

  /**
   * Extract layout change details
   */
  extractLayoutChanges(request) {
    const changes = {};
    
    // Position changes
    if (request.match(/center/i)) changes.align = 'center';
    if (request.match(/left/i)) changes.align = 'left';
    if (request.match(/right/i)) changes.align = 'right';
    
    // Sidebar changes
    if (request.match(/sidebar/i)) {
      changes.sidebar = request.match(/remove|hide/i) ? 'remove' : 'add';
    }
    
    // Grid changes
    const columnsMatch = request.match(/(\d+)\s*column/i);
    if (columnsMatch) {
      changes.columns = parseInt(columnsMatch[1]);
    }
    
    return changes;
  }

  /**
   * Extract content change details
   */
  extractContentChanges(request) {
    const changes = {};
    
    // Title changes
    const titleMatch = request.match(/title\s*(?:to|be)?\s*["']([^"']+)["']/i);
    if (titleMatch) {
      changes.title = titleMatch[1];
    }
    
    // Text replacements
    const replaceMatch = request.match(/change\s*["']([^"']+)["']\s*to\s*["']([^"']+)["']/i);
    if (replaceMatch) {
      changes.oldText = replaceMatch[1];
      changes.newText = replaceMatch[2];
    }
    
    return changes;
  }

  /**
   * Extract component change details
   */
  extractComponentChanges(request) {
    const changes = {};
    
    // Add/remove actions
    changes.action = request.match(/\b(add|create|insert)\b/i) ? 'add' : 
                    request.match(/\b(remove|delete|hide)\b/i) ? 'remove' : 'modify';
    
    // Component type
    const componentTypes = ['navbar', 'footer', 'hero', 'card', 'button', 'form', 'gallery', 'testimonial', 'search'];
    for (const type of componentTypes) {
      if (request.toLowerCase().includes(type)) {
        changes.componentType = type;
        break;
      }
    }
    
    // Position
    if (request.match(/\b(top|bottom|after|before|above|below)\b/i)) {
      changes.position = request.match(/\b(top|bottom|after|before|above|below)\b/i)[1];
    }
    
    return changes;
  }

  /**
   * Extract navigation change details
   */
  extractNavigationChanges(request) {
    const changes = {};
    
    // Add/remove links
    const linkMatch = request.match(/(?:add|create)\s*(?:a\s*)?link\s*(?:to|for)?\s*["']?([^"']+)["']?/i);
    if (linkMatch) {
      changes.action = 'add-link';
      changes.linkText = linkMatch[1];
    }
    
    // Reorder
    if (request.match(/\b(reorder|rearrange|move)\b/i)) {
      changes.action = 'reorder';
    }
    
    return changes;
  }

  /**
   * Handle style changes
   */
  handleStyleChange(refinementType, projectName) {
    const operations = [];
    const { specific } = refinementType;
    
    if (specific.newColor) {
      // Update CSS file
      operations.push({
        type: 'update_file',
        path: `${projectName}/assets/styles/main.css`,
        content: this.updateColorInCSS(specific.colorType, specific.newColor),
        partial: true
      });
    }
    
    if (specific.theme) {
      // Add dark mode styles
      operations.push({
        type: 'append_file',
        path: `${projectName}/assets/styles/main.css`,
        content: this.generateDarkModeCSS()
      });
    }
    
    return operations;
  }

  /**
   * Handle layout changes
   */
  handleLayoutChange(refinementType, projectName, currentState) {
    const operations = [];
    const { specific } = refinementType;
    
    // This would analyze current HTML and make layout adjustments
    // For now, we'll return a placeholder
    operations.push({
      type: 'update_note',
      message: `Layout change requested: ${JSON.stringify(specific)}`,
      path: `${projectName}/index.html`
    });
    
    return operations;
  }

  /**
   * Handle content changes
   */
  handleContentChange(refinementType, projectName) {
    const operations = [];
    const { specific } = refinementType;
    
    if (specific.title) {
      // Update title in all HTML files
      operations.push({
        type: 'replace_in_files',
        pattern: /<title>.*?<\/title>/,
        replacement: `<title>${specific.title}</title>`,
        files: [`${projectName}/*.html`]
      });
    }
    
    return operations;
  }

  /**
   * Handle component changes
   */
  handleComponentChange(refinementType, projectName, currentState) {
    const operations = [];
    const { specific } = refinementType;
    
    if (specific.action === 'add' && specific.componentType) {
      // Add component to index.html
      operations.push({
        type: 'insert_component',
        component: specific.componentType,
        position: specific.position || 'end',
        file: `${projectName}/index.html`
      });
    }
    
    return operations;
  }

  /**
   * Handle navigation changes
   */
  handleNavigationChange(refinementType, projectName, currentState) {
    const operations = [];
    const { specific } = refinementType;
    
    if (specific.action === 'add-link') {
      operations.push({
        type: 'add_nav_link',
        text: specific.linkText,
        href: `#${specific.linkText.toLowerCase().replace(/\s+/g, '-')}`,
        files: [`${projectName}/*.html`]
      });
    }
    
    return operations;
  }

  /**
   * Handle general changes
   */
  handleGeneralChange(refinementType, projectName) {
    return [{
      type: 'note',
      message: `General refinement requested: "${refinementType.original}"`,
      suggestion: 'Please be more specific about what you\'d like to change.'
    }];
  }

  /**
   * Update color in CSS
   */
  updateColorInCSS(colorType, newColor) {
    // This would read existing CSS and update the color
    // For now, return a CSS snippet
    return `:root {
  --${colorType}-color: ${newColor};
}`;
  }

  /**
   * Generate dark mode CSS
   */
  generateDarkModeCSS() {
    return `
/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1a1a1a;
    --text-color: #ffffff;
    --card-background: #2a2a2a;
    --border-color: #3a3a3a;
  }
  
  body {
    background-color: var(--background-color);
    color: var(--text-color);
  }
  
  .card {
    background-color: var(--card-background);
    border-color: var(--border-color);
  }
}

/* Dark mode toggle */
.dark-mode {
  --background-color: #1a1a1a;
  --text-color: #ffffff;
  --card-background: #2a2a2a;
  --border-color: #3a3a3a;
}`;
  }

  /**
   * Generate response message
   */
  generateResponseMessage(refinementType) {
    const messages = {
      style: `I've updated the ${refinementType.specific.colorType || 'visual'} style as requested.`,
      layout: 'I\'ve adjusted the layout according to your specifications.',
      content: 'I\'ve updated the content as requested.',
      component: `I've ${refinementType.specific.action}ed the ${refinementType.specific.componentType} component.`,
      navigation: 'I\'ve updated the navigation structure.',
      general: 'I\'ve made the requested changes.'
    };
    
    return messages[refinementType.category] || messages.general;
  }
}