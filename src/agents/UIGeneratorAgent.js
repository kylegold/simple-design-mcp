import { HTMLGenerator } from '../generators/HTMLGenerator.js';
import { FileOperations } from '../managers/FileOperations.js';

/**
 * UIGeneratorAgent - Converts UX flows to actual HTML
 */
export class UIGeneratorAgent {
  constructor() {
    this.name = 'UIGeneratorAgent';
    this.htmlGenerator = new HTMLGenerator();
    this.fileOps = new FileOperations();
  }

  /**
   * Generate UI from design brief and UX flow
   */
  async generateUI(designBrief, uxFlow, projectName) {
    const { screens, navigation } = uxFlow;
    const { colorScheme, designStyle, appType } = designBrief;
    
    const fileOperations = [];
    
    // Generate CSS with custom color scheme
    const cssContent = this.generateCSS(colorScheme, designStyle);
    fileOperations.push({
      type: 'create_file',
      path: `${projectName}/assets/styles/main.css`,
      content: cssContent
    });
    
    // Generate HTML for each screen
    for (const screen of screens) {
      const html = await this.generateScreen(screen, designBrief, navigation);
      const filename = screen.id === 'home' ? 'index.html' : `${screen.id}.html`;
      
      fileOperations.push({
        type: 'update_file',
        path: `${projectName}/${filename}`,
        content: html
      });
    }
    
    // Generate component library reference
    const componentLibrary = this.generateComponentLibrary(designBrief);
    fileOperations.push({
      type: 'create_file',
      path: `${projectName}/components.html`,
      content: componentLibrary
    });
    
    return {
      fileOperations,
      mainFile: `${projectName}/index.html`,
      screens: screens.map(s => ({
        ...s,
        file: s.id === 'home' ? 'index.html' : `${s.id}.html`
      }))
    };
  }

  /**
   * Generate screen HTML
   */
  async generateScreen(screen, designBrief, navigation) {
    const { appType, appName, features } = designBrief;
    
    // Build components for this screen
    const components = [];
    
    // Always add navbar
    if (screen.components.includes('navbar')) {
      components.push({
        type: 'navbar',
        props: {
          brand: appName || `${appType.charAt(0).toUpperCase() + appType.slice(1)} App`,
          links: navigation.main.map(link => ({
            ...link,
            active: link.id === screen.id
          }))
        }
      });
    }
    
    // Add screen-specific components
    const componentMap = this.getComponentMap(screen, designBrief);
    
    for (const compName of screen.components) {
      if (compName !== 'navbar' && compName !== 'footer' && componentMap[compName]) {
        components.push(componentMap[compName]);
      }
    }
    
    // Always add footer
    if (screen.components.includes('footer')) {
      components.push({
        type: 'footerWithLinks',
        props: {
          columns: [
            {
              title: 'Product',
              links: navigation.main.slice(0, 3).map(l => ({ text: l.text, href: l.href }))
            },
            {
              title: 'Company',
              links: [
                { text: 'About', href: '#about' },
                { text: 'Blog', href: '#blog' },
                { text: 'Careers', href: '#careers' }
              ]
            },
            {
              title: 'Support',
              links: [
                { text: 'Help Center', href: '#help' },
                { text: 'Contact', href: '#contact' },
                { text: 'FAQ', href: '#faq' }
              ]
            }
          ],
          social: [
            { name: 'Twitter', url: '#', icon: '🐦' },
            { name: 'Facebook', url: '#', icon: '📘' },
            { name: 'Instagram', url: '#', icon: '📷' }
          ]
        }
      });
    }
    
    // Generate page
    return this.htmlGenerator.generatePage({
      title: `${screen.name} - ${designBrief.projectName}`,
      layout: 'default',
      components,
      customStyles: `
        /* Custom styles for ${screen.id} */
        :root {
          --primary-color: ${designBrief.colorScheme.primary};
          --secondary-color: ${designBrief.colorScheme.secondary};
          --accent-color: ${designBrief.colorScheme.accent};
        }
      `
    });
  }

