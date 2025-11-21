export interface PrinterConfig {
  type: 'thermal' | 'inkjet' | 'laser';
  port: string;
  baudRate?: number;
  width?: number;
  height?: number;
  paperWidth?: number; // mm
}

export interface ReceiptData {
  restaurant: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  order: {
    orderNo: string;
    tableNo?: string;
    customerName?: string;
    cashierName: string;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      modifiers?: string[];
    }>;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    discount: number;
    total: number;
    paymentMethod: string;
    paidAmount?: number;
    change?: number;
    tip?: number;
  };
  timestamp: Date;
}

export class PrinterService {
  private printerConfigs: Map<string, PrinterConfig> = new Map();
  private defaultPrinter: string | null = null;

  constructor() {
    // Initialize with default thermal printer config
    this.addPrinter('default', {
      type: 'thermal',
      port: 'COM1', // Windows default, adjust as needed
      paperWidth: 80, // 80mm thermal paper
      width: 48, // characters per line
      height: 32
    });
  }

  addPrinter(id: string, config: PrinterConfig) {
    this.printerConfigs.set(id, config);
    if (this.defaultPrinter === null) {
      this.defaultPrinter = id;
    }
  }

  setDefaultPrinter(id: string) {
    if (this.printerConfigs.has(id)) {
      this.defaultPrinter = id;
    }
  }

  async printReceipt(receiptData: ReceiptData, printerId?: string) {
    const printerIdToUse = printerId || this.defaultPrinter;
    if (!printerIdToUse) {
      throw new Error('No printer configured');
    }

    const config = this.printerConfigs.get(printerIdToUse);
    if (!config) {
      throw new Error(`Printer ${printerIdToUse} not found`);
    }

    try {
      // Generate receipt text
      const receiptText = this.generateReceiptText(receiptData, config);

      // Print based on printer type
      switch (config.type) {
        case 'thermal':
          await this.printThermal(receiptText, config);
          break;
        case 'inkjet':
        case 'laser':
          await this.printStandard(receiptText, config);
          break;
        default:
          throw new Error(`Unsupported printer type: ${config.type}`);
      }
    } catch (error) {
      console.error('Printing error:', error);
      throw error;
    }
  }

  private generateReceiptText(receiptData: ReceiptData, config: PrinterConfig): string {
    const { restaurant, order, timestamp } = receiptData;
    const lineLength = config.width || 48;

    let receipt = '';

    // Header
    receipt += this.centerText(restaurant.name, lineLength) + '\n';
    receipt += this.centerText(restaurant.address, lineLength) + '\n';
    receipt += this.centerText(`Tel: ${restaurant.phone}`, lineLength) + '\n';
    receipt += '\n';

    // Order details
    receipt += this.centerText('*** RECEIPT ***', lineLength) + '\n';
    receipt += '\n';
    receipt += `Order #: ${order.orderNo}\n`;
    receipt += `Date: ${timestamp.toLocaleDateString()}\n`;
    receipt += `Time: ${timestamp.toLocaleTimeString()}\n`;

    if (order.tableNo) {
      receipt += `Table: ${order.tableNo}\n`;
    }

    if (order.customerName) {
      receipt += `Customer: ${order.customerName}\n`;
    }

    receipt += `Cashier: ${order.cashierName}\n`;
    receipt += '\n';
    receipt += '-'.repeat(lineLength) + '\n';

    // Items
    order.items.forEach((item, index) => {
      const itemName = `${item.quantity}x ${item.name}`;
      receipt += itemName.padEnd(lineLength - 12) + '\n';
      receipt += `${this.formatCurrency(item.unitPrice).padStart(12)}\n`;

      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach(mod => {
          receipt += `  + ${mod.padEnd(lineLength - 8)}\n`;
        });
      }

      receipt += this.formatCurrency(item.subtotal).padStart(lineLength) + '\n';

      if (index < order.items.length - 1) {
        receipt += '\n';
      }
    });

    receipt += '\n';
    receipt += '-'.repeat(lineLength) + '\n';

    // Totals
    receipt += `Subtotal:`.padEnd(lineLength - 12) + this.formatCurrency(order.subtotal).padStart(12) + '\n';

    if (order.discount > 0) {
      receipt += `Discount:`.padEnd(lineLength - 12) + `-${this.formatCurrency(order.discount)}`.padStart(12) + '\n';
    }

    receipt += `Tax:`.padEnd(lineLength - 12) + this.formatCurrency(order.tax).padStart(12) + '\n';

    if (order.serviceCharge > 0) {
      receipt += `Service:`.padEnd(lineLength - 12) + this.formatCurrency(order.serviceCharge).padStart(12) + '\n';
    }

