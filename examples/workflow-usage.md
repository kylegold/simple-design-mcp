# Simple Design Orchestrator - Workflow Usage Examples

This document shows how Claude Code uses the orchestrator to execute design workflows locally.

## How It Works

1. **User**: Requests a design task through Commands.com
2. **MCP Orchestrator**: Returns a workflow (instructions, not execution)
3. **Claude Code**: Executes the workflow locally using user's tokens
4. **Result**: No rate limits because work happens on user's machine

## Example 1: Creating a New App

### Step 1: Get the Workflow
```javascript
// Claude Code calls the orchestrator
const workflow = await mcp.call('simple_design_orchestrate', {
  task: 'create_app',
  input: {
    description: 'I want to build a recipe sharing app',
    path: './my-recipe-app'
  }
});
```

### Step 2: Orchestrator Returns Workflow
```json
{
  "workflowId": "create_app_1234567890",
  "task": "create_app",
  "workflow": {
    "name": "Create App Workflow",
    "description": "Analyzes requirements and generates a complete app design",
    "steps": [
      {
        "agent": "DesignBrief",
        "action": "analyze",
        "input": "user_description",
        "output": "design_brief",
        "instruction": "Analyze the app description and extract key requirements"
      },
      {
        "agent": "UXFlow",
        "action": "generate",
        "input": "design_brief",
        "output": "ux_flow",
        "instruction": "Create user flows and screen structure"
      }
    ]
  },
  "context": {
    "task": "create_app",
    "timestamp": "2025-07-30T21:00:00.000Z",
    "description": "I want to build a recipe sharing app",
    "path": "./my-recipe-app",
    "appType": "recipe"
  },
  "agents": {
    "DesignBrief": {
      "analyze": {
        "prompt": "Given the app description: \"{description}\"...",
        "example": { /* example output */ }
      }
    },
    "UXFlow": {
      "generate": {
        "prompt": "Given the app type: \"{appType}\"...",
        "patterns": { /* app-specific patterns */ }
      }
    }
  },
  "components": {
    "navbar": { /* component spec */ },
    "recipe-card": { /* component spec */ }
  },
  "instructions": "I'll help you create a recipe app. Here's what I'll do...",
  "estimatedTokens": {
    "estimated": 4800,
    "note": "Tokens used by Claude Code locally, not MCP server"
  }
}
```

### Step 3: Claude Code Executes Locally
```javascript
// Claude Code runs each step using the provided templates
for (const step of workflow.steps) {
  const agent = workflow.agents[step.agent];
  const agentMethod = agent[step.action];
  
  // Execute the agent locally using the template
  const result = await executeAgent(agentMethod, workflow.context);
  
  // Store result for next step
  workflow.context[step.output] = result;
}

// Generate files based on the workflow results
await generateFiles(workflow.context);
```

## Example 2: Updating a Design

### Request
```javascript
const workflow = await mcp.call('simple_design_orchestrate', {
  task: 'update_design',
  input: {
    request: 'make the primary color blue',
    projectName: 'recipe-app-1234'
  }
});
```

### Response
The orchestrator returns:
- Change analysis templates
- UI update instructions
- File modification patterns
- No actual file changes (Claude Code does this)

## Example 3: Getting Component Specs

### Request
```javascript
const component = await mcp.call('simple_design_get_component', {
  componentName: 'recipe-card',
  appType: 'recipe'
});
```

### Response
```json
{
  "componentName": "recipe-card",
  "specification": {
    "type": "component",
    "props": {
      "title": { "type": "string", "required": true },
      "image": { "type": "string", "required": true },
      "cookTime": { "type": "string", "required": false },
      "difficulty": { "type": "string", "required": false }
    },
    "variants": ["default", "compact", "featured"],
    "responsive": true
  }
}
```

## Benefits of This Architecture

1. **No Rate Limits**: All AI calls happen on user's machine
2. **User's Tokens**: Uses Claude Code's tokens, not MCP server's
3. **Scalable**: MCP server only returns lightweight instructions
4. **Flexible**: Claude Code can adapt workflows as needed
5. **Transparent**: Users see exactly what's happening

## Migration Path

For existing users:
1. The MCP server returns workflows instead of generated content
2. Claude Code executes these workflows locally
3. Same end result, but using user's resources
4. No more 429 rate limit errors!