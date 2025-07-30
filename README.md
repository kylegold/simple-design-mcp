# Simple Design MCP Server

Design beautiful apps without coding - just tell me what you want to build! 🎨

## 🌟 Overview

Simple Design MCP is a conversational design tool that lets non-technical builders create professional React and React Native apps through natural language. No coding required - just describe your vision and watch it come to life!

## ✨ Features

- **Natural Language Design**: Just describe what you want in plain English
- **Smart Defaults**: Automatically chooses the right UI library, colors, and layout based on your app type
- **Real Code Generation**: Produces production-ready React/React Native code
- **No Technical Decisions**: The AI handles all technical choices for you
- **Local-First**: Everything runs on your machine, no cloud dependencies
- **Beautiful Templates**: Pre-configured with Material-UI, Tailwind, or shadcn/ui

## 🚀 Installation

```bash
npx @your-username/simple-design-mcp
```

Or install globally:

```bash
npm install -g @your-username/simple-design-mcp
```

## 🎯 Usage

### 1. Start a Conversation

```
You: I want to build a recipe app for home cooks
Bot: I love it! A recipe app - perfect for food lovers!

Let me ask a few quick questions to make sure I design exactly what you're envisioning:

1. Who's going to use your recipe app?
2. What's the main thing they'll do with it?
3. Any apps you love the look of?

Just answer naturally - I'll handle all the technical stuff! 😊
```

### 2. Available Commands

- **`chat`** - Tell me what you want to build or change
- **`show`** - See your current design
- **`export`** - Generate the actual app code
- **`examples`** - Get inspiration from different app types

### 3. Example Conversations

#### Starting a New Project
```
You: I need an app for tracking my workouts
Bot: A fitness app - let's help people get healthy! Who will use this app?
You: Busy professionals who want quick workouts
Bot: Perfect! I'll design something efficient and motivating...
```

#### Adding Features
```
You: Can we add a way to upload photos?
Bot: Great idea! I've added photo upload to your app. Users can now add and view photos.
```

#### Changing Styles
```
You: Make it darker and more modern
Bot: Love it! I've updated the design to be darker and more sophisticated. The app now has a sleek dark theme with great contrast.
```

## 🎨 Smart Defaults

The tool automatically selects appropriate design systems based on your app type:

- **Recipe Apps**: Warm colors, card layouts, Material-UI
- **Fitness Apps**: Energetic colors, dashboard layout, Tailwind
- **Social Apps**: Modern design, feed layout, shadcn/ui
- **And many more...**

## 📁 Generated Project Structure

```
my-awesome-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Full page layouts
│   ├── styles/          # Theme and styling
│   └── App.js          # Main application file
├── design/
│   ├── decisions.md    # Design rationale in plain English
│   └── project.json    # Conversation history
├── package.json        # Ready to npm install
└── README.md          # Project documentation
```

## 🛠️ For Developers

### Adding to Claude Desktop

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "simple-design": {
      "command": "npx",
      "args": ["@your-username/simple-design-mcp"]
    }
  }
}
```

### Running Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/simple-design-mcp.git
cd simple-design-mcp

# Install dependencies
npm install

# Run the server
npm start
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

Built for [Commands.com](https://commands.com) to make app design accessible to everyone!

---

**Made with ❤️ for non-technical builders who have great ideas**