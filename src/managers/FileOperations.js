/**
 * FileOperations class that returns file operation instructions
 * for Claude Code to execute on the user's machine
 */
export class FileOperations {
  constructor() {
    this.operations = [];
  }

  /**
   * Generate file operation instructions for project initialization
   */
  getProjectInitOperations(projectName) {
    const operations = [
      {
        type: 'create_directory',
        path: projectName
      },
      {
        type: 'create_directory',
        path: `${projectName}/assets`
      },
      {
        type: 'create_directory',
        path: `${projectName}/assets/images`
      },
      {
        type: 'create_directory',
        path: `${projectName}/assets/styles`
      },
      {
        type: 'create_directory',
        path: `${projectName}/.simple-design`
      },
      {
        type: 'create_file',
        path: `${projectName}/index.html`,
        content: this.getInitialHTML(projectName)
      },
      {
        type: 'create_file',
        path: `${projectName}/.simple-design/project.json`,
        content: JSON.stringify({
          name: projectName,
          created: new Date().toISOString(),
          version: '1.0.0',
          type: 'html-prototype',
          description: 'Created with Simple Design MCP'
        }, null, 2)
      }
    ];

    return operations;
  }

  /**
   * Generate file update operation
   */
  getFileUpdateOperation(projectName, filePath, content) {
    return {
      type: 'update_file',
      path: `${projectName}/${filePath}`,
      content: content,
      backup: true
    };
  }

  /**
   * Get initial HTML template
   */
  getInitialHTML(projectName) {
    const title = projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta http-equiv="refresh" content="3">
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
                <h1>🚀 ${title}</h1>
                <p>Your design is being created. This page will update automatically.</p>
                <p><small>Auto-refreshing every 3 seconds...</small></p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Format operations as readable instructions
   */
  formatOperationsAsText(operations) {
    const instructions = [];
    
    for (const op of operations) {
      switch (op.type) {
        case 'create_directory':
          instructions.push(`📁 Creating directory: ${op.path}/`);
          break;
        case 'create_file':
          instructions.push(`📄 Creating file: ${op.path}`);
          break;
        case 'update_file':
          instructions.push(`✏️ Updating file: ${op.path}`);
          break;
      }
    }
    
    return instructions.join('\n');
  }
}