  /**
   * Get component map for screen
   */
  getComponentMap(screen, designBrief) {
    const { appType, features } = designBrief;
    
    // Common components
    const common = {
      'hero': {
        type: 'hero',
        props: {
          title: `Welcome to ${designBrief.projectName}`,
          subtitle: designBrief.purpose || 'Build something amazing',
          ctaText: 'Get Started',
          ctaLink: '#browse'
        }
      },
      'search-bar': {
        type: 'searchBar',
        props: {
          placeholder: `Search ${appType}...`,
          size: 'large'
        }
      },
      'contact-form': {
        type: 'contactForm',
        props: {}
      },
      'login-form': {
        type: 'loginForm',
        props: {}
      }
    };
    
    // App-specific components
    const specific = {
      recipe: {
        'recipe-grid': {
          type: 'cardGrid',
          props: {
            cards: this.generateSampleCards('recipe', 6),
            columns: 3
          }
        },
        'category-filter': {
          type: 'section',
          props: {
            title: 'Browse by Category',
            content: this.generateCategoryButtons(['Italian', 'Mexican', 'Asian', 'American', 'Desserts'])
          }
        },
        'recipe-form': {
          type: 'section',
          props: {
            title: 'Create New Recipe',
            content: '<p>Recipe creation form would go here</p>'
          }
        }
      },
      fitness: {
        'workout-list': {
          type: 'section',
          props: {
            title: 'Recent Workouts',
            content: this.generateWorkoutList()
          }
        },
        'progress-chart': {
          type: 'section',
          props: {
            title: 'Your Progress',
            content: '<div style="background: #f0f0f0; padding: 2rem; text-align: center;">Progress charts would display here</div>'
          }
        },
        'stats-summary': {
          type: 'row',
          props: {
            columns: [
              { size: 4, content: this.generateStatCard('Workouts', '23', 'This month') },
              { size: 4, content: this.generateStatCard('Calories', '12,450', 'Burned') },
              { size: 4, content: this.generateStatCard('Goals', '3/5', 'Completed') }
            ]
          }
        }
      },
      social: {
        'feed-list': {
          type: 'section',
          props: {
            title: '',
            content: this.generateSocialFeed()
          }
        },
        'post-creator': {
          type: 'section',
          props: {
            title: '',
            content: this.generatePostCreator()
          }
        }
      },
      ecommerce: {
        'product-grid': {
          type: 'cardGrid',
          props: {
            cards: this.generateSampleCards('product', 9),
            columns: 3
          }
        },
        'featured-products': {
          type: 'section',
          props: {
            title: 'Featured Products',
            content: this.htmlGenerator.generateComponents([{
              type: 'cardGrid',
              props: {
                cards: this.generateSampleCards('product', 3),
                columns: 3
              }
            }])
          }
        }
      }
    };
    
    return {
      ...common,
      ...(specific[appType] || {})
    };
  }

  /**
   * Generate sample cards for different app types
   */
  generateSampleCards(type, count) {
    const templates = {
      recipe: {
        title: ['Pasta Carbonara', 'Chocolate Cake', 'Greek Salad', 'Beef Tacos', 'Veggie Stir Fry', 'Apple Pie'],
        content: '⭐⭐⭐⭐⭐ (4.8) • 30 mins • Easy',
        image: 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Recipe'
      },
      product: {
        title: ['Premium Headphones', 'Smart Watch', 'Laptop Stand', 'Wireless Mouse', 'USB Hub', 'Phone Case', 'Desk Lamp', 'Keyboard', 'Monitor'],
        content: '$99.99',
        image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Product'
      }
    };
    
    const template = templates[type] || templates.product;
    
    return Array.from({ length: count }, (_, i) => ({
      title: template.title[i % template.title.length],
      content: template.content,
      image: template.image,
      link: '#',
      linkText: 'View Details'
    }));
  }

  /**
   * Generate category buttons
   */
  generateCategoryButtons(categories) {
    return `<div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
      ${categories.map(cat => 
        `<button class="btn btn-outline-primary">${cat}</button>`
      ).join('')}
    </div>`;
  }

