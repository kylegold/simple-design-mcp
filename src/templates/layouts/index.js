export const layouts = {
  default: (props) => {
    const {
      title = 'My App',
      content = '',
      customStyles = '',
      customScripts = ''
    } = props;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta http-equiv="refresh" content="3">
    
    <!-- Design System Variables -->
    <style>
        :root {
            --primary-color: #007bff;
            --secondary-color: #6c757d;
            --success-color: #28a745;
            --danger-color: #dc3545;
            --warning-color: #ffc107;
            --info-color: #17a2b8;
            --light-color: #f8f9fa;
            --dark-color: #343a40;
            --white: #ffffff;
            --black: #000000;
            
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            --font-size-base: 16px;
            --line-height-base: 1.6;
            
            --spacing-unit: 8px;
            --spacing-xs: calc(var(--spacing-unit) * 0.5);
            --spacing-sm: var(--spacing-unit);
            --spacing-md: calc(var(--spacing-unit) * 2);
            --spacing-lg: calc(var(--spacing-unit) * 3);
            --spacing-xl: calc(var(--spacing-unit) * 4);
            
            --border-radius: 4px;
            --border-radius-lg: 8px;
            --border-radius-xl: 16px;
            
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
            --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
            --shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
            
            --transition-fast: 150ms ease;
            --transition-base: 300ms ease;
            --transition-slow: 500ms ease;
            
            --z-index-dropdown: 1000;
            --z-index-modal: 1050;
            --z-index-tooltip: 1100;
        }
        
        /* Dark mode variables */
        @media (prefers-color-scheme: dark) {
            :root {
                --light-color: #1a1a1a;
                --dark-color: #f8f9fa;
                --white: #000000;
                --black: #ffffff;
            }
        }
        
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            font-size: var(--font-size-base);
            scroll-behavior: smooth;
        }
        
        body {
            font-family: var(--font-family);
            line-height: var(--line-height-base);
            color: var(--dark-color);
            background-color: var(--light-color);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        main {
            flex: 1;
        }
        
        /* Utility classes */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--spacing-md);
        }
        
        .container-fluid {
            width: 100%;
            padding: 0 var(--spacing-md);
        }
        
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        
        .mt-1 { margin-top: var(--spacing-sm); }
        .mt-2 { margin-top: var(--spacing-md); }
        .mt-3 { margin-top: var(--spacing-lg); }
        .mt-4 { margin-top: var(--spacing-xl); }
        
        .mb-1 { margin-bottom: var(--spacing-sm); }
        .mb-2 { margin-bottom: var(--spacing-md); }
        .mb-3 { margin-bottom: var(--spacing-lg); }
        .mb-4 { margin-bottom: var(--spacing-xl); }
        
        .py-1 { padding-top: var(--spacing-sm); padding-bottom: var(--spacing-sm); }
        .py-2 { padding-top: var(--spacing-md); padding-bottom: var(--spacing-md); }
        .py-3 { padding-top: var(--spacing-lg); padding-bottom: var(--spacing-lg); }
        .py-4 { padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl); }
        
        /* Button styles */
        .btn {
            display: inline-block;
            font-weight: 500;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            user-select: none;
            border: 1px solid transparent;
            padding: 0.5rem 1rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: var(--border-radius);
            transition: all var(--transition-base);
            cursor: pointer;
            text-decoration: none;
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
        
        .btn:active {
            transform: translateY(0);
            box-shadow: var(--shadow-sm);
        }
        
        .btn-primary {
            color: white;
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        
        .btn-primary:hover {
            background-color: #0056b3;
            border-color: #004085;
        }
        
        .btn-secondary {
            color: white;
            background-color: var(--secondary-color);
            border-color: var(--secondary-color);
        }
        
        .btn-outline-primary {
            color: var(--primary-color);
            background-color: transparent;
            border-color: var(--primary-color);
        }
        
        .btn-outline-primary:hover {
            color: white;
            background-color: var(--primary-color);
        }
        
        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }
        
        .btn-lg {
            padding: 0.75rem 1.5rem;
            font-size: 1.125rem;
        }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 1rem;
        }
        
        h1 { font-size: 2.5rem; }
        h2 { font-size: 2rem; }
        h3 { font-size: 1.75rem; }
        h4 { font-size: 1.5rem; }
        h5 { font-size: 1.25rem; }
        h6 { font-size: 1rem; }
        
        p {
            margin-bottom: 1rem;
        }
        
        a {
            color: var(--primary-color);
            text-decoration: none;
            transition: color var(--transition-base);
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* Grid system */
        .row {
            display: flex;
            flex-wrap: wrap;
            margin-right: calc(var(--spacing-md) * -1);
            margin-left: calc(var(--spacing-md) * -1);
        }
        
        .col {
            flex: 1;
            padding-right: var(--spacing-md);
            padding-left: var(--spacing-md);
        }
        
        .col-12 { flex: 0 0 100%; max-width: 100%; }
        .col-6 { flex: 0 0 50%; max-width: 50%; }
        .col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
        .col-3 { flex: 0 0 25%; max-width: 25%; }
        
        @media (max-width: 768px) {
            .col-sm-12 { flex: 0 0 100%; max-width: 100%; }
            .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
        }
        
        /* Section spacing */
        section {
            padding: var(--spacing-xl) 0;
        }
        
        /* Accessibility */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Focus styles */
        *:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
        
        ${customStyles}
    </style>
</head>
<body>
    ${content}
    
    <script>
        // Auto-refresh indicator
        let refreshCountdown = 3;
        const countdownElement = document.createElement('div');
        countdownElement.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; z-index: 9999;';
        countdownElement.textContent = 'Auto-refresh in 3s';
        document.body.appendChild(countdownElement);
        
        setInterval(() => {
            refreshCountdown--;
            countdownElement.textContent = \`Auto-refresh in \${refreshCountdown}s\`;
            if (refreshCountdown <= 0) {
                refreshCountdown = 3;
            }
        }, 1000);
        
        ${customScripts}
    </script>
</body>
</html>`;
  },

  landing: (props) => {
    const {
      title = 'Welcome',
      navbar = true,
      hero = true,
      features = true,
      testimonials = false,
      cta = true,
      footer = true,
      content = '',
      customStyles = '',
      customScripts = ''
    } = props;

    // This would use the component system to build a landing page layout
    return layouts.default({
      title,
      content,
      customStyles,
      customScripts
    });
  },

  dashboard: (props) => {
    const {
      title = 'Dashboard',
      sidebar = true,
      navbar = true,
      content = '',
      customStyles = '',
      customScripts = ''
    } = props;

    // This would use the component system to build a dashboard layout
    return layouts.default({
      title,
      content,
      customStyles: `
        ${customStyles}
        body {
          background: var(--light-color);
        }
        main {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          margin-left: ${sidebar ? '250px' : '0'};
          padding: 2rem;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `,
      customScripts
    });
  }
};