/**
 * WorkflowDefinitions.js - Complete workflow specifications
 * These define the exact steps Claude Code should execute locally
 */

export const WorkflowDefinitions = {
  // Create App Workflow
  create_app: {
    id: 'create_app',
    name: 'Create App Workflow',
    description: 'Complete workflow for creating a new app from scratch',
    
    steps: [
      {
        id: 'analyze_requirements',
        name: 'Analyze Requirements',
        agent: 'DesignBrief',
        action: 'analyze',
        input: {
          source: 'context.description',
          params: {}
        },
        output: 'designBrief',
        validation: {
          required: ['appType', 'purpose', 'features']
        }
      },
      {
        id: 'generate_ux_flow',
        name: 'Generate UX Flow',
        agent: 'UXFlow',
        action: 'generate',
        input: {
          source: 'results.designBrief',
          params: {
            appType: '${results.designBrief.appType}',
            features: '${results.designBrief.features}'
          }
        },
        output: 'uxFlow',
        validation: {
          required: ['screens', 'navigation', 'userFlows']
        }
      },
      {
        id: 'design_screens',
        name: 'Design UI for Each Screen',
        agent: 'UIGenerator',
        action: 'generate',
        forEach: 'results.uxFlow.screens',
        input: {
          source: 'item',
          params: {
            screenName: '${item.name}',
            appType: '${results.designBrief.appType}',
            designStyle: '${results.designBrief.style}'
          }
        },
        output: 'screenDesigns',
        accumulate: true
      },
      {
        id: 'create_file_structure',
        name: 'Create Project Files',
        agent: 'FileCreator',
        action: 'create',
        input: {
          source: 'combined',
          params: {
            projectName: '${context.projectName}',
            screens: '${results.screenDesigns}',
            designBrief: '${results.designBrief}',
            path: '${context.path}'
          }
        },
        output: 'fileStructure'
      }
    ],
    
    artifacts: {
      files: [
        {
          path: '${projectName}/index.html',
          type: 'html',
          description: 'Main landing page'
        },
        {
          path: '${projectName}/assets/styles/main.css',
          type: 'css',
          description: 'Global styles and theme'
        },
        {
          path: '${projectName}/assets/styles/components.css',
          type: 'css',
          description: 'Component-specific styles'
        },
        {
          path: '${projectName}/assets/js/app.js',
          type: 'javascript',
          description: 'Interactive functionality'
        }
      ],
      screenFiles: {
        pattern: '${projectName}/${screenName}.html',
        forEach: 'screens'
      }
    },
    
    postProcess: [
      {
        action: 'addAutoRefresh',
        target: 'all HTML files',
        description: 'Add 3-second auto-refresh meta tag'
      },
      {
        action: 'generateManifest',
        output: '${projectName}/manifest.json',
        description: 'Create project manifest with metadata'
      }
    ]
  },

  // Update Design Workflow
  update_design: {
    id: 'update_design',
    name: 'Update Design Workflow',
    description: 'Workflow for modifying existing designs',
    
    prerequisites: [
      {
        check: 'projectExists',
        params: {
          projectName: '${context.projectName}'
        },
        errorMessage: 'Project not found. Create a project first.'
      }
    ],
    
    steps: [
      {
        id: 'analyze_change',
        name: 'Analyze Change Request',
        agent: 'ChangeAnalyzer',
        action: 'analyze',
        input: {
          source: 'context.request',
          params: {
            currentState: '${context.currentProject}'
          }
        },
        output: 'changeSpec'
      },
      {
        id: 'apply_changes',
        name: 'Apply Design Changes',
        conditional: {
          if: 'changeSpec.changeType',
          branches: {
            style: 'updateStyles',
            layout: 'updateLayout',
            component: 'updateComponents',
            content: 'updateContent',
            navigation: 'updateNavigation'
          }
        }
      }
    ],
    
    branches: {
      updateStyles: [
        {
          id: 'modify_css',
          name: 'Update CSS Variables',
          action: 'modifyFile',
          target: 'assets/styles/main.css',
          modifications: '${changeSpec.modifications}'
        }
      ],
      updateLayout: [
        {
          id: 'restructure_html',
          name: 'Update HTML Structure',
          action: 'modifyFiles',
          targets: '${changeSpec.scope}',
          modifications: '${changeSpec.modifications}'
        }
      ],
      updateComponents: [
        {
          id: 'integrate_component',
          name: 'Add/Update Component',
          agent: 'ComponentIntegrator',
          action: 'integrate',
          input: {
            component: '${changeSpec.component}',
            target: '${changeSpec.targetLocation}'
          }
        }
      ]
    }
  },

  // Add Component Workflow
  add_component: {
    id: 'add_component',
    name: 'Add Component Workflow',
    description: 'Workflow for adding new components to existing design',
    
    steps: [
      {
        id: 'select_component',
        name: 'Select Component',
        action: 'selectFromLibrary',
        input: {
          request: '${context.component_request}',
          appType: '${context.appType}'
        },
        output: 'selectedComponent'
      },
      {
        id: 'customize_component',
        name: 'Customize Component',
        action: 'applyCustomization',
        input: {
          component: '${selectedComponent}',
          style: '${context.currentStyle}',
          props: '${context.componentProps}'
        },
        output: 'customizedComponent'
      },
      {
        id: 'integrate_component',
        name: 'Integrate into Design',
        agent: 'ComponentIntegrator',
        action: 'integrate',
        input: {
          component: '${customizedComponent}',
          targetScreen: '${context.targetScreen}',
          position: '${context.position}'
        },
        output: 'integration'
      },
      {
        id: 'update_files',
        name: 'Update Project Files',
        action: 'updateFiles',
        input: {
          htmlChanges: '${integration.htmlChanges}',
          cssChanges: '${integration.cssChanges}',
          jsChanges: '${integration.jsChanges}'
        }
      }
    ]
  },

  // Export to React Workflow
  export_react: {
    id: 'export_react',
    name: 'Export to React Workflow',
    description: 'Convert HTML design to React components',
    
    steps: [
      {
        id: 'analyze_structure',
        name: 'Analyze HTML Structure',
        action: 'parseHTMLFiles',
        input: {
          projectPath: '${context.projectPath}'
        },
        output: 'htmlStructure'
      },
      {
        id: 'extract_components',
        name: 'Extract React Components',
        action: 'htmlToReactComponents',
        input: {
          html: '${htmlStructure}',
          componentize: true
        },
        output: 'reactComponents'
      },
      {
        id: 'create_react_project',
        name: 'Setup React Project',
        action: 'createReactStructure',
        input: {
          projectName: '${context.projectName}-react',
          components: '${reactComponents}'
        },
        output: 'reactProject'
      },
      {
        id: 'generate_react_files',
        name: 'Generate React Files',
        action: 'writeReactFiles',
        input: {
          components: '${reactComponents}',
          routing: '${reactProject.routing}',
          state: '${reactProject.state}'
        }
      }
    ],
    
    artifacts: {
      structure: {
        'src/': ['components/', 'pages/', 'styles/', 'utils/'],
        'public/': ['index.html', 'manifest.json'],
        root: ['package.json', 'README.md', '.gitignore']
      }
    }
  }
};

