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

// Initialize orchestrator
const orchestrator = new WorkflowOrchestrator();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['https://commands.com', 'https://api.commands.com'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Tool definitions
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
          description: 'Task-specific input parameters'
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
        agentName: { type: 'string' },
        action: { type: 'string' }
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
        componentName: { type: 'string' },
        appType: { type: 'string' }
      },
      required: ['componentName']
    }
  }
];

// Tool handler
async function handleTool(toolName, params, user) {
  switch (toolName) {
    case 'simple_design_orchestrate':
      const workflow = orchestrator.orchestrate(params.task, params.input);
      return createLightweightResponse(workflow);
      
    case 'simple_design_get_agent':
      const agent = orchestrator.agentTemplates[params.agentName];
      if (!agent) throw new Error(`Unknown agent: ${params.agentName}`);
      return {
        agentName: params.agentName,
        action: params.action || 'all',
        template: params.action ? agent[params.action] : agent
      };
      
    case 'simple_design_get_component':
      const component = orchestrator.getComponentTemplate(params.componentName);
      if (!component) {
        const appComponents = orchestrator.getComponentSpecs(params.appType || 'general');
        const appComponent = appComponents[params.componentName];
        if (!appComponent) throw new Error(`Unknown component: ${params.componentName}`);
        return { componentName: params.componentName, appType: params.appType, specification: appComponent };
      }
      return { componentName: params.componentName, specification: component };
      
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'simple-design-mcp-orchestrator',
    version: '3.0.0'
  });
});

// MCP discovery
app.get('/.well-known/mcp.json', (req, res) => {
  res.json({
    schemaVersion: "2024-11-05",
    vendor: "Commands.com",
    name: "simple-design-mcp-orchestrator",
    version: "3.0.0",
    description: "Orchestrates app design workflows for Claude Code local execution",
    license: "PROPRIETARY",
    capabilities: {
      tools: { listChanged: true }
    },
    serverInfo: {
      name: "simple-design-mcp-orchestrator",
      version: "3.0.0"
    }
  });
});

// REST endpoints
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  });
});

app.post('/mcp/tools/:toolName', skipAuth ? (req, res, next) => next() : verifyJwt, async (req, res) => {
  const { toolName } = req.params;
  const { params = {} } = req.body;
  
  try {
    const result = await handleTool(toolName, params, req.user);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Main JSON-RPC endpoint
app.post('/', async (req, res) => {
  const { method, params, id, jsonrpc } = req.body;
  
  if (jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request - jsonrpc must be "2.0"' },
      id: id || null
    });
  }
  
  // Public methods that don't require auth
  const publicMethods = ['initialize', 'notifications/initialized', 'tools/list'];
  
  // Check auth for protected methods
  if (!publicMethods.includes(method) && !skipAuth) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return res.status(401).json({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Authentication required' },
        id: id || null
      });
    }
    
    // Verify token manually for JSON-RPC
    const { default: jwt } = await import('jsonwebtoken');
    const { default: jwksRsa } = await import('jwks-rsa');
    
    try {
      const client = jwksRsa({
        jwksUri: process.env.COMMANDS_JWKS_URL || 'https://api.commands.com/.well-known/jwks.json',
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5
      });
      
      await new Promise((resolve, reject) => {
        jwt.verify(token, (header, callback) => {
          client.getSigningKey(header.kid, (err, key) => {
            callback(err, key?.getPublicKey());
          });
        }, {
          algorithms: ['RS256'],
          issuer: process.env.COMMANDS_JWT_ISSUER || 'https://api.commands.com',
          audience: process.env.COMMANDS_JWT_AUDIENCE || 'commands.com'
        }, (err, decoded) => {
          if (err) reject(err);
          else {
            req.user = decoded;
            resolve();
          }
        });
      });
    } catch (err) {
      return res.status(401).json({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid or expired token' },
        id: id || null
      });
    }
  }
  
  try {
    switch (method) {
      case 'initialize':
        return res.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2025-06-18',
            capabilities: { tools: { listChanged: true } },
            serverInfo: { name: 'simple-design-mcp-orchestrator', version: '3.0.0' }
          },
          id
        });
        
      case 'notifications/initialized':
        return res.status(200).end();
        
      case 'tools/list':
        return res.json({
          jsonrpc: '2.0',
          result: { tools },
          id
        });
        
      case 'tools/call':
        const { name: toolName, arguments: toolArgs } = params;
        const result = await handleTool(toolName, toolArgs || {}, req.user);
        return res.json({
          jsonrpc: '2.0',
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          },
          id
        });
        
      default:
        return res.status(404).json({
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${method}` },
          id: id || null
        });
    }
  } catch (error) {
    return res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' },
      id: id || null
    });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Simple Design MCP Orchestrator v3.0 running on ${HOST}:${PORT}`);
  console.log(`Orchestrating design workflows for Claude Code local execution`);
});