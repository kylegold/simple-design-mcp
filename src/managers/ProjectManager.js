import { DesignBriefAgent } from '../agents/DesignBriefAgent.js';
import { UXFlowAgent } from '../agents/UXFlowAgent.js';
import { UIGeneratorAgent } from '../agents/UIGeneratorAgent.js';
import { RefinementAgent } from '../agents/RefinementAgent.js';
import { FileOperations } from './FileOperations.js';

/**
 * ProjectManager - Orchestrates the entire design process
 */
export class ProjectManager {
  constructor() {
    this.agents = {
      designBrief: new DesignBriefAgent(),
      uxFlow: new UXFlowAgent(),
      uiGenerator: new UIGeneratorAgent(),
      refinement: new RefinementAgent()
    };
    this.fileOps = new FileOperations();
    this.projects = new Map();
  }

  /**
   * Create a new design project
   */
  async createProject(userInput, basePath = '.') {
    // Step 1: Analyze requirements with DesignBriefAgent
    const designBrief = await this.agents.designBrief.analyzeRequirements(userInput);
    const projectName = designBrief.projectName;
    
    // Step 2: Generate UX flow with UXFlowAgent
    const uxFlow = await this.agents.uxFlow.generateUXFlow(designBrief);
    
    // Step 3: Generate initial project structure
    const initOperations = this.fileOps.getProjectInitOperations(projectName);
    
    // Step 4: Generate UI with UIGeneratorAgent
    const uiResult = await this.agents.uiGenerator.generateUI(designBrief, uxFlow, projectName);
    
    // Combine all file operations
    const allOperations = [...initOperations, ...uiResult.fileOperations];
    
    // Store project state
    const projectState = {
      projectName,
      basePath,
      designBrief,
      uxFlow,
      currentFiles: uiResult.screens,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.projects.set(projectName, projectState);
    
    return {
      projectName,
      operations: allOperations,
      designBrief,
      uxFlow,
      message: this.generateCreationMessage(designBrief, uxFlow),
      previewUrl: `file://${basePath}/${projectName}/index.html`
    };
  }

  /**
   * Update an existing project
   */
  async updateProject(projectName, userRequest) {
    const projectState = this.projects.get(projectName);
    if (!projectState) {
      throw new Error(`Project "${projectName}" not found. Please create it first.`);
    }
    
    // Use RefinementAgent to process the update
    const refinementResult = await this.agents.refinement.processRefinement(
      userRequest,
      projectState,
      projectName
    );
    
    // Update project state
    projectState.lastModified = new Date().toISOString();
    
    return {
      projectName,
      operations: refinementResult.fileOperations,
      message: refinementResult.message,
      affectedFiles: refinementResult.affectedFiles,
      refinementType: refinementResult.refinementType
    };
  }

  /**
   * Get project status
   */
  getProjectStatus(projectName) {
    const projectState = this.projects.get(projectName);
    if (!projectState) {
      return null;
    }
    
    return {
      projectName,
      appType: projectState.designBrief.appType,
      created: projectState.created,
      lastModified: projectState.lastModified,
      screens: projectState.uxFlow.screens.map(s => ({
        name: s.name,
        file: s.id === 'home' ? 'index.html' : `${s.id}.html`
      })),
      features: projectState.designBrief.features,
      previewUrl: `file://${projectState.basePath}/${projectName}/index.html`
    };
  }

  /**
   * Generate React app from current design
   */
  async exportToReact(projectName) {
    const projectState = this.projects.get(projectName);
    if (!projectState) {
      throw new Error(`Project "${projectName}" not found.`);
    }
    
    // This would use a ReactConverter to transform HTML to React components
    // For now, return a placeholder
    return {
      message: 'React export functionality will be implemented in Phase 7',
      projectName: `${projectName}-react`,
      operations: []
    };
  }

  /**
   * Generate creation message
   */
  generateCreationMessage(designBrief, uxFlow) {
    const { appType, projectName, features } = designBrief;
    const screenCount = uxFlow.screens.length;
    
    return `✨ Created your ${appType} app "${projectName}"!

📁 Project structure:
• ${screenCount} screens designed
• Responsive layout
• ${features.length} features included

🎨 Design:
• Style: ${designBrief.designStyle}
• Colors: ${Object.values(designBrief.colorScheme).join(', ')}
• Target: ${designBrief.targetAudience}

📂 Files created:
• index.html (home page)
• ${screenCount - 1} additional pages
• assets/styles/main.css
• components.html (component library)

🚀 Next steps:
1. Open the preview URL in your browser
2. The page auto-refreshes every 3 seconds
3. Tell me what you'd like to change!

Preview URL: file://./${projectName}/index.html`;
  }

  /**
   * Get active project or create from input
   */
  async getOrCreateProject(input, conversationId) {
    // Check if this is a refinement of existing project
    const existingProject = this.findProjectFromInput(input);
    if (existingProject) {
      return { project: existingProject, isNew: false };
    }
    
    // Check conversation history
    const conversationProject = this.projects.get(conversationId);
    if (conversationProject) {
      return { project: conversationProject, isNew: false };
    }
    
    // Create new project
    const result = await this.createProject(input);
    return { project: this.projects.get(result.projectName), isNew: true, result };
  }

  /**
   * Find project from user input
   */
  findProjectFromInput(input) {
    const lowercaseInput = input.toLowerCase();
    
    // Check for explicit project references
    for (const [name, project] of this.projects) {
      if (lowercaseInput.includes(name) || 
          lowercaseInput.includes(project.designBrief.appType)) {
        return project;
      }
    }
    
    // Check if this seems like a refinement request
    if (lowercaseInput.match(/\b(change|update|modify|add|remove|make|color|style)\b/)) {
      // Return the most recent project
      const projects = Array.from(this.projects.values());
      return projects.sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
      )[0];
    }
    
    return null;
  }

  /**
   * Format file operations for display
   */
  formatOperations(operations) {
    const formatted = [];
    
    for (const op of operations) {
      switch (op.type) {
        case 'create_directory':
          formatted.push(`📁 Create folder: ${op.path}/`);
          break;
        case 'create_file':
          formatted.push(`📄 Create file: ${op.path}`);
          break;
        case 'update_file':
          formatted.push(`✏️ Update file: ${op.path}`);
          break;
        case 'append_file':
          formatted.push(`➕ Append to: ${op.path}`);
          break;
        default:
          formatted.push(`🔧 ${op.type}: ${op.path || op.message}`);
      }
    }
    
    return formatted.join('\n');
  }
}