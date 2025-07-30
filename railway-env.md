# Railway Environment Variables

Add these environment variables to your Railway deployment:

```
NODE_ENV=production
PORT=3002
SKIP_AUTH=false
COMMANDS_JWKS_URL=https://api.commands.com/.well-known/jwks.json
COMMANDS_JWT_ISSUER=https://api.commands.com
COMMANDS_JWT_AUDIENCE=commands.com
HOST=0.0.0.0
```

## To add them:
1. Go to your Railway dashboard
2. Click on your simple-design-mcp service
3. Go to Variables tab
4. Add each variable above

## Important:
- PORT should be 3002 (as you mentioned)
- HOST must be 0.0.0.0 for Railway
- SKIP_AUTH must be false in production