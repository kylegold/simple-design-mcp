import { promises as fs } from 'fs';
import path from 'path';
import { componentTemplates } from '../templates/componentTemplates.js';
import { projectTemplates } from '../templates/projectTemplates.js';

export class CodeGenerator {
  async generateProject(project, projectPath) {
    const files = [];
    
    try {
      // Create project directory
      await fs.mkdir(projectPath, { recursive: true });
      
      // Generate package.json
      const packageJson = this.generatePackageJson(project);
      await fs.writeFile(path.join(projectPath, 'package.json'), packageJson);
      files.push('package.json');
      
      // Generate README
      const readme = this.generateReadme(project);
      await fs.writeFile(path.join(projectPath, 'README.md'), readme);
      files.push('README.md');
      
      // Create source directory
      await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'src/components'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'src/screens'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'src/styles'), { recursive: true });
      
      // Generate main App file
      const appFile = this.generateAppFile(project);
      await fs.writeFile(path.join(projectPath, 'src/App.js'), appFile);
      files.push('src/App.js');
      
      // Generate theme/styles
      const theme = this.generateTheme(project);
      await fs.writeFile(path.join(projectPath, 'src/styles/theme.js'), theme);
      files.push('src/styles/theme.js');
      
      // Generate components
      for (const component of project.components || []) {
        const componentCode = this.generateComponent(component, project);
        const componentPath = this.getComponentPath(component);
        const fullPath = path.join(projectPath, 'src', componentPath);
        
        await fs.writeFile(fullPath, componentCode);
        files.push(`src/${componentPath}`);
      }
      
      // Generate index file
      const indexFile = this.generateIndexFile(project);
      await fs.writeFile(path.join(projectPath, 'src/index.js'), indexFile);
      files.push('src/index.js');
      
      // Add design documentation
      await fs.mkdir(path.join(projectPath, 'design'), { recursive: true });
      const designDoc = this.generateDesignDoc(project);
      await fs.writeFile(path.join(projectPath, 'design/decisions.md'), designDoc);
      files.push('design/decisions.md');
      