  /**
   * Generate workout list
   */
  generateWorkoutList() {
    const workouts = [
      { name: 'Morning Run', date: 'Today', duration: '45 min', calories: '350' },
      { name: 'Strength Training', date: 'Yesterday', duration: '60 min', calories: '450' },
      { name: 'Yoga Session', date: '2 days ago', duration: '30 min', calories: '150' }
    ];
    
    return `<div class="workout-list">
      ${workouts.map(w => `
        <div style="padding: 1rem; border-bottom: 1px solid #e0e0e0;">
          <h4>${w.name}</h4>
          <p style="color: var(--secondary-color);">${w.date} • ${w.duration} • ${w.calories} cal</p>
        </div>
      `).join('')}
    </div>`;
  }

  /**
   * Generate stat card
   */
  generateStatCard(label, value, sublabel) {
    return `<div style="background: white; padding: 2rem; text-align: center; border-radius: var(--border-radius); box-shadow: var(--shadow-sm);">
      <h3 style="font-size: 2rem; color: var(--primary-color); margin: 0;">${value}</h3>
      <p style="margin: 0.5rem 0 0 0; color: var(--secondary-color);">${label}</p>
      ${sublabel ? `<small style="color: var(--secondary-color);">${sublabel}</small>` : ''}
    </div>`;
  }

  /**
   * Generate social feed
   */
  generateSocialFeed() {
    return `<div class="social-feed">
      <div style="background: white; padding: 1.5rem; margin-bottom: 1rem; border-radius: var(--border-radius); box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
          <div style="width: 40px; height: 40px; background: var(--primary-color); border-radius: 50%; margin-right: 1rem;"></div>
          <div>
            <strong>John Doe</strong>
            <p style="margin: 0; font-size: 0.875rem; color: var(--secondary-color);">2 hours ago</p>
          </div>
        </div>
        <p>Just launched my new project! 🚀 Check it out and let me know what you think.</p>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
          <button class="btn btn-sm">👍 Like</button>
          <button class="btn btn-sm">💬 Comment</button>
          <button class="btn btn-sm">🔄 Share</button>
        </div>
      </div>
    </div>`;
  }

  /**
   * Generate post creator
   */
  generatePostCreator() {
    return `<div style="background: white; padding: 1.5rem; margin-bottom: 2rem; border-radius: var(--border-radius); box-shadow: var(--shadow-sm);">
      <textarea placeholder="What's on your mind?" style="width: 100%; padding: 1rem; border: 1px solid #e0e0e0; border-radius: var(--border-radius); resize: none; min-height: 100px;"></textarea>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
        <div>
          <button class="btn btn-sm">📷 Photo</button>
          <button class="btn btn-sm">🎥 Video</button>
          <button class="btn btn-sm">📍 Location</button>
        </div>
        <button class="btn btn-primary">Post</button>
      </div>
    </div>`;
  }

  /**
   * Generate CSS file
   */
  generateCSS(colorScheme, designStyle) {
    return `/* Custom styles for ${designStyle} design */

:root {
  --primary-color: ${colorScheme.primary};
  --secondary-color: ${colorScheme.secondary};
  --accent-color: ${colorScheme.accent};
}

/* Additional custom styles */
.hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

/* Responsive utilities */
@media (max-width: 768px) {
  .hide-mobile {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .show-mobile {
    display: none !important;
  }
}`;
  }

  /**
   * Generate component library reference
   */
  generateComponentLibrary(designBrief) {
    const components = [
      { type: 'button', props: { text: 'Primary Button', type: 'primary' } },
      { type: 'button', props: { text: 'Secondary Button', type: 'secondary' } },
      { type: 'card', props: { title: 'Sample Card', content: 'This is a sample card component' } },
      { type: 'alert', props: { message: 'This is an info alert', type: 'info' } },
      { type: 'searchBar', props: { placeholder: 'Search...' } }
    ];
    
    return this.htmlGenerator.generatePage({
      title: 'Component Library',
      layout: 'default',
      components: [
        {
          type: 'section',
          props: {
            title: 'Component Library',
            content: `<p>Reference of all available components for your ${designBrief.appType} app.</p>`
          }
        },
        ...components.map(comp => ({
          type: 'section',
          props: {
            title: comp.type.charAt(0).toUpperCase() + comp.type.slice(1),
            content: this.htmlGenerator.generateComponent(comp)
          }
        }))
      ]
    });
  }
}