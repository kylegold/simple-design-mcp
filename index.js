#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ConversationAgent } from "./src/agents/ConversationAgent.js";
import { DesignAgent } from "./src/agents/DesignAgent.js";
import { CodeGenerator } from "./src/agents/CodeGenerator.js";
import { promises as fs } from "fs";
import path from "path";

// Simple in-memory state for current conversation
let currentProject = null;
let conversationHistory = [];

async function main() {
  const server = new Server(
    {
      name: "simple-design-mcp",
      version: "1.0.0",
      description: "Design beautiful apps without coding - just tell me what you want to build!"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Initialize agents
  const conversationAgent = new ConversationAgent();
  const designAgent = new DesignAgent();
  const codeGenerator = new CodeGenerator();

  // Tool schemas
  const chatSchema = z.object({
    message: z.string().describe("Tell me what you want to build or change")
  });

  const showSchema = z.object({});

  const exportSchema = z.object({
    path: z.string().optional().describe("Where to export (defaults to current directory)")
  });

  const examplesSchema = z.object({
    type: z.string().optional().describe("Type of app (e.g., 'recipe', 'fitness', 'social')")
  });

  // Tool handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "chat",
        description: "Tell me what you want to build or change - just describe it naturally!",
        inputSchema: chatSchema
      },
      {
        name: "show",
        description: "Show me what we've designed so far",
        inputSchema: showSchema
      },
      {
        name: "export",
        description: "Generate the actual app code when you're ready",
        inputSchema: exportSchema
      },
      {
        name: "examples",
        description: "See examples of different app types for inspiration",
        inputSchema: examplesSchema
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === "chat") {
        const { message } = chatSchema.parse(args);
        
        // Add to conversation history
        conversationHistory.push({ role: "user", message });
        
        // Process with conversation agent
        const response = await conversationAgent.process(message, currentProject, conversationHistory);
        
        // Update project state if needed
        if (response.projectUpdate) {
          currentProject = { ...currentProject, ...response.projectUpdate };
        }
        
        // Add agent response to history
        conversationHistory.push({ role: "assistant", message: response.message });
        
        return {
          content: [
            {
              type: "text",
              text: response.message
            }
          ]
        };
      }

      if (name === "show") {
        if (!currentProject) {
          return {
            content: [
              {
                type: "text",
                text: "No project started yet! Tell me what you'd like to build first."
              }
            ]
          };
        }

        const preview = await designAgent.generatePreview(currentProject);
        
        return {
          content: [
            {
              type: "text",
              text: preview
            }
          ]
        };
      }

      if (name === "export") {
        const { path: exportPath } = exportSchema.parse(args);
        
        if (!currentProject) {
          return {
            content: [
              {
                type: "text",
                text: "No project to export yet! Start by telling me what you want to build."
              }
            ]
          };
        }

        const projectPath = exportPath || `./${currentProject.name}`;
        const files = await codeGenerator.generateProject(currentProject, projectPath);
        
        return {
          content: [
            {
              type: "text",
              text: `✨ Your app is ready!\n\nCreated at: ${projectPath}\n\nTo run your app:\n\`\`\`bash\ncd ${projectPath}\nnpm install\nnpm start\n\`\`\`\n\nFiles created:\n${files.map(f => `  - ${f}`).join('\n')}\n\nYour app is production-ready with:\n- Clean, modular components\n- Modern UI library (${currentProject.uiLibrary})\n- Responsive design\n- Accessibility built-in\n\nHappy building! 🚀`
            }
          ]
        };
      }

      if (name === "examples") {
        const { type } = examplesSchema.parse(args);
        const examples = await designAgent.getExamples(type);
        
        return {
          content: [
            {
              type: "text",
              text: examples
            }
          ]
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Simple Design MCP Server running...");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});