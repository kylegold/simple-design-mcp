#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { z } from 'zod';
import { ConversationAgent } from './src/agents/ConversationAgent.js';
import { DesignAgent } from './src/agents/DesignAgent.js';
import { CodeGenerator } from './src/agents/CodeGenerator.js';
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

// Simple in-memory state for conversations
const conversations = new Map();

// Initialize agents
const conversationAgent = new ConversationAgent();
const designAgent = new DesignAgent();
const codeGenerator = new CodeGenerator();

// Tool definitions for MCP
const tools = [
  {
    name: 'simple_design_chat',
    description: 'Tell me what you want to build or change - just describe it naturally!',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Tell me what you want to build or change'
        },
        conversationId: {
          type: 'string',
          description: 'Optional conversation ID to continue a previous conversation'
        }
      },
      required: ['message']
    }
  },
  {
    name: 'simple_design_show',
    description: 'Show me what we\'ve designed so far',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'Conversation ID'
        }
      }
    }
  },
  {
    name: 'simple_design_export',
    description: 'Generate the actual app code when you\'re ready',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Where to export (defaults to current directory)'
        },
        conversationId: {
          type: 'string',
          description: 'Conversation ID'
        }
      }
    }
  },
  {
    name: 'simple_design_examples',
    description: 'See examples of different app types for inspiration',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type of app (e.g., \'recipe\', \'fitness\', \'social\')'
        }
      }
    }
  }
];

// Helper function to send streaming responses for SSE-enabled gateways
function sendStreamingResponse(res, result, id) {
  // Set headers for SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Send the complete JSON-RPC response as a single SSE event
  const response = { jsonrpc: '2.0', result, id };
  res.write(`data: ${JSON.stringify(response)}\n\n`);
  
  // End the response
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
    version: '1.0.0'
  });
});

// MCP discovery endpoint
app.get('/.well-known/mcp.json', (req, res) => {
  res.json({
    schemaVersion: "2024-11-05",
    vendor: "Commands.com",
    name: "simple-design-mcp",
    version: "1.0.0",
    description: "Design beautiful apps without coding - just tell me what you want to build!",
    license: "PROPRIETARY",
    capabilities: {
      tools: {
        listChanged: true
      }
    },
    serverInfo: {
      name: "simple-design-mcp",
      version: "1.0.0"
    }
  });
});

