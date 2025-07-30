export const componentTemplates = {
  Home: (project) => {
    const isMaterial = project.uiLibrary === 'material-ui';
    
    if (isMaterial) {
      return `import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Button 
} from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to ${project.name}
        </Typography>
        <Typography variant="h5" color="text.secondary">
          ${project.description || `Your ${project.type} app`}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        ${generateFeatureCards(project.features || [], isMaterial)}
      </Grid>
    </Container>
  );
};

export default Home;`;
    }
    
    // Tailwind version
    return `import React from 'react';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to ${project.name}</h1>
        <p className="text-xl text-gray-600">
          ${project.description || `Your ${project.type} app`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${generateFeatureCards(project.features || [], false)}
      </div>
    </div>
  );
};

export default Home;`;
  },

  Navigation: (project) => {
    const isMaterial = project.uiLibrary === 'material-ui';
    const navType = project.components?.navigation || 'bottom-tabs';
    
    if (isMaterial && navType === 'bottom-tabs') {
      return `import React, { useState } from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction,
  Paper 
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Navigation = () => {
  const [value, setValue] = useState(0);

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Search" icon={<SearchIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation;`;
    }
    
    // Add more navigation types as needed
    return generateDefaultNavigation(project);
  },

  RecipeCard: (project) => {
    const isMaterial = project.uiLibrary === 'material-ui';
    
    if (isMaterial) {
      return `import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const RecipeCard = ({ recipe }) => {
  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={recipe.image || 'https://via.placeholder.com/345x200?text=Recipe+Image'}
        alt={recipe.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {recipe.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimeIcon sx={{ mr: 1, fontSize: 'small' }} />
          <Typography variant="body2" color="text.secondary">
            {recipe.time || '30 mins'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {recipe.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {recipe.tags?.map((tag) => (
            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
          ))}
        </Box>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default RecipeCard;`;
    }
    
    return generateTailwindRecipeCard();
  },

  LoginScreen: (project) => {
    const isMaterial = project.uiLibrary === 'material-ui';
    
    if (isMaterial) {
      return `import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert
} from '@mui/material';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log('Login with:', email, password);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Sign In
          </Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Don't have an account?{' '}
                <Link href="#" variant="body2">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginScreen;`;
    }
    
    return generateTailwindLoginScreen();
  }
};

// Helper functions
function generateFeatureCards(features, isMaterial) {
  if (features.length === 0) {
    features = ['Get Started', 'Explore', 'Connect'];
  }
  
  return features.slice(0, 3).map((feature, index) => {
    if (isMaterial) {
      return `
        <Grid item xs={12} md={4} key={${index}}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                ${capitalize(feature)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${getFeatureDescription(feature)}
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }}>
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Grid>`;
    } else {
      return `
        <div key="${index}" className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">${capitalize(feature)}</h3>
          <p className="text-gray-600 mb-4">
            ${getFeatureDescription(feature)}
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Learn More
          </button>
        </div>`;
    }
  }).join('');
}

function generateDefaultNavigation(project) {
  return `import React from 'react';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-bold">${project.name}</h1>
          <div className="flex space-x-4">
            <a href="#home" className="text-gray-700 hover:text-blue-500">Home</a>
            <a href="#about" className="text-gray-700 hover:text-blue-500">About</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-500">Contact</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;`;
}

function generateTailwindRecipeCard() {
  return `import React from 'react';

const RecipeCard = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={recipe.image || 'https://via.placeholder.com/400x300?text=Recipe+Image'} 
        alt={recipe.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{recipe.time || '30 mins'}</span>
        </div>
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags?.map((tag) => (
            <span key={tag} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between">
          <button className="text-red-500 hover:text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="text-gray-500 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.316C18.114 15.938 18 15.482 18 15c0-.482.114-.938.316-1.342m0 2.684a3 3 0 110-2.684M9 12a3 3 0 11-6 0 3 3 0 016 0zm12 3a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;`;
}

function generateTailwindLoginScreen() {
  return `import React, { useState } from 'react';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log('Login with:', email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

function getFeatureDescription(feature) {
  const descriptions = {
    'Get Started': 'Begin your journey with our easy-to-use platform',
    'Explore': 'Discover amazing content and features',
    'Connect': 'Join our community and share your experience',
    'search': 'Find exactly what you\'re looking for',
    'favorites': 'Save and organize your favorite items',
    'authentication': 'Secure access to your personal space'
  };
  return descriptions[feature] || `Experience the power of ${feature}`;
}