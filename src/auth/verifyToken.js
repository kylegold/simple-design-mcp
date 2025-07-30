import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

// Initialize JWKS client
let jwksClient;

function initializeJwksClient() {
  if (!jwksClient) {
    jwksClient = jwksRsa({
      jwksUri: process.env.COMMANDS_JWKS_URL || 'https://api.commands.com/.well-known/jwks.json',
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5
    });
  }
  return jwksClient;
}

function getKey(header, callback) {
  const client = initializeJwksClient();
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

export function verifyJwt(req, res, next) {
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
    return res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Authorization header with Bearer token required'
      },
      id: null
    });
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
        return res.status(401).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid or expired token'
          },
          id: null
        });
      }

      req.user = decoded;
      next();
    }
  );
}