      // Save conversation history
      const conversationHistory = JSON.stringify(project, null, 2);
      await fs.writeFile(path.join(projectPath, 'design/project.json'), conversationHistory);
      files.push('design/project.json');
      
    } catch (error) {
      console.error('Error generating project:', error);
      throw error;
    }
    
    return files;
  }
  
  generatePackageJson(project) {
    const isReactNative = project.framework === 'react-native';
    const uiLibrary = project.uiLibrary || 'material-ui';
    
    const dependencies = {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
    };
    
    // Add UI library dependencies
    if (uiLibrary === 'material-ui') {
      dependencies["@mui/material"] = "^5.14.0";
      dependencies["@emotion/react"] = "^11.11.0";
      dependencies["@emotion/styled"] = "^11.11.0";
      dependencies["@mui/icons-material"] = "^5.14.0";
    } else if (uiLibrary === 'tailwind') {
      dependencies["tailwindcss"] = "^3.3.0";
      dependencies["autoprefixer"] = "^10.4.0";
      dependencies["postcss"] = "^8.4.0";
    } else if (uiLibrary === 'shadcn') {
      dependencies["tailwindcss"] = "^3.3.0";
      dependencies["@radix-ui/react-dialog"] = "^1.0.0";
      dependencies["@radix-ui/react-dropdown-menu"] = "^2.0.0";
      dependencies["class-variance-authority"] = "^0.7.0";
      dependencies["clsx"] = "^2.0.0";
    }
    
    // Add feature-specific dependencies
    if (project.features?.includes('routing')) {
      dependencies["react-router-dom"] = "^6.15.0";
    }
    if (project.features?.includes('authentication')) {
      dependencies["firebase"] = "^10.0.0";
    }
    
    const packageJson = {
      name: project.name,
      version: "1.0.0",
      description: project.description || `A ${project.type} app built with Simple Design MCP`,
      private: true,
      dependencies,
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build",
        test: "react-scripts test",
        eject: "react-scripts eject"
      },
      eslintConfig: {
        extends: ["react-app"]
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
      },
      devDependencies: {
        "react-scripts": "5.0.1"
      }
    };
    
    return JSON.stringify(packageJson, null, 2);
  }
  
  generateReadme(project) {
    return `# ${project.name}

${project.description || `A ${project.type} app built with Simple Design MCP`}

## 🚀 Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🎨 Design

This app was designed using Simple Design MCP with:
- **UI Library**: ${project.uiLibrary}
- **Primary Color**: ${project.colors?.primary}
- **Theme**: ${project.style?.theme || 'Light'}

## ✨ Features

${project.features?.map(f => `- ${this.capitalize(f)}`).join('\n') || '- Core functionality'}

## 📱 Screens

${project.components?.map(c => `- ${c}`).join('\n') || '- Main screens'}

## 🛠️ Built With

- React
- ${this.getUILibraryName(project.uiLibrary)}
- Love ❤️

---

Created with [Simple Design MCP](https://commands.com/package/simple-design-mcp)
`;
  }
  
  generateAppFile(project) {
    const imports = this.generateImports(project);
    const components = this.generateAppComponents(project);
    
    return `${imports}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        ${components}
      </div>
    </ThemeProvider>
  );
}

export default App;
`;
  }
  
  generateImports(project) {
    const imports = [`import React from 'react';`];
    
    if (project.uiLibrary === 'material-ui') {
      imports.push(`import { ThemeProvider } from '@mui/material/styles';`);
      imports.push(`import CssBaseline from '@mui/material/CssBaseline';`);
      imports.push(`import { Container } from '@mui/material';`);
    }
    
    imports.push(`import theme from './styles/theme';`);
    
    // Import components
    if (project.components?.includes('Navigation')) {
      imports.push(`import Navigation from './components/Navigation';`);
    }
    if (project.components?.includes('Home')) {
      imports.push(`import Home from './screens/Home';`);
    }
    
    return imports.join('\n');
  }
  
  generateAppComponents(project) {
    const components = [];
    
    if (project.uiLibrary === 'material-ui') {
      components.push('<CssBaseline />');
    }
    
    if (project.components?.includes('Navigation')) {
      components.push('<Navigation />');
    }
    
    components.push(`
        <Container maxWidth="lg">
          <Home />
        </Container>`);
    
    return components.join('\n        ');
  }
  
  generateTheme(project) {
    if (project.uiLibrary === 'material-ui') {
      return `import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '${project.colors?.primary || '#3B82F6'}',
    },
    secondary: {
      main: '${project.colors?.secondary || '#8B5CF6'}',
    },
    background: {
      default: '${project.colors?.background || '#FFFFFF'}',
    },
    text: {
      primary: '${project.colors?.text || '#1F2937'}',
    },
  },
  typography: {
    fontFamily: '"${project.typography?.bodyFont || 'Inter'}", sans-serif',
    h1: {
      fontFamily: '"${project.typography?.headingFont || 'Inter'}", sans-serif',
    },
    h2: {
      fontFamily: '"${project.typography?.headingFont || 'Inter'}", sans-serif',
    },
  },
});

export default theme;
`;
    }
    
    // Tailwind config
    if (project.uiLibrary === 'tailwind') {
      return `export const colors = {
  primary: '${project.colors?.primary || '#3B82F6'}',
  secondary: '${project.colors?.secondary || '#8B5CF6'}',
  accent: '${project.colors?.accent || '#10B981'}',
  background: '${project.colors?.background || '#FFFFFF'}',
  text: '${project.colors?.text || '#1F2937'}',
};

export const theme = {
  colors,
  fonts: {
    heading: '"${project.typography?.headingFont || 'Inter'}", sans-serif',
    body: '"${project.typography?.bodyFont || 'Inter'}", sans-serif',
  },
};
`;
    }
  }
  
  generateComponent(componentName, project) {
    // Use templates if available
    if (componentTemplates[componentName]) {
      return componentTemplates[componentName](project);
    }
    
    // Generate generic component
    return this.generateGenericComponent(componentName, project);
  }
  
  generateGenericComponent(name, project) {
    const isMaterial = project.uiLibrary === 'material-ui';
    
    return `import React from 'react';
${isMaterial ? `import { Box, Typography, Paper } from '@mui/material';` : ''}

const ${name} = () => {
  return (
    ${isMaterial ? `<Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h4" gutterBottom>
        ${name}
      </Typography>
      <Typography variant="body1">
        This is the ${name} component. Customize it to fit your needs!
      </Typography>
    </Paper>` : `<div className="p-6 mb-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">${name}</h2>
      <p>This is the ${name} component. Customize it to fit your needs!</p>
    </div>`}
  );
};

export default ${name};
`;
  }
  
  generateIndexFile(project) {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
${project.uiLibrary === 'tailwind' ? `import './index.css';` : ''}
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  }
  
  generateDesignDoc(project) {
    return `# Design Decisions for ${project.name}

## Overview
${project.description || `A ${project.type} app designed with Simple Design MCP`}

## Design System

### Colors
- **Primary**: ${project.colors?.primary} - Main brand color
- **Secondary**: ${project.colors?.secondary} - Supporting color
- **Accent**: ${project.colors?.accent} - Call-to-action color
- **Background**: ${project.colors?.background}
- **Text**: ${project.colors?.text}

### Typography
- **Headings**: ${project.typography?.headingFont || 'Inter'}
- **Body**: ${project.typography?.bodyFont || 'Inter'}

### UI Library
We chose **${this.getUILibraryName(project.uiLibrary)}** because:
${this.getUILibraryReasoning(project.uiLibrary, project.type)}

## User Experience

### Target Users
${project.personas?.map(p => `- **${this.capitalize(p.type)}**: ${p.needs.join(', ')}`).join('\n') || '- General users'}

### Key Features
${project.features?.map(f => `- **${this.capitalize(f)}**: ${this.getFeatureDescription(f)}`).join('\n') || '- Core functionality'}

### Navigation
${this.getNavigationDescription(project.components?.navigation)}

## Technical Decisions

### Framework
- **React** for web development
- Component-based architecture
- Modern hooks and functional components

### State Management
- React Context for global state
- Local state for component-specific data

### Styling Approach
${this.getStylingApproach(project.uiLibrary)}

## Future Enhancements
- Add more features based on user feedback
- Implement user authentication
- Add analytics and monitoring
- Progressive Web App capabilities

---

Generated by Simple Design MCP - Making app design accessible to everyone!
`;
  }
  
  // Helper methods
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }
  
  getUILibraryName(lib) {
    const names = {
      'material-ui': 'Material-UI (MUI)',
      'tailwind': 'Tailwind CSS',
      'shadcn': 'shadcn/ui',
      'bootstrap': 'Bootstrap',
      'ant-design': 'Ant Design'
    };
    return names[lib] || lib;
  }
  
  getUILibraryReasoning(lib, type) {
    const reasoning = {
      'material-ui': 'It provides a comprehensive set of pre-built components with excellent accessibility and a professional look.',
      'tailwind': 'It offers maximum flexibility with utility classes while maintaining consistency.',
      'shadcn': 'It combines the power of Radix UI with Tailwind CSS for modern, customizable components.'
    };
    return reasoning[lib] || 'It fits the project requirements perfectly.';
  }
  
  getFeatureDescription(feature) {
    const descriptions = {
      'authentication': 'Secure user login and registration',
      'search': 'Fast and intuitive content search',
      'favorites': 'Save and organize favorite items',
      'photo-upload': 'Easy photo uploads with preview',
      'messaging': 'Real-time chat functionality',
      'notifications': 'Push notifications for important updates'
    };
    return descriptions[feature] || 'Essential functionality';
  }
  
  getNavigationDescription(nav) {
    const descriptions = {
      'bottom-tabs': 'Mobile-style bottom navigation for easy thumb access',
      'sidebar': 'Desktop-optimized sidebar for complex navigation',
      'top-bar': 'Traditional top navigation bar'
    };
    return descriptions[nav] || 'Intuitive navigation system';
  }
  
  getStylingApproach(lib) {
    const approaches = {
      'material-ui': '- Emotion for CSS-in-JS\n- Theme-based styling\n- sx prop for component styles',
      'tailwind': '- Utility-first CSS classes\n- Custom components with Tailwind\n- Responsive design utilities',
      'shadcn': '- Combination of Tailwind utilities\n- CSS variables for theming\n- Component variants with CVA'
    };
    return approaches[lib] || '- Modern CSS approach';
  }
  
  getComponentPath(component) {
    // Determine if component is a screen or component
    const screens = ['Home', 'LoginScreen', 'SignupScreen', 'ProfileScreen', 'Settings'];
    const isScreen = screens.some(s => component.includes(s));
    
    return isScreen ? `screens/${component}.js` : `components/${component}.js`;
  }
}