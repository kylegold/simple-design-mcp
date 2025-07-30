/**
 * ComponentSpecs.js - UI component specifications (not implementations)
 * These specs tell Claude Code what components are available and their properties
 */

export const ComponentSpecs = {
  // Navigation Components
  navbar: {
    type: 'navigation',
    description: 'Top navigation bar with brand and menu items',
    props: {
      brand: { 
        type: 'string', 
        required: true,
        description: 'Brand/logo text'
      },
      links: { 
        type: 'array', 
        required: true,
        schema: {
          label: 'string',
          href: 'string',
          active: 'boolean'
        }
      },
      sticky: { 
        type: 'boolean', 
        default: true,
        description: 'Stick to top on scroll' 
      },
      transparent: { 
        type: 'boolean', 
        default: false,
        description: 'Transparent background'
      }
    },
    variants: ['default', 'transparent', 'dark', 'centered'],
    responsive: {
      mobile: 'hamburger menu',
      tablet: 'condensed menu',
      desktop: 'full menu'
    },
    accessibility: 'nav with aria-label, proper focus states'
  },

  sidebar: {
    type: 'navigation',
    description: 'Vertical navigation sidebar',
    props: {
      items: {
        type: 'array',
        required: true,
        schema: {
          icon: 'string',
          label: 'string',
          href: 'string',
          badge: 'number'
        }
      },
      collapsed: {
        type: 'boolean',
        default: false
      },
      position: {
        type: 'string',
        enum: ['left', 'right'],
        default: 'left'
      }
    },
    variants: ['default', 'minimal', 'with-header'],
    responsive: {
      mobile: 'drawer overlay',
      desktop: 'fixed sidebar'
    }
  },

  // Hero Components
  hero: {
    type: 'section',
    description: 'Large hero section for landing pages',
    props: {
      title: { 
        type: 'string', 
        required: true 
      },
      subtitle: { 
        type: 'string', 
        required: false 
      },
      cta: { 
        type: 'object',
        schema: {
          text: 'string',
          href: 'string',
          variant: 'primary|secondary|outline'
        }
      },
      background: { 
        type: 'string',
        enum: ['gradient', 'image', 'video', 'pattern'],
        default: 'gradient'
      },
      height: {
        type: 'string',
        enum: ['small', 'medium', 'large', 'fullscreen'],
        default: 'large'
      }
    },
    variants: ['centered', 'left-aligned', 'with-image', 'with-video', 'split'],
    responsive: {
      mobile: 'stacked content',
      desktop: 'side-by-side option'
    }
  },

  // Card Components
  card: {
    type: 'component',
    description: 'Versatile card component for content',
    props: {
      title: { 
        type: 'string', 
        required: true 
      },
      content: { 
        type: 'string', 
        required: true 
      },
      image: { 
        type: 'string',
        required: false,
        description: 'Image URL'
      },
      actions: { 
        type: 'array',
        schema: {
          label: 'string',
          action: 'string',
          variant: 'link|button'
        }
      },
      meta: {
        type: 'object',
        description: 'Metadata like date, author, tags'
      }
    },
    variants: ['default', 'horizontal', 'overlay', 'minimal', 'featured'],
    responsive: {
      mobile: 'stacked layout',
      desktop: 'flexible layout'
    }
  },

  // Grid Layouts
  grid: {
    type: 'layout',
    description: 'Responsive grid container',
    props: {
      columns: { 
        type: 'number',
        default: 3,
        description: 'Number of columns on desktop'
      },
      gap: { 
        type: 'string',
        default: '1rem',
        description: 'Space between items'
      },
      items: { 
        type: 'array',
        required: true,
        description: 'Array of components to display'
      }
    },
    responsive: {
      mobile: 1,
      tablet: 2,
      desktop: 'columns prop value'
    },
    variants: ['masonry', 'equal-height', 'auto-fill']
  },

  // Form Components
  searchBar: {
    type: 'form',
    description: 'Search input with optional filters',
    props: {
      placeholder: {
        type: 'string',
        default: 'Search...'
      },
      showFilters: {
        type: 'boolean',
        default: false
      },
      filters: {
        type: 'array',
        schema: {
          label: 'string',
          field: 'string',
          type: 'select|checkbox|range'
        }
      },
      suggestions: {
        type: 'boolean',
        default: true
      }
    },
    variants: ['default', 'large', 'minimal', 'with-button'],
    features: ['autocomplete', 'recent searches', 'voice input']
  },

  form: {
    type: 'form',
    description: 'Flexible form component',
    props: {
      fields: {
        type: 'array',
        required: true,
        schema: {
          name: 'string',
          label: 'string',
          type: 'text|email|password|select|textarea|checkbox|radio',
          required: 'boolean',
          validation: 'object'
        }
      },
      submitText: {
        type: 'string',
        default: 'Submit'
      },
      layout: {
        type: 'string',
        enum: ['vertical', 'horizontal', 'inline'],
        default: 'vertical'
      }
    },
    features: ['validation', 'error messages', 'loading states']
  },

  // Data Display
  statCard: {
    type: 'data',
    description: 'Card showing a statistic or metric',
    props: {
      label: {
        type: 'string',
        required: true
      },
      value: {
        type: 'string|number',
        required: true
      },
      change: {
        type: 'object',
        schema: {
          value: 'number',
          trend: 'up|down|neutral'
        }
      },
      icon: {
        type: 'string'
      },
      color: {
        type: 'string',
        enum: ['primary', 'success', 'warning', 'danger'],
        default: 'primary'
      }
    },
    variants: ['default', 'minimal', 'detailed', 'with-chart']
  },

  chart: {
    type: 'data',
    description: 'Data visualization component',
    props: {
      type: {
        type: 'string',
        enum: ['line', 'bar', 'pie', 'donut', 'area'],
        required: true
      },
      data: {
        type: 'object',
        required: true,
        description: 'Chart data structure'
      },
      title: {
        type: 'string'
      },
      height: {
        type: 'number',
        default: 300
      }
    },
    features: ['responsive', 'interactive', 'animations']
  },

  // Content Components
  imageGallery: {
    type: 'content',
    description: 'Image gallery with lightbox',
    props: {
      images: {
        type: 'array',
        required: true,
        schema: {
          src: 'string',
          alt: 'string',
          caption: 'string'
        }
      },
      layout: {
        type: 'string',
        enum: ['grid', 'masonry', 'carousel', 'slider'],
        default: 'grid'
      },
      columns: {
        type: 'number',
        default: 3
      }
    },
    features: ['lightbox', 'zoom', 'captions', 'lazy loading']
  },

  testimonial: {
    type: 'content',
    description: 'Customer testimonial component',
    props: {
      quote: {
        type: 'string',
        required: true
      },
      author: {
        type: 'string',
        required: true
      },
      role: {
        type: 'string'
      },
      avatar: {
        type: 'string'
      },
      rating: {
        type: 'number',
        min: 1,
        max: 5
      }
    },
    variants: ['default', 'minimal', 'card', 'large']
  },

  // App-Specific Components
  recipeCard: {
    type: 'app-specific',
    appType: 'recipe',
    description: 'Recipe preview card',
    props: {
      title: { type: 'string', required: true },
      image: { type: 'string', required: true },
      cookTime: { type: 'string' },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      rating: { type: 'number' },
      author: { type: 'string' },
      cuisine: { type: 'string' }
    }
  },

  workoutCard: {
    type: 'app-specific',
    appType: 'fitness',
    description: 'Workout session card',
    props: {
      name: { type: 'string', required: true },
      duration: { type: 'string', required: true },
      difficulty: { type: 'string' },
      exercises: { type: 'number' },
      equipment: { type: 'array' },
      calories: { type: 'number' }
    }
  },

  productCard: {
    type: 'app-specific',
    appType: 'ecommerce',
    description: 'Product listing card',
    props: {
      name: { type: 'string', required: true },
      price: { type: 'number', required: true },
      image: { type: 'string', required: true },
      discount: { type: 'number' },
      rating: { type: 'number' },
      inStock: { type: 'boolean' }
    }
  },

  // Layout Components
  footer: {
    type: 'layout',
    description: 'Page footer with links and info',
    props: {
      columns: {
        type: 'array',
        schema: {
          title: 'string',
          links: 'array'
        }
      },
      copyright: {
        type: 'string'
      },
      social: {
        type: 'array',
        schema: {
          platform: 'string',
          url: 'string'
        }
      }
    },
    variants: ['default', 'minimal', 'centered', 'mega']
  },

  container: {
    type: 'layout',
    description: 'Content container with max-width',
    props: {
      maxWidth: {
        type: 'string',
        enum: ['sm', 'md', 'lg', 'xl', 'full'],
        default: 'lg'
      },
      padding: {
        type: 'boolean',
        default: true
      }
    }
  }
};

/**
 * Get component specification by name
 */
export function getComponentSpec(componentName) {
  return ComponentSpecs[componentName] || null;
}

/**
 * Get components for specific app type
 */
export function getAppComponents(appType) {
  const appComponents = {};
  
  for (const [name, spec] of Object.entries(ComponentSpecs)) {
    if (spec.appType === appType || !spec.appType) {
      appComponents[name] = spec;
    }
  }
  
  return appComponents;
}

/**
 * Get components by type
 */
export function getComponentsByType(type) {
  const components = {};
  
  for (const [name, spec] of Object.entries(ComponentSpecs)) {
    if (spec.type === type) {
      components[name] = spec;
    }
  }
  
  return components;
}