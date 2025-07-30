export const hero = {
  basic: (props) => {
    const {
      title = 'Welcome to Our App',
      subtitle = 'Build something amazing',
      ctaText = 'Get Started',
      ctaLink = '#',
      secondaryCtaText = '',
      secondaryCtaLink = '#',
      align = 'center',
      height = '70vh'
    } = props;

    const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

    return `
<section class="hero ${alignClass}" style="min-height: ${height}" data-component="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">${title}</h1>
      <p class="hero-subtitle">${subtitle}</p>
      <div class="hero-actions">
        <a href="${ctaLink}" class="btn btn-primary btn-lg">${ctaText}</a>
        ${secondaryCtaText ? `<a href="${secondaryCtaLink}" class="btn btn-outline-primary btn-lg">${secondaryCtaText}</a>` : ''}
      </div>
    </div>
  </div>
</section>

<style>
.hero {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  font-weight: 300;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.text-center .hero-actions {
  justify-content: center;
}

.text-left .hero-actions {
  justify-content: flex-start;
}

.text-right .hero-actions {
  justify-content: flex-end;
}

.btn-lg {
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
}

.btn-outline-primary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline-primary:hover {
  background: white;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-lg {
    width: 100%;
    text-align: center;
  }
}
</style>`;
  },

  withImage: (props) => {
    const {
      title = 'Welcome to Our App',
      subtitle = 'Build something amazing',
      ctaText = 'Get Started',
      ctaLink = '#',
      image = 'https://via.placeholder.com/600x400',
      imageAlt = 'Hero image',
      reverse = false
    } = props;

    return `
<section class="hero-with-image" data-component="hero-with-image">
  <div class="container">
    <div class="hero-grid ${reverse ? 'reverse' : ''}">
      <div class="hero-content">
        <h1 class="hero-title">${title}</h1>
        <p class="hero-subtitle">${subtitle}</p>
        <div class="hero-actions">
          <a href="${ctaLink}" class="btn btn-primary btn-lg">${ctaText}</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="${image}" alt="${imageAlt}" />
      </div>
    </div>
  </div>
</section>

<style>
.hero-with-image {
  padding: 5rem 0;
  background: var(--light-color);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-grid.reverse {
  direction: rtl;
}

.hero-grid.reverse .hero-content {
  direction: ltr;
}

.hero-with-image .hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.hero-with-image .hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--secondary-color);
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .hero-grid.reverse {
    direction: ltr;
  }
  
  .hero-with-image .hero-title {
    font-size: 2rem;
  }
}
</style>`;
  },

  withVideo: (props) => {
    const {
      title = 'Experience the Future',
      subtitle = 'Watch our story unfold',
      videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      overlay = true
    } = props;

    return `
<section class="hero-video" data-component="hero-video">
  ${overlay ? '<div class="hero-overlay"></div>' : ''}
  <div class="hero-video-container">
    <iframe 
      src="${videoUrl}" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  <div class="hero-video-content">
    <div class="container">
      <h1 class="hero-title">${title}</h1>
      <p class="hero-subtitle">${subtitle}</p>
    </div>
  </div>
</section>

<style>
.hero-video {
  position: relative;
  height: 80vh;
  overflow: hidden;
}

.hero-video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero-video-container iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-video-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 2;
  width: 100%;
}

.hero-video .hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.hero-video .hero-subtitle {
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

@media (max-width: 768px) {
  .hero-video {
    height: 60vh;
  }
  
  .hero-video .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-video .hero-subtitle {
    font-size: 1.25rem;
  }
}
</style>`;
  }
};