// Root endpoint with basic info
app.get('/', (req, res) => {
  res.json({
    name: "simple-design-mcp",
    description: "Design beautiful apps without coding - just tell me what you want to build!",
    version: "1.0.0",
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
    // Mock user for development
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
  const conversationId = params.conversationId || 'default';
  
  switch (toolName) {
    case 'simple_design_chat':
      if (!params.message) {
        throw new Error('Message is required');
      }
      
      // Get or create conversation
      let conversation = conversations.get(conversationId);
      if (!conversation) {
        conversation = {
          id: conversationId,
          messages: [],
          designState: null
        };
        conversations.set(conversationId, conversation);
      }
      
      // Process the message through our agents
      const analysisResult = await conversationAgent.analyzeDescription(params.message);
      
      if (analysisResult.needsDesign) {
        // Generate design
        const designResult = await designAgent.generateDesign(analysisResult);
        conversation.designState = designResult;
        conversation.messages.push({
          type: 'user',
          content: params.message,
          timestamp: new Date().toISOString()
        });
        conversation.messages.push({
          type: 'assistant',
          content: designResult.summary,
          timestamp: new Date().toISOString()
        });
        
        return `Great! I've designed your ${analysisResult.appType} app. Here's what I created:

${designResult.summary}

Key features:
${designResult.features.map(f => `• ${f}`).join('\n')}

Screens designed:
${designResult.components && designResult.components.length > 0 
  ? designResult.components.map(c => `• ${c.name}: ${c.purpose}`).join('\n')
  : '• (Design in progress...)'}

Use "Show Design" to see the full details, or tell me what you'd like to change!`;
      } else {
        // Just conversation
        conversation.messages.push({
          type: 'user',
          content: params.message,
          timestamp: new Date().toISOString()
        });
        
        const response = `I understand you want to work on: ${analysisResult.intent}

Could you tell me more about what type of app you'd like to build? For example:
• A recipe app for sharing cooking ideas
• A fitness tracker for workouts
• A social app for connecting with friends
• A productivity app for task management

The more details you give me, the better I can design it for you!`;
        
        conversation.messages.push({
          type: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        });
        
        return response;
      }
      
    case 'simple_design_show':
      const showConversation = conversations.get(conversationId);
      if (!showConversation || !showConversation.designState) {
        return "No design created yet. Start by telling me what you want to build!";
      }
      
      const design = showConversation.designState;
      return `## ${design.appName || 'Your App'}

**Type:** ${design.appType}
**Platform:** ${design.platform}

**Description:**
${design.description}

**Key Features:**
${design.features.map(f => `• ${f}`).join('\n')}

**User Experience Flow:**
${design.userFlow}

**Screens & Components:**
${designAgent.formatComponents(design.components)}

**Technical Stack:**
• Frontend: ${design.techStack.frontend}
• Styling: ${design.techStack.styling}
• State: ${design.techStack.state}
• Navigation: ${design.techStack.navigation}`;

    case 'simple_design_export':
      const exportConversation = conversations.get(conversationId);
      if (!exportConversation || !exportConversation.designState) {
        return "No design to export. Start by telling me what you want to build!";
      }
      
      const exportPath = params.path || './my-app';
      const generatedCode = await codeGenerator.generateApp(exportConversation.designState, exportPath);
      
      return `✅ App code generated successfully!

**Generated files:**
${generatedCode.files.map(f => `• ${f.path}`).join('\n')}

**Next steps:**
1. Navigate to: cd ${exportPath}
2. Install dependencies: npm install
3. Start development: npm start

Your ${exportConversation.designState.platform} app is ready to run!`;

    case 'simple_design_examples':
      const appType = params.type || 'general';
      const examples = {
        recipe: "🍳 Recipe App Example:\n• Browse recipes by cuisine\n• Save favorites\n• Shopping list generator\n• Step-by-step cooking mode",
        fitness: "💪 Fitness App Example:\n• Workout tracking\n• Progress photos\n• Exercise library\n• Personal trainer chat",
        social: "👥 Social App Example:\n• User profiles\n• Photo/video sharing\n• Comments and likes\n• Direct messaging",
        general: "Here are some popular app types I can help you design:\n• Recipe apps\n• Fitness trackers\n• Social networks\n• E-commerce stores\n• Productivity tools\n\nJust tell me what you want to build!"
      };
      
      return examples[appType] || examples.general;
      
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Main JSON-RPC endpoint
app.post('/', async (req, res) => {
  // Check if client supports SSE
  const acceptsSSE = req.headers.accept?.includes('text/event-stream');
  
  // Handle JSON-RPC request
  const { method, params, id, jsonrpc } = req.body;
  
  // Methods that don't require authentication
  const publicMethods = ['initialize', 'notifications/initialized', 'tools/list'];
  
  // Check authentication for protected methods
  if (!publicMethods.includes(method)) {
    // Apply authentication check
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
    
    // If we have a token, verify it
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
      // Mock user for development
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
              version: '1.0.0'
            }
          },
          id
        });
        
      case 'notifications/initialized':
        // Notification - no response needed
        return res.status(200).end();
        
      case 'tools/list':
        const toolsResult = {
          tools: tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }))
        };
        
        // Use SSE if client supports it
        if (acceptsSSE) {
          return sendStreamingResponse(res, toolsResult, id);
        }
        
        return res.json({
          jsonrpc: '2.0',
          result: toolsResult,
          id
        });
        
      case 'resources/list':
        const resourcesResult = {
          resources: []
        };
        
        // Use SSE if client supports it
        if (acceptsSSE) {
          return sendStreamingResponse(res, resourcesResult, id);
        }
        
        return res.json({
          jsonrpc: '2.0',
          result: resourcesResult,
          id
        });
        
      case 'prompts/list':
        const promptsResult = {
          prompts: []
        };
        
        // Use SSE if client supports it
        if (acceptsSSE) {
          return sendStreamingResponse(res, promptsResult, id);
        }
        
        return res.json({
          jsonrpc: '2.0',
          result: promptsResult,
          id
        });
        
      case 'tools/call':
        // Handle tool execution
        const { name: toolName, arguments: toolArgs } = params;
        
        // Log tool calls in development
        if (isDevelopment) {
          console.log(`[MCP] Tool call: ${toolName} with args:`, toolArgs);
        }
        
        try {
          const result = await handleTool(toolName, toolArgs || {}, req.user);
          
          // Format response according to MCP spec
          const toolResult = {
            content: [
              {
                type: 'text',
                text: result
              }
            ]
          };
          
          // Use SSE if client supports it
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
  console.log(`Simple Design MCP Server running on ${HOST}:${PORT}`);
  
  if (isDevelopment) {
    console.log(`Available tools: ${tools.map(t => t.name).join(', ')}`);
    console.log(`Authentication: ${skipAuth ? 'DISABLED (dev mode)' : 'ENABLED'}`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
    console.log(`MCP Discovery: http://${HOST}:${PORT}/.well-known/mcp.json`);
  }
});

export default app;