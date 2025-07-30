/**
 * AgentTemplates.js - Lightweight agent instructions for Claude Code execution
 * These are templates, not implementations - Claude Code executes them locally
 */

export const AgentTemplates = {
  // Design Brief Agent - Analyzes user requirements
  DesignBrief: {
    name: 'Design Brief Analyzer',
    description: 'Extracts structured requirements from natural language descriptions',
    methods: {
      analyze: {
        instructions: `You are analyzing an app description to extract structured requirements.

Given the user's description, identify and structure:
1. App Type (recipe, fitness, social, ecommerce, productivity, or general)
2. Core Purpose - The main problem it solves
3. Target Audience - Who will use this app
4. Key Features - 5-10 main features the user wants
5. Design Style - Modern, minimal, playful, professional, etc.
6. Color Preference - Any mentioned colors or mood
7. Special Requirements - Specific requests or constraints

Return a JSON object with these exact keys:
- appType: string
- purpose: string  
- audience: string
- features: string[]
- style: string
- colorHint: string (optional)
- requirements: string[] (optional)`,
        
        examples: [
          {
            input: "I want to build a recipe sharing app where home cooks can upload photos of their dishes and share recipes with the community",
            output: {
              appType: "recipe",
              purpose: "Share and discover home cooking recipes with photos",
              audience: "Home cooks and food enthusiasts",
              features: [
                "Recipe creation and editing",
                "Photo upload for dishes",
                "Recipe search and discovery",
                "User profiles and following",
                "Recipe collections/favorites",
                "Ingredient-based search",
                "Cooking time and difficulty filters",
                "Community ratings and reviews"
              ],
              style: "warm and inviting",
              colorHint: "warm colors like orange or red",
              requirements: ["Mobile-friendly", "Easy photo uploads"]
            }
          }
        ]
      }
    }
  },

  // UX Flow Agent - Creates screen structure and navigation
  UXFlow: {
    name: 'UX Flow Generator',
    description: 'Designs user flows and screen architecture',
    methods: {
      generate: {
        instructions: `You are designing the UX flow and screen structure for an app.

Based on the app type and features, create:
1. Complete list of screens needed
2. Navigation structure between screens
3. Main user journeys (2-3 key flows)
4. Information architecture

Use these standard patterns by app type:
- Recipe apps: home, browse, recipe-detail, create-recipe, profile
- Fitness apps: dashboard, workouts, exercises, progress, profile  
- Social apps: feed, post-detail, create-post, messages, profile
- Ecommerce: home, products, product-detail, cart, checkout
- Productivity: dashboard, projects, tasks, calendar, settings

Return a JSON object with:
- screens: array of {name, purpose, mainComponents}
- navigation: {type: "tab"|"drawer"|"stack", items: array}
- userFlows: array of {name, steps: array}
- dataStructure: object describing main entities`,
        
        patterns: {
          recipe: {
            screens: ['home', 'browse-recipes', 'recipe-detail', 'create-recipe', 'my-recipes', 'profile', 'search'],
            navigation: 'tab',
            mainFlow: 'home → browse → recipe-detail → save'
          },
          fitness: {
            screens: ['dashboard', 'workouts', 'exercises', 'progress', 'profile', 'settings'],
            navigation: 'tab',
            mainFlow: 'dashboard → start-workout → log-exercises → view-progress'
          }
        }
      }
    }
  },

  // UI Generator Agent - Selects components for screens
  UIGenerator: {
    name: 'UI Component Selector',
    description: 'Chooses appropriate UI components for each screen',
    methods: {
      generate: {
        instructions: `You are selecting UI components for a screen in the app.

For each screen, determine:
1. Layout pattern (single column, grid, split, etc.)
2. Required components from the library
3. Component arrangement and hierarchy
4. Content/data to display
5. User actions available

Match the app's design style when selecting components.
Consider mobile-first responsive design.

Return a JSON object with:
- layout: string (layout pattern name)
- components: array of {type, props, content}
- actions: array of {type, label, action}
- responsive: object with breakpoint adjustments`,
        
        componentPatterns: {
          home: ['navbar', 'hero', 'feature-cards', 'cta', 'footer'],
          browse: ['navbar', 'search-bar', 'filters', 'item-grid', 'pagination', 'footer'],
          detail: ['navbar', 'image-gallery', 'info-section', 'action-buttons', 'related-items', 'footer'],
          form: ['navbar', 'form-header', 'form-fields', 'submit-button', 'footer'],
          dashboard: ['navbar', 'stat-cards', 'charts', 'recent-activity', 'quick-actions', 'footer']
        }
      }
    }
  },

  // File Creator Agent - Generates file structure
  FileCreator: {
    name: 'File Structure Generator',
    description: 'Creates project file structure and boilerplate',
    methods: {
      create: {
        instructions: `You are creating the file structure for the app.

Generate:
1. Project directory structure
2. HTML file for each screen
3. CSS files (main.css and component styles)
4. JavaScript for interactivity
5. Assets directory structure

Follow these conventions:
- index.html as the home page
- Semantic HTML5 elements
- Mobile-first CSS
- CSS custom properties for theming
- Modular file organization

Return a JSON object with:
- directories: array of paths to create
- files: array of {path, type, content}
- assets: object describing needed assets`,
        
        structure: {
          base: [
            'index.html',
            'assets/styles/main.css',
            'assets/styles/components.css',
            'assets/js/app.js',
            'assets/images/'
          ]
        }
      }
    }
  },

  // Change Analyzer Agent - Understands update requests
  ChangeAnalyzer: {
    name: 'Change Request Analyzer',
    description: 'Interprets design change requests',
    methods: {
      analyze: {
        instructions: `You are analyzing a design change request.

Determine:
1. Type of change (style, layout, content, component, navigation)
2. Scope - which screens/components are affected
3. Specific modifications needed
4. Priority/impact of the change

Common change types:
- Style: colors, fonts, spacing, themes
- Layout: grid changes, alignment, positioning
- Content: text updates, image changes
- Component: add, remove, or modify components
- Navigation: menu changes, flow updates

Return a JSON object with:
- changeType: string
- scope: array of affected items
- modifications: array of specific changes
- impact: "low"|"medium"|"high"`,
        
        examples: [
          {
            input: "make the primary color blue",
            output: {
              changeType: "style",
              scope: ["all screens", "main.css"],
              modifications: [
                "Update CSS custom property --primary-color to blue",
                "Update related hover and active states"
              ],
              impact: "medium"
            }
          }
        ]
      }
    }
  },

  // Component Integrator Agent - Adds components to existing designs
  ComponentIntegrator: {
    name: 'Component Integration Specialist',
    description: 'Integrates new components into existing layouts',
    methods: {
      integrate: {
        instructions: `You are integrating a new component into an existing design.

Consider:
1. Where the component should be placed
2. How it affects existing layout
3. Responsive behavior
4. Style consistency
5. Interaction with other components

Return a JSON object with:
- targetLocation: where to add the component
- layoutAdjustments: changes to accommodate it
- styleUpdates: CSS modifications needed
- interactions: event handlers or behaviors`,
        
        strategies: {
          addToTop: 'Insert before main content',
          addToBottom: 'Append after main content',
          replaceExisting: 'Swap out similar component',
          createSection: 'Add new section for component'
        }
      }
    }
  }
};

/**
 * Helper function to get agent template by name and method
 */
export function getAgentTemplate(agentName, methodName = null) {
  const agent = AgentTemplates[agentName];
  if (!agent) return null;
  
  if (methodName) {
    return agent.methods[methodName] || null;
  }
  
  return agent;
}

/**
 * Get all agent names
 */
export function getAllAgentNames() {
  return Object.keys(AgentTemplates);
}

/**
 * Get agent methods
 */
export function getAgentMethods(agentName) {
  const agent = AgentTemplates[agentName];
  if (!agent) return [];
  
  return Object.keys(agent.methods);
}