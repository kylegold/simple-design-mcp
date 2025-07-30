export const forms = {
  contact: (props) => {
    const {
      action = '#',
      method = 'POST',
      showPhone = true,
      showCompany = false,
      buttonText = 'Send Message'
    } = props;

    return `
<form class="contact-form" action="${action}" method="${method}" data-component="contact-form">
  <div class="form-group">
    <label for="contact-name">Name</label>
    <input type="text" id="contact-name" name="name" class="form-control" required>
  </div>
  
  <div class="form-group">
    <label for="contact-email">Email</label>
    <input type="email" id="contact-email" name="email" class="form-control" required>
  </div>
  
  ${showPhone ? `
  <div class="form-group">
    <label for="contact-phone">Phone</label>
    <input type="tel" id="contact-phone" name="phone" class="form-control">
  </div>` : ''}
  
  ${showCompany ? `
  <div class="form-group">
    <label for="contact-company">Company</label>
    <input type="text" id="contact-company" name="company" class="form-control">
  </div>` : ''}
  
  <div class="form-group">
    <label for="contact-message">Message</label>
    <textarea id="contact-message" name="message" class="form-control" rows="5" required></textarea>
  </div>
  
  <button type="submit" class="btn btn-primary">${buttonText}</button>
</form>

<style>
.contact-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--dark-color);
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--dark-color);
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: var(--border-radius);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}
</style>`;
  },

  login: (props) => {
    const {
      action = '#',
      method = 'POST',
      showRemember = true,
      showForgot = true,
      showRegister = true
    } = props;

    return `
<form class="login-form" action="${action}" method="${method}" data-component="login-form">
  <h2 class="form-title">Login</h2>
  
  <div class="form-group">
    <label for="login-email">Email</label>
    <input type="email" id="login-email" name="email" class="form-control" required>
  </div>
  
  <div class="form-group">
    <label for="login-password">Password</label>
    <input type="password" id="login-password" name="password" class="form-control" required>
  </div>
  
  ${showRemember ? `
  <div class="form-check">
    <input type="checkbox" id="login-remember" name="remember" class="form-check-input">
    <label for="login-remember" class="form-check-label">Remember me</label>
  </div>` : ''}
  
  <button type="submit" class="btn btn-primary btn-block">Login</button>
  
  <div class="form-footer">
    ${showForgot ? `<a href="/forgot-password">Forgot password?</a>` : ''}
    ${showRegister ? `<span>Don't have an account? <a href="/register">Register</a></span>` : ''}
  </div>
</form>

<style>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
}

.form-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--dark-color);
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  margin: 0;
  font-weight: normal;
}

.btn-block {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.125rem;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.form-footer a {
  color: var(--primary-color);
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

.form-footer span {
  display: block;
  margin-top: 0.5rem;
  color: var(--secondary-color);
}
</style>`;
  },

  searchBar: (props) => {
    const {
      placeholder = 'Search...',
      buttonText = 'Search',
      action = '/search',
      method = 'GET',
      size = 'default'
    } = props;

    const sizeClass = size === 'large' ? 'search-bar-lg' : size === 'small' ? 'search-bar-sm' : '';

    return `
<form class="search-bar ${sizeClass}" action="${action}" method="${method}" data-component="search-bar">
  <div class="search-input-group">
    <input 
      type="search" 
      name="q" 
      class="search-input" 
      placeholder="${placeholder}"
      aria-label="Search"
    >
    <button type="submit" class="search-button">
      <span class="search-icon">🔍</span>
      <span class="search-text">${buttonText}</span>
    </button>
  </div>
</form>

<style>
.search-bar {
  width: 100%;
  max-width: 600px;
}

.search-input-group {
  display: flex;
  align-items: stretch;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-right: none;
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: 2px solid var(--primary-color);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: var(--primary-color);
  transform: translateX(2px);
}

.search-icon {
  font-size: 1.125rem;
}

.search-text {
  font-weight: 500;
}

/* Size variations */
.search-bar-lg .search-input,
.search-bar-lg .search-button {
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
}

.search-bar-sm .search-input,
.search-bar-sm .search-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .search-text {
    display: none;
  }
  
  .search-button {
    padding: 0.75rem 1rem;
  }
}
</style>`;
  }
};