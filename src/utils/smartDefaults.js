export const smartDefaults = {
  recipe: {
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4", 
      accent: "#45B7D1",
      background: "#FAFAFA",
      text: "#2C3E50"
    },
    uiLibrary: "material-ui",
    features: ["search", "favorites", "categories", "photo-upload", "ratings"],
    layout: "card-grid",
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Open Sans"
    },
    components: {
      cardStyle: "elevated-with-image",
      navigation: "bottom-tabs"
    }
  },
  
  fitness: {
    colors: {
      primary: "#00D9FF",
      secondary: "#0099DB",
      accent: "#FF6B6B",
      background: "#0A0A0A",
      text: "#FFFFFF"
    },
    uiLibrary: "tailwind",
    features: ["workouts", "progress-tracking", "timer", "achievements", "social"],
    layout: "dashboard",
    typography: {
      headingFont: "Montserrat",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "flat-modern",
      navigation: "sidebar"
    }
  },
  
  social: {
    colors: {
      primary: "#5865F2",
      secondary: "#7289DA",
      accent: "#57F287",
      background: "#36393F",
      text: "#DCDDDE"
    },
    uiLibrary: "shadcn",
    features: ["profiles", "messaging", "feed", "notifications", "groups"],
    layout: "feed-based",
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "rounded-modern",
      navigation: "top-bar"
    }
  },
  
  productivity: {
    colors: {
      primary: "#6366F1",
      secondary: "#8B5CF6",
      accent: "#EC4899",
      background: "#FFFFFF",
      text: "#1F2937"
    },
    uiLibrary: "shadcn",
    features: ["tasks", "calendar", "reminders", "categories", "analytics"],
    layout: "kanban",
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "minimal-border",
      navigation: "sidebar"
    }
  },
  
  learning: {
    colors: {
      primary: "#10B981",
      secondary: "#3B82F6",
      accent: "#F59E0B",
      background: "#F9FAFB",
      text: "#111827"
    },
    uiLibrary: "material-ui",
    features: ["courses", "progress", "quizzes", "certificates", "discussions"],
    layout: "course-grid",
    typography: {
      headingFont: "Poppins",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "elevated-clean",
      navigation: "top-bar"
    }
  },
  
  shopping: {
    colors: {
      primary: "#F97316",
      secondary: "#EC4899",
      accent: "#8B5CF6",
      background: "#FFFFFF",
      text: "#18181B"
    },
    uiLibrary: "tailwind",
    features: ["products", "cart", "checkout", "search", "reviews", "wishlist"],
    layout: "product-grid",
    typography: {
      headingFont: "Poppins",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "product-card",
      navigation: "sticky-header"
    }
  },
  
  finance: {
    colors: {
      primary: "#059669",
      secondary: "#0891B2",
      accent: "#7C3AED",
      background: "#F8FAFC",
      text: "#0F172A"
    },
    uiLibrary: "shadcn",
    features: ["dashboard", "transactions", "budgets", "analytics", "goals"],
    layout: "dashboard",
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "clean-stats",
      navigation: "sidebar"
    }
  },
  
  travel: {
    colors: {
      primary: "#0EA5E9",
      secondary: "#14B8A6",
      accent: "#F97316",
      background: "#FFFFFF",
      text: "#0F172A"
    },
    uiLibrary: "material-ui",
    features: ["destinations", "booking", "itinerary", "maps", "reviews"],
    layout: "explore-grid",
    typography: {
      headingFont: "Montserrat",
      bodyFont: "Open Sans"
    },
    components: {
      cardStyle: "image-heavy",
      navigation: "bottom-tabs"
    }
  },
  
  music: {
    colors: {
      primary: "#1DB954",
      secondary: "#191414",
      accent: "#1ED760",
      background: "#121212",
      text: "#FFFFFF"
    },
    uiLibrary: "tailwind",
    features: ["playlists", "player", "discover", "library", "social"],
    layout: "player-focused",
    typography: {
      headingFont: "Montserrat",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "album-art",
      navigation: "bottom-player"
    }
  },
  
  photo: {
    colors: {
      primary: "#E11D48",
      secondary: "#BE123C",
      accent: "#FBBF24",
      background: "#FAFAFA",
      text: "#18181B"
    },
    uiLibrary: "material-ui",
    features: ["gallery", "upload", "filters", "albums", "sharing"],
    layout: "masonry-grid",
    typography: {
      headingFont: "Poppins",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "photo-tile",
      navigation: "bottom-tabs"
    }
  },
  
  general: {
    colors: {
      primary: "#3B82F6",
      secondary: "#8B5CF6",
      accent: "#10B981",
      background: "#FFFFFF",
      text: "#1F2937"
    },
    uiLibrary: "material-ui",
    features: ["home", "explore", "profile", "settings"],
    layout: "standard",
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter"
    },
    components: {
      cardStyle: "elevated",
      navigation: "bottom-tabs"
    }
  }
};

export const getSmartDefaults = (category) => {
  return smartDefaults[category] || smartDefaults.general;
};