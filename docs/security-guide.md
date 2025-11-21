# 🔒 Security Guide

Comprehensive security documentation for the Restaurant POS System.

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication & Access Control](#authentication--access-control)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [Payment Security](#payment-security)
- [Physical Security](#physical-security)
- [Compliance & Regulations](#compliance--regulations)
- [Security Best Practices](#security-best-practices)
- [Incident Response](#incident-response)
- [Security Auditing](#security-auditing)

---

## Security Overview

### Security Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   NETWORK   │ │  APPLICATION │ │   DATABASE  │        │
│  │   SECURITY  │ │   SECURITY   │ │   SECURITY   │        │
│  │             │ │             │ │             │        │
│  │ • HTTPS/TLS │ │ • RLS/RBAC   │ │ • Encryption│        │
│  │ • Firewall  │ │ • JWT Auth   │ │ • Access    │        │
│  │ • WAF      │ │ • Input      │ │ • Auditing  │        │
│  │ • DDoS      │ │ Validation   │ │ • Backups   │        │
│  │ Protection │ │ • CSRF       │ │             │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │    DEVICE   │ │   PHYSICAL   │ │   OPERATIONAL│        │
│  │  SECURITY   │ │   SECURITY   │ │   SECURITY   │        │
│  │             │ │             │ │             │        │
│  │ • Device    │ │ • Access     │ │ • Training   │        │
│  │   Control   │ │   Control   │ │ • Policies   │        │
│  │ • MDM       │ │ • Cameras    │ │ • Monitoring│        │
│  │ • Encryption│ │ • Alarms     │ │ • Incident   │        │
│  │             │ │             │ │   Response  │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Security Principles
1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users have minimum necessary access
3. **Zero Trust**: Verify everything, trust nothing
4. **Secure by Default**: Security built into all components
5. **Continuous Monitoring**: Real-time security monitoring

---

## Authentication & Access Control

### User Authentication

#### Password Security
```typescript
// Password strength requirements
interface PasswordPolicy {
  minLength: 8;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: true;
  preventReuse: 5; // last 5 passwords
}

// Password validation
const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  return password.length >= minLength &&
         hasUpper && hasLower && hasNumber && hasSpecial;
};
```

#### Multi-Factor Authentication (MFA)
```typescript
// MFA implementation
interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'email')[];
  requiredForRoles: ('owner' | 'manager')[];
}

// TOTP setup
const setupTOTP = async (userId: string) => {
  const secret = generateTOTPSecret();
  const qrCode = generateTOTPQRCode(secret);

  // Save secret to database (encrypted)
  await saveMFASecret(userId, secret);

  return { secret, qrCode };
};

// MFA verification
const verifyMFA = async (userId: string, code: string) => {
  const secret = await getMFASecret(userId);
  return verifyTOTP(secret, code);
};
```

#### Session Management
```typescript
// Secure session configuration
const sessionConfig = {
  timeout: 30 * 60 * 1000, // 30 minutes
  refreshToken: true,
  secureCookies: true,
  sameSite: 'strict',
  maxConcurrentSessions: 3
};

// Session validation
const validateSession = async (sessionToken: string) => {
  try {
    const session = await verifyJWT(sessionToken);
    const user = await getUserById(session.userId);

    if (!user || !user.isActive) {
      throw new Error('Invalid session');
    }

    return { user, session };
  } catch (error) {
    throw new Error('Session expired or invalid');
  }
};
```

### Role-Based Access Control (RBAC)

#### User Roles and Permissions
```typescript
enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  KITCHEN = 'kitchen',
  WAITSTAFF = 'waitstaff'
}

interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    // Full access to all resources
    { resource: '*', action: '*' }
  ],
  [UserRole.MANAGER]: [
    { resource: 'products', action: '*' },
    { resource: 'orders', action: '*' },
    { resource: 'customers', action: '*' },
    { resource: 'reports', action: 'read' },
    { resource: 'users', action: 'read' },
    { resource: 'branches', action: 'read' }
  ],
  [UserRole.CASHIER]: [
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'read' },
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'payments', action: 'create' }
  ],
  [UserRole.KITCHEN]: [
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update', conditions: { fields: ['status'] } },
    { resource: 'stock_movements', action: 'create' },
    { resource: 'products', action: 'read' }
  ]
};

// Permission checking
const hasPermission = (
  userRole: UserRole,
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean => {
  const permissions = rolePermissions[userRole];

  for (const permission of permissions) {
    if (permission.resource === '*' || permission.resource === resource) {
      if (permission.action === '*' || permission.action === action) {
        if (permission.conditions) {
          return checkConditions(permission.conditions, context);
        }
        return true;
      }
    }
  }

  return false;
};
```

#### Row Level Security (RLS)
```sql
-- RLS Policy Example: Users can only access their branch data
CREATE POLICY "Users can only access branch data"
ON products
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND (
    -- Owners can access all data
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
    -- Others can only access their branch data
    OR branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
  )
);

-- RLS Policy Example: Different access levels for different roles
CREATE POLICY "Manager can update products, others can only read"
ON products
FOR UPDATE
USING (
  auth.role() = 'authenticated'
  AND (
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
    OR (
      (SELECT role FROM users WHERE id = auth.uid()) = 'manager'
      AND branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    )
  )
);
```

### Access Control Implementation
```typescript
// Permission hook
const usePermissions = () => {
  const { user } = useAuth();

  const can = useCallback((resource: string, action: string) => {
    if (!user) return false;
    return hasPermission(user.role, resource, action);
  }, [user]);

  const canAccessBranch = useCallback((branchId: string) => {
    if (!user) return false;
    return user.role === 'owner' || user.branchId === branchId;
  }, [user]);

  return { can, canAccessBranch };
};

// Protected component
const ProtectedComponent: React.FC<{
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ resource, action, children, fallback }) => {
  const { can } = usePermissions();

  if (!can(resource, action)) {
    return fallback || <div>Access denied</div>;
  }

  return <>{children}</>;
};

// API endpoint protection
const protectedApiHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const { resource, action } = req.body;

  if (!hasPermission(user.role, resource, action)) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  next();
};
```

---

## Data Protection

### Encryption

#### Data at Rest
```typescript
// Encryption service
import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;

  encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string, key: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Encrypt sensitive data
const encryptionService = new EncryptionService();

// Customer data encryption
const encryptCustomerData = (customer: Customer) => {
  const sensitiveFields = ['phone', 'email', 'address', 'creditCard'];
  const encrypted = { ...customer };

  sensitiveFields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encryptionService.encrypt(
        encrypted[field],
        process.env.ENCRYPTION_KEY
      );
    }
  });

  return encrypted;
};
```

#### Data in Transit
```typescript
// HTTPS enforcement
const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};

// Secure headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'"
};

// API security middleware
const apiSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Rate limiting
  rateLimiter(req, res, next);

  // Input validation
  validateInput(req, res, next);
};
```

### Data Privacy

#### PII (Personally Identifiable Information) Protection
```typescript
// PII fields that need special handling
const PII_FIELDS = [
  'email',
  'phone',
  'address',
  'creditCard',
  'ssn',
  'dateOfBirth'
];

// PII masking for logs
const maskPII = (data: Record<string, any>): Record<string, any> => {
  const masked = { ...data };

  PII_FIELDS.forEach(field => {
    if (masked[field]) {
      masked[field] = maskSensitiveData(masked[field]);
    }
  });

  return masked;
};

// Sensitive data masking
const maskSensitiveData = (data: string): string => {
  if (typeof data !== 'string') return data;

  // Email masking
  if (data.includes('@')) {
    const [username, domain] = data.split('@');
    return `${username.slice(0, 2)}***@${domain}`;
  }

  // Phone masking
  if (data.replace(/\D/g, '').length >= 10) {
    return `${data.slice(0, 3)}-***-***${data.slice(-4)}`;
  }

  // Credit card masking
  if (data.replace(/\D/g, '').length >= 12) {
    return `****-****-****-${data.slice(-4)}`;
  }

  return `${data.slice(0, 2)}***`;
};

// GDPR compliance
class GDPRService {
  // Right to be forgotten
  async deleteUserData(userId: string) {
    // Soft delete user
    await anonymizeUser(userId);

    // Delete or anonymize related data
    await deleteCustomerData(userId);
    await anonymizeOrderData(userId);

    // Log deletion
    await logDataDeletion(userId);
  }

  // Data portability
  async exportUserData(userId: string) {
    const userData = await getUserData(userId);
    const orderHistory = await getOrderHistory(userId);
    const loyaltyData = await getLoyaltyData(userId);

    return {
      personal: maskPII(userData),
      orders: orderHistory,
      loyalty: loyaltyData,
      exportDate: new Date().toISOString()
    };
  }

  // Consent management
  async updateConsent(userId: string, consent: ConsentData) {
    await saveConsent(userId, consent);
    await logConsentUpdate(userId, consent);
  }
}
```

### Database Security

#### SQL Injection Prevention
```typescript
// Parameterized queries (Supabase handles this automatically)
const safeQuery = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId); // Safe parameterized query

  return { data, error };
};

// Input validation
const validateInput = (input: any, schema: any): boolean => {
  try {
    schema.parse(input);
    return true;
  } catch (error) {
    console.error('Input validation failed:', error);
    return false;
  }
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
};
```

#### Database Backup Security
```typescript
// Encrypted backup
const createEncryptedBackup = async () => {
  const data = await exportAllData();
  const encrypted = encryptionService.encrypt(JSON.stringify(data));

  // Store encrypted backup
  await storeBackup({
    data: encrypted,
    timestamp: new Date().toISOString(),
    checksum: calculateChecksum(encrypted)
  });
};

// Backup verification
const verifyBackupIntegrity = async (backupId: string): boolean => {
  const backup = await getBackup(backupId);
  const calculatedChecksum = calculateChecksum(backup.data);

  return backup.checksum === calculatedChecksum;
};

// Backup retention policy
const backupRetentionPolicy = {
  daily: 30,    // Keep 30 days of daily backups
  weekly: 12,   // Keep 12 weeks of weekly backups
  monthly: 24,  // Keep 24 months of monthly backups
  yearly: 7    // Keep 7 years of yearly backups
};
```

---

## Network Security

### Transport Layer Security

#### HTTPS Configuration
```nginx
# Nginx HTTPS configuration
server {
    listen 443 ssl http2;
    server_name your-restaurant-pos.com;

    # SSL certificates
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

#### WebSocket Security
```typescript
// Secure WebSocket connections
const secureWebSocketConnection = (supabaseUrl: string) => {
  const wsUrl = supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://');

  const ws = new WebSocket(wsUrl, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  ws.onopen = () => {
    console.log('Secure WebSocket connection established');
  };

  ws.onmessage = (event) => {
    // Validate and process message
    try {
      const data = JSON.parse(event.data);
      if (validateMessage(data)) {
        processMessage(data);
      } else {
        console.warn('Invalid WebSocket message received');
      }
    } catch (error) {
      console.error('WebSocket message processing error:', error);
    }
  };

  return ws;
};

// Message validation
const validateMessage = (message: any): boolean => {
  const requiredFields = ['type', 'payload'];
  const allowedTypes = ['order_update', 'inventory_change', 'user_notification'];

  return requiredFields.every(field => message.hasOwnProperty(field)) &&
         allowedTypes.includes(message.type);
};
```

### API Security

#### Rate Limiting
```typescript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: rateLimitConfig.message,
  standardHeaders: rateLimitConfig.standardHeaders,
  legacyHeaders: rateLimitConfig.legacyHeaders
});

// User-specific rate limiting
const userRateLimit = (maxRequests: number) => {
  const requests = new Map();

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) return next();

    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < rateLimitConfig.windowMs);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    validRequests.push(now);
    requests.set(userId, validRequests);
    next();
  };
};
```

#### Input Validation
```typescript
// Input validation schema
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  stock: z.number().min(0),
  category_id: z.string().uuid(),
  description: z.string().max(1000).optional()
});

