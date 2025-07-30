import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

// Initialize JWKS client with caching
let jwksClient;

function initializeJwksClient() {
  if (!jwksClient) {
    jwksClient = jwksRsa({
      jwksUri: process.env.COMMANDS_JWKS_URL || 'https://api.commands.com/.well-known/jwks.json',
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 5
    });
  }
  return jwksClient;
}

// Cache for signing keys to avoid repeated lookups
const keyCache = new Map();

function getKey(header, callback) {
  // Check cache first
  const cachedKey = keyCache.get(header.kid);
  if (cachedKey && cachedKey.expires > Date.now()) {
    return callback(null, cachedKey.key);
  }

  const client = initializeJwksClient();
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    
    const signingKey = key?.getPublicKey();
    if (signingKey) {
      // Cache the key for 5 minutes
      keyCache.set(header.kid, {
        key: signingKey,
        expires: Date.now() + 5 * 60 * 1000
      });
    }
    
    callback(null, signingKey);
  });
}

// New middleware that doesn't send responses, just sets req.authError
export function verifyJwtMiddleware(req, res, next) {
  // Skip auth in development if SKIP_AUTH is true
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
    req.user = {
      sub: 'dev-user',
      email: 'dev@example.com',
      scope: 'read:user'
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    req.authError = {
      code: -32600,
      message: 'Authentication required'
    };
    return next();
  }

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      issuer: process.env.COMMANDS_JWT_ISSUER || 'https://api.commands.com',
      audience: process.env.COMMANDS_JWT_AUDIENCE || 'commands.com'
    },
    (err, decoded) => {
      if (err) {
        // Only log JWT errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('JWT verification failed:', err.message);
        }
        
        req.authError = {
          code: -32600,
          message: 'Invalid or expired token'
        };
        return next();
      }

      req.user = decoded;
      next();
    }
  );
}

// Legacy middleware for backwards compatibility
export function verifyJwt(req, res, next) {
  verifyJwtMiddleware(req, res, () => {
    if (req.authError) {
      // This is the problem - it doesn't have access to the JSON-RPC id
      return res.status(401).json({
        error: {
          code: 401,
          message: req.authError.message
        }
      });
    }
    next();
  });
}