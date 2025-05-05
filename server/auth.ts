import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Express, Request } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { User as SelectUser } from '@shared/schema';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Generate a random session secret if not provided in environment
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid username or password' });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );
  
  // Setup Google strategy if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `/api/auth/google/callback`,
          scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with this Google ID
            let user = await storage.getUserByOAuthId('google', profile.id);
            
            if (!user) {
              // If user doesn't exist, create a new one
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
              const username = profile.displayName.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 1000);
              
              user = await storage.createUser({
                username,
                password: await hashPassword(randomBytes(16).toString('hex')), // Random secure password
                firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
                lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' '),
                email,
                profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                oauthProvider: 'google',
                oauthId: profile.id
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
  
  // Setup Facebook strategy if credentials are available
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `/api/auth/facebook/callback`,
          profileFields: ['id', 'displayName', 'photos', 'email', 'name']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with this Facebook ID
            let user = await storage.getUserByOAuthId('facebook', profile.id);
            
            if (!user) {
              // If user doesn't exist, create a new one
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
              const username = profile.displayName.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 1000);
              
              user = await storage.createUser({
                username,
                password: await hashPassword(randomBytes(16).toString('hex')), // Random secure password
                firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
                lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' '),
                email,
                profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                oauthProvider: 'facebook',
                oauthId: profile.id
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Registration endpoint
  app.post('/api/register', async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message || 'Authentication failed' });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
    res.json(req.user);
  });
  
  // Google OAuth routes
  app.get('/api/auth/google', passport.authenticate('google'));
  
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req, res) => {
      res.redirect('/');
    }
  );
  
  // Facebook OAuth routes
  app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  
  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth' }),
    (req, res) => {
      res.redirect('/');
    }
  );
}

// Middleware for route protection
export function isAuthenticated(req: Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

export function isAdmin(req: Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Not authorized' });
}
