# /export-app Command

Generate production-ready React or React Native code for your designed app.

## What You Get

- ✅ Complete project structure
- ✅ All dependencies in package.json
- ✅ Clean, modular components
- ✅ Modern UI library integrated
- ✅ Responsive design built-in
- ✅ README with instructions
- ✅ Design documentation

## Usage

### Basic Export
```
/export-app
```

### Specify Location
```
/export-app --export_path "./my-awesome-app"
```

### Export Specific Session
```
/export-app --conversation_id "your-session-id"
```

## Generated Structure

```
my-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Full page layouts
│   ├── styles/         # Theme and styling
│   └── App.js          # Main application
├── design/
│   ├── decisions.md    # Design rationale
│   └── project.json    # Conversation history
├── package.json        # Ready to npm install
└── README.md          # Project documentation
```

## Next Steps

After export:
1. `cd my-app`
2. `npm install`
3. `npm start`

Your app is ready to customize and deploy!