// Validation middleware
const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid input',
        details: error.errors
      });
    }
  };
};

// Usage
app.post('/api/products',
  validateInput(ProductSchema),
  createProduct
);
```

#### CORS Configuration
```typescript
// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-restaurant-pos.com']
    : ['http://localhost:3000', 'https://your-restaurant-pos.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// CORS middleware
app.use(cors(corsOptions));
```

### Firewall Configuration

#### Web Application Firewall (WAF)
```typescript
// WAF rules for common attacks
const wafRules = {
  // SQL Injection
  sqlInjection: {
    patterns: [
      /(\%27)|(\')|(--)|(\%23)|(#)/gi,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\%3D)|(=)|(\s)*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION))/gi
    ]
  },

  // XSS Prevention
  xss: {
    patterns: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ]
  },

  // Path Traversal
  pathTraversal: {
    patterns: [
      /\.\./g,
      /%2e%2e/gi
    ]
  }
};

// WAF middleware
const wafMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const url = req.url;
  const body = JSON.stringify(req.body);
  const headers = JSON.stringify(req.headers);

  // Check against WAF rules
  for (const [attackType, config] of Object.entries(wafRules)) {
    for (const pattern of config.patterns) {
      if (pattern.test(url) || pattern.test(body) || pattern.test(headers)) {
        console.warn(`WAF blocked ${attackType} attack`);
        return res.status(403).json({ error: 'Request blocked' });
      }
    }
  }

  next();
};
```

---

## Payment Security

### Payment Processing Security

#### PCI DSS Compliance
```typescript
// PCI DSS compliance configuration
const pciConfig = {
  // Never store raw card numbers
  cardNumberEncryption: true,

  // Never store CVV codes
  cvvStorage: false,

  // Secure transmission
  encryptionAtRest: true,
  encryptionInTransit: true,

  // Access control
  restrictedCardDataAccess: true,

  // Network security
  firewallProtection: true,

  // Security testing
  regularVulnerabilityScans: true,
  penetrationTesting: true
};

