# 👥 Roles & Permissions Guide

Complete guide to user roles and permissions in the Restaurant POS System.

## Table of Contents

- [Overview](#overview)
- [Role Definitions](#role-definitions)
- [Permission Matrix](#permission-matrix)
- [Security Policies](#security-policies)
- [User Management](#user-management)
- [Role-Based Access](#role-based-access)
- [Best Practices](#best-practices)
- [Compliance Requirements](#compliance-requirements)

---

## Overview

### Permission Philosophy
- **Least Privilege**: Users only get access to what they need
- **Need-to-Know**: Permissions based on job requirements
- **Segregation of Duties**: Sensitive operations require multiple approvals
- **Audit Trail**: All actions are logged and trackable

### Access Control Model
- **Role-Based Access Control (RBAC)**: Permissions assigned by role
- **Data Isolation**: Users can only access data from their branch
- **Resource-Based**: Granular permissions for specific operations
- **Temporal Access**: Some permissions are time-restricted

### Security Levels
1. **System Level**: Infrastructure and database access
2. **Application Level**: Features and functionality access
3. **Data Level**: Row-level security for data access
4. **Physical Level**: Device and location access

---

## Role Definitions

### 👔 Owner
**Full system administrator** with complete access to all branches and features.

#### Responsibilities
- **System Management**: Configure and maintain the entire POS system
- **Multi-Branch Management**: Create and manage multiple restaurant locations
- **User Administration**: Create, modify, delete user accounts
- **Financial Oversight**: Access to all financial reports and data
- **Compliance**: Ensure adherence to regulations (PCI DSS, GDPR)
- **Security Management**: Implement and monitor security policies

#### Capabilities
- ✅ Full system configuration
- ✅ Create/delete branches
- ✅ Manage all user accounts and roles
- ✅ Access all reports and analytics
- ✅ Configure payment methods and hardware
- ✅ Export all data
- ✅ System backup and recovery
- ✅ Security monitoring and logs
- ✅ Compliance reporting

#### Limitations
- None – has full system access

---

### 👔 Manager
**Branch administrator** with comprehensive control over their assigned location.

#### Responsibilities
- **Branch Operations**: Manage all aspects of their branch
- **Staff Management**: Hire, train, schedule staff members
- **Inventory Management**: Track stock, orders, suppliers
- **Customer Relations**: Handle customer service and issues
- **Financial Reporting**: Generate branch-specific reports
- **Quality Control**: Ensure service standards are met

#### Capabilities
- ✅ Branch configuration and settings
- ✅ Manage staff accounts (except other managers/owners)
- ✅ Product and menu management
- ✌ Inventory and stock control
- ✅ Order management and viewing
- ✅ Customer data access and management
- ✅ Report generation (branch-specific)
- ✅ Discount and pricing control
- ✅ Hardware setup and configuration
- ✅ Staff scheduling and performance tracking

#### Limitations
- ❌ Cannot manage other branches
- ❌ Cannot create/delete manager or owner accounts
- ❌ Cannot access system-level configurations
- ❌ Cannot export sensitive global data

---

### 💰 Cashier
**Front-line staff** who handle customer interactions and transactions.

#### Responsibilities
- **Order Processing**: Take orders, process payments, manage customer experience
- **Customer Service**: Assist customers, handle inquiries and issues
- **Point of Sale**: Operate POS terminal efficiently and accurately
- **Inventory Awareness**: Report stock issues, suggest alternatives
- **Payment Handling**: Process payments, handle cash management
- **Table Management**: Seat customers, manage table turnover

#### Capabilities
- ✅ Take and modify orders
- ✅ Process all payment methods
- ✅ Search and manage customers
- ✅ View product information and stock
- ✅ Print receipts and documentation
- ✅ Table management (assign/checkout)
- ✅ Handle refunds and voids (with approval)
- ✅ View order history
- ✅ Cash management

#### Limitations
- ❌ Cannot modify pricing or products
- ❌ Cannot access sensitive financial reports
- ❌ Cannot manage staff schedules
- ❌ Cannot approve large discounts (requires manager approval)
- ❌ Cannot delete or archive data

---

### 🍳 Kitchen Staff
**Back-of-house team** responsible for food preparation and quality control.

#### Responsibilities
- **Order Preparation**: View and prepare orders received from POS
- **Quality Control**: Ensure food quality and presentation
- **Timing Management**: Monitor preparation times and prioritize orders
- **Inventory Updates**: Report stock issues and waste
- **Kitchen Display**: Monitor and update order status
- **Communication**: Coordinate with front-of-house staff

#### Capabilities
- ✅ View kitchen display system
- ✅ Update order preparation status
- ✅ Modify item status (preparing, ready, served)
- ✅ View order details and special requirements
- ✅ Communicate with waitstaff
- ✅ Report stock issues immediately
- ✅ Manage waste tracking
- ✅ Access product information for preparation

#### Limitations
- ❌ Cannot create or modify orders
- ❌ Cannot access customer financial data
- ❌ Cannot modify product pricing
- ❌ Cannot handle payments
- ❌ Cannot access sensitive reports
- ❌ Limited to kitchen-related data

---

### 🧑 Waitstaff
**Front-of-house staff** responsible for customer service and table management.

#### Responsibilities
- **Guest Relations**: Welcome and seat customers
- **Order Taking**: Take food and beverage orders from customers
- **Table Management**: Manage table status and turnover
- **Customer Service**: Handle customer requests and complaints
- **Payment Processing**: Process payments and handle tips
- **Table Coordination**: Coordinate with kitchen and bar staff

#### Capabilities
- ✅ Manage table assignments and status
- ✅ Take and modify customer orders
- ✅ Process all payment types
- ✅ Search and manage customers
- ✅ Split bills and handle complex payments
- ✅ Add special requests and modifications
- ✅ Print receipts and documentation
- ✅ Communicate with kitchen staff

#### Limitations
- ❌ Cannot modify product pricing
- ✅ Cannot access financial reports
- ❌ Cannot approve large discounts (requires manager approval)
- ❌ Cannot manage other staff accounts
- ❌ Cannot delete order history

---

## Permission Matrix

### Feature Access by Role

| Feature | Owner | Manager | Cashier | Kitchen | Waitstaff |
|--------|-------|---------|--------|-----------|
| **System Configuration** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Branch Management** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Multi-Branch Access** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create/Delete Managers** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Staff Scheduling** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Product Management** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Modify Pricing** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Inventory Management** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Stock Adjustments** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Waste Tracking** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Order Management** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create Orders** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Modify Orders** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Delete Orders** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Cancel Orders** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View All Orders** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Branch Orders** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Customer Management** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Create Customers** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Modify Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Delete Customers** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Customer Data Privacy** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **All Payment Methods** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Process Payments** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Handle Refunds** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Void Transactions** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **All Reports** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Financial Reports** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Sales Analytics** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Inventory Reports** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Staff Performance** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Table Management** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Table Assignments** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Table Status Updates** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Kitchen Display** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Order Status Updates** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Receipt Printing** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Printer Setup** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Device Management** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Barcode Scanning** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Camera Access** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Location Tracking** | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permission Codes

#### Financial Permissions
```typescript
interface FinancialPermissions {
  viewReports: boolean;
  exportData: boolean;
  accessRevenue: boolean;
  handleRefunds: boolean;
  approveDiscounts: {
    smallAmount: boolean;  // <$10
    mediumAmount: boolean; // <$50
    largeAmount: boolean;  // >$50
  };
}
```

#### Inventory Permissions
```typescript
interface InventoryPermissions {
  viewStock: boolean;
  updateStock: boolean;
  adjustStock: boolean;
  wasteManagement: boolean;
  purchaseManagement: boolean;
  lowStockAlerts: boolean;
}
```

#### Customer Data Permissions
```typescript
interface CustomerPermissions {
  viewCustomerData: boolean;
  createCustomers: boolean;
  modifyCustomers: boolean;
  deleteCustomers: boolean;
  exportData: boolean;
  viewHistory: boolean;
  managePrivacy: boolean;
}
```

---

## Security Policies

### Authentication Policies

#### Password Requirements
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, special characters
- Changed every 90 days
- Cannot reuse last 5 passwords
- Temporary account lock after 5 failed attempts

#### Session Management
- Default session timeout: 30 minutes
- Maximum concurrent sessions per user: 3
- Automatic logout after inactivity
- Sessions invalidated on password change

#### Multi-Factor Authentication
- Required for owners and managers
- Optional for other roles (based on branch settings)
- TOTP (Time-based One-Time Password) preferred
- SMS fallback available

### Data Access Policies

#### Branch Isolation
- Users can only access data from their assigned branch
- Owners have cross-branch access
- Cross-branch data sharing requires explicit permission
- Branch switching requires separate authentication

#### Row Level Security (RLS)
```sql
-- Users can only access orders from their branch
CREATE POLICY "Orders branch isolation"
ON orders
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND (
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
    OR branch_id = (
      SELECT branch_id FROM users WHERE id = auth.uid()
    )
  )
);
```

#### Data Encryption
- Sensitive data encrypted at rest
- Database connections use TLS
- API endpoints enforce HTTPS
- Local storage encryption for offline data

### Device Security Policies

#### Device Access Control
- Device registration required for new devices
- Device certificates validated
- Lost/stolen devices can be remotely disabled
- Mobile devices require device encryption

#### Location-Based Access
- Access controls based on IP address
- Time-based access windows for different roles
- Geofencing for mobile devices
- Automatic lockout from unauthorized locations

#### Physical Security
- Automatic screen lock after inactivity
- Required authentication after resume
- Secure boot configuration
- Device monitoring and logging

---

## User Management

### Account Creation Process

#### 1. Initial Setup
```typescript
interface UserAccount {
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
  phone?: string;
  permissions: string[];
}

const createUserAccount = async (account: UserAccount): Promise<User> => {
  // Validate email uniqueness
  const emailExists = await checkEmailExists(account.email);
  if (emailExists) {
    throw new Error('Email already in use');
  }

  // Validate role permissions
  if (!validateRolePermission(account.role, account.branchId)) {
    throw new Error('Role not permitted for this branch');
  }

  // Create user
  const hashedPassword = await hashPassword(account.password);
  const user = await supabase.from('users').insert({
    email: account.email,
    password_hash: hashedPassword,
    name: account.name,
    role: account.role,
    branch_id: account.branchId || null,
    phone: account.phone,
    created_at: new Date().toISOString(),
    is_active: true
  }).select().single();

  // Send welcome email
  await sendWelcomeEmail(user);

  return user;
};
```

#### 2. Role Assignment
```typescript
interface RoleAssignment {
  userId: string;
  role: UserRole;
  branchId: string;
  permissions: string[];
  restrictions: string[];
}

const assignUserRole = async (assignment: RoleAssignment): Promise<void> {
  // Validate user existence
  const user = await getUserById(assignment.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check role conflicts
  if (!canAssignRole(assignment.role, user, assignment.branchId)) {
    throw new Error('Cannot assign role to user');
  }

  // Update user role
  await supabase.from('users')
    .update({
      role: assignment.role,
      branch_id: assignment.branchId,
      updated_at: new Date().toISOString()
    })
    .eq('id', assignment.userId);

  // Log role change
  await logActivity({
    userId: assignment.userId,
    action: 'role_changed',
    details: {
      oldRole: user.role,
      newRole: account.role,
      assignedBy: getCurrentUserId()
    }
  });
};
```

### Account Status Management

#### Active/Inactive Status
```typescript
enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

interface AccountStatusUpdate {
  userId: string;
  status: AccountStatus;
  reason?: string;
  updatedBy: string;
}

const updateAccountStatus = async (update: AccountStatusUpdate): Promise<void> {
  // Validate permissions
  if (!canUpdateAccountStatus(update.updatedBy, update.userId)) {
    throw new Error('Insufficient permissions');
  }

  // Update account status
  await supabase.from('users')
    .update({
      is_active: update.status === AccountStatus.ACTIVE,
      updated_at: new Date().toISOString()
    })
    .eq('id', update.userId);

  // Log status change
  await logActivity({
    userId: <string>update.userId,
    action: 'status_changed',
    details: {
      newStatus: update.status,
      reason: update.reason
    }
  });
};
```

### Password Management

#### Password Reset Process
```typescript
interface PasswordReset {
  email: string;
  temporaryPassword: string;
  expiresAt: Date;
  resetToken: string;
}

const initiatePasswordReset = async (email: string): Promise<PasswordReset> => {
  // Generate temporary password
  const temporaryPassword = generateTemporaryPassword();
  const resetToken = generateResetToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Update user with temporary password
  await supabase
    .from('users')
    .update({
      password_hash: await hashPassword(temporaryPassword),
      reset_token: resetToken,
      reset_token_expires_at: expiresAt.toISOString(),
      force_password_reset: true,
      updated_at: new Date().toISOString()
    })
    .eq('email', email);

  // Send reset email
  await sendPasswordResetEmail(email, temporaryPassword, resetToken);

  return {
    email,
    temporaryPassword,
    expiresAt
  };
};
```

### User Activity Monitoring
```typescript
interface UserActivity {
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

const logUserActivity = async (activity: Omit<keyof UserActivity, 'timestamp'>): Promise<void> => {
  const activityData: UserActivity = {
    timestamp: new Date(),
    ipAddress: getClientIpAddress(),
    userAgent: getUserAgent(),
    ...activity
  };

  // Store in activity log
  await supabase
    .from('activity_logs')
    .insert({
      user_id: activityData.userId,
      branch_id: await getUserBranchId(activityData.userId),
      action: activityData.action,
      resource: activityData.resource,
      details: activityData.details,
      ip_address: activityData.ipAddress,
      user_agent: activityData.userAgent,
      created_at: activityData.timestamp.toISOString()
    });
};
```

---

## Role-Based Access

### Permission Checking
```typescript
class PermissionManager {
  private permissions: Map<string, PermissionSet> = new Map();

  constructor() {
    this.initializePermissions();
  }

  private initializePermissions(): void {
    // Define permission sets for each role
    this.permissions.set('owner', {
      system: ['*', 'configuration', 'security'],
      branches: ['create', 'update', 'delete', 'view'],
      users: ['create', 'update', 'delete', 'view'],
      reports: ['view', 'export'],
      inventory: ['*'],
      orders: ['*'],
      customers: ['*'],
      payments: ['*']
    });

    this.permissions.set('manager', {
      system: ['view'],
      branches: ['view'],
      users: ['create', 'update', 'delete', 'view'],
      reports: ['view', 'export'],
      inventory: ['create', 'update', 'view'],
      orders: ['*'],
      customers: ['create', 'update', 'delete', 'view'],
      payments: ['process', 'view'],
      hardware: ['configure']
    });

    this.permissions.set('cashier', {
      system: ['view'],
      users: ['view'],
      orders: ['create', 'view', 'update'],
      customers: ['create', 'view'],
      products: ['view'],
      payments: ['process', 'view'],
      receipts: ['print', 'view']
    });

    this.permissions.set('kitchen', {
      system: ['view'],
      orders: ['view'],
      products: ['view'],
      stock_movements: ['create', 'view'],
      order_items: ['view', 'update']
    });

    this.permissions.set('waitstaff', {
      system: ['view'],
      orders: ['create', 'view', 'update'],
      customers: ['create', 'view'],
      products: ['view'],
      payments: ['process', 'view'],
      tables: ['*', 'view'],
      receipts: ['print', 'view']
    });
  }

  hasPermission(user: User, permission: string): boolean {
    const userPermissions = this.permissions.get(user.role);
    return userPermissions ? userPermissions.includes(permission) || userPermissions.includes('*') : false;
  }

  hasResourcePermission(user: User, resource: string, action: string): boolean {
    const userPermissions = this.permissions.get(user.role);
    if (!userPermissions) return false;

    // Check specific resource permission
    const resourcePermissions = userPermissions.get(resource);
    if (resourcePermissions) {
      return resourcePermissions.includes(action) || resourcePermissions.includes('*');
    }

    // Check general permissions
    const generalPermissions = userPermissions.get('system') || [];
    return generalPermissions.includes(action);
  }

  canPerformOperation(user: User, operation: Operation): boolean {
    return this.hasResourcePermission(user, operation.resource, operation.action);
  }
}
```

### Context-Based Permissions
```typescript
interface Operation {
  resource: string;
  action: string;
  context?: {
    branchId?: string;
    userId?: string;
    resourceOwnerId?: string;
    value?: any;
  };
}

class ContextualPermissionChecker {
  canPerformOperation(user: User, operation: Operation): boolean {
    const hasPermission = this.hasPermission(user, operation.resource, operation.action);

    if (!hasPermission) {
      return false;
    }

    // Apply context-based checks
    return this.applyContextChecks(user, operation);
  }

  private applyContextChecks(user: User, operation: Operation): boolean {
    // Branch isolation checks
    if (operation.context?.branchId) {
      if (user.role === 'owner') {
        // Owners can access all branches
        continue;
      } else if (user.branchId !== operation.context.branchId) {
        return false; // Can't access other branches
      }
    }

    // Resource ownership checks
    if (operation.context?.resourceOwnerId) {
      if (operation.context.resourceOwnerId !== user.id) {
        return false; // Can only access own resources
      }
    }

    // Value-based restrictions
    if (operation.context?.value) {
      return this.checkValueRestrictions(user, operation);
    }

    return true;
  }

  private checkValueRestrictions(user: User, operation: operation): boolean {
    // Financial limits for non-managers
    if (!['owner', 'manager'].includes(user.role)) {
      if (operation.resource === 'discounts' || operation.resource === 'refunds') {
        const value = operation.context?.value || 0;
        const limits = {
          cashier: { max: 50, needsApproval: true },
          waitstaff: { max: 20, needsApproval: true },
          kitchen: { max: 0, needsApproval: false }
        };

        const userLimits = limits[user.role as keyof typeof limits];
        if (value > userLimits.max) {
          return false;
        }
        if (value > 10 && userLimits.needsApproval) {
          return this.needsManagerApproval(operation, user);
        }
      }
    }

    // Time-based restrictions
    if (operation.resource === 'delete' && !['owner', 'manager'].includes(user.role)) {
      return this.isWithinBusinessHours();
    }

    return true;
  }

  private needsManagerApproval(operation: Operation, user: User): boolean {
    // Request manager approval
    const approval = await this.requestManagerApproval(operation, user);
    return approval.granted;
  }

  private isWithinBusinessHours(): boolean {
    // Define business hours (9 AM to 10 PM)
    const now = new Date();
    const businessHours = {
      start: { hour: 9, minute: 0 },
      end: { hour: 22, minute: 0 }
    };

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return (
      currentHour >= businessHours.start.hour &&
      currentHour < businessHours.end.hour ||
      (currentHour === businessHours.end.hour && currentMinute <= businessHours.end.minute)
    );
  }
}
```

---

## Best Practices

### Role Assignment Guidelines

#### 1. Principle of Least Privilege
- Start users with minimal required permissions
- Grant additional permissions only as needed
- Regular reviews to ensure permissions remain appropriate
- Remove permissions that are no longer required

#### 2. Separation of Duties
- No single person should have complete control over a process
- Multiple people involved in critical operations
- Clear documentation of responsibilities

#### 3. Role Progression Path
- Clear promotion criteria for each role
- Training requirements for role transitions
- Performance reviews before role advancement
- Documentation of new responsibilities

### Implementation Best Practices

#### 1. Permission Design
```typescript
// Granular permission model
const PERMISSIONS = {
  // Resource-based permissions
  products: ['create', 'update', 'read', 'delete'],

  // Action-based permissions
  'orders:create': 'orders',
  'orders:update': 'orders',
  'orders:delete': 'orders',

  // Feature-level permissions
  'features:offline_mode': 'system',
  'features:barcode_scanning': 'system',
  'features:kitchen_display': 'system'
};

// Combination permissions
const ROLE_PERMISSIONS = {
  owner: Object.keys(PERMISSIONS),
  manager: [
    'products', 'orders', 'customers', 'reports',
    'hardware:configure'
  ]
};
```

#### 2. Permission Checking
```typescript
// Centralized permission checker
const PermissionChecker = {
  hasPermission(user: User, permission: string): boolean {
    const permissions = getPermissions(user.role);
    return permissions.includes(permission) || permissions.includes('*');
  },

  checkOperation: (user: User, operation: Operation): boolean => {
    // Check base permission
    if (!this.hasPermission(user, operation.action)) {
      return false;
    }

    // Apply context checks
    return this.applyContextChecks(user, operation);
  },

  applyContextChecks: (user: User, operation: Operation): boolean => {
    // Time-based restrictions
    if (operation.context?.timeRestriction) {
      return this.checkTimeRestriction(user, operation);
    }

    // Location-based restrictions
    if (operation.context?.locationRestriction) {
      return this.checkLocationRestriction(user, operation);
    }

    // Value-based restrictions
    if (operation.context?.valueRestriction) {
      return this.checkValueRestriction(user, operation);
    }

    return true;
  }
};
```

#### 3. Session Management
```typescript
// Secure session management
class SessionManager {
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private readonly maxConcurrentSessions = 3;

  validateSession(session: UserSession): boolean {
    // Check session validity
    if (session.expiresAt < Date.now()) {
      return false;
    }

    // Check if user is still active
    if (!session.user.isActive) {
      return false;
    }

    // Check session IP address
    const currentIp = this.getClientIp();
    if (session.ipAddress !== currentIp) {
      return false;
    }

    return true;
  }

  revokeAllSessions(userId: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Also clear any local storage sessions
    this.clearLocalSessions();
  }
}
```

### Security Configuration

#### 1. Password Policy
```typescript
interface PasswordPolicy {
  minLength: 8;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  maxAge: number;
}

class PasswordPolicyManager {
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    const policy = this.getPolicy();

    // Length check
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters`);
    }

    // Complexity requirements
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      password.push('Password must contain uppercase letters');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      password.push('Password must contain lowercase letters');
    }

    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      password.push('password must contain numbers');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
      password.push('password must contain special characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

#### 2. Access Control
```typescript
// Access control decorator
@RequirePermission(['orders:create', 'orders:update'])
class OrderController {
  @CheckPermission(['products:read', 'categories:read'])
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    // Permission checking happens here automatically
    const result = await orderService.create(orderData);
    return result;
  }
}

// Function decorator for permission checking
function RequirePermission(permissions: string | string[]) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const originalMethod = target[propertyName];

  descriptor.writable = true;
  descriptor.value = async function (...args: any[]) {
    const user = getCurrentUser();

    // Check if user has required permissions
    const hasPermission = permissions.some(permission =>
      PermissionChecker.hasPermission(user, permission)
    );

    if (!hasPermission) {
      throw new PermissionError('Insufficient permissions');
    }

    // Call original method
    return originalMethod.apply(this, args);
  };

  return descriptor;
};
```

---

## Compliance Requirements

### PCI DSS Compliance

#### Cardholder Data Protection
```typescript
interface PCICompliance {
  protectCardholderData(cardData: CardData): ProtectedCardData {
    return {
      ...cardData,
      cardNumber: maskCardNumber(cardData.cardNumber),
      expirationDate: maskExpirationDate(cardData.expirationDate),
      cvv: undefined // Never store CVV
    };
  }

  handlePaymentData(paymentData: PaymentData): Promise<void> {
    // Encrypt sensitive data before storage
    const encrypted = this.encryptPaymentData(paymentData);

    // Store only what's necessary
    const sanitizedData = {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      method: paymentData.method,
      status: paymentData.status,
      metadata: paymentData.metadata
    };

    // Store in secure database
    await this.savePaymentRecord(sanitizedData);

    // Remove sensitive data from memory
    this.clearSensitiveData(paymentData);
  }
}
```

#### Audit Trail
```typescript
class PCIComplianceAudit {
  async logAccessAttempt(userId: string, accessType: string, success: boolean): Promise<void> {
    await this.logEvent({
      userId,
      event: 'payment_access_attempt',
      accessType,
      success,
      timestamp: new Date().toISOString()
    });
  }

  async logSensitiveOperation(operation: string, details: any): Promise<void> {
    await this.logEvent({
      event: 'sensitive_operation',
      operation,
      details,
      timestamp: new Date().toISOString()
    });
  }
}
```

### GDPR Compliance

#### Data Subject Rights
```typescript
class GDPRCompliance {
  async handleDataRequest(userId: string, requestType: string): Promise<void> {
    switch (requestType) {
      case 'access':
        await this.provideDataCopy(userId);
        break;
      case 'rectification':
        await this.rectifyData(userId);
        break;
      -> {
        throw new Error(`Unknown request type: ${requestType}`);
      }
    }
  }

  private async provideDataCopy(userId: string): Promise<UserDataExport> {
    const userData = await this.getUserData(userId);
    const transactions = await this.getTransactionHistory(userId);

    // Apply GDPR anonymization
    const anonymized = this.anonymizePersonalData({
      personal: userData,
      transactions
    });

    return anonymized;
  }

  private anonymizePersonalData(data: { personal: any, transactions: any }): UserDataExport {
  return {
    personal: {
      ...data.personal,
      name: this.maskName(data.personal.name),
      email: this.maskEmail(data.personal.email),
      phone: this.maskPhone(data.personal.phone)
    },
    transactions: data.transactions.map(transaction => ({
      ...transaction,
      customer_id: this.maskId(transaction.customer_id),
      cardLast4: this.maskCardNumber(transaction.cardLast4)
    }))
  }
}
```

### HIPAA Compliance
```typescript
class HIPAACompliance {
  protectedHealthInformation(data: any): ProtectedHealthInformation {
    // Encrypt PHI (Protected Health Information)
    return this.encryptPHI(data);
  }

  logAccessToPHI(userId: string, accessType: string, data: any): Promise<void> {
    // Log any access to health data
    await this.auditTrail.logEvent({
      userId,
      event: 'phi_access',
      accessType,
      dataType: 'health_data',
      timestamp: new Date().toISOString(),
      dataHash: this.hashData(data)
    });
  }

  async encryptPHI(data: any): string {
    return encryptionService.encrypt(JSON.stringify(data));
  }
}
```

This comprehensive roles and permissions guide ensures the Restaurant POS System maintains security while providing the flexibility needed for restaurant operations. Regular security reviews and audits should be conducted to ensure ongoing compliance with security policies and regulations.