/**
 * Get workflow definition by ID
 */
export function getWorkflowDefinition(workflowId) {
  return WorkflowDefinitions[workflowId] || null;
}

/**
 * Get all workflow IDs
 */
export function getAllWorkflowIds() {
  return Object.keys(WorkflowDefinitions);
}

/**
 * Validate workflow prerequisites
 */
export function validatePrerequisites(workflow, context) {
  if (!workflow.prerequisites) return { valid: true };
  
  for (const prereq of workflow.prerequisites) {
    // In real implementation, would check actual conditions
    if (prereq.check === 'projectExists' && !context.projectName) {
      return {
        valid: false,
        error: prereq.errorMessage
      };
    }
  }
  
  return { valid: true };
}

/**
 * Get workflow steps with resolved parameters
 */
export function resolveWorkflowSteps(workflow, context, results = {}) {
  const resolvedSteps = [];
  
  for (const step of workflow.steps) {
    const resolvedStep = { ...step };
    
    // Resolve input parameters
    if (step.input) {
      resolvedStep.input = resolveParameters(step.input, context, results);
    }
    
    // Handle forEach loops
    if (step.forEach) {
      const items = resolveValue(step.forEach, context, results);
      if (Array.isArray(items)) {
        resolvedStep.forEach = items;
      }
    }
    
    // Handle conditional branches
    if (step.conditional) {
      const condition = resolveValue(step.conditional.if, context, results);
      const branch = step.conditional.branches[condition];
      if (branch && workflow.branches[branch]) {
        resolvedStep.branch = workflow.branches[branch];
      }
    }
    
    resolvedSteps.push(resolvedStep);
  }
  
  return resolvedSteps;
}

/**
 * Helper to resolve template strings
 */
function resolveValue(template, context, results) {
  if (typeof template !== 'string') return template;
  
  return template.replace(/\${([^}]+)}/g, (match, path) => {
    const parts = path.split('.');
    let value = parts[0] === 'context' ? context : results;
    
    for (let i = 1; i < parts.length; i++) {
      value = value?.[parts[i]];
    }
    
    return value || match;
  });
}

/**
 * Helper to resolve parameters object
 */
function resolveParameters(params, context, results) {
  const resolved = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      resolved[key] = resolveParameters(value, context, results);
    } else {
      resolved[key] = resolveValue(value, context, results);
    }
  }
  
  return resolved;
}