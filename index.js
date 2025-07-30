#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ProjectManager } from './src/managers/ProjectManager.js';
import { verifyJwt } from './src/auth/verifyToken.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';
const isDevelopment = process.env.NODE_ENV === 'development';
const skipAuth = process.env.SKIP_AUTH === 'true' && isDevelopment;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['https://commands.com', 'https://api.commands.com'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Initialize project manager
const projectManager = new ProjectManager();

// Tool definitions for MCP
const tools = [
  {
    name: 'simple_design_create',
    description: 'Start designing a new app - just describe what you want to build!',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Describe the app you want to build'
        },
        path: {
          type: 'string',
          description: 'Where to create the project (optional, defaults to current directory)'
        }
      },
      required: ['description']
    }
  },
  {
    name: 'simple_design_update',
    description: 'Update or refine your current design',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'string',
          description: 'What would you like to change?'
        },
        projectName: {
          type: 'string',
          description: 'Project name (optional, uses most recent if not specified)'
        }
      },
      required: ['request']
    }
  },
  {
    name: 'simple_design_preview',
    description: 'Get the current design status and preview URLs',
    inputSchema: {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: 'Project name (optional, uses most recent if not specified)'
        }
      }
    }
  },
  {
    name: 'simple_design_export_react',
    description: 'Convert your HTML design to a React app',
    inputSchema: {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: 'Project name to export'
        }
      },
      required: ['projectName']
    }
  }
];

// Helper function to send streaming responses for SSE-enabled gateways
function sendStreamingResponse(res, result, id) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  const response = { jsonrpc: '2.0', result, id };
  res.write(`data: ${JSON.stringify(response)}\n\n`);
  res.end();
}

// Request logging (only in development)
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'simple-design-mcp',
    version: '2.0.0'
  });
});

// MCP discovery endpoint
app.get('/.well-known/mcp.json', (req, res) => {
  res.json({
    schemaVersion: "2024-11-05",
    vendor: "Commands.com",
    name: "simple-design-mcp",
    version: "2.0.0",
    description: "Design beautiful apps without coding - see live HTML preview instantly!",
    license: "PROPRIETARY",
    capabilities: {
      tools: {
        listChanged: true
      }
    },
    serverInfo: {
      name: "simple-design-mcp",
      version: "2.0.0"
    }
  });
});

// Root endpoint with basic info
app.get('/', (req, res) => {
  res.json({
    name: "simple-design-mcp",
    description: "Design beautiful apps without coding - see live HTML preview instantly!",
    version: "2.0.0",
    endpoints: {
      health: '/health',
      discovery: '/.well-known/mcp.json'
    },
    tools: tools.map(tool => `${tool.name} - ${tool.description}`)
  });
});

// Define authentication middleware
const authMiddleware = skipAuth ? 
  (req, res, next) => {
    if (isDevelopment) {
      console.log('Authentication: DISABLED (dev mode)');
    }
    req.user = {
      sub: 'dev-user',
      email: 'dev@example.com',
      scope: 'read:user'
    };
    next();
  } : 
  verifyJwt;

