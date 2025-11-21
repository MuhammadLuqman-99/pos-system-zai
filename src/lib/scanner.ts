export interface ScannerConfig {
  type: 'camera' | 'usb' | 'bluetooth';
  device?: string;
  resolution?: number;
}

export interface ScanResult {
  type: 'barcode' | 'qr';
  data: string;
  timestamp: Date;
}

export class ScannerService {
  private scannerConfigs: Map<string, ScannerConfig> = new Map();
  private activeScanner: string | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.addScanner('default', {
      type: 'camera',
      resolution: 640
    });
  }

  addScanner(id: string, config: ScannerConfig) {
    this.scannerConfigs.set(id, config);
  }

  async startScanning(scannerId?: string): Promise<ScanResult> {
    const scannerIdToUse = scannerId || 'default';
    const config = this.scannerConfigs.get(scannerIdToUse);

    if (!config) {
      throw new Error(`Scanner ${scannerIdToUse} not found`);
    }

    this.activeScanner = scannerIdToUse;

    try {
      switch (config.type) {
        case 'camera':
          return await this.scanWithCamera(config);
        case 'usb':
          return await this.scanWithUSB(config);
        case 'bluetooth':
          return await this.scanWithBluetooth(config);
        default:
          throw new Error(`Unsupported scanner type: ${config.type}`);
      }
    } catch (error) {
      this.stopScanning();
      throw error;
    }
  }

  stopScanning() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.activeScanner = null;
  }

  private async scanWithCamera(config: ScannerConfig): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
      // Request camera access
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: config.resolution,
          height: config.resolution
        }
      })
      .then((stream) => {
        this.stream = stream;

        // Create video element for scanning
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const scanFrame = () => {
            if (!this.stream) {
              reject(new Error('Scanning stopped'));
              return;
            }

            try {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

              // Try to decode with jsQR
              if (typeof window !== 'undefined' && (window as any).jsQR) {
                const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                  this.stopScanning();
                  resolve({
                    type: 'qr', // jsQR can detect both QR and barcodes
                    data: code.data,
                    timestamp: new Date()
                  });
                  return;
                }
              }

              // Continue scanning
              requestAnimationFrame(scanFrame);
            } catch (error) {
              console.error('Scanning error:', error);
              requestAnimationFrame(scanFrame);
            }
          };

          scanFrame();
        };

        video.play().catch(reject);
      })
      .catch(reject);
    });
  }

  private async scanWithUSB(config: ScannerConfig): Promise<ScanResult> {
    // USB scanner integration would require additional libraries
    // For now, we'll simulate with a keyboard listener
    return new Promise((resolve, reject) => {
      let barcodeData = '';
      let timeoutId: NodeJS.Timeout;

      const handleKeyPress = (event: KeyboardEvent) => {
        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Check if it's a valid barcode character (numbers, letters, some symbols)
        if (event.key.length === 1 || event.key === 'Enter') {
          if (event.key === 'Enter') {
            // Barcode scan complete
            if (barcodeData.length > 0) {
              document.removeEventListener('keydown', handleKeyPress);
              resolve({
                type: 'barcode',
                data: barcodeData,
                timestamp: new Date()
              });
            }
          } else {
            barcodeData += event.key;
          }

          // Set timeout to detect end of scan
          timeoutId = setTimeout(() => {
            if (barcodeData.length > 0) {
              document.removeEventListener('keydown', handleKeyPress);
              resolve({
                type: 'barcode',
                data: barcodeData,
                timestamp: new Date()
              });
            }
          }, 100);
        }
      };

      // Listen for keyboard events
      document.addEventListener('keydown', handleKeyPress);

      // Set timeout to reject if no scan occurs
      setTimeout(() => {
        document.removeEventListener('keydown', handleKeyPress);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        reject(new Error('USB scanner timeout - no scan detected'));
      }, 30000); // 30 second timeout
    });
  }

  private async scanWithBluetooth(config: ScannerConfig): Promise<ScanResult> {
    // Bluetooth scanner integration would require Web Bluetooth API
    // This is more complex and would need specific device support
    return new Promise((resolve, reject) => {
      if (!navigator.bluetooth) {
        reject(new Error('Bluetooth not supported in this browser'));
        return;
      }

      navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'] // Adjust based on scanner
      })
      .then(device => {
        console.log('Bluetooth device found:', device.name);
        // Connect and scan would go here
        // This is a placeholder implementation
        reject(new Error('Bluetooth scanning not fully implemented'));
      })
      .catch(error => {
        reject(new Error('Bluetooth device selection cancelled: ' + error.message));
      });
    });
  }

  // Utility method to load jsQR library
  static async loadJsQR(): Promise<void> {
    if (typeof window !== 'undefined' && !(window as any).jsQR) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.async = true;

      return new Promise((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  // Validate barcode format
  static validateBarcode(data: string): { valid: boolean; type?: string; format?: string } {
    // Remove whitespace and convert to uppercase
    const cleanedData = data.trim().toUpperCase();

    // Check EAN-13 (13 digits)
    if (/^\d{13}$/.test(cleanedData)) {
      return { valid: true, type: 'barcode', format: 'EAN-13' };
    }

    // Check UPC-A (12 digits)
    if (/^\d{12}$/.test(cleanedData)) {
      return { valid: true, type: 'barcode', format: 'UPC-A' };
    }

    // Check Code 128 (variable length, alphanumeric)
    if (/^[A-Z0-9]{8,20}$/.test(cleanedData)) {
      return { valid: true, type: 'barcode', format: 'Code 128' };
    }

    // Check QR Code (typically longer and contains special chars)
    if (cleanedData.length > 10 && /[^A-Z0-9]/.test(cleanedData)) {
      return { valid: true, type: 'qr', format: 'QR Code' };
    }

    // Check for common product SKUs
    if (/^[A-Z]{2,4}\d{4,8}$/.test(cleanedData)) {
      return { valid: true, type: 'sku', format: 'SKU' };
    }

    return { valid: false };
  }

  // Get scanner status
  getStatus(): { active: boolean; scannerId: string | null; type: string | null } {
    const config = this.activeScanner ? this.scannerConfigs.get(this.activeScanner) : null;
    return {
      active: !!this.activeScanner,
      scannerId: this.activeScanner,
      type: config?.type || null
    };
  }
}

// Singleton instance
export const scannerService = new ScannerService();

// Auto-load jsQR when module is imported
if (typeof window !== 'undefined') {
  ScannerService.loadJsQR().catch(console.error);
}

// For development/testing purposes
if (typeof window !== 'undefined') {
  (window as any).scannerService = scannerService;
}