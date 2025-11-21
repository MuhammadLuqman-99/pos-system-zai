# 📱 Offline Mode Guide

Complete guide to offline functionality in the Restaurant POS System.

## Table of Contents

- [Overview](#overview)
- [Offline Architecture](#offline-architecture)
- [Data Synchronization](#data-synchronization)
- [Conflict Resolution](#conflict-resolution)
- [Storage Management](#storage-management)
- [Offline Capabilities](#offline-capabilities)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

The Restaurant POS System supports offline operation, ensuring business continuity during internet outages. The system automatically detects network status and switches to offline mode when needed.

### Benefits of Offline Mode
- **Business Continuity**: Continue operations during internet outages
- **Improved Performance**: Faster response times for local operations
- **Reduced Dependency**: Less reliance on constant internet connectivity
- **Data Safety**: Local backup of critical data
- **Cost Savings**: Reduced data usage for mobile deployments

### Offline Limitations
- **Real-time Updates**: Kitchen display and multi-terminal sync delayed
- **New Products**: Cannot access recently added products
- **Customer Data**: Cannot search for new customer records
- **Reports**: Limited to cached historical data
- **Authentication**: Cached sessions required for initial login

---

## Offline Architecture

### Offline Storage Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    OFFLINE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ IndexedDB   │ │  Service    │ │  Conflict   │        │
│  │   Cache     │ │   Worker    │ │ Resolution  │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                             │
│  Stored Data:                                                │
│  • Products (with images)                                    │
│  • Categories                                                 │
│  • Orders (draft)                                            │
│  • Cart items                                                │
│  • Customer data                                             │
│  • User sessions                                             │
│  • Settings                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Storage Structure
```typescript
interface OfflineStorage {
  // Core business data
  products: Map<string, Product>;
  categories: Map<string, Category>;
  customers: Map<string, Customer>;

  // Transactional data
  orders: Map<string, Order>;
  cart: Cart;
  payments: Map<string, Payment>;

  // Session and settings
  userSession: UserSession;
  settings: AppSettings;

  // Sync metadata
  lastSync: string;
  pendingSync: Array<SyncOperation>;
  conflicts: Array<DataConflict>;
}
```

### Service Worker Architecture
```typescript
// Service Worker for background operations
class OfflineServiceWorker {
  private syncQueue: Array<SyncOperation> = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Listen for sync requests
    self.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.startSync();

    // Notify all clients
    this.broadcastToClients({ type: 'online' });
  }

  private handleOffline(): void {
    this.isOnline = false;

    // Notify all clients
    this.broadcastToClients({ type: 'offline' });
  }

  private async startSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();
        await this.processSyncOperation(operation);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
}
```

---

## Data Synchronization

### Sync Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                  SYNCHRONIZATION FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Offline Device            Online Server                │
│       │                          │                        │
│  ┌───────────┐         ┌─────────────────┐           │
│  │Create Order│         │   Process     │           │
│  │   ↓      │         │      Order    │           │
│  │Store Local│         │        ↓       │           │
│  │   ↓      │         │Update Inventory│           │
│  │Add to    │         │        ↓       │           │
│  │Sync Queue│         │   Notify     │           │
│  │   ↓      │         │      Other    │           │
│  │          │         │      Terminals│           │
│  └───────────┘         └─────────────────┘           │
│                                                             │
│  Internet Connection Detected → Process Sync Queue         │
└─────────────────────────────────────────────────────────────┘
```

### Sync Queue Management
```typescript
class SyncQueueManager {
  private queue: Array<SyncOperation> = [];
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  async addToQueue(operation: SyncOperation): Promise<void> {
    // Add timestamp for ordering
    operation.createdAt = new Date().toISOString();
    operation.retryCount = 0;

    this.queue.push(operation);

    // Persist queue to IndexedDB
    await this.persistQueue();

    // Try immediate sync if online
    if (navigator.onLine) {
      await this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    while (this.queue.length > 0 && navigator.onLine) {
      const operation = this.queue[0];

      try {
        await this.executeOperation(operation);

        // Remove from queue on success
        this.queue.shift();
        await this.persistQueue();

        // Clear retry count
        delete operation.retryCount;

      } catch (error) {
        console.error('Sync operation failed:', error);

        // Retry logic
        operation.retryCount = (operation.retryCount || 0) + 1;

        if (operation.retryCount < this.maxRetries) {
          // Delay retry
          setTimeout(() => {
            this.processQueue();
          }, this.retryDelay);
          return;
        } else {
          // Max retries reached, remove from queue
          this.queue.shift();
          await this.markAsFailed(operation);
          await this.persistQueue();
        }
      }
    }
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'CREATE_ORDER':
        return this.syncCreateOrder(operation.data);
      case 'UPDATE_ORDER':
        return this.syncUpdateOrder(operation.data);
      case 'CREATE_PAYMENT':
        return this.syncCreatePayment(operation.data);
      case 'UPDATE_STOCK':
        return this.syncUpdateStock(operation.data);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
}
```

### Conflict Resolution
```typescript
class ConflictResolver {
  async resolveConflict(conflict: DataConflict): Promise<ConflictResolution> {
    switch (conflict.type) {
      case 'ORDER_UPDATE':
        return this.resolveOrderConflict(conflict);
      case 'STOCK_UPDATE':
        return this.resolveStockConflict(conflict);
      case 'CUSTOMER_UPDATE':
        return this.resolveCustomerConflict(conflict);
      default:
        return this.autoResolve(conflict);
    }
  }

  private async resolveOrderConflict(conflict: DataConflict): Promise<ConflictResolution> {
    const localData = conflict.localData;
    const serverData = conflict.serverData;

    // Business logic for order conflicts
    if (serverData.status === 'completed' && localData.status !== 'completed') {
      // Server completed order takes precedence
      return {
        action: 'accept_server',
        reason: 'Order already completed on server'
      };
    }

    if (localData.status === 'completed' && serverData.status !== 'completed') {
      // Local completed order takes precedence
      return {
        action: 'accept_local',
        reason: 'Order completed locally'
      };
    }

    // Merge payment information
    const mergedOrder = {
      ...serverData,
      // Keep server-side payments
      payments: serverData.payments,
      // Keep local modifications
      special_requests: localData.special_requests || serverData.special_requests
    };

    return {
      action: 'merge',
      data: mergedOrder,
      reason: 'Merged order data'
    };
  }
}
```

### Progressive Sync Strategies
```typescript
interface SyncStrategy {
  priority: number;
  type: 'immediate' | 'batch' | 'deferred';
  conditions: string[];
}

class SyncStrategyManager {
  private strategies: Map<string, SyncStrategy> = new Map([
    ['CREATE_ORDER', {
      priority: 1,
      type: 'immediate',
      conditions: ['online']
    }],
    ['UPDATE_ORDER', {
      priority: 2,
      type: 'immediate',
      conditions: ['online']
    }],
    ['UPDATE_STOCK', {
      priority: 3,
      type: 'batch',
      conditions: ['online', 'high_priority']
    }],
    ['UPDATE_SETTINGS', {
      priority: 4,
      type: 'deferred',
      conditions: ['wifi']
    }]
  ]);

  async executeStrategy(operation: SyncOperation): Promise<void> {
    const strategy = this.strategies.get(operation.type);

    if (!strategy) {
      // Default strategy
      await this.defaultSync(operation);
      return;
    }

    // Check conditions
    const conditionsMet = this.checkConditions(strategy.conditions);

    if (!conditionsMet) {
      await this.addToQueue(operation);
      return;
    }

    switch (strategy.type) {
      case 'immediate':
        await this.executeImmediately(operation);
        break;
      case 'batch':
        await this.addToBatch(operation);
        break;
      case 'deferred':
        await this.deferOperation(operation);
        break;
    }
  }
}
```

---

## Storage Management

### IndexedDB Implementation
```typescript
// IndexedDB wrapper for offline storage
class OfflineStorage {
  private db: IDBDatabase | null = null;
  private dbName = 'restaurant-pos-offline';
  private version = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('orders')) {
          const store = db.createObjectStore('orders', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' });
        }
      };
    });
  }

  async store<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

### Storage Quota Management
```typescript
class StorageQuotaManager {
  private maxStorage = 100 * 1024 * 1024; // 100MB
  private warningThreshold = 80 * 1024 * 1024; // 80MB

  async checkStorageUsage(): Promise<StorageUsage> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();

      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100,
        maxAllowed: this.maxStorage
      };
    }

    // Fallback for browsers without storage estimate
    return {
      used: 0,
      available: this.maxStorage,
      percentage: 0,
      maxAllowed: this.maxStorage
    };
  }

  async manageStorage(): Promise<void> {
    const usage = await this.checkStorageUsage();

    if (usage.percentage > 90) {
      await this.cleanupStorage();
    } else if (usage.percentage > this.warningThreshold) {
      this.showStorageWarning(usage);
    }
  }

  private async cleanupStorage(): Promise<void> {
    const storage = new OfflineStorage();

    // Remove old completed orders (older than 30 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const orders = await storage.getAll<Order>('orders');
    const recentOrders = orders.filter(order =>
      new Date(order.created_at) > cutoffDate
    );

    await storage.clear('orders');

    // Store only recent orders
    for (const order of recentOrders) {
      await storage.store('orders', order);
    }

    // Clear sync queue for completed operations
    const syncQueue = await storage.getAll<SyncOperation>('sync_queue');
    const pendingSync = syncQueue.filter(op => op.status !== 'completed');

    await storage.clear('sync_queue');

    for (const operation of pendingSync) {
      await storage.store('sync_queue', operation);
    }
  }
}
```

### Cache Management
```typescript
class CacheManager {
  private cacheVersion = '1.0.0';
  private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  async cacheData(key: string, data: any): Promise<void> {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      version: this.cacheVersion,
      expiry: Date.now() + this.maxCacheAge
    };

    const storage = new OfflineStorage();
    await storage.store('cache', { key, ...cacheEntry });
  }

  async getCachedData(key: string): Promise<any | null> {
    const storage = new OfflineStorage();
    const cacheEntry = await storage.get('cache', key);

    if (!cacheEntry) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() > cacheEntry.expiry) {
      await this.removeCachedData(key);
      return null;
    }

    return cacheEntry.data;
  }

  async removeCachedData(key: string): Promise<void> {
    const storage = new OfflineStorage();
    const cacheEntries = await storage.getAll('cache');
    const filteredEntries = cacheEntries.filter(entry => entry.key !== key);

    await storage.clear('cache');

    for (const entry of filteredEntries) {
      await storage.store('cache', entry);
    }
  }

  async clearExpiredCache(): Promise<void> {
    const storage = new OfflineStorage();
    const cacheEntries = await storage.getAll('cache');
    const validEntries = cacheEntries.filter(
      entry => Date.now() <= entry.expiry
    );

    await storage.clear('cache');

    for (const entry of validEntries) {
      await storage.store('cache', entry);
    }
  }
}
```

---

## Offline Capabilities

### Supported Operations Offline

#### ✅ Fully Supported
- **Order Creation**: Create complete orders with items and payments
- **Product Management**: View and work with cached products
- **Customer Search**: Search existing cached customers
- **Cart Operations**: Add, remove, and modify cart items
- **Payment Processing**: Accept payments (stored locally)
- **Receipt Printing**: Print receipts from cached data

#### ⚠️ Limited Support
- **New Products**: Only products cached before going offline
- **Customer Creation**: Limited to existing customer data
- **Inventory Updates**: Local updates synced when online
- **Report Generation**: Limited to cached historical data

#### ❌ Not Supported
- **Kitchen Display**: Real-time updates not available
- **Multi-terminal Sync**: Updates synced when online
- **Real-time Notifications**: Only when online
- **New User Login**: Requires cached session

### Offline Status Indicators
```typescript
interface OfflineStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingOperations: number;
  storageUsage: number;
  capabilities: OfflineCapabilities;
}

const useOfflineStatus = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingOperations: 0,
    storageUsage: 0,
    capabilities: {
      canCreateOrders: true,
      canTakePayments: true,
      canPrintReceipts: true,
      canAccessProducts: true,
      canAccessCustomers: false,
      canUpdateInventory: false
    }
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
};
```

### Offline UI Components
```typescript
// Offline status indicator component
const OfflineStatusIndicator: React.FC = () => {
  const status = useOfflineStatus();

  if (status.isOnline) {
    return null;
  }

  return (
    <div className="offline-indicator fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline Mode</span>
      </div>
      {status.pendingOperations > 0 && (
        <div className="text-xs mt-1">
          {status.pendingOperations} operations pending sync
        </div>
      )}
    </div>
  );
};

// Offline message component
const OfflineMessage: React.FC = () => {
  const status = useOfflineStatus();

  if (!status.isOnline) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-sm font-medium text-yellow-800">
            Offline Mode Active
          </h3>
        </div>
        <p className="text-sm text-yellow-700 mb-3">
          You can continue taking orders and processing payments while offline.
          All data will be automatically synced when internet connection is restored.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-100 text-green-800 p-2 rounded">
            ✓ Create Orders
          </div>
          <div className="bg-green-100 text-green-800 p-2 rounded">
            ✓ Process Payments
          </div>
          <div className="bg-green-100 text-green-800 p-2 rounded">
            ✓ Print Receipts
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
            ⚠ Limited Functions
          </div>
        </div>
      </div>
    );
  }

  return null;
};
```

---

## Troubleshooting

### Common Offline Issues

#### Sync Queue Not Processing
```typescript
const diagnoseSyncIssues = async (): Promise<SyncDiagnostics> => {
  const diagnostics: SyncDiagnostics = {
    isOnline: navigator.onLine,
    serviceWorkerActive: false,
    indexedDbAvailable: false,
    queueLength: 0,
    lastSyncAttempt: null,
    storageQuota: null,
    networkConnectivity: null
  };

  // Check IndexedDB availability
  try {
    const storage = new OfflineStorage();
    await storage.initialize();
    diagnostics.indexedDbAvailable = true;
  } catch (error) {
    diagnostics.indexedDbAvailable = false;
  }

  // Check Service Worker
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    diagnostics.serviceWorkerActive = !!registration.active;
  }

  // Check queue length
  try {
    const storage = new OfflineStorage();
    const queue = await storage.getAll<SyncOperation>('sync_queue');
    diagnostics.queueLength = queue.length;
  } catch (error) {
    // IndexedDB not available
  }

  // Check storage quota
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    diagnostics.storageQuota = {
      used: estimate.usage,
      available: estimate.quota,
      percentage: (estimate.usage / estimate.quota) * 100
    };
  }

  // Check network connectivity
  try {
    const response = await fetch('/api/health', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    diagnostics.networkConnectivity = response.ok;
  } catch (error) {
    diagnostics.networkConnectivity = false;
  }

  return diagnostics;
};
```

#### Data Corruption Issues
```typescript
const dataIntegrityCheck = async (): Promise<IntegrityReport> => {
  const report: IntegrityReport = {
    timestamp: new Date(),
    checks: [],
    issues: [],
    recommendations: []
  };

  const storage = new OfflineStorage();

  // Check products integrity
  try {
    const products = await storage.getAll<Product>('products');
    const issues: string[] = [];

    products.forEach((product, index) => {
      if (!product.id) {
        issues.push(`Product at index ${index} missing ID`);
      }
      if (!product.name || product.name.trim() === '') {
        issues.push(`Product ${product.id || 'unknown'} missing name`);
      }
      if (!product.price || product.price <= 0) {
        issues.push(`Product ${product.id || 'unknown'} has invalid price`);
      }
    });

    report.checks.push({
      category: 'products',
      status: issues.length === 0 ? 'pass' : 'fail',
      issues: issues.length
    });

    if (issues.length > 0) {
      report.issues.push(...issues);
      report.recommendations.push('Run data repair for products');
    }
  } catch (error) {
    report.checks.push({
      category: 'products',
      status: 'error',
      message: 'Failed to read products from offline storage'
    });
    report.issues.push('Products data not accessible');
  }

  return report;
};
```

### Performance Issues

#### Storage Performance Optimization
```typescript
class PerformanceOptimizer {
  private batchOperations: Map<string, Array<any>> = new Map();
  private batchSize = 50;
  private batchTimeout = 1000; // 1 second

  async batchStore<T>(storeName: string, data: T[]): Promise<void> {
    if (data.length === 0) return;

    const storage = new OfflineStorage();

    // For large datasets, use batch transactions
    if (data.length > this.batchSize) {
      const batches = this.createBatches(data, this.batchSize);

      for (const batch of batches) {
        await this.processBatch(storage, storeName, batch);
      }
    } else {
      // For smaller datasets, single transaction
      const transaction = storage.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const item of data) {
        store.put(item);
      }

      await new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    }
  }

  private createBatches<T>(data: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    return batches;
  }
}
```

### Recovery Procedures

#### Data Recovery
```typescript
class DataRecovery {
  async recoverFromBackup(): Promise<RecoveryResult> {
    const recovery: RecoveryResult = {
      timestamp: new Date(),
      status: 'starting',
      steps: [],
      errors: []
    };

    try {
      // Step 1: Validate backup
      recovery.steps.push('Validating backup data');
      const backup = await this.validateBackup();
      if (!backup.isValid) {
        throw new Error('Backup validation failed');
      }

      // Step 2: Clear corrupted data
      recovery.steps.push('Clearing corrupted local data');
      await this.clearCorruptedData();

      // Step 3: Restore data
      recovery.steps.push('Restoring data from backup');
      await this.restoreData(backup.data);

      // Step 4: Verify restored data
      recovery.steps.push('Verifying restored data');
      const verification = await this.verifyRestoredData();
      if (!verification.valid) {
        throw new Error('Data verification failed');
      }

      recovery.status = 'success';
    } catch (error) {
      recovery.status = 'failed';
      recovery.errors.push(error.message);
    }

    return recovery;
  }
}
```

---

## Best Practices

### Development Best Practices

#### Offline Testing
```typescript
// Offline testing utilities
class OfflineTestUtils {
  async simulateOfflineMode(): Promise<void> {
    // Disable network
    await this.disableNetwork();

    // Wait for system to detect offline mode
    await this.waitForOfflineMode();

    // Run offline tests
    await this.runOfflineTests();

    // Re-enable network
    await this.enableNetwork();

    // Verify sync process
    await this.verifySyncProcess();
  }

  private async runOfflineTests(): Promise<TestResults> {
    const results: TestResults = {
      timestamp: new Date(),
      tests: []
    };

    // Test order creation
    try {
      const order = await this.createOfflineOrder();
      results.tests.push({
        name: 'Create Order Offline',
        status: 'pass',
        result: order
      });
    } catch (error) {
      results.tests.push({
        name: 'Create Order Offline',
        status: 'fail',
        error: error.message
      });
    }

    // Test cart operations
    try {
      const cart = await this.testCartOperations();
      results.tests.push({
        name: 'Cart Operations',
        status: 'pass',
        result: cart
      });
    } catch (error) {
      results.tests.push({
        name: 'Cart Operations',
        status: 'fail',
        error: error.message
      });
    }

    return results;
  }
}
```

#### Error Handling
```typescript
class OfflineErrorHandler {
  handle(error: Error, context: string): void {
    // Log error with context
    console.error(`[OFFLINE-${context}] ${error.message}`, error);

    // Classify error type
    const errorType = this.classifyError(error);

    // Handle specific error types
    switch (errorType) {
      case 'STORAGE_QUOTA':
        this.handleStorageQuotaExceeded();
        break;
      case 'SYNCON_CONFLICT':
        this.handleSyncConflict(error);
        break;
      case 'DATA_CORRUPTION':
        this.handleDataCorruption(error);
        break;
      default:
        this.handleGenericError(error);
        break;
    }

    // Show user-friendly message
    this.showUserFriendlyMessage(errorType);
  }

  private classifyError(error: Error): string {
    if (error.message.includes('quota') || error.message.includes('storage')) {
      return 'STORAGE_QUOTA';
    }
    if (error.message.includes('conflict')) {
      return 'SYNC_CONFLICT';
    }
    if (error.message.includes('corruption') || error.message.includes('invalid')) {
      return 'DATA_CORRUPTION';
    }
    return 'GENERIC';
  }
}
```

### User Experience Best Practices

#### Offline UX Guidelines
1. **Clear Status Indicators**: Always show current online/offline status
2. **Graceful Degradation**: Clearly indicate which features are unavailable
3. **Automatic Recovery**: Automatically retry failed operations when online
4. **Progress Feedback**: Show sync progress and pending operations
5. **Error Recovery**: Provide clear error messages and recovery options

#### Performance Optimization
1. **Lazy Loading**: Load data only when needed
2. **Caching Strategy**: Cache frequently accessed data locally
3. **Batch Operations**: Group database operations for better performance
4. **Memory Management**: Monitor and manage memory usage
5. **Storage Cleanup**: Regular cleanup of old data

#### Data Safety
1. **Encryption**: Encrypt sensitive data stored locally
2. **Backup Strategy Regular backup to server when online
3. **Validation**: Validate all data before storage
4. **Recovery**: Plan for data recovery scenarios
5. **Testing**: Regular testing of offline functionality

This comprehensive offline mode guide ensures your POS system remains functional and reliable during internet outages while maintaining data integrity and providing a smooth user experience.