/**
 * LightweightResponse.js - Creates minimal responses to avoid overwhelming Commands.com
 */

export function createLightweightResponse(fullWorkflow) {
  const { workflowId, task, workflow, context, estimatedTokens } = fullWorkflow;
  
  // Return a minimal response with instructions to fetch details separately
  return {
    workflowId,
    task,
    status: 'ready',
    summary: workflow.description,
    
    // Just the step names and agents, not full details
    steps: workflow.steps.map(step => ({
      id: step.id,
      name: step.name,
      agent: step.agent,
      action: step.action
    })),
    
    // Basic context without full descriptions
    context: {
      appType: context.appType,
      projectName: context.projectName || generateProjectName(context.appType),
      path: context.path
    },
    
    // Instructions for Claude Code
    instructions: `To execute this workflow:
1. Call simple_design_get_agent for each agent in the steps
2. Execute each step using the agent templates
3. Create files in ${context.path || './'}

Estimated tokens: ${estimatedTokens.estimated}`,
    
    // Tell Claude Code how to get full details
    nextActions: [
      'Use simple_design_get_agent to get agent templates',
      'Use simple_design_get_component to get UI components'
    ]
  };
}

function generateProjectName(appType) {
  const timestamp = Date.now().toString().slice(-4);
  return `${appType}-app-${timestamp}`;
}