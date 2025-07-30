import { components } from '../templates/components/index.js';
import { layouts } from '../templates/layouts/index.js';

export class HTMLGenerator {
  constructor() {
    this.components = components;
    this.layouts = layouts;
  }

  /**
   * Generate a complete HTML page
   */
  generatePage(config) {
    const {
      title,
      layout = 'default',
      components = [],
      customStyles = '',
      customScripts = ''
    } = config;

    const layoutTemplate = this.layouts[layout] || this.layouts.default;
    const componentHTML = this.generateComponents(components);

    return layoutTemplate({
      title,
      content: componentHTML,
      customStyles,
      customScripts
    });
  }

  /**
   * Generate HTML for multiple components
   */
  generateComponents(components) {
    return components
      .map(comp => this.generateComponent(comp))
      .join('\n');
  }

  /**
   * Generate HTML for a single component
   */
  generateComponent(config) {
    const { type, props = {} } = config;
    const componentTemplate = this.components[type];
    
    if (!componentTemplate) {
      console.warn(`Component type "${type}" not found`);
      return `<!-- Component "${type}" not found -->`;
    }

    return componentTemplate(props);
  }

  /**
   * Update specific component in HTML
   */
  updateComponent(html, componentId, newComponent) {
    // This will be implemented to update specific parts of HTML
    // For now, we'll regenerate the entire page
    return html;
  }

  /**
   * Add component to existing HTML
   */
  addComponent(html, component, position = 'end') {
    const componentHTML = this.generateComponent(component);
    
    if (position === 'end') {
      // Add before closing body tag
      return html.replace('</body>', `${componentHTML}\n</body>`);
    } else if (position === 'start') {
      // Add after opening body tag
      return html.replace('<body>', `<body>\n${componentHTML}`);
    } else {
      // Add after specific element
      const regex = new RegExp(`(id="${position}"[^>]*>)`);
      return html.replace(regex, `$1\n${componentHTML}`);
    }
  }

  /**
   * Generate inline styles
   */
  generateStyles(styles) {
    const styleRules = [];
    
    for (const [selector, rules] of Object.entries(styles)) {
      const ruleString = Object.entries(rules)
        .map(([prop, value]) => `  ${this.camelToKebab(prop)}: ${value};`)
        .join('\n');
      styleRules.push(`${selector} {\n${ruleString}\n}`);
    }
    
    return `<style>\n${styleRules.join('\n\n')}\n</style>`;
  }

  /**
   * Convert camelCase to kebab-case
   */
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Parse existing HTML to extract components
   */
  parseHTML(html) {
    // Simple parser to identify existing components
    const components = [];
    
    // Extract sections with data-component attribute
    const componentRegex = /<[^>]+data-component="([^"]+)"[^>]*>/g;
    let match;
    
    while ((match = componentRegex.exec(html)) !== null) {
      components.push({
        type: match[1],
        html: match[0]
      });
    }
    
    return components;
  }

  /**
   * Generate responsive image HTML
   */
  generateResponsiveImage(src, alt, sizes = {}) {
    const srcset = Object.entries(sizes)
      .map(([size, url]) => `${url} ${size}w`)
      .join(', ');
    
    return `<img 
      src="${src}" 
      alt="${alt}"
      srcset="${srcset}"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading="lazy"
    >`;
  }

  /**
   * Generate form HTML
   */
  generateForm(fields, options = {}) {
    const {
      action = '#',
      method = 'POST',
      id = 'form',
      className = 'form'
    } = options;

    const fieldHTML = fields.map(field => this.generateFormField(field)).join('\n');

    return `<form action="${action}" method="${method}" id="${id}" class="${className}">
  ${fieldHTML}
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`;
  }

  /**
   * Generate individual form field
   */
  generateFormField(field) {
    const {
      type = 'text',
      name,
      label,
      placeholder = '',
      required = false,
      options = []
    } = field;

    const id = `field-${name}`;
    const requiredAttr = required ? 'required' : '';

    let fieldHTML = '';

    switch (type) {
      case 'select':
        fieldHTML = `
  <div class="form-group">
    <label for="${id}">${label}</label>
    <select id="${id}" name="${name}" class="form-control" ${requiredAttr}>
      ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n      ')}
    </select>
  </div>`;
        break;

      case 'textarea':
        fieldHTML = `
  <div class="form-group">
    <label for="${id}">${label}</label>
    <textarea id="${id}" name="${name}" class="form-control" placeholder="${placeholder}" ${requiredAttr}></textarea>
  </div>`;
        break;

      default:
        fieldHTML = `
  <div class="form-group">
    <label for="${id}">${label}</label>
    <input type="${type}" id="${id}" name="${name}" class="form-control" placeholder="${placeholder}" ${requiredAttr}>
  </div>`;
    }

    return fieldHTML;
  }
}