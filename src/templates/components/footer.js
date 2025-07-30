export const footer = {
  basic: (props) => {
    const {
      copyright = `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
      social = []
    } = props;

    const socialLinks = social.map(link => 
      `<a href="${link.url}" class="social-link" aria-label="${link.name}">${link.icon || link.name}</a>`
    ).join('');

    return `
<footer class="footer" data-component="footer">
  <div class="container">
    <div class="footer-content">
      <p class="footer-copyright">${copyright}</p>
      ${socialLinks ? `<div class="footer-social">${socialLinks}</div>` : ''}
    </div>
  </div>
</footer>

<style>
.footer {
  background: var(--dark-color);
  color: white;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copyright {
  margin: 0;
  opacity: 0.8;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: white;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.social-link:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>`;
  },

  withLinks: (props) => {
    const {
      columns = [],
      copyright = `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
      social = []
    } = props;

    const footerColumns = columns.map(col => `
      <div class="footer-column">
        <h4 class="footer-heading">${col.title}</h4>
        <ul class="footer-links">
          ${col.links.map(link => 
            `<li><a href="${link.href}">${link.text}</a></li>`
          ).join('')}
        </ul>
      </div>
    `).join('');

    const socialLinks = social.map(link => 
      `<a href="${link.url}" class="social-link" aria-label="${link.name}">${link.icon || link.name}</a>`
    ).join('');

    return `
<footer class="footer-extended" data-component="footer-with-links">
  <div class="container">
    <div class="footer-columns">
      ${footerColumns}
    </div>
    <div class="footer-bottom">
      <p class="footer-copyright">${copyright}</p>
      ${socialLinks ? `<div class="footer-social">${socialLinks}</div>` : ''}
    </div>
  </div>
</footer>

<style>
.footer-extended {
  background: var(--dark-color);
  color: white;
  padding: 3rem 0 2rem;
  margin-top: auto;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.footer-heading {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copyright {
  margin: 0;
  opacity: 0.8;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: white;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.social-link:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .footer-columns {
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>`;
  }
};