#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { WorkflowOrchestrator } from './src/orchestrator/WorkflowOrchestrator.js';
import { createLightweightResponse } from './src/orchestrator/LightweightResponse.js';
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

// Initialize workflow orchestrator
const orchestrator = new WorkflowOrchestrator();

// Tool definitions for MCP - Now orchestration tools
const tools = [
  {
    name: 'simple_design_orchestrate',
    description: 'Get a workflow for designing apps - returns instructions for Claude Code to execute locally',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          enum: ['create_app', 'update_design', 'add_component'],
          description: 'The design task to orchestrate'
        },
        input: {
          type: 'object',
          description: 'Task-specific input parameters',
          properties: {
            description: {
              type: 'string',
              description: 'For create_app: describe what you want to build'
            },
            request: {
              type: 'string',
              description: 'For update_design: what to change'
            },
            component_request: {
              type: 'string',
              description: 'For add_component: what component to add'
            },
            projectName: {
              type: 'string',
              description: 'Project name (for updates)'
            },
            path: {
              type: 'string',
              description: 'Where to create the project'
            }
          }
        }
      },
      required: ['task', 'input']
    }
  },
  {
    name: 'simple_design_get_agent',
    description: 'Get a specific agent template for local execution',
    inputSchema: {
      type: 'object',
      properties: {
        agentName: {
          type: 'string',
          description: 'Name of the agent template to retrieve'
        },
        action: {
          type: 'string',
          description: 'The action method to get'
        }
      },
      required: ['agentName']
    }
  },
  {
    name: 'simple_design_get_component',
    description: 'Get component specifications for UI building',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to get specs for'
        },
        appType: {
          type: 'string',
          description: 'App type for context-specific components'
        }
      },
      required: ['componentName']
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
  const recentRequests = isDevelopment ? 
    Array.from(requestLog.entries()).slice(-10).map(([id, data]) => ({
      id,
      ...data
    })) : [];
    
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'simple-design-mcp-orchestrator',
    version: '3.0.0',
    requestCount,
    recentRequests
  });
});

// MCP discovery endpoint
app.get('/.well-known/mcp.json', (req, res) => {
  res.json({
    schemaVersion: "2024-11-05",
    vendor: "Commands.com",
    name: "simple-design-mcp-orchestrator",
    version: "3.0.0",
    description: "Orchestrates app design workflows for Claude Code local execution",
    license: "PROPRIETARY",
    capabilities: {
      tools: {
        listChanged: true
      }
    },
    serverInfo: {
      name: "simple-design-mcp-orchestrator",
      version: "3.0.0"
    }
  });
});

