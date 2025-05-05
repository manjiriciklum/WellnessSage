/**
 * HIPAA-Compliant Security Features for Healthcare Data
 * 
 * This module implements security features required for HIPAA compliance including:
 * - Data encryption at rest and in transit
 * - Audit logging for all data access
 * - Authentication and authorization controls
 * - Data retention policies
 * - Data masking for sensitive information
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Request, Response, NextFunction } from 'express';

// ES Modules replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Encryption keys and initialization vectors should be stored securely in environment variables
// For demo purposes, we're generating them here, but in production they should be managed securely
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex');

// Encryption algorithm - AES-256-GCM is recommended for HIPAA compliance
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

// Directory for audit logs
const AUDIT_LOG_DIR = path.join(__dirname, '../logs');

/**
 * Encrypt sensitive data
 * @param data - Data to encrypt
 * @returns Encrypted data with IV and auth tag
 */
export function encryptData(data: string): { encryptedData: string; iv: string; authTag: string } {
  // Create IV
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    iv
  );
  
  // Encrypt data
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get authentication tag (for GCM mode)
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag
  };
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Data to decrypt
 * @param iv - Initialization vector used for encryption
 * @param authTag - Authentication tag from encryption
 * @returns Original data
 */
export function decryptData(encryptedData: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    Buffer.from(iv, 'hex')
  );
  
  // Set auth tag for GCM mode
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  // Decrypt data
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Log audit events for HIPAA compliance
 * @param userId - User performing the action
 * @param action - Action being performed (view, create, update, delete)
 * @param resourceType - Type of resource being accessed (patient, prescription, etc.)
 * @param resourceId - ID of the resource
 * @param details - Additional details about the action
 */
export function logAuditEvent(userId: number, action: string, resourceType: string, resourceId: string | number, details?: string): void {
  // Create audit log entry
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    userId,
    action,
    resourceType,
    resourceId,
    details,
    userIp: '', // Should be filled with request IP
    userAgent: '' // Should be filled with request user agent
  };
  
  // Ensure log directory exists
  if (!fs.existsSync(AUDIT_LOG_DIR)) {
    fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
  }
  
  // Write to log file
  const logFilePath = path.join(AUDIT_LOG_DIR, `audit-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
  
  // In a production environment, you might want to send this to a secure logging service
  console.log(`AUDIT: ${action} ${resourceType} ${resourceId} by user ${userId}`);
}

/**
 * Middleware to log API access for HIPAA compliance
 */
export function auditLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract user ID from request (assumes authentication middleware has run)
  const userId = req.body.userId || 1; // Default to 1 for demo purposes
  
  // Determine resource type and ID from URL
  const urlParts = req.path.split('/');
  let resourceType = urlParts[1] || 'unknown';
  let resourceId = urlParts[2] || 'all';
  
  // Determine action from HTTP method
  let action = '';
  switch (req.method) {
    case 'GET':
      action = 'view';
      break;
    case 'POST':
      action = 'create';
      break;
    case 'PUT':
    case 'PATCH':
      action = 'update';
      break;
    case 'DELETE':
      action = 'delete';
      break;
    default:
      action = req.method;
  }
  
  // Add IP and user agent
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resourceType,
    resourceId,
    userIp: req.ip,
    userAgent: req.headers['user-agent'],
    requestPath: req.path,
    requestMethod: req.method
  };
  
  // Log the access
  if (!fs.existsSync(AUDIT_LOG_DIR)) {
    fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
  }
  
  const logFilePath = path.join(AUDIT_LOG_DIR, `api-access-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
  
  next();
}

/**
 * Mask sensitive information for display (e.g., SSN, DOB)
 * @param data - Data containing sensitive fields
 * @returns Data with sensitive fields masked
 */
export function maskSensitiveData<T extends Record<string, any>>(data: T): T {
  const sensitiveFields = ['ssn', 'socialSecurityNumber', 'dob', 'dateOfBirth'];
  const maskedData = { ...data } as T; // Explicit cast to T to avoid TypeScript errors

  for (const field of sensitiveFields) {
    if (Object.prototype.hasOwnProperty.call(maskedData, field)) {
      if (field === 'ssn' || field === 'socialSecurityNumber') {
        // Mask all but last 4 digits for SSN
        const ssn = String(maskedData[field as keyof T]);
        (maskedData as any)[field] = 'XXX-XX-' + ssn.slice(-4);
      } else if (field === 'dob' || field === 'dateOfBirth') {
        // Only show year for DOB
        const dobValue = maskedData[field as keyof T];
        if (dobValue) {
          const dob = new Date(dobValue as string | number | Date);
          (maskedData as any)[field] = `XX/XX/${dob.getFullYear()}`;
        }
      }
    }
  }

  return maskedData;
}

/**
 * Apply data retention policies - delete data older than retention period
 * @param dataType - Type of health data
 * @param retentionMonths - Retention period in months
 */
export function applyDataRetention(dataType: string, retentionMonths: number): void {
  // This would connect to your storage and apply retention policies
  // For in-memory storage demo, this would need to be customized
  console.log(`Applying ${retentionMonths} month retention policy to ${dataType} data`);
  // Implementation would delete records older than the retention period
}

/**
 * Generate a secure password hash
 * @param password - Password to hash
 * @returns Hashed password and salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a password against a hash
 * @param password - Password to verify
 * @param hash - Stored password hash
 * @param salt - Salt used for hashing
 * @returns True if password matches
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Extended Request interface to include session properties
interface ExtendedRequest extends Request {
  session?: {
    lastActivity?: number;
    destroy: (callback: (err: any) => void) => void;
  };
}

/**
 * Session timeout - HIPAA requires automatic logoff
 * @param minutes - Minutes until session timeout
 * @returns Express middleware
 */
export function sessionTimeout(minutes: number) {
  const timeout = minutes * 60 * 1000; // Convert to milliseconds
  
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    // This assumes you're using express-session
    if (req.session) {
      // Check if session has lastActivity timestamp
      if (req.session.lastActivity) {
        const now = Date.now();
        // Check if session has timed out
        if (now - req.session.lastActivity > timeout) {
          // Destroy session if timed out
          req.session.destroy((err: any) => {
            if (err) {
              console.error('Session destruction error:', err);
            }
            // Redirect to login page
            return res.status(401).json({ error: 'Session expired' });
          });
          return;
        }
      }
      
      // Update last activity time
      req.session.lastActivity = Date.now();
    }
    
    next();
  };
}

/** 
 * TLS/SSL validation middleware - HIPAA requires secure transmission
 * Only active in production environment
 */
export function requireTLS(req: Request, res: Response, next: NextFunction): void {
  // Check if we're in production and protocol is not secure
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    // Check for proxy headers in case we're behind a reverse proxy
    if (req.get('x-forwarded-proto') !== 'https') {
      console.warn('Non-secure connection attempt in production');
      res.status(403).json({ error: 'TLS/SSL Required for HIPAA Compliance' });
      return;
    }
  }
  next();
}