// Tool handler functions
async function handleTool(toolName, params, user) {
  try {
    switch (toolName) {
      case 'simple_design_create': {
        const result = await projectManager.createProject(
          params.description,
          params.path || '.'
        );
        
        // Format file operations as instructions
        const instructions = projectManager.formatOperations(result.operations);
        
        return `${result.message}

📝 File operations to execute:
${instructions}

The HTML files will auto-refresh every 3 seconds as you make changes.`;
      }
      
      case 'simple_design_update': {
        // Find the most recent project if not specified
        const targetProject = params.projectName || 
          Array.from(projectManager.projects.keys()).pop();
          
        if (!targetProject) {
          return 'No active project found. Please create a project first using simple_design_create.';
        }
        
        const result = await projectManager.updateProject(
          targetProject,
          params.request
        );
        
        const instructions = projectManager.formatOperations(result.operations);
        
        return `${result.message}

📝 Updates to apply:
${instructions}

Affected files: ${result.affectedFiles.join(', ')}`;
      }
      
      case 'simple_design_preview': {
        const targetProject = params.projectName || 
          Array.from(projectManager.projects.keys()).pop();
          
        if (!targetProject) {
          return 'No active project found. Please create a project first.';
        }
        
        const status = projectManager.getProjectStatus(targetProject);
        
        return `## ${status.projectName} - ${status.appType} App

📂 Project Structure:
${status.screens.map(s => `• ${s.name}: ${s.file}`).join('\n')}

✨ Features:
${status.features.map(f => `• ${f}`).join('\n')}

🔗 Preview URL: ${status.previewUrl}

📅 Created: ${new Date(status.created).toLocaleString()}
📅 Last Modified: ${new Date(status.lastModified).toLocaleString()}

Open the preview URL in your browser to see your design!`;
      }
      
      case 'simple_design_export_react': {
        const result = await projectManager.exportToReact(params.projectName);
        return result.message;
      }
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Tool execution error:`, error);
    throw error;
  }
}

// Main JSON-RPC endpoint
app.post('/', async (req, res) => {
  const acceptsSSE = req.headers.accept?.includes('text/event-stream');
  const { method, params, id, jsonrpc } = req.body;
  
  // Methods that don't require authentication
  const publicMethods = ['initialize', 'notifications/initialized', 'tools/list'];
  
  // Check authentication for protected methods
  if (!publicMethods.includes(method)) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token && !skipAuth) {
      return res.status(401).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Authentication required'
        },
        id: id || null
      });
    }
    
    if (token && !skipAuth) {
      try {
        await new Promise((resolve, reject) => {
          authMiddleware(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (err) {
        return res.status(401).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid or expired token'
          },
          id: id || null
        });
      }
    } else if (skipAuth) {
      req.user = {
        sub: 'dev-user',
        email: 'dev@example.com',
        scope: 'read:user'
      };
    }
  }
  
  // Log requests in development
  if (isDevelopment) {
    console.log(`[MCP] JSON-RPC Request: method=${method}, id=${id}, user=${req.user?.email || req.user?.sub}`);
  }
  
  if (jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request - jsonrpc must be "2.0"'
      },
      id: id || null
    });
  }
  
  try {
    switch (method) {
      case 'initialize':
        return res.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {
                listChanged: true
              }
            },
            serverInfo: {
              name: 'simple-design-mcp',
              version: '2.0.0'
            }
          },
          id
        });
        
      case 'notifications/initialized':
        return res.status(200).end();
        
      case 'tools/list':
        const toolsResult = {
          tools: tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }))
        };
        
        if (acceptsSSE) {
          return sendStreamingResponse(res, toolsResult, id);
        }
        
        return res.json({
          jsonrpc: '2.0',
          result: toolsResult,
          id
        });
        
      case 'resources/list':
        const resourcesResult = { resources: [] };
        
        if (acceptsSSE) {
          return sendStreamingResponse(res, resourcesResult, id);
        }
        
        return res.json({
          jsonrpc: '2.0',
          result: resourcesResult,
          id
        });
        
      case 'prompts/list':
        const promptsResult = { prompts: [] };
        
        if (acceptsSSE) {
          return sendStreamingResponse(res, promptsResult, id);
        }
        
        return res.json({
          jsonrpc: '2.0',
          result: promptsResult,
          id
        });
        
      case 'tools/call':
        const { name: toolName, arguments: toolArgs } = params;
        
        if (isDevelopment) {
          console.log(`[MCP] Tool call: ${toolName} with args:`, toolArgs);
        }
        
        try {
          const result = await handleTool(toolName, toolArgs || {}, req.user);
          
          const toolResult = {
            content: [
              {
                type: 'text',
                text: result
              }
            ]
          };
          
          if (acceptsSSE) {
            return sendStreamingResponse(res, toolResult, id);
          }
          
          return res.json({
            jsonrpc: '2.0',
            result: toolResult,
            id
          });
        } catch (toolError) {
          console.error(`Tool execution error for ${toolName}:`, toolError);
          return res.json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: `Tool execution failed: ${toolError.message}`
            },
            id
          });
        }
        
      default:
        return res.status(404).json({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          },
          id: id || null
        });
    }
  } catch (error) {
    console.error('JSON-RPC handler error:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error'
      },
      id: id || null
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 404,
      message: 'Endpoint not found',
      path: req.originalUrl
    }
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: {
      code: 500,
      message: 'Internal server error'
    }
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Simple Design MCP Server v2.0 running on ${HOST}:${PORT}`);
  console.log(`Visual HTML design with live preview!`);
  
  if (isDevelopment) {
    console.log(`Available tools: ${tools.map(t => t.name).join(', ')}`);
    console.log(`Authentication: ${skipAuth ? 'DISABLED (dev mode)' : 'ENABLED'}`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
    console.log(`MCP Discovery: http://${HOST}:${PORT}/.well-known/mcp.json`);
  }
});

export default app;