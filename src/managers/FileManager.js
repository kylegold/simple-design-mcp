import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

export class FileManager {
  constructor() {
    this.activeProjects = new Map();
  }

  /**
   * Initialize a new project directory
   */
  async initializeProject(projectName, basePath = process.cwd()) {
    const projectPath = path.join(basePath, projectName);
    
    // Create project structure
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'assets'));
    await fs.ensureDir(path.join(projectPath, 'assets/images'));
    await fs.ensureDir(path.join(projectPath, 'assets/styles'));
    await fs.ensureDir(path.join(projectPath, '.simple-design'));
    
    // Create initial index.html
    const initialHTML = this.getInitialHTML(projectName);
    await fs.writeFile(path.join(projectPath, 'index.html'), initialHTML);
    
    // Create project metadata
    const metadata = {
      name: projectName,
      created: new Date().toISOString(),
      version: '1.0.0',
      type: 'html-prototype',
      path: projectPath
    };
    
    await fs.writeJSON(
      path.join(projectPath, '.simple-design', 'project.json'),
      metadata,
      { spaces: 2 }
    );
    
    // Track active project
    this.activeProjects.set(projectName, projectPath);
    
    return {
      path: projectPath,
      url: `file://${projectPath}/index.html`,
      metadata
    };
  }

  /**
   * Get or create project
   */
  async getProject(projectName, basePath = process.cwd()) {
    const projectPath = path.join(basePath, projectName);
    
    if (await fs.pathExists(projectPath)) {
      // Load existing project
      const metadataPath = path.join(projectPath, '.simple-design', 'project.json');
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJSON(metadataPath);
        this.activeProjects.set(projectName, projectPath);
        return {
          path: projectPath,
          url: `file://${projectPath}/index.html`,
          metadata,
          exists: true
        };
      }
    }
    
    // Create new project
    const result = await this.initializeProject(projectName, basePath);
    return { ...result, exists: false };
  }

  /**
   * Update a file in the project
   */
  async updateFile(projectName, filePath, content) {
    const projectPath = this.activeProjects.get(projectName);
    if (!projectPath) {
      throw new Error(`Project ${projectName} not found`);
    }
    
    const fullPath = path.join(projectPath, filePath);
    
    // Create backup
    if (await fs.pathExists(fullPath)) {
      const backupPath = path.join(
        projectPath,
        '.simple-design',
        'backups',
        `${filePath}.${Date.now()}.backup`
      );
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(fullPath, backupPath);
    }
    
    // Write new content
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
    
    return fullPath;
  }

  /**
   * Read a file from the project
   */
  async readFile(projectName, filePath) {
    const projectPath = this.activeProjects.get(projectName);
    if (!projectPath) {
      throw new Error(`Project ${projectName} not found`);
    }
    
    const fullPath = path.join(projectPath, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  /**
   * Get initial HTML template
   */
  getInitialHTML(projectName) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</title>
    <meta http-equiv="refresh" content="3">
    <link rel="stylesheet" href="assets/styles/main.css">
    <style>
        :root {
            --primary-color: #007bff;
            --secondary-color: #6c757d;
            --success-color: #28a745;
            --danger-color: #dc3545;
            --warning-color: #ffc107;
            --info-color: #17a2b8;
            --light-color: #f8f9fa;
            --dark-color: #343a40;
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            --spacing-unit: 8px;
            --border-radius: 4px;
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
            --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: var(--dark-color);
            background-color: var(--light-color);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 calc(var(--spacing-unit) * 2);
        }
        
        .coming-soon {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        
        .coming-soon h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .coming-soon p {
            font-size: 1.25rem;
            color: var(--secondary-color);
        }
        
        @media (max-width: 768px) {
            .coming-soon h1 {
                font-size: 2rem;
            }
            .coming-soon p {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="coming-soon">
            <div>
                <h1>🚀 ${projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h1>
                <p>Your design is being created. This page will update automatically.</p>
                <p><small>Auto-refreshing every 3 seconds...</small></p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Save project state
   */
  async saveProjectState(projectName, state) {
    const projectPath = this.activeProjects.get(projectName);
    if (!projectPath) {
      throw new Error(`Project ${projectName} not found`);
    }
    
    const statePath = path.join(projectPath, '.simple-design', 'state.json');
    await fs.writeJSON(statePath, state, { spaces: 2 });
  }

  /**
   * Load project state
   */
  async loadProjectState(projectName) {
    const projectPath = this.activeProjects.get(projectName);
    if (!projectPath) {
      throw new Error(`Project ${projectName} not found`);
    }
    
    const statePath = path.join(projectPath, '.simple-design', 'state.json');
    if (await fs.pathExists(statePath)) {
      return await fs.readJSON(statePath);
    }
    
    return null;
  }
}