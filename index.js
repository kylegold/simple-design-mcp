#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { z } from 'zod';
import { ConversationAgent } from './src/agents/ConversationAgent.js';
import { DesignAgent } from './src/agents/DesignAgent.js';
import { CodeGenerator } from './src/agents/CodeGenerator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');
const isDevelopment = process.env.NODE_ENV === 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: isDevelopment ? '*' : ['https://commands.com', 'https://api.commands.com'],
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

// Tool definitions
const tools = [
  {
    name: 'chat',
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
    },
    handler: async (params) => {
      const { message, conversationId = 'default' } = params;
      
      // Get or create conversation state
      let conversation = conversations.get(conversationId);
      if (!conversation) {
        conversation = {
          project: null,
          history: []
        };
        conversations.set(conversationId, conversation);
      }
      
      // Add to conversation history
      conversation.history.push({ role: 'user', message });
      
      // Process with conversation agent
      const response = await conversationAgent.process(
        message, 
        conversation.project, 
        conversation.history
      );
      
      // Update project state if needed
      if (response.projectUpdate) {
        conversation.project = { 
          ...conversation.project, 
          ...response.projectUpdate 
        };
      }
      
      // Add agent response to history
      conversation.history.push({ role: 'assistant', message: response.message });
      
      return {
        message: response.message,
        conversationId,
        project: conversation.project
      };
    }
  },
  {
    name: 'show',
    description: 'Show me what we\'ve designed so far',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'Conversation ID'
        }
      }
    },
    handler: async (params) => {
      const { conversationId = 'default' } = params;
      const conversation = conversations.get(conversationId);
      
      if (!conversation || !conversation.project) {
        return {
          preview: 'No project started yet! Tell me what you\'d like to build first.'
        };
      }
      
      const preview = await designAgent.generatePreview(conversation.project);
      return { preview };
    }
  },
  {
    name: 'export',
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
    },
    handler: async (params) => {
      const { path: exportPath, conversationId = 'default' } = params;
      const conversation = conversations.get(conversationId);
      
      if (!conversation || !conversation.project) {
        return {
          error: 'No project to export yet! Start by telling me what you want to build.'
        };
      }
      
      const projectPath = exportPath || `./${conversation.project.name}`;
      const files = await codeGenerator.generateProject(
        conversation.project, 
        projectPath
      );
      
      return {
        message: `✨ Your app is ready!\n\nCreated at: ${projectPath}\n\nTo run your app:\n\`\`\`bash\ncd ${projectPath}\nnpm install\nnpm start\n\`\`\`\n\nFiles created:\n${files.map(f => `  - ${f}`).join('\n')}\n\nYour app is production-ready with:\n- Clean, modular components\n- Modern UI library (${conversation.project.uiLibrary})\n- Responsive design\n- Accessibility built-in\n\nHappy building! 🚀`,
        projectPath,
        files
      };
    }
  },
  {
    name: 'examples',
    description: 'See examples of different app types for inspiration',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type of app (e.g., \'recipe\', \'fitness\', \'social\')'
        }
      }
    },
    handler: async (params) => {
      const { type } = params;
      const examples = await designAgent.getExamples(type);
      return { examples };
    }
  }
];

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
    schemaVersion: '2024-11-05',
    vendor: 'Commands.com',
    name: 'simple-design-mcp',
    version: '1.0.0',
    description: 'Design beautiful apps without coding - just tell me what you want to build!',
    license: 'MIT',
    capabilities: {
      tools: {
        listChanged: true
      }
    },
    serverInfo: {
      name: 'simple-design-mcp',
      version: '1.0.0'
    }
  });
});

// Root endpoint with basic info
app.get('/', (req, res) => {
  res.json({
    name: 'simple-design-mcp',
    description: 'Design beautiful apps without coding - just tell me what you want to build!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      discovery: '/.well-known/mcp.json',
      tools: '/mcp/tools',
      execute: '/mcp/tools/:toolName'
    },
    tools: tools.map(tool => `${tool.name} - ${tool.description}`)
  });
});

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
app.post('/mcp/tools/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const { params = {} } = req.body;
  
  // Log REST API calls in development
  if (isDevelopment) {
    console.log(`[REST] Tool execution: ${toolName} with params:`, params);
  }
  
  try {
    // Find the tool
    const tool = tools.find(t => t.name === toolName);
    if (!tool) {
      return res.status(404).json({
        error: {
          code: 404,
          message: `Tool '${toolName}' not found`
        }
      });
    }
    
    // Execute the tool
    const result = await tool.handler(params);
    
    // Return the result
    res.json({ result });
    
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    res.status(500).json({
      error: {
        code: 500,
        message: error.message || 'Internal server error'
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: {
      code: 500,
      message: 'Internal server error'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple Design MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP discovery: http://localhost:${PORT}/.well-known/mcp.json`);
  console.log(`Environment: ${isDevelopment ? 'development' : 'production'}`);
});