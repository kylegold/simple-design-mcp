/**
 * WorkflowOrchestrator - Returns lightweight workflows for Claude Code to execute locally
 * This is the core of the new architecture where MCP acts as a conductor, not performer
 */
import { AgentTemplates, getAgentTemplate } from './AgentTemplates.js';
import { ComponentSpecs, getComponentSpec, getAppComponents } from './ComponentSpecs.js';
import { WorkflowDefinitions, getWorkflowDefinition, resolveWorkflowSteps } from './WorkflowDefinitions.js';

export class WorkflowOrchestrator {
  constructor() {
    this.workflows = WorkflowDefinitions;
    this.agentTemplates = AgentTemplates;
    this.componentSpecs = ComponentSpecs;
  }

  /**
   * Get orchestration instructions for a task
   */
  orchestrate(task, input) {
    const workflow = getWorkflowDefinition(task);
    if (!workflow) {
      throw new Error(`Unknown task: ${task}`);
    }

    // Generate a unique workflow ID
    const workflowId = `${task}_${Date.now()}`;

    // Build the workflow context
    const context = this.buildContext(task, input);

    // Get resolved workflow steps
    const resolvedSteps = resolveWorkflowSteps(workflow, context);

    // Get relevant agent templates
    const agentNames = this.extractAgentNames(resolvedSteps);
    const agents = this.getAgentTemplates(agentNames);

    // Get component specifications if needed
    const components = task.includes('app') ? 
      this.getComponentSpecs(context.appType) : {};

    return {
      workflowId,
      task,
      workflow: {
        name: workflow.name,
        description: workflow.description,
        steps: resolvedSteps,
        artifacts: workflow.artifacts
      },
      context,
      agents,
      components,
      instructions: this.generateInstructions(task, context),
      estimatedTokens: this.estimateTokenUsage(resolvedSteps)
    };
  }

  /**
   * Extract agent names from workflow steps
   */
  extractAgentNames(steps) {
    const agentNames = new Set();
    
    for (const step of steps) {
      if (step.agent) {
        agentNames.add(step.agent);
      }
      
      // Check branch steps too
      if (step.branch) {
        for (const branchStep of step.branch) {
          if (branchStep.agent) {
            agentNames.add(branchStep.agent);
          }
        }
      }
    }
    
    return Array.from(agentNames);
  }



  /**
   * Build context from input
   */
  buildContext(task, input) {
    const context = {
      task,
      timestamp: new Date().toISOString(),
      ...input
    };

    // Infer app type if creating an app
    if (task === 'create_app' && input.description) {
      context.appType = this.inferAppType(input.description);
    }

    return context;
  }

  /**
   * Infer app type from description
   */
  inferAppType(description) {
    const lower = description.toLowerCase();
    
    const typePatterns = {
      recipe: /recipe|food|cook|dish|meal|cuisine/,
      fitness: /fitness|workout|exercise|gym|health|training/,
      social: /social|connect|share|friend|community|network/,
      ecommerce: /shop|store|product|buy|sell|commerce/,
      productivity: /task|todo|manage|organize|track|project/
    };

    for (const [type, pattern] of Object.entries(typePatterns)) {
      if (pattern.test(lower)) {
        return type;
      }
    }

    return 'general';
  }

  /**
   * Get agent templates for workflow
   */
  getAgentTemplates(agentNames) {
    const templates = {};
    for (const name of agentNames) {
      const agent = getAgentTemplate(name);
      if (agent) {
        templates[name] = agent;
      }
    }
    return templates;
  }

  /**
   * Get component specs for app type
   */
  getComponentSpecs(appType) {
    return getAppComponents(appType);
  }

  /**
   * Generate human-readable instructions
   */
  generateInstructions(task, context) {
    const instructions = {
      create_app: `I'll help you create a ${context.appType || 'web'} app. Here's what I'll do:

1. Analyze your requirements to understand what you need
2. Design the user experience flow and screens
3. Select appropriate UI components for each screen
4. Generate the HTML/CSS files with responsive design

This will create a fully functional prototype you can view in your browser immediately.`,

      update_design: `I'll update your design based on your request. Here's the process:

1. Analyze what needs to be changed
2. Update the relevant components or styles
3. Modify the HTML/CSS files accordingly

Your changes will be visible immediately with auto-refresh.`,

      add_component: `I'll add the requested component to your design:

1. Select the appropriate component from the library
2. Integrate it into your existing layout
3. Update the files with the new component

The component will match your existing design style.`
    };

    return instructions[task] || 'I\'ll help you with your design task.';
  }

  /**
   * Estimate token usage for workflow steps
   */
  estimateTokenUsage(steps) {
    // Rough estimates for planning
    const agentTokens = {
      DesignBrief: 500,
      UXFlow: 800,
      UIGenerator: 1500,
      FileCreator: 2000,
      ChangeAnalyzer: 300,
      UIUpdater: 1000,
      FileUpdater: 1200,
      ComponentIntegrator: 800
    };

    let total = 0;
    for (const step of steps) {
      if (step.agent) {
        total += agentTokens[step.agent] || 500;
      }
      
      // Handle forEach multiplier
      if (step.forEach && Array.isArray(step.forEach)) {
        total *= step.forEach.length;
      }
    }

    return {
      estimated: total,
      note: 'Tokens used by Claude Code locally, not MCP server'
    };
  }

  /**
   * Get specific component template
   */
  getComponentTemplate(componentName) {
    return getComponentSpec(componentName);
  }

  /**
   * Get workflow status (for multi-step workflows)
   */
  getWorkflowStatus(workflowId) {
    // In production, this would track workflow progress
    return {
      workflowId,
      status: 'ready',
      completedSteps: [],
      currentStep: null,
      remainingSteps: []
    };
  }
}