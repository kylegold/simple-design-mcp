export const cards = {
  basic: (props) => {
    const {
      title = 'Card Title',
      content = 'Card content goes here',
      image = '',
      imageAlt = '',
      link = '',
      linkText = 'Learn More',
      footer = ''
    } = props;

    return `
<div class="card" data-component="card">
  ${image ? `<img src="${image}" class="card-img-top" alt="${imageAlt || title}">` : ''}
  <div class="card-body">
    <h5 class="card-title">${title}</h5>
    <p class="card-text">${content}</p>
    ${link ? `<a href="${link}" class="card-link">${linkText}</a>` : ''}
  </div>
  ${footer ? `<div class="card-footer">${footer}</div>` : ''}
</div>

<style>
.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 1.5rem;
  flex: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--dark-color);
}

.card-text {
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.card-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: color 0.3s ease;
}

.card-link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: var(--light-color);
  border-top: 1px solid rgba(0,0,0,0.1);
}
</style>`;
  },

  grid: (props) => {
    const {
      cards = [],
      columns = 3,
      gap = '2rem'
    } = props;

    const cardElements = cards.map(card => this.basic(card)).join('\n');

    return `
<div class="card-grid" style="--columns: ${columns}; --gap: ${gap}" data-component="card-grid">
  ${cardElements}
</div>

<style>
.card-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: var(--gap);
  margin: 2rem 0;
}

@media (max-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>`;
  },

  feature: (props) => {
    const {
      icon = '🚀',
      title = 'Feature Title',
      description = 'Feature description goes here',
      link = '',
      linkText = 'Learn More'
    } = props;

    return `
<div class="feature-card" data-component="feature-card">
  <div class="feature-icon">${icon}</div>
  <h3 class="feature-title">${title}</h3>
  <p class="feature-description">${description}</p>
  ${link ? `<a href="${link}" class="feature-link">${linkText} →</a>` : ''}
</div>

<style>
.feature-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.feature-description {
  color: var(--secondary-color);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feature-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: color 0.3s ease;
}

.feature-link:hover {
  color: var(--primary-color);
  transform: translateX(4px);
}
</style>`;
  },

  testimonial: (props) => {
    const {
      quote = 'This product changed my life!',
      author = 'Happy Customer',
      role = 'CEO, Company',
      avatar = '',
      rating = 5
    } = props;

    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    return `
<div class="testimonial-card" data-component="testimonial-card">
  <div class="testimonial-rating">${stars}</div>
  <blockquote class="testimonial-quote">"${quote}"</blockquote>
  <div class="testimonial-author">
    ${avatar ? `<img src="${avatar}" alt="${author}" class="testimonial-avatar">` : ''}
    <div class="testimonial-info">
      <div class="testimonial-name">${author}</div>
      <div class="testimonial-role">${role}</div>
    </div>
  </div>
</div>

<style>
.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.testimonial-rating {
  color: #ffc107;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.testimonial-quote {
  font-size: 1.125rem;
  font-style: italic;
  color: var(--dark-color);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.testimonial-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.testimonial-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-info {
  text-align: left;
}

.testimonial-name {
  font-weight: 600;
  color: var(--dark-color);
}

.testimonial-role {
  font-size: 0.875rem;
  color: var(--secondary-color);
}
</style>`;
  }
};