// Secure payment processing
class SecurePaymentProcessor {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.PAYMENT_ENCRYPTION_KEY;
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    // Validate payment data
    this.validatePaymentData(paymentData);

    // Encrypt sensitive data
    const encryptedData = this.encryptPaymentData(paymentData);

    // Process payment through secure gateway
    const result = await this.sendToPaymentGateway(encryptedData);

    // Log payment (without sensitive data)
    this.logPaymentResult(result, paymentData.amount);

    return result;
  }

  private validatePaymentData(data: PaymentData): void {
    // Validate card format
    if (data.cardNumber && !this.isValidCardNumber(data.cardNumber)) {
      throw new Error('Invalid card number');
    }

    // Validate CVV
    if (data.cvv && !this.isValidCVV(data.cvv)) {
      throw new Error('Invalid CVV');
    }

    // Validate expiry
    if (data.expiry && !this.isValidExpiry(data.expiry)) {
      throw new Error('Invalid expiry date');
    }
  }

  private encryptPaymentData(data: PaymentData): string {
    // Encrypt sensitive fields only
    const sensitive = {
      cardNumber: data.cardNumber,
      cvv: data.cvv,
      expiry: data.expiry
    };

    return encryptionService.encrypt(JSON.stringify(sensitive), this.encryptionKey);
  }
}
```

#### Tokenization
```typescript
// Payment tokenization
class PaymentTokenization {
  async tokenizeCard(cardData: CardData): Promise<string> {
    // Send card data to secure tokenization service
    const response = await fetch('https://secure-tokenization-service/tokenize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOKENIZATION_API_KEY}`
      },
      body: JSON.stringify(cardData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error('Tokenization failed');
    }

    return result.token;
  }

