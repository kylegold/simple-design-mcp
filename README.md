# Simple Design MCP Orchestrator v3.0

Orchestrates app design workflows for Claude Code local execution - no more rate limits! 🎯

## What's New in v3.0 - The Orchestrator Architecture

### The Problem We Solved
- **v2.0 Issue**: MCP server did all the work, hitting rate limits (100 req/min)
- **v3.0 Solution**: MCP returns workflows, Claude Code executes locally using YOUR tokens

### How It Works Now
```
User → Commands.com → MCP Orchestrator → Workflow Instructions → Claude Code (local execution) → Success!
```

## Key Benefits

1. **🚀 No Rate Limits** - Uses your Claude Code tokens, not the server's
2. **⚡ Faster Execution** - No network roundtrips for AI calls
3. **🔍 Full Transparency** - See exactly what's happening
4. **🛡️ Better Privacy** - Your data stays on your machine
5. **📈 Infinitely Scalable** - Server just returns instructions

## Available Orchestration Tools

### 🎼 `simple_design_orchestrate`
Get a complete workflow for designing apps - returns instructions for Claude Code to execute locally.

**Parameters:**
- `task`: The design task (`create_app`, `update_design`, `add_component`)
- `input`: Task-specific parameters

**Example Response:**
```json
{
  "workflowId": "create_app_1234567890",
  "workflow": {
    "name": "Create App Workflow",
    "steps": [/* step-by-step instructions */]
  },
  "agents": {/* agent templates */},
  "components": {/* component specs */},
  "estimatedTokens": 4800
}
```

### 🤖 `simple_design_get_agent`
Get specific agent templates for local execution.

**Parameters:**
- `agentName`: Name of the agent (e.g., "DesignBrief", "UXFlow")
- `action`: Optional specific action

### 🧩 `simple_design_get_component`
Get component specifications for UI building.

**Parameters:**
- `componentName`: Component to get specs for
- `appType`: Optional app type for context

## How Commands Work

### Creating an App
**You type:** `/design-app "recipe sharing app"`

**What happens:**
1. MCP orchestrator analyzes your request
2. Returns a workflow with:
   - Design Brief agent template
   - UX Flow generation instructions
   - UI component specifications
   - File structure guidelines
3. Claude Code executes each step locally
4. HTML/CSS files created on your machine
5. No rate limits!

### Updating a Design
**You type:** `/update-design "make the header blue"`

**What happens:**
1. Orchestrator returns change analysis workflow
2. Claude Code analyzes the change locally
3. Updates files using your resources
4. Instant results, no server load

## Architecture Overview

### Core Components

1. **WorkflowOrchestrator** - Main orchestration engine
2. **AgentTemplates** - Lightweight agent instructions
3. **ComponentSpecs** - UI component specifications
4. **WorkflowDefinitions** - Complete workflow structures

### Agent Templates
- `DesignBrief` - Analyzes app requirements
- `UXFlow` - Creates screen structure
- `UIGenerator` - Selects UI components
- `FileCreator` - Generates file structure
- `ChangeAnalyzer` - Understands update requests
- `ComponentIntegrator` - Adds new components

### Component Library
- Navigation: navbar, sidebar
- Layout: hero, grid, container
- Content: cards, galleries, testimonials
- Forms: search, inputs, buttons
- Data: charts, stats, tables
- App-specific: recipe cards, workout cards, etc.

## Installation & Setup

1. **Deploy to Railway** (or your preferred platform)
2. **Import to Commands.com**
3. **Use with Claude Code**

No local installation needed - it's all orchestrated!

## For Developers

### Testing Locally
```bash
npm install
npm test  # Run orchestrator tests
```

### Example Integration
```javascript
// Get workflow from orchestrator
const workflow = await mcp.call('simple_design_orchestrate', {
  task: 'create_app',
  input: { description: 'fitness app' }
});

// Execute locally in Claude Code
for (const step of workflow.steps) {
  await executeStep(step, workflow.agents[step.agent]);
}
```

## Migration from v2.0

See [MIGRATION.md](MIGRATION.md) for upgrade instructions.

## Support

- **Issues**: [GitHub Issues](https://github.com/kylegold/simple-design-mcp/issues)
- **Docs**: See `/examples` folder
- **Version**: 3.0.0

---

Built with ❤️ to solve rate limiting and empower local execution!