#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { WorkflowOrchestrator } from './src/orchestrator/WorkflowOrchestrator.js';
import { createLightweightResponse } from './src/orchestrator/LightweightResponse.js';
import { WorkflowSessionManager } from './src/orchestrator/WorkflowSessionManager.js';
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

// Initialize workflow orchestrator and session manager
const orchestrator = new WorkflowOrchestrator();
const sessionManager = new WorkflowSessionManager(orchestrator);

// Tool definitions for MCP - Simple tools for Commands.com compatibility
const tools = [
  {
    name: 'simple_design_start',
    description: 'Start a new design workflow session',
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
    name: 'simple_design_next_step',
    description: 'Get the next step in the workflow',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'The workflow session ID'
        }
      },
      required: ['sessionId']
    }
  },
  {
    name: 'simple_design_get_prompt',
    description: 'Get the prompt for a specific agent action',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'The workflow session ID'
        },
        agent: {
          type: 'string',
          description: 'Name of the agent'
        },
        action: {
          type: 'string',
          description: 'The action to get prompt for'
        }
      },
      required: ['sessionId', 'agent', 'action']
    }
  },
  {
    name: 'simple_design_get_template',
    description: 'Get code template for current step',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'The workflow session ID'
        },
        templateType: {
          type: 'string',
          description: 'Type of template to retrieve'
        }
      },
      required: ['sessionId', 'templateType']
    }
  },
  {
    name: 'simple_design_get_component',
    description: 'Get component specifications for UI building',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'The workflow session ID'
        },
        componentName: {
          type: 'string',
          description: 'Name of the component to get specs for'
        }
      },
      required: ['sessionId', 'componentName']
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
    server: 'simple-design-mcp-orchestrator',
    version: '3.1.0'
  });
});

// MCP discovery endpoint
app.get('/.well-known/mcp.json', (req, res) => {
  res.json({
    schemaVersion: "2024-11-05",
    vendor: "Commands.com",
    name: "simple-design-mcp-orchestrator",
    version: "3.1.0",
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

// Root endpoint with basic info
app.get('/', (req, res) => {
  res.json({
    name: "simple-design-mcp-orchestrator",
    description: "Orchestrates app design workflows for Claude Code local execution",
    version: "3.1.0",
    endpoints: {
      health: '/health',
      discovery: '/.well-known/mcp.json',
      tools: '/mcp/tools',
      execute: '/mcp/tools/:toolName'
    },
    tools: tools.map(tool => `${tool.name} - ${tool.description}`)
  });
});

// REST API endpoints for Commands.com compatibility
// GET /mcp/tools - Tool discovery endpoint
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  });
});

// POST /mcp/tools/:toolName - Direct tool execution
app.post('/mcp/tools/:toolName', authMiddleware, async (req, res) => {
  const { toolName } = req.params;
  const { params = {} } = req.body;
  
  // Log REST API calls in development
  if (isDevelopment) {
    console.log(`[REST] Tool execution: ${toolName} with params:`, params);
  }
  
  try {
    const result = await handleTool(toolName, params, req.user);
    res.json({ result });
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: {
        code: error.message.includes('not found') ? 404 : 500,
        message: error.message,
        data: { tool: toolName }
      }
    });
  }
});