// Root endpoint with basic info
app.get('/', (req, res) => {
  res.json({
    name: "simple-design-mcp-orchestrator",
    description: "Orchestrates app design workflows for Claude Code local execution",
    version: "3.0.0",
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

// Tool handler functions - Now returns workflows instead of executing
async function handleTool(toolName, params, user) {
  try {
    switch (toolName) {
      case 'simple_design_orchestrate': {
        // Get the workflow from orchestrator
        const workflow = orchestrator.orchestrate(params.task, params.input);
        
        // Return lightweight version to avoid overwhelming the client
        return createLightweightResponse(workflow);
      }
      
      case 'simple_design_get_agent': {
        // Get specific agent template
        const agent = orchestrator.agentTemplates[params.agentName];
        
        if (!agent) {
          throw new Error(`Unknown agent: ${params.agentName}`);
        }
        
        const action = params.action ? agent[params.action] : agent;
        
        return {
          agentName: params.agentName,
          action: params.action || 'all',
          template: action
        };
      }
      
      case 'simple_design_get_component': {
        // Get component specification
        const component = orchestrator.getComponentTemplate(params.componentName);
        
        if (!component) {
          // Try to get app-specific component
          const appComponents = orchestrator.getComponentSpecs(params.appType || 'general');
          const appComponent = appComponents[params.componentName];
          
          if (!appComponent) {
            throw new Error(`Unknown component: ${params.componentName}`);
          }
          
          return {
            componentName: params.componentName,
            appType: params.appType,
            specification: appComponent
          };
        }
        
        return {
          componentName: params.componentName,
          specification: component
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Tool execution error:`, error);
    throw error;
  }
}

// REST API endpoints for tool discovery and execution
// GET /mcp/tools - Tool discovery endpoint (non-JSON-RPC)
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  });
});

// POST /mcp/tools/:toolName - Direct tool execution (non-JSON-RPC)
app.post('/mcp/tools/:toolName', authMiddleware, async (req, res) => {
  const { toolName } = req.params;
  const { params = {} } = req.body;
  
  if (isDevelopment) {
    console.log(`[REST] Tool execution: ${toolName} with params:`, params);
  }
  
  try {
    const result = await handleTool(toolName, params, req.user);
    res.json({
      success: true,
      result: typeof result === 'object' ? result : { text: result }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: error.message
      }
    });
  }
});

// Request counter for debugging
let requestCount = 0;
const requestLog = new Map();

// Public JSON-RPC endpoint for unauthenticated methods
app.post('/', async (req, res) => {
  const requestId = ++requestCount;
  const startTime = Date.now();
  
  // Log request for debugging
  if (isDevelopment) {
    requestLog.set(requestId, {
      method: req.body?.method,
      time: new Date().toISOString()
    });
    
    // Keep only last 100 requests
    if (requestLog.size > 100) {
      const firstKey = requestLog.keys().next().value;
      requestLog.delete(firstKey);
    }
  }
  
  // Disable SSE for now - it might be causing connection issues
  const acceptsSSE = false; // req.headers.accept?.includes('text/event-stream');
  
  // Validate request body
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error - invalid JSON'
      },
      id: null
    });
  }
  
  const { method, params, id, jsonrpc } = req.body;
  
  // Validate JSON-RPC version
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
  
  // Check if this is a public method
  const publicMethods = ['initialize', 'notifications/initialized', 'tools/list'];
  
  // For protected methods, verify authentication
  if (!publicMethods.includes(method)) {
    // Apply auth check
    if (!skipAuth) {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      
      if (!token) {
        return res.status(401).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Authentication required'
          },
          id: id || null
        });
      }
      
      // Verify token inline to get proper error handling
      try {
        await new Promise((resolve, reject) => {
          verifyJwt(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (err) {
        // Auth middleware already sent response
        return;
      }
    } else {
      // Dev mode
      req.user = {
        sub: 'dev-user',
        email: 'dev@example.com',
        scope: 'read:user'
      };
    }
  }
  
  // Log requests in development
  if (isDevelopment) {
    console.log(`[MCP] Request #${requestId}: method=${method}, id=${id}, user=${req.user?.email || req.user?.sub}`);
  }
  
  try {
    switch (method) {
      case 'initialize':
        return res.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2025-06-18',
            capabilities: {
              tools: {
                listChanged: true
              }
            },
            serverInfo: {
              name: 'simple-design-mcp-orchestrator',
              version: '3.0.0'
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
          
          // Log result size for debugging
          const resultSize = JSON.stringify(result).length;
          if (isDevelopment) {
            console.log(`[MCP] Tool result size: ${resultSize} bytes`);
          }
          
          // Warn if response is too large
          if (resultSize > 50000) {
            console.warn(`[MCP] Large response detected: ${resultSize} bytes for ${toolName}`);
          }
          
          // If result is an object, wrap it properly for MCP
          const toolResult = typeof result === 'object' ? {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          } : {
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
  console.log(`Simple Design MCP Orchestrator v3.0 running on ${HOST}:${PORT}`);
  console.log(`Orchestrating design workflows for Claude Code local execution`);
  
  if (isDevelopment) {
    console.log(`Available tools: ${tools.map(t => t.name).join(', ')}`);
    console.log(`Authentication: ${skipAuth ? 'DISABLED (dev mode)' : 'ENABLED'}`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
    console.log(`MCP Discovery: http://${HOST}:${PORT}/.well-known/mcp.json`);
  }
});

export default app;