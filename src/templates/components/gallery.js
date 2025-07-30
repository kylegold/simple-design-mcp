export const gallery = {
  grid: (props) => {
    const {
      images = [],
      columns = 3,
      gap = '1rem',
      lightbox = true
    } = props;

    const imageElements = images.map((img, index) => `
      <div class="gallery-item" ${lightbox ? `onclick="openLightbox(${index})"` : ''}>
        <img src="${img.src}" alt="${img.alt || `Image ${index + 1}`}" loading="lazy">
        ${img.caption ? `<div class="gallery-caption">${img.caption}</div>` : ''}
      </div>
    `).join('');

    return `
<div class="image-gallery" style="--columns: ${columns}; --gap: ${gap}" data-component="image-gallery">
  ${imageElements}
</div>

${lightbox ? `
<div id="lightbox" class="lightbox" onclick="closeLightbox(event)">
  <span class="lightbox-close">&times;</span>
  <img class="lightbox-image" id="lightbox-img" src="" alt="">
  <div class="lightbox-caption" id="lightbox-caption"></div>
  <button class="lightbox-prev" onclick="changeLightboxImage(-1); event.stopPropagation();">&#10094;</button>
  <button class="lightbox-next" onclick="changeLightboxImage(1); event.stopPropagation();">&#10095;</button>
</div>` : ''}

<style>
.image-gallery {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: var(--gap);
  margin: 2rem 0;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius);
  cursor: ${lightbox ? 'pointer' : 'default'};
  background: var(--light-color);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-caption {
  transform: translateY(0);
}

/* Lightbox styles */
.lightbox {
  display: none;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  cursor: pointer;
}

.lightbox.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
  cursor: default;
}

.lightbox-caption {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: var(--border-radius);
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 40px;
  color: white;
  font-size: 40px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1001;
}

.lightbox-close:hover {
  color: #f1f1f1;
}

.lightbox-prev,
.lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  font-size: 30px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.lightbox-prev:hover,
.lightbox-next:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

@media (max-width: 1024px) {
  .image-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .image-gallery {
    grid-template-columns: 1fr;
  }
  
  .lightbox-prev,
  .lightbox-next {
    padding: 5px 10px;
    font-size: 20px;
  }
}
</style>

<script>
const galleryImages = ${JSON.stringify(images)};
let currentImageIndex = 0;

function openLightbox(index) {
  currentImageIndex = index;
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  
  img.src = galleryImages[index].src;
  img.alt = galleryImages[index].alt || \`Image \${index + 1}\`;
  caption.textContent = galleryImages[index].caption || '';
  caption.style.display = galleryImages[index].caption ? 'block' : 'none';
  
  lightbox.classList.add('active');
}

function closeLightbox(event) {
  if (event.target.id === 'lightbox' || event.target.className === 'lightbox-close') {
    document.getElementById('lightbox').classList.remove('active');
  }
}

function changeLightboxImage(direction) {
  currentImageIndex += direction;
  
  if (currentImageIndex >= galleryImages.length) {
    currentImageIndex = 0;
  } else if (currentImageIndex < 0) {
    currentImageIndex = galleryImages.length - 1;
  }
  
  openLightbox(currentImageIndex);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && lightbox.classList.contains('active')) {
    if (e.key === 'Escape') closeLightbox({ target: lightbox });
    if (e.key === 'ArrowLeft') changeLightboxImage(-1);
    if (e.key === 'ArrowRight') changeLightboxImage(1);
  }
});
</script>`;
  },

  carousel: (props) => {
    const {
      images = [],
      autoplay = true,
      interval = 5000,
      showIndicators = true,
      showControls = true
    } = props;

    const slides = images.map((img, index) => `
      <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
        <img src="${img.src}" alt="${img.alt || `Slide ${index + 1}`}">
        ${img.caption ? `<div class="carousel-caption">
          ${img.title ? `<h3>${img.title}</h3>` : ''}
          ${img.caption ? `<p>${img.caption}</p>` : ''}
        </div>` : ''}
      </div>
    `).join('');

    const indicators = showIndicators ? `
      <div class="carousel-indicators">
        ${images.map((_, index) => 
          `<button class="indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})" aria-label="Go to slide ${index + 1}"></button>`
        ).join('')}
      </div>
    ` : '';

    return `
<div class="carousel" data-component="carousel" data-autoplay="${autoplay}" data-interval="${interval}">
  <div class="carousel-inner">
    ${slides}
  </div>
  
  ${showControls ? `
  <button class="carousel-control prev" onclick="changeSlide(-1)" aria-label="Previous slide">
    <span>&#10094;</span>
  </button>
  <button class="carousel-control next" onclick="changeSlide(1)" aria-label="Next slide">
    <span>&#10095;</span>
  </button>
  ` : ''}
  
  ${indicators}
</div>

<style>
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
}

.carousel-inner {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  text-align: center;
}

.carousel-caption h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.carousel-caption p {
  font-size: 1rem;
  margin: 0;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 1rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.carousel-control:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-control.prev {
  left: 1rem;
}

.carousel-control.next {
  right: 1rem;
}

.carousel-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
  width: 30px;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .carousel-caption h3 {
    font-size: 1.25rem;
  }
  
  .carousel-caption p {
    font-size: 0.875rem;
  }
  
  .carousel-control {
    font-size: 1.5rem;
    padding: 0.5rem;
  }
}
</style>

<script>
let currentSlide = 0;
let slideInterval;
const totalSlides = ${images.length};

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');
  
  slides.forEach(slide => slide.classList.remove('active'));
  indicators.forEach(indicator => indicator.classList.remove('active'));
  
  slides[index].classList.add('active');
  if (indicators[index]) indicators[index].classList.add('active');
}

function changeSlide(direction) {
  currentSlide += direction;
  
  if (currentSlide >= totalSlides) {
    currentSlide = 0;
  } else if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  }
  
  showSlide(currentSlide);
  resetInterval();
}

function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
  resetInterval();
}

function resetInterval() {
  if (slideInterval) {
    clearInterval(slideInterval);
    startAutoplay();
  }
}

function startAutoplay() {
  const carousel = document.querySelector('.carousel');
  const autoplay = carousel.dataset.autoplay === 'true';
  const interval = parseInt(carousel.dataset.interval) || 5000;
  
  if (autoplay) {
    slideInterval = setInterval(() => changeSlide(1), interval);
  }
}

// Start autoplay when page loads
document.addEventListener('DOMContentLoaded', startAutoplay);

// Pause on hover
const carousel = document.querySelector('.carousel');
carousel.addEventListener('mouseenter', () => {
  if (slideInterval) clearInterval(slideInterval);
});
carousel.addEventListener('mouseleave', startAutoplay);
</script>`;
  }
};