    receipt += '-'.repeat(lineLength) + '\n';
    receipt += `TOTAL:`.padEnd(lineLength - 12) + this.formatCurrency(order.total).padStart(12) + '\n';
    receipt += '-'.repeat(lineLength) + '\n';

    // Payment details
    receipt += `Payment: ${order.paymentMethod}\n`;

    if (order.paidAmount) {
      receipt += `Paid:`.padEnd(lineLength - 12) + this.formatCurrency(order.paidAmount).padStart(12) + '\n';
    }

    if (order.change && order.change > 0) {
      receipt += `Change:`.padEnd(lineLength - 12) + this.formatCurrency(order.change).padStart(12) + '\n';
    }

    if (order.tip && order.tip > 0) {
      receipt += `Tip:`.padEnd(lineLength - 12) + this.formatCurrency(order.tip).padStart(12) + '\n';
    }

    receipt += '\n';
    receipt += this.centerText('Thank you for dining with us!', lineLength) + '\n';
    receipt += this.centerText('Please come again', lineLength) + '\n';
    receipt += '\n';

    return receipt;
  }

  private async printThermal(text: string, config: PrinterConfig) {
    // For thermal printers, we need to send the text with proper formatting
    // This would typically involve connecting to the printer port and sending raw data

    // In a browser environment, we'll use a different approach
    if (typeof window !== 'undefined') {
      // Create a print-friendly version
      const printWindow = window.open('', '', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  white-space: pre;
                  padding: 10px;
                }
              </style>
            </head>
            <body>${text}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  }

  private async printStandard(text: string, config: PrinterConfig) {
    // For standard printers, we can use the browser's print functionality
    if (typeof window !== 'undefined') {
      const printWindow = window.open('', '', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  white-space: pre;
                  padding: 20px;
                }
              </style>
            </head>
            <body>${text}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  }

  private centerText(text: string, width: number): string {
    const padding = Math.max(0, width - text.length);
    const leftPadding = Math.floor(padding / 2);
    const rightPadding = padding - leftPadding;
    return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  async testPrinter(printerId?: string) {
    const testData: ReceiptData = {
      restaurant: {
        name: 'Test Restaurant',
        address: '123 Test St',
        phone: '(555) 123-4567',
        email: 'test@restaurant.com'
      },
      order: {
        orderNo: 'TEST001',
        cashierName: 'Test User',
        items: [
          {
            name: 'Test Item',
            quantity: 1,
            unitPrice: 9.99,
            subtotal: 9.99
          }
        ],
        subtotal: 9.99,
        tax: 0.80,
        serviceCharge: 1.00,
        discount: 0,
        total: 11.79,
        paymentMethod: 'Test'
      },
      timestamp: new Date()
    };

    await this.printReceipt(testData, printerId);
  }

  async printKOT(orderData: any, printerId?: string) {
    const printerIdToUse = printerId || this.defaultPrinter;
    if (!printerIdToUse) {
      throw new Error('No printer configured');
    }

    const config = this.printerConfigs.get(printerIdToUse);
    if (!config) {
      throw new Error(`Printer ${printerIdToUse} not found`);
    }

    let kot = '';
    const lineLength = config.width || 48;

    // KOT Header
    kot += this.centerText('*** KITCHEN ORDER TICKET ***', lineLength) + '\n';
    kot += '\n';
    kot += `Order #: ${orderData.orderNo}\n`;
    kot += `Table: ${orderData.tableNo || 'Takeaway'}\n`;
    kot += `Time: ${new Date().toLocaleTimeString()}\n`;
    kot += `Waiter: ${orderData.waiterName || 'N/A'}\n`;
    kot += '\n';
    kot += '-'.repeat(lineLength) + '\n';

    // Order items
    orderData.items.forEach((item: any) => {
      kot += `${item.quantity}x ${item.name}\n`;

      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach((mod: any) => {
          kot += `  - ${mod.name}\n`;
        });
      }

      if (item.notes) {
        kot += `  Note: ${item.notes}\n`;
      }

      kot += '\n';
    });

    if (orderData.specialRequests) {
      kot += '\n';
      kot += 'SPECIAL REQUESTS:\n';
      kot += orderData.specialRequests + '\n';
    }

    kot += '\n';
    kot += '-'.repeat(lineLength) + '\n';
    kot += '\n';

    // Print the KOT
    if (typeof window !== 'undefined') {
      const printWindow = window.open('', '', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Kitchen Order Ticket</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 14px;
                  font-weight: bold;
                  white-space: pre;
                  padding: 10px;
                }
              </style>
            </head>
            <body>${kot}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  }
}

// Singleton instance
export const printerService = new PrinterService();

// For development/testing purposes
if (typeof window !== 'undefined') {
  (window as any).printerService = printerService;
}