  async detokenizeCard(token: string): Promise<CardData> {
    // Retrieve card data using token
    const response = await fetch('https://secure-tokenization-service/detokenize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOKENIZATION_API_KEY}`
      },
      body: JSON.stringify({ token })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error('Detokenization failed');
    }

    return result.cardData;
  }
}
```

#### Payment Gateway Integration
```typescript
// Secure payment gateway integration
class PaymentGateway {
  private gatewayConfig = {
    apiUrl: process.env.PAYMENT_GATEWAY_URL,
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
    merchantId: process.env.MERCHANT_ID
  };

  async chargeCard(paymentData: PaymentData): Promise<PaymentResult> {
    // Create secure payment request
    const paymentRequest = {
      merchant_id: this.gatewayConfig.merchantId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      card_token: paymentData.cardToken,
      description: paymentData.description,
      metadata: {
        order_id: paymentData.orderId,
        table_id: paymentData.tableId
      }
    };

    // Sign request
    const signature = this.signRequest(paymentRequest);

    // Make secure payment request
    const response = await fetch(`${this.gatewayConfig.apiUrl}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.gatewayConfig.apiKey}`,
        'X-Signature': signature
      },
      body: JSON.stringify(paymentRequest)
    });

    const result = await response.json();

    // Verify response signature
    if (!this.verifyResponseSignature(result)) {
      throw new Error('Invalid response signature');
    }

    return result;
  }

  private signRequest(data: any): string {
    // Implement HMAC-SHA256 signing
    const crypto = require('crypto');
    const message = JSON.stringify(data);

    return crypto
      .createHmac('sha256', this.gatewayConfig.apiKey)
      .update(message)
      .digest('hex');
  }

  private verifyResponseSignature(response: any): boolean {
    // Implement signature verification
    return true; // Implementation depends on gateway
  }
}
```

### Receipt Security

#### Secure Receipt Printing
```typescript
class SecureReceiptPrinter {
  printReceipt(orderData: OrderData): void {
    // Remove sensitive payment data
    const secureReceipt = this.sanitizeReceiptData(orderData);

    // Print receipt
    this.printToThermalPrinter(secureReceipt);

    // Log printing activity
    this.logReceiptPrinting(orderData.id);
  }

  private sanitizeReceiptData(data: OrderData): OrderData {
    const sanitized = { ...data };

    // Mask credit card information
    if (sanitized.payment?.cardNumber) {
      sanitized.payment.cardNumber = this.maskCardNumber(sanitized.payment.cardNumber);
    }

    // Remove CVV completely
    if (sanitized.payment?.cvv) {
      delete sanitized.payment.cvv;
    }

    return sanitized;
  }