// Tool handler functions - Simple responses for Commands.com compatibility
async function handleTool(toolName, params, user) {
  try {
    switch (toolName) {
      case 'simple_design_start': {
        // Create a new workflow session
        const sessionId = sessionManager.createSession(params.task, params.input);
        const session = sessionManager.getSession(sessionId);
        
        return {
          sessionId,
          task: params.task,
          totalSteps: session.workflow.steps.length,
          status: 'ready',
          description: session.workflow.description,
          estimatedTime: `${session.workflow.steps.length * 2} minutes`
        };
      }
      
      case 'simple_design_next_step': {
        // Get the next step in the workflow
        const session = sessionManager.getSession(params.sessionId);
        if (!session) {
          throw new Error('Session not found or expired');
        }
        
        if (session.currentStep >= session.workflow.steps.length) {
          sessionManager.completeSession(params.sessionId);
          return {
            stepNumber: session.currentStep,
            status: 'completed',
            message: 'Workflow completed successfully',
            hasMore: false
          };
        }
        
        const step = session.workflow.steps[session.currentStep];
        sessionManager.updateSession(params.sessionId, { 
          currentStep: session.currentStep + 1 
        });
        
        return {
          stepNumber: session.currentStep + 1,
          stepName: step.name,
          agent: step.agent,
          action: step.action,
          description: step.description,
          hasMore: session.currentStep + 1 < session.workflow.steps.length
        };
      }
      
      case 'simple_design_get_prompt': {
        // Get prompt for specific agent action
        const session = sessionManager.getSession(params.sessionId);
        if (!session) {
          throw new Error('Session not found or expired');
        }
        
        const agent = session.orchestrationResult.agents[params.agent];
        if (!agent) {
          throw new Error(`Unknown agent: ${params.agent}`);
        }
        
        const prompt = agent[params.action];
        if (!prompt) {
          throw new Error(`Unknown action ${params.action} for agent ${params.agent}`);
        }
        
        // Inject context into prompt
        const contextualPrompt = prompt
          .replace('{context}', JSON.stringify(session.context))
          .replace('{projectName}', session.context.projectName)
          .replace('{appType}', session.context.appType)
          .replace('{description}', session.input.description || '')
          .replace('{request}', session.input.request || '');
        
        return {
          prompt: contextualPrompt,
          agent: params.agent,
          action: params.action
        };
      }
      
      case 'simple_design_get_template': {
        // Get code template
        const session = sessionManager.getSession(params.sessionId);
        if (!session) {
          throw new Error('Session not found or expired');
        }
        
        // Get template based on type
        let template;
        switch (params.templateType) {
          case 'package.json':
            template = orchestrator.getPackageTemplate(session.context.appType);
            break;
          case 'component':
            template = orchestrator.getComponentTemplate(params.componentName);
            break;
          default:
            template = orchestrator.getProjectTemplate(session.context.appType)[params.templateType];
        }
        
        if (!template) {
          throw new Error(`Unknown template type: ${params.templateType}`);
        }
        
        return {
          templateType: params.templateType,
          template: typeof template === 'string' ? template : JSON.stringify(template, null, 2)
        };
      }
      
      case 'simple_design_get_component': {
        // Get component specification
        const session = sessionManager.getSession(params.sessionId);
        if (!session) {
          throw new Error('Session not found or expired');
        }
        
        const component = orchestrator.getComponentTemplate(params.componentName);
        if (!component) {
          // Try app-specific components
          const appComponents = orchestrator.getComponentSpecs(session.context.appType);
          const appComponent = appComponents[params.componentName];
          
          if (!appComponent) {
            throw new Error(`Unknown component: ${params.componentName}`);
          }
          
          return {
            componentName: params.componentName,
            specification: appComponent,
            appType: session.context.appType
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
            protocolVersion: '2025-06-18',
            capabilities: {
              tools: {
                listChanged: true
              }
            },
            serverInfo: {
              name: 'simple-design-mcp-orchestrator',
              version: '3.1.0'
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
  console.log(`Simple Design MCP Orchestrator v3.1 running on ${HOST}:${PORT}`);
  console.log(`Orchestrating design workflows for Claude Code local execution`);
  
  if (isDevelopment) {
    console.log(`Available tools: ${tools.map(t => t.name).join(', ')}`);
    console.log(`Authentication: ${skipAuth ? 'DISABLED (dev mode)' : 'ENABLED'}`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
    console.log(`MCP Discovery: http://${HOST}:${PORT}/.well-known/mcp.json`);
  }
});

export default app;