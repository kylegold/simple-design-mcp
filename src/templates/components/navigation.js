export const navigation = {
  navbar: (props) => {
    const {
      brand = 'My App',
      logo = '',
      links = [],
      sticky = true,
      transparent = false,
      className = ''
    } = props;

    const navLinks = links.map(link => `
      <li class="nav-item${link.active ? ' active' : ''}">
        <a class="nav-link" href="${link.href}">${link.text}</a>
      </li>`).join('');

    return `
<nav class="navbar ${sticky ? 'sticky-top' : ''} ${transparent ? 'navbar-transparent' : 'navbar-light bg-light'} ${className}" data-component="navbar">
  <div class="container">
    <a class="navbar-brand" href="/">
      ${logo ? `<img src="${logo}" alt="${brand}" height="30">` : brand}
    </a>
    
    <button class="navbar-toggler" type="button" onclick="toggleMobileMenu()">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <div class="navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ml-auto">
        ${navLinks}
      </ul>
    </div>
  </div>
</nav>

<style>
.navbar {
  padding: 1rem 0;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.navbar-transparent {
  background: transparent;
  position: absolute;
  width: 100%;
  z-index: 1000;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
  text-decoration: none;
  color: var(--primary-color);
}

.navbar-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-item {
  margin-left: 1.5rem;
}

.nav-link {
  color: var(--dark-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 0.5rem 0;
}

.nav-link:hover,
.nav-item.active .nav-link {
  color: var(--primary-color);
}

.navbar-toggler {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.navbar-toggler-icon {
  display: block;
  width: 25px;
  height: 3px;
  background: var(--dark-color);
  position: relative;
  transition: all 0.3s ease;
}

.navbar-toggler-icon::before,
.navbar-toggler-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--dark-color);
  transition: all 0.3s ease;
}

.navbar-toggler-icon::before {
  top: -8px;
}

.navbar-toggler-icon::after {
  bottom: -8px;
}

.navbar-collapse {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

@media (max-width: 768px) {
  .navbar-toggler {
    display: block;
  }
  
  .navbar-collapse {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    box-shadow: var(--shadow-md);
    padding: 1rem;
  }
  
  .navbar-collapse.show {
    display: block;
  }
  
  .navbar-nav {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nav-item {
    margin: 0;
    margin-top: 0.5rem;
  }
}
</style>

<script>
function toggleMobileMenu() {
  const navbar = document.getElementById('navbarNav');
  navbar.classList.toggle('show');
}
</script>`;
  },

  sidebar: (props) => {
    const {
      links = [],
      header = '',
      footer = '',
      width = '250px'
    } = props;

    const sidebarLinks = links.map(link => {
      if (link.children) {
        return `
      <li class="sidebar-item">
        <a class="sidebar-link has-children" href="#" onclick="toggleSubmenu(event, '${link.id}')">
          ${link.icon ? `<i class="${link.icon}"></i>` : ''}
          ${link.text}
          <i class="arrow"></i>
        </a>
        <ul class="sidebar-submenu" id="${link.id}">
          ${link.children.map(child => `
            <li><a href="${child.href}">${child.text}</a></li>
          `).join('')}
        </ul>
      </li>`;
      }
      
      return `
      <li class="sidebar-item${link.active ? ' active' : ''}">
        <a class="sidebar-link" href="${link.href}">
          ${link.icon ? `<i class="${link.icon}"></i>` : ''}
          ${link.text}
        </a>
      </li>`;
    }).join('');

    return `
<aside class="sidebar" style="width: ${width}" data-component="sidebar">
  ${header ? `<div class="sidebar-header">${header}</div>` : ''}
  
  <nav class="sidebar-nav">
    <ul class="sidebar-menu">
      ${sidebarLinks}
    </ul>
  </nav>
  
  ${footer ? `<div class="sidebar-footer">${footer}</div>` : ''}
</aside>

<style>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: white;
  box-shadow: var(--shadow-md);
  overflow-y: auto;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-header,
.sidebar-footer {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-footer {
  border-bottom: none;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-item {
  margin: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--dark-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

.sidebar-link:hover,
.sidebar-item.active .sidebar-link {
  background: var(--light-color);
  color: var(--primary-color);
}

.sidebar-link i {
  margin-right: 0.5rem;
  width: 20px;
  text-align: center;
}

.sidebar-submenu {
  display: none;
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--light-color);
}

.sidebar-submenu.show {
  display: block;
}

.sidebar-submenu a {
  display: block;
  padding: 0.5rem 1rem 0.5rem 3rem;
  color: var(--secondary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.sidebar-submenu a:hover {
  color: var(--primary-color);
}

.arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.has-children.expanded .arrow {
  transform: rotate(90deg);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
}
</style>

<script>
function toggleSubmenu(event, id) {
  event.preventDefault();
  const submenu = document.getElementById(id);
  submenu.classList.toggle('show');
  event.currentTarget.classList.toggle('expanded');
}
</script>`;
  }
};