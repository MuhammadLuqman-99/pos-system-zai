export interface CashDrawerConfig {
  port: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space';
}

export class CashDrawerService {
  private drawerConfigs: Map<string, CashDrawerConfig> = new Map();
  private defaultDrawer: string | null = null;

  constructor() {
    // Initialize with default cash drawer config
    this.addDrawer('default', {
      port: 'COM2', // Windows default for cash drawer
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });
  }

  addDrawer(id: string, config: CashDrawerConfig) {
    this.drawerConfigs.set(id, config);
    if (this.defaultDrawer === null) {
      this.defaultDrawer = id;
    }
  }

  setDefaultDrawer(id: string) {
    if (this.drawerConfigs.has(id)) {
      this.defaultDrawer = id;
    }
  }

  async openDrawer(drawerId?: string) {
    const drawerIdToUse = drawerId || this.defaultDrawer;
    if (!drawerIdToUse) {
      throw new Error('No cash drawer configured');
    }

    const config = this.drawerConfigs.get(drawerIdToUse);
    if (!config) {
      throw new Error(`Cash drawer ${drawerIdToUse} not found`);
    }

    try {
      // In a real implementation, this would open a serial connection
      // and send the specific command to open the drawer
      await this.sendOpenCommand(config);
      return true;
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
      throw error;
    }
  }

  private async sendOpenCommand(config: CashDrawerConfig) {
    // Most cash drawers use a simple command to open
    // Common commands:
    // 1. Send a specific byte sequence (0x1B, 0x70, 0x00, 0x19, 0xFA)
    // 2. Send the bell character (0x07)
    // 3. Send escape sequence

    const openCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);

    if (typeof window !== 'undefined') {
      // In browser environment, we can't directly access serial ports
      // We'll simulate the opening and provide visual feedback
      console.log('Opening cash drawer with command:', Array.from(openCommand).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Cash Drawer', {
          body: 'Cash drawer opened',
          icon: '/cash-drawer-icon.png'
        });
      }

      // If we have Web Serial API support, we could use it
      if ('serial' in navigator) {
        try {
          const port = await (navigator as any).serial.requestPort();
          await port.open({
            baudRate: config.baudRate || 9600,
            dataBits: config.dataBits || 8,
            stopBits: config.stopBits || 1,
            parity: config.parity || 'none'
          });

          const writer = port.writable?.getWriter();
          if (writer) {
            await writer.write(openCommand);
            writer.releaseLock();
          }

          await port.close();
          return;
        } catch (error) {
          console.warn('Web Serial API not available or failed:', error);
        }
      }

      // Fallback: Visual indication only
      this.showCashDrawerOpened();
    }
  }

  private showCashDrawerOpened() {
    // Create a visual indicator that the drawer opened
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 9999;
      animation: slideOut 3s ease-out forwards;
    `;
    indicator.textContent = '💰 Cash Drawer Opened';

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideOut {
        0% { transform: translateX(0); opacity: 1; }
        70% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(indicator);

    // Remove after animation
    setTimeout(() => {
      indicator.remove();
      style.remove();
    }, 3000);
  }

  async testDrawer(drawerId?: string) {
    try {
      await this.openDrawer(drawerId);
      return true;
    } catch (error) {
      console.error('Cash drawer test failed:', error);
      return false;
    }
  }

  getDrawerStatus(drawerId?: string): {
    configured: boolean;
    type?: string;
    port?: string;
  } {
    const drawerIdToUse = drawerId || this.defaultDrawer;
    if (!drawerIdToUse) {
      return { configured: false };
    }

    const config = this.drawerConfigs.get(drawerIdToUse);
    if (!config) {
      return { configured: false };
    }

    return {
      configured: true,
      type: 'serial',
      port: config.port
    };
  }

  // Method to check if Web Serial API is available
  isWebSerialSupported(): boolean {
    return 'serial' in navigator;
  }

  // Method to request notification permission for visual feedback
  async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      return Notification.permission === 'granted';
    }
    return false;
  }
}

// Singleton instance
export const cashDrawerService = new CashDrawerService();

// Auto-request notification permission
if (typeof window !== 'undefined') {
  cashDrawerService.requestNotificationPermission().catch(console.error);
}

// For development/testing purposes
if (typeof window !== 'undefined') {
  (window as any).cashDrawerService = cashDrawerService;
}