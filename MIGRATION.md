# Migration Guide: v2.0 to v3.0 (Orchestrator Architecture)

## What's Changed

### v2.0 (Old Architecture)
- MCP server generated all HTML/CSS content
- Used server's API tokens for all AI operations
- Hit rate limits (100 requests/min) causing 429 errors
- All computation happened on the server

### v3.0 (New Orchestrator Architecture)
- MCP server returns lightweight workflows
- Claude Code executes workflows locally
- Uses YOUR tokens - no rate limits!
- All computation happens on your machine

## Why This Change?

The main issue with v2.0 was rate limiting. When the MCP server did all the work, it quickly hit Commands.com's rate limits (100 requests/minute). Users would see 429 errors and couldn't complete their designs.

With v3.0, the MCP server is just a "conductor" that tells Claude Code what to do. The actual work happens on your machine using your Claude Code tokens.

## What This Means For You

### Before (v2.0)
```
User → Commands.com → MCP Server (does all work) → Rate Limit! → Error
```

### After (v3.0)
```
User → Commands.com → MCP Server (returns workflow) → Claude Code (executes locally) → Success!
```

## New Tool Structure

### Old Tools (v2.0)
- `simple_design_create` - Generated HTML/CSS files
- `simple_design_update` - Modified existing designs
- `simple_design_preview` - Showed project status
- `simple_design_export_react` - Converted to React

### New Tools (v3.0)
- `simple_design_orchestrate` - Returns workflows for Claude Code
- `simple_design_get_agent` - Gets agent templates
- `simple_design_get_component` - Gets component specs

## How Commands Work Now

### Example: Creating an App

**You type:** `/design-app "recipe sharing app"`

**What happens:**
1. MCP server analyzes your request
2. Returns a workflow with:
   - Step-by-step instructions
   - Agent templates (prompts)
   - Component specifications
   - File structure guidelines
3. Claude Code executes each step locally
4. Files are created on your machine
5. No rate limits!

## Benefits

1. **No More Rate Limits** - Uses your tokens, not the server's
2. **Faster Execution** - No network roundtrips for each AI call
3. **More Transparent** - You see exactly what's happening
4. **More Flexible** - Claude Code can adapt workflows
5. **Better Privacy** - Your data stays on your machine

## For Developers

If you were using the MCP server programmatically:

### Old API Call
```javascript
const result = await mcp.call('simple_design_create', {
  description: 'recipe app',
  path: './my-app'
});
// Result: Generated files
```

### New API Call
```javascript
const workflow = await mcp.call('simple_design_orchestrate', {
  task: 'create_app',
  input: {
    description: 'recipe app',
    path: './my-app'
  }
});
// Result: Workflow instructions for local execution
```

## Backwards Compatibility

The commands (`/design-app`, `/update-design`, etc.) work the same way from a user perspective. The difference is all behind the scenes - better performance and no rate limits!

## Questions?

If you have any issues with the migration, please open an issue on GitHub:
https://github.com/kylegold/simple-design-mcp/issues