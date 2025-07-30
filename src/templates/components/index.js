import { navigation } from './navigation.js';
import { hero } from './hero.js';
import { cards } from './cards.js';
import { footer } from './footer.js';
import { forms } from './forms.js';
import { gallery } from './gallery.js';

export const components = {
  // Navigation components
  navbar: navigation.navbar,
  sidebar: navigation.sidebar,
  
  // Hero sections
  hero: hero.basic,
  heroWithImage: hero.withImage,
  heroWithVideo: hero.withVideo,
  
  // Card components
  card: cards.basic,
  cardGrid: cards.grid,
  featureCard: cards.feature,
  testimonialCard: cards.testimonial,
  
  // Footer
  footer: footer.basic,
  footerWithLinks: footer.withLinks,
  
  // Forms
  contactForm: forms.contact,
  loginForm: forms.login,
  searchBar: forms.searchBar,
  
  // Gallery
  imageGallery: gallery.grid,
  carousel: gallery.carousel,
  
  // Common UI elements
  button: (props) => {
    const {
      text = 'Click me',
      type = 'primary',
      size = 'md',
      onClick = '',
      href = '#'
    } = props;
    
    if (href !== '#') {
      return `<a href="${href}" class="btn btn-${type} btn-${size}">${text}</a>`;
    }
    
    return `<button class="btn btn-${type} btn-${size}" onclick="${onClick}">${text}</button>`;
  },
  
  section: (props) => {
    const {
      title = '',
      content = '',
      className = 'section',
      id = ''
    } = props;
    
    return `
<section class="${className}" ${id ? `id="${id}"` : ''} data-component="section">
  <div class="container">
    ${title ? `<h2 class="section-title">${title}</h2>` : ''}
    ${content}
  </div>
</section>`;
  },
  
  container: (props) => {
    const {
      content = '',
      className = 'container',
      fluid = false
    } = props;
    
    return `<div class="${fluid ? 'container-fluid' : className}">${content}</div>`;
  },
  
  row: (props) => {
    const { columns = [] } = props;
    const cols = columns.map(col => `
    <div class="col${col.size ? `-${col.size}` : ''}">
      ${col.content}
    </div>`).join('');
    
    return `<div class="row">${cols}</div>`;
  },
  
  alert: (props) => {
    const {
      message = '',
      type = 'info',
      dismissible = true
    } = props;
    
    return `
<div class="alert alert-${type} ${dismissible ? 'alert-dismissible' : ''}" role="alert">
  ${message}
  ${dismissible ? '<button type="button" class="close" data-dismiss="alert">&times;</button>' : ''}
</div>`;
  }
};