  private maskCardNumber(cardNumber: string): string {
    return `****-****-****-${cardNumber.slice(-4)}`;
  }
}
```

### Transaction Security

#### Transaction Logging
```typescript
class TransactionLogger {
  async logTransaction(transaction: TransactionData): Promise<void> {
    // Remove sensitive data before logging
    const logData = {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      timestamp: new Date().toISOString(),
      userId: transaction.userId,
      orderId: transaction.orderId,
      paymentMethod: transaction.paymentMethod,
      // Do not log card details
    };

    // Log to secure storage
    await this.writeSecureLog(logData);

    // Store in audit trail
    await this.createAuditTrailEntry(logData);
  }

  private async writeSecureLog(data: any): Promise<void> {
    const encrypted = encryptionService.encrypt(JSON.stringify(data), process.env.LOG_ENCRYPTION_KEY);

    // Write to secure log storage
    await supabase
      .from('audit_logs')
      .insert({
        data: encrypted,
        category: 'transaction',
        created_at: new Date().toISOString()
      });
  }
}
```

---

## Physical Security

### Device Security

#### POS Terminal Security
```typescript
// Device security configuration
const deviceSecurity = {
  // Auto-lock after inactivity
  autoLockTimeout: 5 * 60 * 1000, // 5 minutes

  // Session timeout
  sessionTimeout: 30 * 60 * 1000, // 30 minutes

  // Maximum failed login attempts
  maxFailedLogins: 3,

  // Lockout duration after failed logins
  lockoutDuration: 15 * 60 * 1000, // 15 minutes

  // Require password for sensitive operations
  requirePasswordFor: ['refunds', 'discounts', 'voids']
};

// Device lockdown
const lockDevice = async () => {
  // Clear sensitive data
  clearSensitiveData();

  // Lock screen
  showLockScreen();

  // Log device lock event
  await logDeviceEvent('device_locked');
};

// Biometric authentication (if available)
const biometricAuth = {
  async authenticateFingerprint(): Promise<boolean> {
    if (!('credentials' in navigator)) {
      return false;
    }

    try {
      const credentials = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [
            {
              authenticators: [{
                transports: ['internal'],
                userVerification: 'required'
              }]
            }
          ]
        }
      });

      return credentials !== null;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }
};
```

#### Printer and Hardware Security
```typescript
// Hardware device security
class HardwareSecurity {
  private authorizedDevices: Map<string, DeviceConfig> = new Map();

  async authorizeDevice(deviceId: string, config: DeviceConfig): Promise<void> {
    // Verify device authenticity
    const isValidDevice = await this.verifyDeviceAuthenticity(deviceId);

    if (!isValidDevice) {
      throw new Error('Unauthorized device');
    }

    // Store authorized device config
    this.authorizedDevices.set(deviceId, {
      ...config,
      authorizedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });
  }

  async validateDeviceAccess(deviceId: string, action: string): Promise<boolean> {
    const device = this.authorizedDevices.get(deviceId);

    if (!device) {
      return false;
    }

    // Check if device is still valid
    const now = new Date();
    const lastSeen = new Date(device.lastSeen);
    const timeDiff = now.getTime() - lastSeen.getTime();

    // Device considered invalid if not seen for 24 hours
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return false;
    }

    // Check device permissions
    return device.permissions.includes(action);
  }

  private async verifyDeviceAuthenticity(deviceId: string): Promise<boolean> {
    // Implement device verification logic
    // Could involve checking device certificates, serial numbers, etc.
    return true;
  }
}
```

### Access Control

#### Location-Based Access
```typescript
// Location-based access control
class LocationSecurity {
  private allowedLocations: Array<{
    id: string;
    name: string;
    ipAddress: string;
    allowedUsers: string[];
  }> = [];

  async validateLocation(userId: string, requestIP: string): Promise<boolean> {
    const user = await getUserById(userId);
    if (!user || !user.branchId) {
      return false;
    }

    // Check if IP is from allowed location
    const location = this.allowedLocations.find(
      loc => loc.ipAddress === requestIP && loc.allowedUsers.includes(userId)
    );

    if (!location) {
      // Log unauthorized access attempt
      await this.logUnauthorizedAccess(userId, requestIP);
      return false;
    }

    return true;
  }

  private async logUnauthorizedAccess(userId: string, ip: string): Promise<void> {
    await supabase
      .from('security_logs')
      .insert({
        user_id: userId,
        ip_address: ip,
        event: 'unauthorized_access_attempt',
        created_at: new Date().toISOString()
      });
  }
}
```

#### Time-Based Access
```typescript
// Time-based access control
class TimeBasedAccess {
  private accessWindows: Array<{
    roleId: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  }> = [];

  async validateAccessTime(userId: string): Promise<boolean> {
    const user = await getUserById(userId);
    if (!user) {
      return false;
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check if current time is within allowed window
    const allowedWindows = this.accessWindows.filter(
      window => window.roleId === user.role && window.dayOfWeek === dayOfWeek
    );

    for (const window of allowedWindows) {
      if (this.isTimeInRange(currentTime, window.startTime, window.endTime)) {
        return true;
      }
    }

    return false;
  }

  private isTimeInRange(current: string, start: string, end: string): boolean {
    const currentMinutes = this.timeToMinutes(current);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (startMinutes <= endMinutes) {
      // Normal range (e.g., 09:00 to 17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight range (e.g., 22:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
```

---

## Compliance & Regulations

### GDPR Compliance
```typescript
// GDPR implementation
class GDPRCompliance {
  // Consent management
  async recordConsent(userId: string, consentData: ConsentData): Promise<void> {
    await supabase
      .from('gdpr_consents')
      .insert({
        user_id: userId,
        consent_type: consentData.type,
        granted: consentData.granted,
        granted_at: new Date().toISOString(),
        ip_address: consentData.ipAddress,
        user_agent: consentData.userAgent
      });
  }

  // Right to be forgotten
  async forgetUser(userId: string): Promise<void> {
    // Anonymize user data
    await supabase
      .from('users')
      .update({
        email: `deleted_${userId}@example.com`,
        name: 'Deleted User',
        phone: null,
        address: null,
        gdpr_deleted: true,
        gdpr_deleted_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Delete or anonymize related data
    await this.anonymizeUserData(userId);
  }

  // Data portability
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await this.getUserData(userId);

    return {
      personal: this.sanitizePersonalData(userData.personal),
      orders: this.sanitizeOrderData(userData.orders),
      payments: this.sanitizePaymentData(userData.payments),
      exportDate: new Date().toISOString(),
      exportFormat: 'JSON'
    };
  }
}
```

### PCI DSS Compliance
```typescript
// PCI DSS implementation
class PCIDSSCompliance {
  // Cardholder data protection
  protectedCardholderData(cardData: CardData): void {
    // Encrypt card number
    cardData.cardNumber = this.encryptCardNumber(cardData.cardNumber);

    // Never store CVV
    delete cardData.cvv;

    // Store only last 4 digits for display
    cardData.lastFour = cardData.cardNumber.slice(-4);
    delete cardData.cardNumber;
  }

  // Access control
  enforceAccessControl(user: User, action: string): boolean {
    // Check if user has permission to access card data
    const authorizedRoles = ['manager', 'owner'];

    return authorizedRoles.includes(user.role);
  }

  // Network security
  secureNetworkConnection(): boolean {
    // Ensure HTTPS connection
    return window.location.protocol === 'https:';
  }

  // Vulnerability testing
  async runSecurityTests(): Promise<SecurityTestResults> {
    return {
      networkSecurity: await this.testNetworkSecurity(),
      encryptionStatus: await this.testEncryption(),
      accessControls: await this.testAccessControls(),
      pciCompliance: await this.testPCICompliance()
    };
  }
}
```

### Health Data Compliance (HIPAA)
```typescript
// HIPAA implementation (if handling health data)
class HIPAACompliance {
  // Protected Health Information (PHI)
  protectedPHI(data: any): void {
    const phiFields = ['medicalHistory', 'allergies', 'dietaryRestrictions'];

    phiFields.forEach(field => {
      if (data[field]) {
        data[field] = this.encryptPHI(data[field]);
      }
    });
  }

  // Audit trail
  async createAuditTrail(userId: string, action: string, data: any): Promise<void> {
    await supabase
      .from('hipaa_audit_trail')
      .insert({
        user_id: userId,
        action,
        data: this.encryptPHI(data),
        timestamp: new Date().toISOString()
      });
  }
}
```

---

## Security Best Practices

### Code Security

#### Secure Coding Practices
```typescript
// Input validation
const validateInput = (input: any, type: string): boolean => {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'phone':
      return /^\d{10,15}$/.test(input.replace(/\D/g, ''));
    case 'price':
      return typeof input === 'number' && input > 0 && input < 10000;
    case 'quantity':
      return Number.isInteger(input) && input > 0 && input <= 1000;
    default:
      return false;
  }
};

// Secure password hashing
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

#### Error Handling Security
```typescript
// Secure error handling
class SecurityErrorHandler {
  handle(error: Error): void {
    // Log error without sensitive information
    const sanitizedError = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      level: this.getLogLevel(error)
    };

    this.logError(sanitizedError);

    // Show user-friendly error message
    this.showUserFriendlyError(error);
  }

  private getLogLevel(error: Error): string {
    if (error instanceof AuthenticationError) {
      return 'security';
    } else if (error instanceof DatabaseError) {
      return 'database';
    } else {
      return 'application';
    }
  }

  private showUserFriendlyError(error: Error): void {
    // Don't expose technical details to users
    let message = 'An error occurred. Please try again.';

    if (error instanceof AuthenticationError) {
      message = 'Invalid credentials. Please try again.';
    } else if (error instanceof NetworkError) {
      message = 'Network error. Please check your connection.';
    }

    toast.error(message);
  }
}
```

### Database Security

#### SQL Injection Prevention
```typescript
// Always use parameterized queries
const secureQuery = async (table: string, columns: string[], conditions: Record<string, any>) => {
  let query = supabase.from(table).select(columns.join(', '));

  Object.entries(conditions).forEach(([key, value]) => {
    query = query.eq(key, value); // Safe parameterized query
  });

  return query;
};

// Never use string interpolation for SQL
const insecureQuery = (table: string, id: string) => {
  // DANGEROUS - Never do this!
  // return supabase.raw(`SELECT * FROM ${table} WHERE id = ${id}`);
};
```

#### Data Validation
```typescript
// Comprehensive data validation
const validateOrderData = (order: any): ValidationResult => {
  const errors: string[] = [];

  // Required fields
  if (!order.customerId) errors.push('Customer ID is required');
  if (!order.branchId) errors.push('Branch ID is required');
  if (!order.items || order.items.length === 0) errors.push('At least one item is required');

  // Validate items
  order.items?.forEach((item: any, index: number) => {
    if (!item.productId) errors.push(`Item ${index + 1}: Product ID is required`);
    if (!item.quantity || item.quantity <= 0) errors.push(`Item ${index + 1}: Invalid quantity`);
    if (!item.unitPrice || item.unitPrice <= 0) errors.push(`Item ${index + 1}: Invalid price`);
  });

  // Validate totals
  if (order.total <= 0) errors.push('Total must be positive');
  if (order.subtotal <= 0) errors.push('Subtotal must be positive');

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

---

## Incident Response

### Security Incident Response Plan

#### Incident Classification
```typescript
enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum IncidentType {
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH = 'data_breach',
  MALWARE = 'malware',
  DENIAL_OF_SERVICE = 'denial_of_service',
  FRAUD = 'fraud',
  PHYSICAL_SECURITY = 'physical_security'
}

interface SecurityIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  affectedSystems: string[];
  timestamp: Date;
  reportedBy: string;
  assignedTo: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
}
```

#### Incident Response Process
```typescript
class IncidentResponse {
  async createIncident(incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'status'>): Promise<string> {
    const incidentData = {
      ...incident,
      id: generateIncidentId(),
      timestamp: new Date(),
      status: 'open' as const
    };

    // Log incident
    await this.logIncident(incidentData);

    // Notify security team
    await this.notifySecurityTeam(incidentData);

    // Take immediate action based on severity
    await this.takeImmediateAction(incidentData);

    return incidentData.id;
  }

  private async takeImmediateAction(incident: SecurityIncident): Promise<void> {
    switch (incident.severity) {
      case IncidentSeverity.CRITICAL:
        // Immediate lockdown
        await this.emergencyLockdown();
        break;
      case IncidentSeverity.HIGH:
        // Isolate affected systems
        await this.isolateSystems(incident.affectedSystems);
        break;
      case IncidentSeverity.MEDIUM:
        // Increase monitoring
        await this.increaseMonitoring();
        break;
      case IncidentSeverity.LOW:
        // Log for investigation
        await this.logForInvestigation(incident);
        break;
    }
  }

  private async emergencyLockdown(): Promise<void> {
    // Force logout all users
    await this.forceLogoutAllUsers();

    // Disable non-critical systems
    await this.disableNonCriticalSystems();

    // Enable enhanced monitoring
    await this.enableEnhancedMonitoring();
  }
}
```

### Security Monitoring

#### Real-time Security Monitoring
```typescript
class SecurityMonitor {
  private alertThresholds = {
    failedLogins: 5, // 5 failed logins in 5 minutes
    suspiciousActivity: 10, // 10 suspicious activities in 1 hour
    unusualDataAccess: 20, // 20 unusual data accesses in 1 hour
    systemErrors: 50 // 50 system errors in 1 hour
  };

  async monitorFailedLogins(): Promise<void> {
    const recentFailures = await this.getRecentFailedLogins(5 * 60 * 1000); // 5 minutes

    if (recentFailures.length >= this.alertThresholds.failedLogins) {
      await this.triggerSecurityAlert({
        type: 'failed_logins',
        severity: 'high',
        count: recentFailures.length,
        timeframe: '5 minutes'
      });
    }
  }

  async monitorDataAccess(): Promise<void> {
    const unusualAccess = await this.detectUnusualDataAccess();

    if (unusualAccess.length >= this.alertThresholds.unusualDataAccess) {
      await this.triggerSecurityAlert({
        type: 'unusual_data_access',
        severity: 'medium',
        count: unusualAccess.length,
        timeframe: '1 hour'
      });
    }
  }

  private async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Log alert
    await this.logSecurityAlert(alert);

    // Notify security team
    await this.notifySecurityTeam(alert);

    // Take automated response actions
    await this.automatedResponse(alert);
  }
}
```

---

## Security Auditing

### Security Checklist

#### Regular Security Audits
```typescript
interface SecurityAudit {
  timestamp: Date;
  auditor: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'network_security' | 'physical_security';
  checks: SecurityCheck[];
  results: AuditResult;
  recommendations: string[];
}

class SecurityAuditor {
  async runFullAudit(): Promise<SecurityAudit> {
    const audit: SecurityAudit = {
      timestamp: new Date(),
      auditor: 'security_system',
      category: 'full_audit',
      checks: [],
      results: {} as AuditResult,
      recommendations: []
    };

    // Authentication security
    audit.checks.push(...await this.auditAuthentication());

    // Authorization security
    audit.checks.push(...await this.auditAuthorization());

    // Data protection
    audit.checks.push(...await this.auditDataProtection());

    // Network security
    audit.checks.push(...await this.auditNetworkSecurity());

    // Physical security
    audit.checks.push(...await this.auditPhysicalSecurity());

    // Calculate results
    audit.results = this.calculateAuditResults(audit.checks);

    // Generate recommendations
    audit.recommendations = this.generateRecommendations(audit.checks);

    return audit;
  }

  private async auditAuthentication(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check password policies
    const passwordPolicyValid = await this.checkPasswordPolicy();
    checks.push({
      id: 'password_policy',
      category: 'authentication',
      description: 'Password policy compliance',
      status: passwordPolicyValid ? 'pass' : 'fail',
      details: passwordPolicyValid ? 'Password policy is compliant' : 'Password policy needs improvement'
    });

    // Check multi-factor authentication
    const mfaEnabled = await this.checkMFAStatus();
    checks.push({
      id: 'mfa_enabled',
      category: 'authentication',
      description: 'Multi-factor authentication',
      status: mfaEnabled ? 'pass' : 'warning',
      details: mfaEnabled ? 'MFA is enabled for admin accounts' : 'MFA should be enabled for sensitive accounts'
    });

    return checks;
  }
}
```

### Penetration Testing
```typescript
// Automated penetration testing
class PenetrationTesting {
  async runSecurityTests(): Promise<PenetrationTestResults> {
    const results: PenetrationTestResults = {
      timestamp: new Date(),
      tests: [],
      vulnerabilities: [],
      score: 0
    };

    // SQL injection testing
    results.tests.push(await this.testSQLInjection());

    // XSS testing
    results.tests.push(await this.testXSS());

    // Authentication testing
    results.tests.push(await this.testAuthentication());

    // Authorization testing
    results.tests.push(await this.testAuthorization());

    // Input validation testing
    results.tests.push(await this.testInputValidation());

    // Calculate score
    results.score = this.calculateSecurityScore(results.tests);

    return results;
  }

  private async testSQLInjection(): Promise<PenetrationTest> {
    const maliciousPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "1'; DELETE FROM products WHERE '1'='1' --"
    ];

    let vulnerabilities = 0;

    for (const payload of maliciousPayloads) {
      try {
        const response = await this.sendMaliciousRequest(payload);

        if (this.detectSQLInjection(response)) {
          vulnerabilities++;
        }
      } catch (error) {
        // Expected to fail if properly protected
      }
    }

    return {
      type: 'sql_injection',
      vulnerabilities,
      passed: vulnerabilities === 0
    };
  }
}
```

This comprehensive security guide covers all aspects of securing the Restaurant POS System, from authentication and data protection to compliance and incident response. Regular security audits and penetration testing should be conducted to ensure ongoing security.